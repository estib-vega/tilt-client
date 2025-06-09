import React from 'react';
import { TiltAgent } from './agent';
import { usePersistedState } from '../persistance';
import { MCPHost } from './mcp';

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
      agentRef.current.init().then(() => {
        flushUpdate();
      });
    }
    return () => {
      agentRef.current?.cleanUp();
      agentRef.current = null;
    };
  }, [apiKey]);

  return agentRef.current?.ready() ? agentRef.current : null;
}

/**
 * Custom hook to manage the MCPHost instance.
 *
 * This hook initializes a MCPHost instance when the component mounts
 * and cleans it up when the component unmounts.
 */
export function useMCPHost(): MCPHost | null {
  const mcpHostRef = React.useRef<MCPHost | null>(null);
  const [, flushUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    if (!mcpHostRef.current) {
      mcpHostRef.current = MCPHost.getInstance();
      mcpHostRef.current.init().then(() => {
        flushUpdate();
      });
    }
    return () => {
      mcpHostRef.current = null;
    };
  }, []);

  return mcpHostRef.current?.ready() ? mcpHostRef.current : null;
}

const API_KEY_STORARGE_KEY = 'apiKey';
/**
 * Custom hook to manage the API key.
 *
 * Will persist the API key in localStorage
 */
export function useApiKey(): [string, (value: string) => void] {
  return usePersistedState(API_KEY_STORARGE_KEY);
}
