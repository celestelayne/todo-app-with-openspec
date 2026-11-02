import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/tokens.css';
import './styles/global.css';

import App from './App.tsx';
import { QueryProvider } from './app/providers/QueryProvider.tsx';
import { ApiClientProvider } from './shared/api/ApiClientProvider.tsx';
import { createFetchApiClient } from './shared/api/FetchApiClient.ts';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is not set; copy .env.example to .env');
}

const apiClient = createFetchApiClient({ baseUrl: apiBaseUrl });

async function enableMocking() {
  if (import.meta.env.VITE_API_MODE !== 'mock') return;
  const { worker } = await import('./mocks/browser.ts');
  await worker.start();
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryProvider>
        <ApiClientProvider client={apiClient}>
          <App />
        </ApiClientProvider>
      </QueryProvider>
    </StrictMode>,
  );
});
