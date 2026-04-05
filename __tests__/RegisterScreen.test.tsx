import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RegisterScreen } from '../src/features/auth/screens/RegisterScreen';

import { axiosLikeError } from './helpers/axiosLikeError';

const mockNavigate = jest.fn();
const mockRegister = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

jest.mock('@features/auth/services/authApi', () => ({
  register: (...args: unknown[]) => mockRegister(...args),
}));

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

function renderRegister() {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <RegisterScreen />
    </SafeAreaProvider>,
  );
}

describe('RegisterScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockRegister.mockReset();
  });

  it('renders headline and form fields', () => {
    renderRegister();
    expect(screen.getByText('Create your M-Feed account')).toBeTruthy();
    expect(screen.getByText('Already have an account? ')).toBeTruthy();
    expect(screen.getByLabelText('E-mail')).toBeTruthy();
    expect(screen.getByLabelText('Username')).toBeTruthy();
    expect(screen.getByLabelText('Full name')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByLabelText('Create account')).toBeTruthy();
    expect(screen.getByLabelText('Sign In')).toBeTruthy();
  });

  it('navigates to Login when Sign In is pressed', () => {
    renderRegister();
    fireEvent.press(screen.getByLabelText('Sign In'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('blocks submit and shows inline errors when all fields are empty', () => {
    renderRegister();
    fireEvent.press(screen.getByLabelText('Create account'));
    expect(screen.getByText('Enter your email.')).toBeTruthy();
    expect(screen.getByText('Enter a username.')).toBeTruthy();
    expect(screen.getByText('Enter your full name.')).toBeTruthy();
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('blocks submit with username shorter than 3 chars and shows specific error', () => {
    renderRegister();
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'a@b.co');
    fireEvent.changeText(screen.getByLabelText('Username'), 'ab');
    fireEvent.changeText(screen.getByLabelText('Full name'), 'Name');
    fireEvent.changeText(screen.getByLabelText('Password'), 'secret12');
    fireEvent.press(screen.getByLabelText('Create account'));
    expect(screen.getByText('Username must be at least 3 characters.')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('blocks submit with password shorter than 6 chars and shows specific error', () => {
    renderRegister();
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'a@b.co');
    fireEvent.changeText(screen.getByLabelText('Username'), 'user1');
    fireEvent.changeText(screen.getByLabelText('Full name'), 'Name');
    fireEvent.changeText(screen.getByLabelText('Password'), '12345');
    fireEvent.press(screen.getByLabelText('Create account'));
    expect(screen.getByText('Password must be at least 6 characters.')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('calls register and navigates to Login with successMessage on success', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    renderRegister();
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'new@user.co');
    fireEvent.changeText(screen.getByLabelText('Username'), 'newuser');
    fireEvent.changeText(screen.getByLabelText('Full name'), 'New User');
    fireEvent.changeText(screen.getByLabelText('Password'), 'secret12');
    fireEvent.press(screen.getByLabelText('Create account'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Login', {
        successMessage: 'Account created. Sign in to continue.',
      });
    });
    expect(mockRegister).toHaveBeenCalledWith({
      email: 'new@user.co',
      username: 'newuser',
      fullName: 'New User',
      password: 'secret12',
    });
  });

  it('shows API message on 400', async () => {
    mockRegister.mockRejectedValueOnce(axiosLikeError(400, { message: 'E-mail já cadastrado' }));
    renderRegister();
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'taken@x.co');
    fireEvent.changeText(screen.getByLabelText('Username'), 'user1');
    fireEvent.changeText(screen.getByLabelText('Full name'), 'One');
    fireEvent.changeText(screen.getByLabelText('Password'), 'secret12');
    fireEvent.press(screen.getByLabelText('Create account'));
    await waitFor(() => {
      expect(screen.getByText('E-mail já cadastrado')).toBeTruthy();
    });
  });
});
