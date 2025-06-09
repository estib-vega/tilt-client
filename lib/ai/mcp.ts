import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ListPromptsResult, ListToolsResult } from '@modelcontextprotocol/sdk/types.js';

function logMCP(...args: unknown[]): void {
  // eslint-disable-next-line no-console
  console.log(`[MCP]`, ...args);
}
class StdioMCPClient {
  private client: Client;
  private transport: StdioClientTransport;
  private connected: boolean;
  private env: Record<string, string>;

  constructor(
    public name: string,
    private command: string,
    private args: string[],
    env: Record<string, string> | undefined
  ) {
    const defaultEnv = {
      ...process.env,
      ...(env ?? {}),
    } as Record<string, string>;

    logMCP(`Creating MCP Client: ${name} with command: ${command} args: ${args.join(' ')}`);
    this.env = defaultEnv;
    this.client = new Client({ name, version: '1.0' });
    this.transport = new StdioClientTransport({
      command,
      args,
      env: defaultEnv,
    });
    this.connected = false;
  }

  getCommand() {
    return this.command;
  }

  getArgs() {
    return this.args;
  }

  getEnv() {
    return this.env;
  }

  async connect() {
    if (this.connected) return;

    await this.client.connect(this.transport);
    this.connected = true;
  }

  async reconnect(command: string, args: string[], env: Record<string, string> | undefined) {
    await this.close();
    this.command = command;
    this.args = args;

    const defaultEnv = {
      ...process.env,
      ...(env ?? {}),
    } as Record<string, string>;

    this.env = defaultEnv;
    this.transport = new StdioClientTransport({
      command,
      args,
      env: defaultEnv,
    });

    await this.client.connect(this.transport);
    this.connected = true;
  }

  async tools(): Promise<MCPTools> {
    if (!this.connected) {
      throw new Error('Transport not initialized. Call connect() first.');
    }
    const response = await this.client.listTools();
    return response.tools;
  }

  async prompts(): Promise<MCPPrompts> {
    if (!this.connected) {
      throw new Error('Transport not initialized. Call connect() first.');
    }
    const response = await this.client.listPrompts();
    return response.prompts;
  }

  async callTool(toolName: string, args: Record<string, unknown>) {
    if (!this.connected) {
      throw new Error('Transport not initialized. Call connect() first.');
    }
    return this.client.callTool({
      name: toolName,
      arguments: args,
    });
  }

  async close() {
    if (this.connected) {
      this.connected = false;
      await this.client.close();
    }
  }
}

export type MCPTools = ListToolsResult['tools'];
export type MCPPrompts = ListPromptsResult['prompts'];

export interface MCPClientDescription {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface MCPClientInfo extends MCPClientDescription {
  tools: MCPTools;
  prompts: MCPPrompts;
}

export default class MCPHost {
  private stdioClients: Map<string, StdioMCPClient>;

  constructor() {
    this.stdioClients = new Map<string, StdioMCPClient>();
  }

  private async registerStdioClient(description: MCPClientDescription): Promise<StdioMCPClient> {
    const { name, command, args, env } = description;
    const existingClient = this.stdioClients.get(name);
    if (existingClient) {
      await existingClient.reconnect(command, args, env);
      return existingClient;
    }

    const client = new StdioMCPClient(name, command, args, env);
    this.stdioClients.set(name, client);
    return client;
  }

  private async closeClients(): Promise<void> {
    await Promise.all(Array.from(this.stdioClients.values()).map((client) => client.close()));
  }

  async setStdioClients(descriptions: MCPClientDescription[]): Promise<void> {
    await this.closeClients();
    this.stdioClients.clear();
    descriptions.forEach((desc) => this.registerStdioClient(desc));
  }

  async connectClients(): Promise<void> {
    await Promise.all(Array.from(this.stdioClients.values()).map((client) => client.connect()));
  }

  async getClientInfo(name: string): Promise<MCPClientInfo | undefined> {
    const client = this.stdioClients.get(name);
    if (!client) {
      console.warn(`Client with name "${name}" not found.`);
      return undefined;
    }

    const tools = await client.tools();
    const prompts = []; //await client.prompts();

    return {
      name: client.name,
      command: client.getCommand(),
      args: client.getArgs(),
      tools,
      prompts,
    };
  }

  async getClientsInfo(): Promise<MCPClientInfo[]> {
    const stdioClients = Array.from(this.stdioClients.values());
    logMCP(`Getting info for ${stdioClients.length} MCP clients`);

    const results = await Promise.allSettled(
      stdioClients.map(async (client): Promise<MCPClientInfo> => {
        const tools = await client.tools();
        const prompts = []; //await client.prompts();

        return {
          name: client.name,
          command: client.getCommand(),
          args: client.getArgs(),
          tools,
          prompts,
        };
      })
    );

    return results
      .map((result): MCPClientInfo | undefined => {
        if (result.status === 'rejected') {
          console.error(`Failed to get client info: ${result.reason}`);
          return undefined;
        }
        return result.value;
      })
      .filter((result) => result !== undefined);
  }

  async callTool(serverName: string, toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const client = this.stdioClients.get(serverName);
    if (!client) {
      throw new Error(`Client with name "${serverName}" not found.`);
    }
    return client.callTool(toolName, args);
  }
}
