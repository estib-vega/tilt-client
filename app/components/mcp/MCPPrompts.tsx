import { MCPServersInfo } from '@/app/lib/ai/mcp';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface MCPPromptsProps {
  prompts: MCPServersInfo['prompts'];
}

export const MCPPrompts = ({ prompts }: MCPPromptsProps) => {
  if (prompts.length === 0) {
    return <div className="text-muted-foreground">None</div>;
  }

  return (
    <div className="flex flex-wrap gap-1 text-xs text-muted-foreground bg-background mb-2">
      {prompts.map((prompt) => (
        <Tooltip key={prompt.name}>
          <TooltipTrigger asChild>
            <Button className="text-xs bg-accent" size="sm" variant="ghost">
              {prompt.name}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm text-pretty">{prompt.description}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
