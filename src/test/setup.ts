import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from '../mocks/server.ts';
import { todosDb } from '../mocks/todosDb.ts';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  todosDb.reset();
});

afterAll(() => server.close());
