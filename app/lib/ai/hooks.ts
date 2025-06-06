import React from 'react';
import { TiltAgent } from './agent';

/**
 * Custom hook to manage the TiltAgent instance.
 *
 * This hook initializes a TiltAgent instance when the component mounts
 * and cleans it up when the component unmounts.
 */
export function useAgent(apiKey: string | undefined): TiltAgent | null {
  const agentRef = React.useRef<TiltAgent | null>(null);
  const [, flushUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    if (!agentRef.current && apiKey) {
      agentRef.current = new TiltAgent(apiKey);
      flushUpdate();
    }
    return () => {
      agentRef.current?.cleanUp();
      agentRef.current = null;
    };
  }, [apiKey]);

  return agentRef.current;
}

/**
 * Custom hook to manage the API key.
 *
 * Will persist the API key in localStorage
 */
export function useApiKey(): [string, (value: string) => void] {
  const [apiKey, setApiKey] = React.useState<string>('');

  React.useEffect(() => {
    const key = localStorage.getItem('apiKey');
    if (key) {
      setApiKey(key);
    }
  }, []);

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('apiKey', newApiKey);
  };

  return [apiKey, handleApiKeyChange];
}
