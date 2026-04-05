import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoginScreen } from '../src/features/auth/screens/LoginScreen';

import { axiosLikeError } from './helpers/axiosLikeError';

const mockNavigate = jest.fn();
const mockSetSession = jest.fn();
const mockLogin = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
    useRoute: () => ({
      key: 'Login-test',
      name: 'Login',
      params: undefined,
    }),
  };
});

jest.mock('@store/authStore', () => ({
  useAuthStore: (selector: (s: { setSession: typeof mockSetSession }) => unknown) =>
    selector({ setSession: mockSetSession }),
}));

jest.mock('@features/auth/services/authApi', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderLogin() {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <LoginScreen />
    </SafeAreaProvider>,
  );
}

describe('LoginScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetSession.mockClear();
    mockLogin.mockReset();
  });

  it('shows login headline and form actions', () => {
    renderLogin();
    expect(screen.getByText('Welcome back to M-Feed')).toBeTruthy();
    expect(screen.getByLabelText('Sign in')).toBeTruthy();
    expect(screen.getByLabelText('Sign up')).toBeTruthy();
  });

  it('navigates to Register when Sign up is pressed', () => {
    renderLogin();
    fireEvent.press(screen.getByLabelText('Sign up'));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('blocks submit and shows inline errors when fields are empty', () => {
    renderLogin();
    fireEvent.press(screen.getByLabelText('Sign in'));
    expect(screen.getByText('Enter your email or username.')).toBeTruthy();
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockSetSession).not.toHaveBeenCalled();
  });

  it('calls setSession after successful login', async () => {
    mockLogin.mockResolvedValueOnce({
      token: 'jwt-token',
      user: { id: 1, email: 'a@b.co', username: 'user1', fullName: 'User One' },
    });
    renderLogin();
    fireEvent.changeText(screen.getByLabelText('E-mail or Username'), 'user@test.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'secret12');
    fireEvent.press(screen.getByLabelText('Sign in'));
    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith({
        token: 'jwt-token',
        user: { id: 1, email: 'a@b.co', username: 'user1', fullName: 'User One' },
      });
    });
    expect(mockLogin).toHaveBeenCalledWith({ email: 'user@test.com', password: 'secret12' });
  });

  it('shows invalid credentials message on 401', async () => {
    mockLogin.mockRejectedValueOnce(axiosLikeError(401));
    renderLogin();
    fireEvent.changeText(screen.getByLabelText('E-mail or Username'), 'x');
    fireEvent.changeText(screen.getByLabelText('Password'), 'y');
    fireEvent.press(screen.getByLabelText('Sign in'));
    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeTruthy();
    });
    expect(mockSetSession).not.toHaveBeenCalled();
  });

  it('shows API message on 400', async () => {
    mockLogin.mockRejectedValueOnce(axiosLikeError(400, { message: 'E-mail inválido' }));
    renderLogin();
    fireEvent.changeText(screen.getByLabelText('E-mail or Username'), 'bad');
    fireEvent.changeText(screen.getByLabelText('Password'), 'secret12');
    fireEvent.press(screen.getByLabelText('Sign in'));
    await waitFor(() => {
      expect(screen.getByText('E-mail inválido')).toBeTruthy();
    });
    expect(mockSetSession).not.toHaveBeenCalled();
  });
});
