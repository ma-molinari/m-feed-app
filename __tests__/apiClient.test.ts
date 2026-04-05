// eslint-disable-next-line @typescript-eslint/no-require-imports -- Jest hoisted mock
jest.mock('axios', () => require('./mocks/axiosStub'));

function loadApiClient(options: { token: string | null; signOut?: jest.Mock }) {
  jest.resetModules();
  jest.doMock('@constants/env', () => ({
    env: { apiUrl: 'http://127.0.0.1:9999', imageUrl: '' },
  }));
  const signOut = options.signOut ?? jest.fn();
  jest.doMock('@store/authStore', () => ({
    useAuthStore: {
      getState: () => ({ token: options.token, signOut }),
    },
  }));
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { apiClient } = require('../src/services/api/client');
  return { apiClient, signOut };
}

function makeAxios401Error(config: Record<string, unknown>) {
  return {
    isAxiosError: true,
    name: 'AxiosError',
    message: 'Unauthorized',
    config,
    response: {
      status: 401,
      data: {},
      statusText: 'Unauthorized',
      headers: {},
      config,
    },
  };
}

describe('apiClient', () => {
  it('sends Bearer when token is set', async () => {
    const { apiClient } = loadApiClient({ token: 'my-jwt' });
    await apiClient.get('/test', {
      adapter: async (config: { headers?: { Authorization?: string } }) => {
        expect(config.headers?.Authorization).toBe('Bearer my-jwt');
        return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
      },
    });
  });

  it('omits Authorization when token is null', async () => {
    const { apiClient } = loadApiClient({ token: null });
    await apiClient.get('/test', {
      adapter: async (config: { headers?: { Authorization?: string } }) => {
        expect(config.headers?.Authorization).toBeUndefined();
        return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
      },
    });
  });

  it('calls signOut on 401 when skipGlobal401Handler is false', async () => {
    const { apiClient, signOut } = loadApiClient({ token: 't' });
    await expect(
      apiClient.get('/test', {
        adapter: async (config: Record<string, unknown>) => Promise.reject(makeAxios401Error(config)),
      }),
    ).rejects.toBeDefined();
    expect(signOut).toHaveBeenCalled();
  });

  it('does not call signOut on 401 when skipGlobal401Handler is true', async () => {
    const { apiClient, signOut } = loadApiClient({ token: 't' });
    await expect(
      apiClient.get('/test', {
        skipGlobal401Handler: true,
        adapter: async (config: Record<string, unknown>) => Promise.reject(makeAxios401Error(config)),
      }),
    ).rejects.toBeDefined();
    expect(signOut).not.toHaveBeenCalled();
  });
});
