import { Button } from '@/app/components/ui/button';
import React from 'react';
import { useApiKey } from './lib/ai/hooks';
import { ChatView } from './components/chat/ChatView';
import { useWindowContext } from '@/lib/window';
import { Page } from './components/window/WindowContext';
import { BotMessageSquare, Settings } from 'lucide-react';
import { SettingsView } from './components/settings/SettingsView';

interface PageControllerProps {
  page: Page;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const PageController = (props: PageControllerProps) => {
  const { page, apiKey, setApiKey } = props;

  switch (page) {
    case 'chat':
      return <ChatView apiKey={apiKey} />;
    case 'settings':
      return <SettingsView apiKey={apiKey} setApiKey={setApiKey} />;
  }
};

export default function App() {
  const { navigation } = useWindowContext();
  const [apiKey, setApiKey] = useApiKey();

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex gap-4 items-center justify-end p-1 sticky top-0 border-b border-secondary bg-background">
        <Button
          className="cursor-opinter"
          disabled={navigation.page === 'chat'}
          variant="ghost"
          size="sm"
          onClick={() => navigation.setPage('chat')}
        >
          <BotMessageSquare />
        </Button>
        <Button
          className="cursor-pointer"
          disabled={navigation.page === 'settings'}
          variant="ghost"
          size="sm"
          onClick={() => navigation.setPage('settings')}
        >
          <Settings />
        </Button>
      </div>

      <PageController page={navigation.page} apiKey={apiKey} setApiKey={setApiKey} />
    </div>
  );
}
