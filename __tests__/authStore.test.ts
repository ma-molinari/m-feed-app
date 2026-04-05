import { useAuthStore } from '../src/store/authStore';

const user = { id: 1, email: 'a@b.c', username: 'u1', fullName: 'User One' };

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null });
  });

  it('setSession stores token and user', () => {
    useAuthStore.getState().setSession({ token: 'jwt-1', user });
    expect(useAuthStore.getState().token).toBe('jwt-1');
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('signOut clears token and user', () => {
    useAuthStore.getState().setSession({ token: 'jwt-1', user });
    useAuthStore.getState().signOut();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
