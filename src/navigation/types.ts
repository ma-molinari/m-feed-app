import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: { successMessage?: string } | undefined;
  Register: undefined;
};

export type TabParamList = {
  Home: undefined;
  Search: undefined;
  Create: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  PostDetail: {
    postId: number;
  };
  EditPost: {
    postId: number;
    content: string;
  };
  UserProfile: {
    userId: number;
  };
};

export type HomeTabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<MainStackParamList>
>;
