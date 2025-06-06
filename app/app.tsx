import { Button } from '@/app/components/ui/button';
import { TiltAgent } from './lib/ai/agent';
import React from 'react';

/**
 * Custom hook to manage the TiltAgent instance.
 *
 * This hook initializes a TiltAgent instance when the component mounts
 * and cleans it up when the component unmounts.
 */
function useAgent(): TiltAgent | null {
  const agentRef = React.useRef<TiltAgent | null>(null);
  const [, flushUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    if (!agentRef.current) {
      agentRef.current = new TiltAgent();
      flushUpdate();
    }
    return () => {
      agentRef.current?.cleanUp();
      agentRef.current = null;
    };
  }, []);

  return agentRef.current;
}

const ChatView = (): React.JSX.Element => {
  const agent = useAgent();

  return (
    <div>
      <h2 className="text-2xl font-semibold text-accent-foreground">Chat View</h2>
      <p className="text-muted-foreground">This is where the chat interface will be implemented.</p>
      {agent ? (
        <p className="text-green-500">Agent is ready to use!</p>
      ) : (
        <p className="text-red-500">Agent is not initialized.</p>
      )}
    </div>
  );
};

export default function App() {
  return (
    <div className="flex h-full w-full items-center justify-center ">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold text-accent-foreground">tilt</h1>
        <Button onClick={() => document.documentElement.classList.toggle('dark')}>toggle</Button>

        <ChatView />
      </div>
    </div>
  );
}
