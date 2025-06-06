import { AgentMessage } from '@/app/lib/ai/agent';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { useAgent } from '@/app/lib/ai/hooks';
import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  message: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, role }) => {
  return (
    <div className={'flex grow-0 min-w-0' + (role === 'user' ? ' justify-end pl-20' : ' justify-start pr-20')}>
      <div className="flex grow-0 mb-2 p-2 rounded bg-secondary shadow-sm">
        <p className="text-sm text-primary">{message}</p>
      </div>
    </div>
  );
};

interface ChatViewProps {
  apiKey: string | undefined;
}

export const ChatView = (props: ChatViewProps): React.JSX.Element => {
  const agent = useAgent(props.apiKey);
  const [input, setInput] = React.useState<string>('');
  const [messages, setMessages] = React.useState<AgentMessage[]>([]);
  const [incomingMessage, setIncomingMessage] = React.useState<string>('');

  if (!agent) {
    return <p>Loading agent...</p>;
  }

  const onToken = (token: string) => {
    setIncomingMessage((prev) => prev + token);
  };

  const onHistoryUpdate = (history: AgentMessage[]) => {
    setMessages(history);
    setIncomingMessage('');
  };

  const ask = () => {
    if (agent && input.trim()) {
      agent.ask({
        question: input,
        onToken,
        onHistoryUpdate,
      });
      setInput('');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      ask();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="scrollable grow flex flex-col justify-start h-full w-full p-4 gap-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message.content} role={message.role} />
        ))}
        {incomingMessage ? <ChatMessage message={incomingMessage} role={'assistant'} /> : null}
      </div>

      <div className="flex border-t border-secondary max-h-40 p-2 gap-2 ">
        <Textarea
          placeholder="Type your message here..."
          className="w-full h-full outline-none resize-none"
          value={input}
          onKeyDown={onKeyDown}
          onInput={(e) => setInput(e.currentTarget.value)}
        ></Textarea>

        <Button onClick={ask}>Send</Button>
      </div>
    </div>
  );
};
