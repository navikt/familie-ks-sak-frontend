import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { beforeAll, afterEach, afterAll } from 'vitest';

import { server } from './src/frontend/testutils/mocks/node';

beforeAll(() => server.listen());
afterEach(() => {
    cleanup();
    server.resetHandlers();
});
afterAll(() => server.close());
