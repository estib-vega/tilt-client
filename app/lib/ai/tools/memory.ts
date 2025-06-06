import { readLocalStorageJson, removeLocalStorage, writeLocalStorageJson } from '../../persistance';
import Tool from './tool';
import { z } from 'zod';
import { BrandedString } from '../../utils/branding';

type MemoryKey = BrandedString<'MemoryKey'>;

const MemorySchema = z.object({
  key: z.string(),
  description: z.string(),
  value: z.string(),
});

function readMemory(key: MemoryKey): z.infer<typeof MemorySchema> | null {
  const memory = readLocalStorageJson(key, MemorySchema);
  return memory;
}

const MemoryOutputSchema = z.object({
  message: z.string().optional(),
});

function createMemoryKey(key: string): MemoryKey {
  return `memory:${key}` as MemoryKey;
}

function isMemoryKey(key: string): key is MemoryKey {
  return key.startsWith('memory:');
}

function cleanMemoryKey(key: MemoryKey): string {
  return key.replace('memory:', '');
}

function cleanMemoeryKeyIfNeeded(key: string): string {
  return isMemoryKey(key) ? cleanMemoryKey(key) : key;
}

const MEMORY_MANIFEST_KEY = 'memoryManifest';

const MemoryManifestSchema = z.array(
  z.object({
    key: z.string(),
    description: z.string(),
  })
);

function getMemoryManifest(): z.infer<typeof MemoryManifestSchema> {
  const manifest = readLocalStorageJson(MEMORY_MANIFEST_KEY, MemoryManifestSchema);
  return manifest ?? [];
}

function addMemoryManifest(key: MemoryKey, description: string): void {
  const manifest = getMemoryManifest();

  if (manifest.map((i) => i.key).includes(key)) {
    throw new Error(`Memory key "${key}" already exists. Please use a different key.`);
  }

  manifest.push({
    key,
    description,
  });

  writeLocalStorageJson(MEMORY_MANIFEST_KEY, manifest);
}

function removeMemoryManifest(key: MemoryKey): void {
  const manifest = getMemoryManifest();
  writeLocalStorageJson(
    MEMORY_MANIFEST_KEY,
    manifest.filter((i) => i.key !== key)
  );
  removeLocalStorage(key);
}

export class WriteMemoryTool extends Tool<typeof MemorySchema, typeof MemoryOutputSchema> {
  constructor() {
    const fn = async (args: z.infer<typeof MemorySchema>) => {
      const key = createMemoryKey(args.key);
      addMemoryManifest(key, args.description);

      writeLocalStorageJson(key, {
        key: args.key,
        description: args.description,
        value: args.value,
      });

      return {
        message: `Memory stored successfully with key "${args.key}".`,
      };
    };
    super('write_memory', 'Store and retrieve key-value pairs in memory.', MemorySchema, MemoryOutputSchema, fn);
  }
}

const ListMemoriesInputSchema = z.object({});

const ListMemoriesOutputSchema = z.object({
  memories: z.array(
    z.object({
      key: z.string(),
      description: z.string(),
    })
  ),
});

export class ListMemoriesTool extends Tool<typeof ListMemoriesInputSchema, typeof ListMemoriesOutputSchema> {
  constructor() {
    const fn = async () => {
      const manifest = getMemoryManifest();
      return {
        memories: manifest.map((item) => ({
          key: cleanMemoeryKeyIfNeeded(item.key),
          description: item.description,
        })),
      };
    };
    super('list_memories', 'List all stored memories.', ListMemoriesInputSchema, ListMemoriesOutputSchema, fn);
  }
}

const ReadMemoryInputSchema = z.object({
  key: z.string(),
});

export class ReadMemoryTool extends Tool<typeof ReadMemoryInputSchema, typeof MemorySchema> {
  constructor() {
    const fn = async (args: z.infer<typeof ReadMemoryInputSchema>) => {
      const key = createMemoryKey(args.key);
      const memory = readMemory(key);

      if (!memory) {
        throw new Error(`Memory with key "${args.key}" not found.`);
      }

      return memory;
    };
    super('read_memory', 'Retrieve a stored memory by its key.', ReadMemoryInputSchema, MemorySchema, fn);
  }
}

const ForgetMemoryInputSchema = z.object({
  key: z.string(),
});

const ForgetMemoryOutputSchema = z.object({
  message: z.string().optional(),
});

export class ForgetMemoryTool extends Tool<typeof ForgetMemoryInputSchema, typeof ForgetMemoryOutputSchema> {
  constructor() {
    const fn = async (args: z.infer<typeof ForgetMemoryInputSchema>) => {
      const key = createMemoryKey(args.key);
      const memory = readMemory(key);

      if (!memory) {
        throw new Error(`Memory with key "${args.key}" not found.`);
      }

      removeMemoryManifest(key);

      return {
        message: `Memory with key "${args.key}" has been removed.`,
      };
    };
    super('forget_memory', 'Remove a stored memory by its key.', ForgetMemoryInputSchema, ForgetMemoryOutputSchema, fn);
  }
}
