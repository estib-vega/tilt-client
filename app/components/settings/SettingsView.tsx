import { InputWithLabel } from '../generics/InputWithLabel';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

interface SettingsViewProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}
export const SettingsView = (props: SettingsViewProps): React.JSX.Element => {
  return (
    <div className=" h-full w-full p-4">
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

      <div className="flex flex-col gap-2">
        <Label>MCP</Label>
        <div className="flex justify-center">
          <Button className="text-xs" size="sm">
            Add MCP server
          </Button>
        </div>
      </div>
    </div>
  );
};
