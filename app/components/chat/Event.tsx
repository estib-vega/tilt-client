import Markdown from 'react-markdown';
import { ChatEvent } from '@/app/lib/ai/agent';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  message: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, role }) => {
  return (
    <div className={'flex grow-0 min-w-0' + (role === 'user' ? ' justify-end pl-20' : ' justify-start pr-20')}>
      <div className="grow-0 mb-2 p-2 rounded bg-secondary shadow-sm">
        <Markdown>{message}</Markdown>
      </div>
    </div>
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
      return <ChatMessage message={`Tool call: ${event.functionName}(${event.arguments})`} role="assistant" />;
    case 'tool-call-output':
      return <ChatMessage message={`Tool output: ${event.output}`} role="assistant" />;
    case 'mcp-tool-call':
      return (
        <ChatMessage
          message={`MCP Tool call: ${event.serverName}/${event.toolName}(${event.arguments})`}
          role="assistant"
        />
      );
  }
};
