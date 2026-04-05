import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '@features/auth/screens/LoginScreen';
import { RegisterScreen } from '@features/auth/screens/RegisterScreen';

const commonScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
};

const AuthStack = createNativeStackNavigator({
  initialRouteName: 'Login',
  screens: {
    Login: {
      screen: LoginScreen,
      options: commonScreenOptions,
    },
    Register: {
      screen: RegisterScreen,
      options: commonScreenOptions,
    },
  },
});

export const AuthNavigation = createStaticNavigation(AuthStack);
