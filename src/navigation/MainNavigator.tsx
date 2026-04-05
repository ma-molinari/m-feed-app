import { View } from 'react-native';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabNavigator } from './TabNavigator';

function StackPlaceholderScreen() {
  return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
}

const MainStack = createNativeStackNavigator({
  initialRouteName: 'Tabs',
  screens: {
    Tabs: {
      screen: MainTabNavigator,
      options: { headerShown: false },
    },
    PostDetail: {
      screen: StackPlaceholderScreen,
      options: { headerShown: false },
    },
    EditPost: {
      screen: StackPlaceholderScreen,
      options: { headerShown: false },
    },
    UserProfile: {
      screen: StackPlaceholderScreen,
      options: { headerShown: false },
    },
  },
});

export const MainNavigation = createStaticNavigation(MainStack);
