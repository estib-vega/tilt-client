import { MCPHost, MCPServerDescription, MCPServersInfo } from '@/app/lib/ai/mcp';
import React, { Suspense } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Minus, Plus } from 'lucide-react';

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

interface MCPServerEnvProps {
  mcpHost: MCPHost | null;
  server: MCPServerDescription;
}

const MCPServerEnv = ({ mcpHost, server }: MCPServerEnvProps) => {
  const [newEnv, setNewEnv] = React.useState<Record<string, string> | undefined>(structuredClone(server.env));

  const entries = React.useMemo(() => {
    return Object.entries(newEnv || {}).map(([key, value]) => ({ key, value }));
  }, [newEnv]);

  const updateEnvKey = (previousKey: string, newKey: string) => {
    setNewEnv((prev) => {
      if (!prev) return prev;
      const { [previousKey]: _, ...rest } = prev;
      return { ...rest, [newKey]: prev[previousKey] };
    });
  };

  const updateEnvValue = (key: string, value: string) => {
    setNewEnv((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  const removeEnvVar = (key: string) => {
    setNewEnv((prev) => {
      if (!prev) return prev;
      const { [key]: _, ...rest } = prev;
      if (Object.keys(rest).length === 0) {
        return undefined;
      }
      return rest;
    });
  };

  const submitValue = async () => {
    if (!mcpHost || !newEnv) {
      console.error('MCP Host is not initialized or newEnv is undefined');
      return;
    }
    try {
      await mcpHost.upsertClient({
        ...server,
        env: newEnv,
      });
    } catch (error) {
      console.error('Failed to update environment variables:', error);
    }
  };

  const findNewVarName = (baseName: string): string => {
    let index = 1;
    let newName = baseName;
    while (newEnv && newName in newEnv) {
      newName = `${baseName}_${index}`;
      index++;
    }
    return newName;
  };

  const addEnvVar = () => {
    const newVarName = findNewVarName('NEW_VAR');
    setNewEnv((prev) => ({
      ...prev,
      [newVarName]: 'SOME_VALUE',
    }));
  };

  return (
    <div className="p-2 flex justify-between ">
      <div>
        {entries.length === 0 ? (
          <div className="text-muted-foreground text-xs mb-2">No environment variables set</div>
        ) : (
          <div className="text-muted-foreground text-xs mb-2">Environment Variables:</div>
        )}
        {entries.map(({ key, value }, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <Input value={key} onChange={(e) => updateEnvKey(key, e.target.value)} />
            <Input value={value} onChange={(e) => updateEnvValue(key, e.target.value)} />
            <Button onClick={() => removeEnvVar(key)} variant="outline" size="sm" className="p-1">
              <Minus className="size-4" />
            </Button>
          </div>
        ))}
        <div className="py-1 flex">
          <Button onClick={() => addEnvVar()} variant="outline" size="sm" className="p-1">
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      {newEnv !== undefined ? (
        <Button variant="ghost" size="sm" onClick={submitValue}>
          Update environment
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={addEnvVar}>
          Add variable
        </Button>
      )}
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

      <MCPServerEnv mcpHost={mcpHost} server={server} />

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
