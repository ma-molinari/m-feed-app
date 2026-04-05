import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SCREEN_TOP_EXTRA_PADDING } from '@navigation/screenTopInset';
import { login } from '@features/auth/services/authApi';
import { getApiErrorMessage } from '@services/api/errors';
import { useAuthStore } from '@store/authStore';
import { colors } from '@theme/colors';
import { radii } from '@theme/radii';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

import type { AuthStackParamList } from '@navigation/types';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- bundled hero asset
const LOGIN_HERO = require('../../../../assets/images/login-hero.jpg');

type LoginNavigation = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
type LoginRoute = RouteProp<AuthStackParamList, 'Login'>;

const SHEET_HEIGHT_RATIO = 0.72;

type FieldErrors = {
  emailOrUsername?: string;
  password?: string;
};

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigation>();
  const route = useRoute<LoginRoute>();
  const successMessage = route.params?.successMessage;
  const setSession = useAuthStore((s) => s.setSession);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sheetHeight = useMemo(() => Math.round(windowHeight * SHEET_HEIGHT_RATIO), [windowHeight]);

  const clearFieldError = useCallback((key: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const onChangeEmail = useCallback(
    (text: string) => {
      setEmailOrUsername(text);
      clearFieldError('emailOrUsername');
      setApiError(null);
    },
    [clearFieldError],
  );

  const onChangePassword = useCallback(
    (text: string) => {
      setPassword(text);
      clearFieldError('password');
      setApiError(null);
    },
    [clearFieldError],
  );

  const onSubmit = useCallback(async () => {
    const emailTrim = emailOrUsername.trim();
    const passwordTrim = password.trim();
    const nextField: FieldErrors = {};
    if (!emailTrim) nextField.emailOrUsername = 'Informe e-mail ou usuário.';
    if (!passwordTrim) nextField.password = 'Informe a senha.';
    if (Object.keys(nextField).length > 0) {
      setFieldErrors(nextField);
      setApiError(null);
      return;
    }

    setFieldErrors({});
    setApiError(null);
    setLoading(true);
    try {
      const session = await login({ email: emailTrim, password: passwordTrim });
      setSession(session);
    } catch (e) {
      setApiError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [emailOrUsername, password, setSession]);

  return (
    <View style={styles.root} testID="login-root">
      <Image
        source={LOGIN_HERO}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        accessibilityIgnoresInvertColors
      />

      <View style={[styles.brandSafe, { paddingTop: insets.top + SCREEN_TOP_EXTRA_PADDING }]}>
        <Text style={styles.brandText} accessibilityRole="header">
          M-FEED
        </Text>
      </View>

      <View style={styles.sheetAnchor} pointerEvents="box-none">
        <View style={[styles.sheet, { height: sheetHeight }]}>
          <View style={styles.handleTrack} accessibilityLabel="Sheet handle">
            <View style={styles.handle} />
          </View>

          <KeyboardAvoidingView
            style={styles.keyboardWrap}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: insets.bottom + spacing.lg },
              ]}
            >
              <Text style={styles.eyebrow}>Log in.</Text>
              <Text style={styles.welcome}>Welcome back to M-Feed</Text>
              <Text style={styles.subtitle}>Enter your credentials to access your account.</Text>

              {successMessage ? (
                <Text style={styles.successBanner} accessibilityRole="alert">
                  {successMessage}
                </Text>
              ) : null}

              {apiError ? (
                <Text style={styles.apiError} accessibilityRole="alert">
                  {apiError}
                </Text>
              ) : null}

              <Text style={styles.fieldLabel} accessibilityRole="text">
                E-mail or Username
              </Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.emailOrUsername ? styles.inputError : null,
                  { marginBottom: fieldErrors.emailOrUsername ? spacing.xs : spacing.md },
                ]}
                value={emailOrUsername}
                onChangeText={onChangeEmail}
                placeholder="E-mail or Username"
                placeholderTextColor={colors.loginPlaceholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                accessibilityLabel="E-mail or Username"
                editable={!loading}
              />
              {fieldErrors.emailOrUsername ? (
                <Text style={styles.inlineError}>{fieldErrors.emailOrUsername}</Text>
              ) : null}

              <Text style={styles.fieldLabel} accessibilityRole="text">
                Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.password ? styles.inputError : null,
                  { marginBottom: fieldErrors.password ? spacing.xs : spacing.md },
                ]}
                value={password}
                onChangeText={onChangePassword}
                placeholder="Password"
                placeholderTextColor={colors.loginPlaceholder}
                secureTextEntry
                accessibilityLabel="Password"
                editable={!loading}
              />
              {fieldErrors.password ? (
                <Text style={styles.inlineError}>{fieldErrors.password}</Text>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.submit,
                  (pressed || loading) && styles.submitPressed,
                  loading && styles.submitDisabled,
                ]}
                onPress={onSubmit}
                accessibilityRole="button"
                accessibilityLabel="Submit"
                accessibilityState={{ disabled: loading }}
                disabled={loading}
              >
                <Text style={styles.submitLabel}>{loading ? 'Signing in…' : 'Submit'}</Text>
              </Pressable>

              <View style={styles.footerRow}>
                <Text style={styles.footerMuted}>{"Don't have an account? "}</Text>
                <Pressable
                  onPress={() => navigation.navigate('Register')}
                  hitSlop={12}
                  accessibilityRole="link"
                  accessibilityLabel="Sign up"
                  disabled={loading}
                >
                  <Text style={styles.footerLink}>Sign Up</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  brandSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  brandText: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    fontSize: 28,
    fontWeight: '800',
    color: colors.background,
    letterSpacing: 0.5,
  },
  sheetAnchor: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.sheetTop,
    borderTopRightRadius: radii.sheetTop,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  handleTrack: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.sheetHandle,
    backgroundColor: colors.loginSheetHandle,
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.xs,
  },
  eyebrow: {
    ...typography.loginEyebrow,
    color: colors.loginText,
    marginBottom: spacing.xs,
  },
  welcome: {
    ...typography.loginWelcome,
    color: colors.loginText,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  successBanner: {
    ...typography.body,
    color: colors.success,
    marginBottom: spacing.md,
  },
  apiError: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.loginFieldLabel,
    color: colors.loginText,
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.loginText,
  },
  inputError: {
    borderColor: colors.error,
  },
  inlineError: {
    ...typography.body,
    fontSize: 13,
    color: colors.error,
    marginBottom: spacing.md,
  },
  submit: {
    minHeight: 48,
    backgroundColor: colors.loginButton,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  submitPressed: {
    opacity: 0.88,
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitLabel: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  footerMuted: {
    ...typography.body,
    color: colors.textMuted,
  },
  footerLink: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
  },
});
