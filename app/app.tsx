import { Button } from '@/app/components/ui/button';
import React from 'react';
import { useApiKey } from './lib/ai/hooks';
import { ChatView } from './components/chat/ChatView';

export default function App() {
  const [apiKey, setApiKey] = useApiKey();

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex gap-4 items-center justify-end p-2 sticky top-0 border-b border-secondary bg-background">
        <Button size="sm" onClick={() => document.documentElement.classList.toggle('dark')}>
          toggle
        </Button>
        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
      </div>

      <ChatView apiKey={apiKey} />
    </div>
  );
}
