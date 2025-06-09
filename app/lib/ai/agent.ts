import { OpenAI } from 'openai';
import { ForgetMemoryTool, ListMemoriesTool, ReadMemoryTool, WriteMemoryTool } from './tools/memory';
import { MCPHost, MCPServersInfo } from './mcp';
import { z } from 'zod';

const DEFAULT_MODEL = 'gpt-4.1-mini';

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function isAgentMessage(message: OpenAI.Responses.ResponseInputItem): message is AgentMessage {
  return (
    message.type === 'message' &&
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string'
  );
}

const SEPARATOR = '_---_';

function encodeMCPToolName(serverName: string, toolName: string): string {
  return `${serverName}${SEPARATOR}${toolName}`;
}

function decodeMCPToolName(encodedName: string): { serverName: string; toolName: string } {
  const parts = encodedName.split(SEPARATOR);
  if (parts.length !== 2) {
    throw new Error(`Invalid encoded tool name: ${encodedName}`);
  }
  return {
    serverName: parts[0],
    toolName: parts[1],
  };
}

const UnknownRecordSchema = z.record(z.unknown());

function parseUnknownRecord(data: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(data);
    const result = UnknownRecordSchema.parse(parsed);
    return result;
  } catch (error) {
    throw new Error(`Failed to parse unknown record: ${error instanceof Error ? error.message : String(error)}`);
  }
}

interface AgentAskParams {
  question: string;
  onToken: (token: string) => void;
  onHistoryUpdate?: (history: AgentMessage[]) => void;
}

export class TiltAgent {
  private isInitialized = false;

  private mcpHost: MCPHost;
  private mcpServersInfo: MCPServersInfo[] | undefined;
  private client: OpenAI;
  private history: OpenAI.Responses.ResponseInputItem[] = [];
  private tools = [
    new WriteMemoryTool(),
    new ListMemoriesTool(),
    new ForgetMemoryTool(),
    new ReadMemoryTool(),
  ] as const;

  constructor(
    apiKey: string,
    private model: string = DEFAULT_MODEL
  ) {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    this.mcpHost = MCPHost.getInstance();
  }

  async init() {
    if (this.isInitialized) return;
    await this.mcpHost.init();
    this.mcpServersInfo = await this.mcpHost.getServcersInfo();
    this.isInitialized = true;
  }

  ready(): boolean {
    return this.isInitialized && this.mcpHost.ready();
  }

  private toolsJson(): OpenAI.Responses.Tool[] {
    const localTools = this.tools.map((tool) => tool.getJson());

    const allTools = [...localTools];
    for (const server of this.mcpServersInfo ?? []) {
      for (const tool of server.tools) {
        allTools.push({
          type: 'function',
          name: encodeMCPToolName(server.name, tool.name),
          description: tool.description,
          parameters: tool.inputSchema,
          strict: false,
        });
      }
    }

    return allTools;
  }

  private callTool(toolName: string, args: string) {
    const tool = this.tools.find((t) => t.name === toolName);

    if (!tool) {
      // Check if the tool is an MCP tool
      const decoded = decodeMCPToolName(toolName);
      const serverInfo = this.mcpServersInfo?.find((s) => s.name === decoded.serverName);

      if (serverInfo) {
        const mcpTool = serverInfo.tools.find((t) => t.name === decoded.toolName);
        if (!mcpTool) {
          throw new Error(`Tool ${decoded.toolName} not found on server ${decoded.serverName}`);
        }

        const parsedArgs = parseUnknownRecord(args);
        return this.mcpHost.callTool(decoded.serverName, decoded.toolName, parsedArgs);
      }
    }

    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    return tool.call(args);
  }

  private createResponse() {
    return this.client.responses.create({
      model: this.model,
      tools: this.toolsJson(),
      input: this.history,
      stream: true,
    });
  }

  private updateHistory(item: OpenAI.Responses.ResponseInputItem, cb?: (history: AgentMessage[]) => void) {
    this.history.push(item);
    if (cb) {
      const filteredHistory = this.getHistory();
      cb(filteredHistory);
    }
  }

  async ask(params: AgentAskParams): Promise<string> {
    const { question, onToken, onHistoryUpdate } = params;
    try {
      this.updateHistory(
        {
          type: 'message',
          role: 'user',
          content: question,
        },
        onHistoryUpdate
      );

      return await this.streamResponseHandler(onToken, onHistoryUpdate);
    } catch (error) {
      console.error('Error during ask:', error);
      return '';
    }
  }

  private async streamResponseHandler(
    onToken: (token: string) => void,
    onHistoryUpdate: ((history: AgentMessage[]) => void) | undefined
  ) {
    const result = await this.createResponse();

    let fullResponse = '';

    for await (const event of result) {
      if (event.type === 'response.output_text.delta') {
        const token = event.delta;
        fullResponse += token;
        onToken(token);
        continue;
      }

      if (event.type === 'response.output_item.done') {
        if (event.item.type === 'function_call') {
          this.updateHistory(event.item, onHistoryUpdate);

          const response = await this.callTool(event.item.name, event.item.arguments);
          const data = response.success ? JSON.stringify(response.result, null, 2) : response.error;

          this.updateHistory(
            {
              type: 'function_call_output',
              call_id: event.item.call_id,
              output: data,
            },
            onHistoryUpdate
          );

          return this.streamResponseHandler(onToken, onHistoryUpdate);
        }
      }
    }

    this.updateHistory(
      {
        type: 'message',
        role: 'assistant',
        content: fullResponse,
      },
      onHistoryUpdate
    );

    return fullResponse;
  }

  getHistory(): AgentMessage[] {
    return this.history.filter(isAgentMessage).map((item) => ({
      role: item.role,
      content: item.content,
    }));
  }

  cleanUp(): void {
    // TODO: Implement any necessary cleanup logic
  }
}
