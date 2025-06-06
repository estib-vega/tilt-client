import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class StdioMCPClient {
  private client: Client;
  private transport: StdioClientTransport;
  private connected: boolean;

  constructor(
    public name: string,
    private command: string,
    private args: string[]
  ) {
    this.client = new Client({ name, version: '1.0' });
    this.transport = new StdioClientTransport({
      command,
      args,
    });
    this.connected = false;
  }

  getCommand() {
    return this.command;
  }

  getArgs() {
    return this.args;
  }

  async connect() {
    if (this.connected) return;

    await this.client.connect(this.transport);
    this.connected = true;
  }

  async reconnect(command: string, args: string[]) {
    await this.close();
    this.command = command;
    this.args = args;
    this.transport = new StdioClientTransport({
      command,
      args,
    });

    await this.client.connect(this.transport);
    this.connected = true;
  }

  async tools() {
    if (!this.connected) {
      throw new Error('Transport not initialized. Call connect() first.');
    }
    const response = await this.client.listTools();
    return response.tools;
  }

  async prompts() {
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

export type MCPTools = Awaited<ReturnType<typeof StdioMCPClient.prototype.tools>>;
export type MCPPrompts = Awaited<ReturnType<typeof StdioMCPClient.prototype.prompts>>;

export interface MCPClientDescription {
  name: string;
  command: string;
  args: string[];
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
    const { name, command, args } = description;
    const existingClient = this.stdioClients.get(name);
    if (existingClient) {
      await existingClient.reconnect(command, args);
      return existingClient;
    }

    const client = new StdioMCPClient(name, command, args);
    this.stdioClients.set(name, client);
    return client;
  }

  private async closeClients(): Promise<void> {
    await Promise.allSettled(Array.from(this.stdioClients.values()).map((client) => client.close()));
  }

  async setStdioClients(descriptions: MCPClientDescription[]): Promise<void> {
    await this.closeClients();
    this.stdioClients.clear();
    descriptions.forEach((desc) => this.registerStdioClient(desc));
  }

  async connectClients(): Promise<void> {
    await Promise.allSettled(Array.from(this.stdioClients.values()).map((client) => client.connect()));
  }

  async getClientsInfo(): Promise<MCPClientInfo[]> {
    const results = await Promise.allSettled(
      Array.from(this.stdioClients.values()).map(async (client): Promise<MCPClientInfo> => {
        const tools = await client.tools();
        const prompts = await client.prompts();

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
      .filter((result) => result !== undefined)
      .map((info) => info);
  }
}
