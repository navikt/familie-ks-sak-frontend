import '@testing-library/jest-dom/vitest';

import { server } from '@testutils/mocks/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
