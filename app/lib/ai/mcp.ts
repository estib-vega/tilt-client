import { readLocalStorageJson, writeLocalStorageJson } from '../persistance';
import { z } from 'zod';
import { MCPTools, MCPPrompts } from '@/lib/ai/mcp';
import { CallResult } from './tools/tool';

const MCP_CLIENTS_SERVERS = 'mcp-clients-servers';

const MCPServerDescriptionSchema = z.object({
  name: z.string(),
  command: z.string(),
  args: z.array(z.string()),
  env: z.record(z.string()).optional(),
});

export type MCPServerDescription = z.infer<typeof MCPServerDescriptionSchema>;

export interface MCPServersInfo extends MCPServerDescription {
  tools: MCPTools;
  prompts: MCPPrompts;
}

function writeMCPServers(clients: MCPServerDescription[]): void {
  writeLocalStorageJson(MCP_CLIENTS_SERVERS, clients);
}

function getMCPServers(): MCPServerDescription[] {
  const storedClients = readLocalStorageJson(MCP_CLIENTS_SERVERS, z.array(MCPServerDescriptionSchema));
  return storedClients ?? [];
}

export class MCPHost {
  private servers: MCPServerDescription[];
  private isInitialized = false;
  private static instance: MCPHost;

  private constructor() {
    this.servers = getMCPServers();
  }

  static getInstance(): MCPHost {
    if (!MCPHost.instance) {
      MCPHost.instance = new MCPHost();
    }
    return MCPHost.instance;
  }

  getServerList(): MCPServerDescription[] {
    return this.servers;
  }

  async init() {
    if (this.isInitialized) return;
    await window.api.invoke('set-mcp-client-list', this.servers);
    this.isInitialized = true;
  }

  ready(): boolean {
    return this.isInitialized;
  }

  async upsertClient(client: MCPServerDescription): Promise<void> {
    const existingIndex = this.servers.findIndex((c) => c.name === client.name);
    if (existingIndex === -1) {
      // Client does not exist, add it
      this.servers.push(client);
    } else {
      // Client exists, update it
      this.servers[existingIndex] = client;
    }
    writeMCPServers(this.servers);
    await window.api.invoke('set-mcp-client-list', this.servers);
  }

  async removeServer(name: string): Promise<void> {
    this.servers = this.servers.filter((client) => client.name !== name);
    writeMCPServers(this.servers);
    await window.api.invoke('set-mcp-client-list', this.servers);
  }

  async getServcersInfo(): Promise<MCPServersInfo[]> {
    const clientsInfo = await window.api.invoke('get-mcp-clients-info');
    return clientsInfo as MCPServersInfo[];
  }

  async getServerInfoByName(name: string): Promise<MCPServersInfo | undefined> {
    const clientsInfo = await window.api.invoke('get-mcp-client-info-by-name', name);
    return clientsInfo as MCPServersInfo | undefined;
  }

  async callTool(serverName: string, toolName: string, args: Record<string, unknown>): Promise<CallResult<unknown>> {
    try {
      const data: unknown = await window.api.invoke('call-tool', serverName, toolName, args);
      return {
        success: true,
        result: data,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to call tool ${toolName} on server ${serverName}: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
