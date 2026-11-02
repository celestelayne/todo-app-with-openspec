import type { ReactNode } from 'react';

import type { ApiClient } from './ApiClient.ts';
import { ApiClientContext } from './ApiClientContext.ts';

export function ApiClientProvider({
  client,
  children,
}: {
  client: ApiClient;
  children: ReactNode;
}) {
  return <ApiClientContext value={client}>{children}</ApiClientContext>;
}
