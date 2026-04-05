import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@theme/spacing';

/** Extra space below the system status bar (shared across screens). */
export const SCREEN_TOP_EXTRA_PADDING = spacing.sm;

export function useScreenTopInset(): number {
  const insets = useSafeAreaInsets();
  return insets.top + SCREEN_TOP_EXTRA_PADDING;
}
