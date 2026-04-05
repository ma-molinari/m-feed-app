import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PostDetailScreen } from '@features/feed/screens/PostDetailScreen';
import { EditPostScreen } from '@features/create/screens/EditPostScreen';
import { UserProfileScreen } from '@features/profile/screens/UserProfileScreen';

import { MainTabNavigator } from './TabNavigator';

const MainStack = createNativeStackNavigator({
  initialRouteName: 'Tabs',
  screens: {
    Tabs: {
      screen: MainTabNavigator,
      options: { headerShown: false },
    },
    PostDetail: {
      screen: PostDetailScreen,
      options: { headerShown: false },
    },
    EditPost: {
      screen: EditPostScreen,
      options: { headerShown: false },
    },
    UserProfile: {
      screen: UserProfileScreen,
      options: { headerShown: false },
    },
  },
});

export const MainNavigation = createStaticNavigation(MainStack);
