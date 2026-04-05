import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@theme/colors';

import { useScreenTopInset } from './screenTopInset';

type MainAppShellProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function MainAppShell({ children, style }: MainAppShellProps) {
  const paddingTop = useScreenTopInset();

  return (
    <View
      style={[
        { flex: 1, paddingTop, backgroundColor: colors.dark.background },
        style,
      ]}
    >
      {children}
    </View>
  );
}
