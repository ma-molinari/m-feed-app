import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

jest.mock('../src/navigation/MainAppShell', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require('./mocks/rootNavigatorMocks');
  return { MainAppShell: m.MainAppShell };
});

jest.mock('../src/navigation/MainNavigator', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require('./mocks/rootNavigatorMocks');
  return { MainNavigation: m.MainNavigation };
});

jest.mock('../src/navigation/AuthNavigator', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require('./mocks/rootNavigatorMocks');
  return { AuthNavigation: m.AuthNavigation };
});

const mockAuthState = { token: null as string | null };
jest.mock('@store/authStore', () => ({
  useAuthStore: (selector: (s: { token: string | null }) => unknown) =>
    selector({ get token() { return mockAuthState.token; } }),
}));

import { RootNavigator } from '../src/navigation/RootNavigator';

describe('RootNavigator', () => {
  it('renders auth tree when token is absent', () => {
    mockAuthState.token = null;
    render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>,
    );
    expect(screen.getByTestId('auth-nav')).toBeTruthy();
  });

  it('renders main app when token is present', () => {
    mockAuthState.token = 'jwt';
    render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>,
    );
    expect(screen.getByTestId('main-nav')).toBeTruthy();
  });
});
