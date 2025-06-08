import { MCPServersInfo } from '@/app/lib/ai/mcp';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface MCPToolsProps {
  tools: MCPServersInfo['tools'];
}

export const MCPTools = ({ tools }: MCPToolsProps) => {
  if (tools.length === 0) {
    return <div className="text-muted-foreground">None</div>;
  }

  return (
    <div className="flex flex-wrap gap-1 text-xs text-muted-foreground bg-background mb-2">
      {tools.map((tool) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="text-xs bg-accent" size="sm" variant="ghost" key={tool.name}>
              {tool.name}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm text-pretty">{tool.description}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
