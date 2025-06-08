import { MCPHost } from '@/app/lib/ai/mcp';
import React from 'react';
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
import { Button } from '../ui/button';
import { InputWithLabel } from '../generics/InputWithLabel';

interface MCPAddServerProps {
  mcpHost: MCPHost | null;
  flushUpdate: () => void;
}

export const MCPAddServerButton = ({ mcpHost, flushUpdate }: MCPAddServerProps) => {
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
