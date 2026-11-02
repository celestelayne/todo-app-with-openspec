import { createContext, use } from 'react';

import type { ApiClient } from './ApiClient.ts';

export const ApiClientContext = createContext<ApiClient | null>(null);

export function useApiClient(): ApiClient {
  const client = use(ApiClientContext);
  if (client === null) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return client;
}
