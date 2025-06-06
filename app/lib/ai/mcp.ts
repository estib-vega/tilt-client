import { readLocalStorageJson, writeLocalStorageJson } from '../persistance';
import { z } from 'zod';
import { MCPTools, MCPPrompts } from '@/lib/ai/mcp';

const MCP_CLIENTS_SERVERS = 'mcp-clients-servers';

const MCPServerDescriptionSchema = z.object({
  name: z.string(),
  command: z.string(),
  args: z.array(z.string()),
});

type MCPServerDescription = z.infer<typeof MCPServerDescriptionSchema>;

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

  constructor() {
    this.servers = getMCPServers();
  }

  getServerList(): MCPServerDescription[] {
    return this.servers;
  }

  async init() {
    await window.api.invoke('set-mcp-client-list', this.servers);
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
}
