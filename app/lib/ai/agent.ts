import { OpenAI } from 'openai';
import { ForgetMemoryTool, ListMemoriesTool, ReadMemoryTool, WriteMemoryTool } from './tools/memory';

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

interface AgentAskParams {
  question: string;
  onToken: (token: string) => void;
  onHistoryUpdate?: (history: AgentMessage[]) => void;
}

export class TiltAgent {
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
  }

  private toolsJson() {
    return this.tools.map((tool) => tool.getJson());
  }

  private callTool(toolName: string, args: string) {
    const tool = this.tools.find((t) => t.name === toolName);
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
