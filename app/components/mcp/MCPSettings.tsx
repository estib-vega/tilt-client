import { useMCPHost } from '@/app/lib/ai/hooks';
import { Label } from '../ui/label';
import { MCPAddServerButton } from './MCPAddServerButton';
import React from 'react';
import { MCPServers } from './MCPServers';

export const MCPSettings = () => {
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
