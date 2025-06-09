import { ChatEvent } from '@/app/lib/ai/agent';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import { MD } from '../markdown/MD';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  message: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, role }) => {
  return (
    <div className={'flex grow-0 min-w-0' + (role === 'user' ? ' justify-end pl-20' : ' justify-start pr-20')}>
      <div className="grow-0 mb-2 p-2 rounded bg-secondary shadow-sm">
        <MD>{message}</MD>
      </div>
    </div>
  );
};

interface ToolCallEventProps {
  mcpServerName?: string;
  functionName: string;
  arguments: string;
}

const ToolCallEvent: React.FC<ToolCallEventProps> = ({ mcpServerName, functionName, arguments: args }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const message = mcpServerName
    ? `**MCP Tool call on ${mcpServerName}: ${functionName}**`
    : `**Tool call: ${functionName}**`;
  const parsedArgs = args ? JSON.parse(args) : {};

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex grow-0 min-w-0 justify-start pr-20">
        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex gap-2 w-full">
            <div className="grow-0 mb-2 p-2 rounded bg-secondary shadow-sm">
              <MD>{message}</MD>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div>
              <pre>
                <code>{JSON.stringify(parsedArgs, null, 2)}</code>
              </pre>
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
};

interface ToolCallOutputEventProps {
  output: string;
}

const ToolCallOutputEvent: React.FC<ToolCallOutputEventProps> = ({ output }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const parsedOutput = output ? JSON.parse(output) : {};

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex grow-0 min-w-0 justify-start pr-20">
        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex gap-2 w-full">
            <div className="grow-0 mb-2 p-2 rounded bg-secondary shadow-sm">
              <MD>{`**Tool output**`}</MD>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div>
              <pre>
                <code>{JSON.stringify(parsedOutput, null, 2)}</code>
              </pre>
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
};

interface EventProps {
  event: ChatEvent;
}

export const Event: React.FC<EventProps> = ({ event }) => {
  switch (event.type) {
    case 'message':
      return <ChatMessage message={event.content} role={event.role} />;
    case 'tool-call':
      return <ToolCallEvent functionName={event.functionName} arguments={event.arguments} />;
    case 'tool-call-output':
      return <ToolCallOutputEvent output={event.output} />;
    case 'mcp-tool-call':
      return (
        <ToolCallEvent mcpServerName={event.serverName} functionName={event.toolName} arguments={event.arguments} />
      );
  }
};
