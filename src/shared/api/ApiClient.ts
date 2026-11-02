export interface RequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
}

export interface ApiClient {
  get(path: string, options?: RequestOptions): Promise<unknown>;
  post(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<unknown>;
  put(path: string, body?: unknown, options?: RequestOptions): Promise<unknown>;
  patch(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<unknown>;
  delete(path: string, options?: RequestOptions): Promise<unknown>;
}

export type ApiErrorKind = 'network' | 'http' | 'parse';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly body?: unknown;

  constructor(
    kind: ApiErrorKind,
    message: string,
    details: { status?: number; body?: unknown } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = details.status;
    this.body = details.body;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
