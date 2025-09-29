import { setupServer } from 'msw/node';

export const setupTestServer = () => {
  const server = setupServer();
  return {
    server,
    listen: () => server.listen({ onUnhandledRequest: 'warn' }),
    close: () => server.close(),
    reset: () => server.resetHandlers(),
  };
};
