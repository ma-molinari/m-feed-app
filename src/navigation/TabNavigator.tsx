import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CreateScreen } from '@features/create/screens/CreateScreen';
import { FeedScreen } from '@features/feed/screens/FeedScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { SearchScreen } from '@features/search/screens/SearchScreen';
import { colors } from '@theme/colors';

export const MainTabNavigator = createBottomTabNavigator({
  initialRouteName: 'Home',
  screenOptions: {
    headerShown: false,
    tabBarShowLabel: false,
    tabBarActiveTintColor: colors.dark.text,
    tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
    tabBarStyle: {
      backgroundColor: colors.dark.surface,
      borderTopColor: colors.dark.border,
      paddingTop: 5,
    },
  },
  screens: {
    Home: {
      screen: FeedScreen,
      options: {
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
        ),
      },
    },
    Search: {
      screen: SearchScreen,
      options: {
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
        ),
      },
    },
    Create: {
      screen: CreateScreen,
      options: {
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons
            name={focused ? 'add-circle' : 'add-circle-outline'}
            size={size}
            color={color}
          />
        ),
      },
    },
    Profile: {
      screen: ProfileScreen,
      options: {
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
        ),
      },
    },
  },
});
