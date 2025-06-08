import { MCPHost, MCPServerDescription, MCPServersInfo } from '@/app/lib/ai/mcp';
import React, { Suspense } from 'react';
import { Button } from '../ui/button';

interface MCPServerInfoProps {
  info: Promise<MCPServersInfo | undefined>;
}

const MCPServerInfo = ({ info }: MCPServerInfoProps) => {
  const resolvedInfo = React.use(info);

  if (!resolvedInfo) {
    return <div className="text-muted-foreground">No server info available</div>;
  }

  return (
    <div className="p-2 text-xs text-muted-foreground bg-background border border-accent mb-2">
      <div>
        <strong>Tools:</strong>{' '}
        {resolvedInfo.tools.length > 0 ? resolvedInfo.tools.map((tool) => tool.name).join(', ') : 'None'}
      </div>
      <div>
        <strong>Prompts:</strong>{' '}
        {resolvedInfo.prompts.length > 0 ? resolvedInfo.prompts.map((prompt) => prompt.name).join(', ') : 'None'}
      </div>
    </div>
  );
};

interface MCPServerProps {
  mcpHost: MCPHost | null;
  server: MCPServerDescription;
  remove: () => void;
}

const MCPServer = ({ server, remove, mcpHost }: MCPServerProps) => {
  const info = React.useMemo(() => mcpHost?.getServerInfoByName(server.name), [mcpHost, server.name]);

  return (
    <div className="flex flex-col">
      <div className="bg-accent flex items-center justify-between p-2">
        <span>{server.name}</span>
        <span className="text-xs text-muted-foreground select-text">
          {server.command} {server.args.join(' ')}
        </span>
        <Button variant="ghost" size="sm" onClick={remove}>
          Remove
        </Button>
      </div>
      {info && (
        <Suspense fallback={<div className="text-muted-foreground">Loading server info...</div>}>
          <MCPServerInfo info={info} />
        </Suspense>
      )}
    </div>
  );
};

interface MCPServersProps {
  mcpHost: MCPHost | null;
  flushUpdate: () => void;
}

export const MCPServers = ({ mcpHost, flushUpdate }: MCPServersProps) => {
  if (!mcpHost) {
    return <div>Loading MCP servers...</div>;
  }

  const servers = mcpHost.getServerList();
  if (servers.length === 0) {
    return <div className="text-muted-foreground">No MCP servers configured</div>;
  }

  const remove = async (serverName: string) => {
    if (!mcpHost) {
      console.error('MCP Host is not initialized');
      return;
    }
    try {
      await mcpHost.removeServer(serverName);
      flushUpdate();
    } catch (error) {
      console.error('Failed to remove MCP server:', error);
    }
  };

  return (
    <div className="rounded-sm overflow-hidden">
      {servers.map((server) => (
        <MCPServer key={server.name} mcpHost={mcpHost} server={server} remove={() => remove(server.name)} />
      ))}
    </div>
  );
};
