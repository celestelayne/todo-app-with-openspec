import { useQuery } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { server } from '../../mocks/server.ts';
import { renderWithProviders, screen } from '../../test/render.tsx';
import { useApiClient } from './ApiClientContext.ts';

const healthSchema = z.object({ status: z.string() });

function HealthStatus() {
  const client = useApiClient();
  const { data, error, isPending } = useQuery({
    queryKey: ['health'],
    queryFn: async ({ signal }) =>
      healthSchema.parse(await client.get('/health', { signal })),
  });

  if (isPending) return <p>Loading</p>;
  if (error) return <p role="alert">Request failed</p>;
  return <p>Status: {data.status}</p>;
}

describe('API boundary', () => {
  it('shows data returned by a mocked HTTP response', async () => {
    renderWithProviders(<HealthStatus />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(await screen.findByText('Status: ok')).toBeInTheDocument();
  });

  it('shows an error when the API responds with a failure', async () => {
    server.use(
      http.get('*/health', () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );

    renderWithProviders(<HealthStatus />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Request failed',
    );
  });
});
