import { useMCPHost } from '@/app/lib/ai/hooks';
import { InputWithLabel } from '../generics/InputWithLabel';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

const MCPServers = () => {
  const mcpHost = useMCPHost();

  if (!mcpHost) {
    return <div>Loading MCP servers...</div>;
  }

  const servers = mcpHost.getServerList();
  if (servers.length === 0) {
    return <div className="text-muted-foreground">No MCP servers configured</div>;
  }

  return (
    <div>
      {mcpHost.getServerList().map((server) => (
        <div key={server.name} className="flex items-center justify-between p-2 border-b">
          <span>{server.name}</span>
          <span className="text-xs text-muted-foreground">
            {server.command} {server.args.join(' ')}
          </span>
          <Button variant="ghost" size="sm" onClick={() => mcpHost.removeClient(server.name)}>
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
};

const MCPSettings = () => {
  return (
    <div className="flex flex-col gap-2">
      <Label>MCP</Label>
      <MCPServers />
      <div className="flex justify-center">
        <Button className="text-xs" size="sm">
          Add MCP server
        </Button>
      </div>
    </div>
  );
};

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

      <MCPSettings />
    </div>
  );
};
