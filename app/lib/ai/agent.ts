import { Agent, run } from '@openai/agents';

const DEFAULT_MODEL = 'gpt-4.1-mini';

export class TiltAgent {
  private agent: Agent;

  constructor() {
    this.agent = new Agent({
      model: DEFAULT_MODEL,
      name: 'Tilt Agent',
      instructions: 'You are a helpful assistant that can answer questions.',
    });
  }

  async ask(question: string, onToken: (token: string) => void): Promise<string> {
    const result = await run(this.agent, question, {
      stream: true,
    });

    const stream = result.toTextStream();
    let fullResponse = '';
    for await (const token of stream) {
      fullResponse += token;
      onToken(token);
    }
    return fullResponse;
  }

  cleanUp(): void {
    // TODO: Implement any necessary cleanup logic
  }
}
