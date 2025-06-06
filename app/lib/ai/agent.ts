import { OpenAI } from 'openai';

const DEFAULT_MODEL = 'gpt-4.1-mini';

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function isAgentMessage(message: OpenAI.Responses.ResponseInputItem): message is AgentMessage {
  return (
    message.type === 'message' &&
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string'
  );
}

interface AgentAskParams {
  question: string;
  onToken: (token: string) => void;
  onHistoryUpdate?: (history: AgentMessage[]) => void;
}

export class TiltAgent {
  private client: OpenAI;
  private history: OpenAI.Responses.ResponseInputItem[] = [];

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async ask(params: AgentAskParams): Promise<string> {
    const { question, onToken, onHistoryUpdate } = params;
    try {
      this.history.push({
        type: 'message',
        role: 'user',
        content: question,
      });

      if (onHistoryUpdate) {
        onHistoryUpdate(this.getHistory());
      }

      const result = await this.client.responses.create({
        model: DEFAULT_MODEL,
        input: this.history,
        stream: true,
      });

      let fullResponse = '';

      for await (const event of result) {
        if (event.type === 'response.output_text.delta') {
          const token = event.delta;
          fullResponse += token;
          onToken(token);
        }
      }

      this.history.push({
        type: 'message',
        role: 'assistant',
        content: fullResponse,
      });

      if (onHistoryUpdate) {
        onHistoryUpdate(this.getHistory());
      }

      return fullResponse;
    } catch (error) {
      console.error('Error during ask:', error);
      return '';
    }
  }

  getHistory(): AgentMessage[] {
    return this.history.filter(isAgentMessage).map((item) => ({
      role: item.role,
      content: item.content,
    }));
  }

  cleanUp(): void {
    // TODO: Implement any necessary cleanup logic
  }
}
