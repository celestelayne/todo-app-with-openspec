import { ApiError, type ApiClient, type RequestOptions } from './ApiClient.ts';

interface FetchApiClientConfig {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function buildUrl(
  baseUrl: string,
  path: string,
  query: RequestOptions['query'],
) {
  const base = new URL(baseUrl, globalThis.location?.origin);
  if (!base.pathname.endsWith('/')) base.pathname += '/';

  const url = new URL(path.replace(/^\//, ''), base);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url;
}

function parseJson(text: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

export function createFetchApiClient({
  baseUrl,
  fetch: fetchImpl = (input, init) => globalThis.fetch(input, init),
}: FetchApiClientConfig): ApiClient {
  async function request(
    method: HttpMethod,
    path: string,
    body: unknown,
    options: RequestOptions = {},
  ): Promise<unknown> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    Object.assign(headers, options.headers);

    let response: Response;
    try {
      response = await fetchImpl(buildUrl(baseUrl, path, options.query), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: options.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
      throw new ApiError('network', 'Network request failed');
    }

    const text = await response.text();
    const parsed = text === '' ? undefined : parseJson(text);

    if (!response.ok) {
      throw new ApiError(
        'http',
        `Request failed with status ${response.status}`,
        {
          status: response.status,
          body: parsed?.ok ? parsed.value : text || undefined,
        },
      );
    }

    if (parsed === undefined) return undefined;
    if (!parsed.ok) {
      throw new ApiError('parse', 'Response was not valid JSON', {
        status: response.status,
      });
    }
    return parsed.value;
  }

  return {
    get: (path, options) => request('GET', path, undefined, options),
    post: (path, body, options) => request('POST', path, body, options),
    put: (path, body, options) => request('PUT', path, body, options),
    patch: (path, body, options) => request('PATCH', path, body, options),
    delete: (path, options) => request('DELETE', path, undefined, options),
  };
}
