import React from 'react';
import { z } from 'zod';

export function readLocalStorage(key: string): string | null {
  return localStorage.getItem(key);
}

export function writeLocalStorage(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function removeLocalStorage(key: string): void {
  localStorage.removeItem(key);
}

export function clearLocalStorage(): void {
  localStorage.clear();
}

export function writeLocalStorageJson<T>(key: string, value: T): void {
  const jsonValue = JSON.stringify(value);
  writeLocalStorage(key, jsonValue);
}

export function readLocalStorageJson<T>(key: string, schema: z.ZodType<T>): T | null {
  const value = readLocalStorage(key);
  if (value === null) {
    return null;
  }
  try {
    const parsedValue = JSON.parse(value);
    return schema.parse(parsedValue);
  } catch (error) {
    console.error(`Error parsing JSON from localStorage for key "${key}":`, error);
    return null;
  }
}

/**
 * Custom hook to manage a persisted state in localStorage.
 *
 * This hook initializes the state from localStorage if available,
 * and provides a function to update the state and persist it.
 */
export function usePersistedState(key: string): [string, (value: string) => void] {
  const [state, setState] = React.useState<string>(() => {
    const storedValue = readLocalStorage(key);
    return storedValue ?? '';
  });

  const setPersistedState = (value: string) => {
    setState(value);
    writeLocalStorage(key, value);
  };

  return [state, setPersistedState];
}
