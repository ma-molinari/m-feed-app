import { apiClient } from '@services/api/client';
import { InvalidLoginResponseError } from '@services/api/errors';

import { login } from '../src/features/auth/services/authApi';

jest.mock('@services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

describe('authApi.login', () => {
  beforeEach(() => {
    mockPost.mockReset();
  });

  it('returns token and user when response is valid', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        data: {
          token: 'jwt-1',
          user: { id: 1, email: 'a@b.c', username: 'u', fullName: 'U' },
        },
      },
    });
    await expect(login({ email: 'a@b.c', password: 'x' })).resolves.toEqual({
      token: 'jwt-1',
      user: { id: 1, email: 'a@b.c', username: 'u', fullName: 'U' },
    });
    expect(mockPost).toHaveBeenCalledWith('/public/login', { email: 'a@b.c', password: 'x' }, {
      skipGlobal401Handler: true,
    });
  });

  it('throws InvalidLoginResponseError when token is missing', async () => {
    mockPost.mockResolvedValueOnce({
      data: { data: { token: '', user: { id: 1, email: '', username: '', fullName: '' } } },
    });
    await expect(login({ email: 'a@b.c', password: 'x' })).rejects.toBeInstanceOf(
      InvalidLoginResponseError,
    );
  });

  it('throws InvalidLoginResponseError when token is not a string', async () => {
    mockPost.mockResolvedValueOnce({
      data: { data: { token: 123 as unknown as string, user: { id: 1 } } },
    });
    await expect(login({ email: 'a@b.c', password: 'x' })).rejects.toBeInstanceOf(
      InvalidLoginResponseError,
    );
  });

  it('throws InvalidLoginResponseError when user id is missing', async () => {
    mockPost.mockResolvedValueOnce({
      data: { data: { token: 'ok', user: { id: 0, email: '', username: '', fullName: '' } } },
    });
    await expect(login({ email: 'a@b.c', password: 'x' })).rejects.toBeInstanceOf(
      InvalidLoginResponseError,
    );
  });

  it('throws InvalidLoginResponseError when envelope is missing', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    await expect(login({ email: 'a@b.c', password: 'x' })).rejects.toBeInstanceOf(
      InvalidLoginResponseError,
    );
  });
});
