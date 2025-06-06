import { useMCPHost } from '@/app/lib/ai/hooks';
import { InputWithLabel } from '../generics/InputWithLabel';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { MCPHost } from '@/app/lib/ai/mcp';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import React from 'react';

interface MCPServersProps {
  mcpHost: MCPHost | null;
  flushUpdate: () => void;
}

const MCPServers = ({ mcpHost, flushUpdate }: MCPServersProps) => {
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
    <div className="bg-accent rounded-sm">
      {mcpHost.getServerList().map((server) => (
        <div key={server.name} className="flex items-center justify-between p-2">
          <span>{server.name}</span>
          <span className="text-xs text-muted-foreground select-text">
            {server.command} {server.args.join(' ')}
          </span>
          <Button variant="ghost" size="sm" onClick={() => remove(server.name)}>
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
};

interface MCPAddServerProps {
  mcpHost: MCPHost | null;
  flushUpdate: () => void;
}

const MCPAddServerButton = ({ mcpHost, flushUpdate }: MCPAddServerProps) => {
  const [open, setOpen] = React.useState(false);

  const [serverName, setServerName] = React.useState('');
  const [serverCommand, setServerCommand] = React.useState('');
  const [serverArgs, setServerArgs] = React.useState('');

  const cancel = () => {
    setServerName('');
    setServerCommand('');
    setServerArgs('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      cancel();
    }
    setOpen(open);
  };

  const parsedServerArgs = serverArgs.split(',').map((arg) => arg.trim());
  const addButtonDisabled = !serverName || !serverCommand || !parsedServerArgs.length;

  const submitServer = async () => {
    if (!mcpHost) {
      console.error('MCP Host is not initialized');
      return;
    }

    const serverDescription = {
      name: serverName,
      command: serverCommand,
      args: parsedServerArgs,
    };

    try {
      await mcpHost.upsertClient(serverDescription);
      flushUpdate();
      cancel();
      setOpen(false);
    } catch (error) {
      console.error('Failed to add MCP server:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={!mcpHost} className="text-xs" size="sm">
          Add MCP server
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an MCP Server</DialogTitle>
          <DialogDescription>
            Enter the details of the MCP server you want to add. The server will be added to the list and can be used
            immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <InputWithLabel
            id="mcpServerName"
            label="Server Name"
            required
            placeholder="Enter server name"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
          />
          <InputWithLabel
            id="mcpServerCommand"
            label="Command"
            required
            placeholder="Enter command"
            value={serverCommand}
            onChange={(e) => setServerCommand(e.target.value)}
          />
          <InputWithLabel
            id="mcpServerArgs"
            label="Arguments"
            required
            placeholder="Enter arguments (comma separated)"
            value={serverArgs}
            onChange={(e) => setServerArgs(e.target.value)}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button disabled={addButtonDisabled} type="submit" onClick={submitServer}>
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MCPSettings = () => {
  const [_, flushUpdate] = React.useReducer((x) => x + 1, 0);
  const mcpHost = useMCPHost();

  return (
    <div className="flex flex-col gap-2">
      <Label>MCP</Label>
      <MCPServers mcpHost={mcpHost} flushUpdate={flushUpdate} />
      <div className="flex justify-center">
        <MCPAddServerButton mcpHost={mcpHost} flushUpdate={flushUpdate} />
      </div>
    </div>
  );
};

interface SettingsViewProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const SettingsView = (props: SettingsViewProps): React.JSX.Element => {
  return (
    <div className=" h-full w-full p-4">
      <h1 className="text-2xl mb-16">Settings</h1>

      <InputWithLabel
        id="apiKey"
        label="Open AI API Key"
        type="password"
        placeholder="Enter your API key"
        value={props.apiKey}
        onChange={(e) => props.setApiKey(e.target.value)}
      />

      <p className="text-sm text-muted-foreground mt-2">
        Your API key is used to authenticate requests to the OpenAI API. Keep it secret!
      </p>

      <Separator className="my-8" />

      <MCPSettings />
    </div>
  );
};
