import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';
import { useAgent } from '@/app/lib/ai/hooks';
import React from 'react';
import { ChatEvent } from '@/app/lib/ai/agent';
import { ChatMessage, Event } from './Event';

interface ChatViewProps {
  apiKey: string | undefined;
}

export const ChatView = (props: ChatViewProps): React.JSX.Element => {
  const agent = useAgent(props.apiKey);
  const [input, setInput] = React.useState<string>('');
  const [events, setEvents] = React.useState<ChatEvent[]>([]);
  const [incomingMessage, setIncomingMessage] = React.useState<string>('');

  if (!agent) {
    return <p>Loading agent...</p>;
  }

  const onToken = (token: string) => {
    setIncomingMessage((prev) => prev + token);
  };

  const onChatEvent = (events: ChatEvent[]) => {
    setEvents(events);
    setIncomingMessage('');
  };

  const ask = () => {
    if (agent && input.trim()) {
      agent.ask({
        question: input,
        onToken,
        onChatEvent,
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
        {events.map((event, index) => (
          <Event key={index} event={event} />
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
