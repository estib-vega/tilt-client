import { OpenAI } from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

interface SuccessfulCallResult<T> {
  success: true;
  result: T;
}

interface FailedCallResult {
  success: false;
  error: string;
}

export type CallResult<T> = SuccessfulCallResult<T> | FailedCallResult;

export default class Tool<T extends z.AnyZodObject, O extends z.AnyZodObject> {
  constructor(
    public name: string,
    private description: string,
    private argumentsSchema: T,
    private outputSchema: O,
    private fn: (args: z.infer<T>) => Promise<z.infer<O>>
  ) {}

  getJson(): OpenAI.Responses.Tool {
    return {
      type: 'function',
      name: this.name,
      description: this.description,
      parameters: zodToJsonSchema(this.argumentsSchema),
      strict: true,
    };
  }

  async call(args: string): Promise<CallResult<z.infer<O>>> {
    const jsonArgs = JSON.parse(args);
    const parsedArgs = this.argumentsSchema.safeParse(jsonArgs);
    if (!parsedArgs.success) {
      return {
        success: false,
        error: `Invalid arguments for tool ${this.name}: ${parsedArgs.error.message}`,
      };
    }

    try {
      const result = await this.fn(parsedArgs.data);
      const parsedResult = this.outputSchema.parse(result);

      return {
        success: true,
        result: parsedResult,
      };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Output validation failed for tool ${this.name}: ${error.message}`,
        };
      }

      return {
        success: false,
        error: `Error calling tool ${this.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
