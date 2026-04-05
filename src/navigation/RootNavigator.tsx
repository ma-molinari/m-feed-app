import { useAuthStore } from '@store/authStore';

import { AuthNavigation } from './AuthNavigator';
import { MainAppShell } from './MainAppShell';
import { MainNavigation } from './MainNavigator';

export function RootNavigator() {
  const token = useAuthStore((s) => s.token);
  return token ? (
    <MainAppShell>
      <MainNavigation />
    </MainAppShell>
  ) : (
    <AuthNavigation />
  );
}
