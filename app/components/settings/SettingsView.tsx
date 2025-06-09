import { InputWithLabel } from '../generics/InputWithLabel';
import { MCPSettings } from '../mcp/MCPSettings';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import React from 'react';
interface SettingsViewProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

export const SettingsView = (props: SettingsViewProps): React.JSX.Element => {
  return (
    <ScrollArea className=" h-full w-full p-4">
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

      <div className="h-[70vh] w-full flex-shrink-0">{/* empty trail */}</div>
    </ScrollArea>
  );
};
