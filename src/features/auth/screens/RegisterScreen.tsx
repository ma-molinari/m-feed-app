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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SCREEN_TOP_EXTRA_PADDING } from '@navigation/screenTopInset';
import { register } from '@features/auth/services/authApi';
import { getApiErrorMessage } from '@services/api/errors';
import { colors } from '@theme/colors';
import { radii } from '@theme/radii';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

import type { AuthStackParamList } from '@navigation/types';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- bundled hero asset
const LOGIN_HERO = require('../../../../assets/images/login-hero.jpg');

type RegisterNavigation = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const SHEET_HEIGHT_RATIO = 0.72;

type FieldErrors = {
  email?: string;
  username?: string;
  fullName?: string;
  password?: string;
};

export function RegisterScreen() {
  const navigation = useNavigation<RegisterNavigation>();
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
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
      setEmail(text);
      clearFieldError('email');
      setApiError(null);
    },
    [clearFieldError],
  );

  const onChangeUsername = useCallback(
    (text: string) => {
      setUsername(text);
      clearFieldError('username');
      setApiError(null);
    },
    [clearFieldError],
  );

  const onChangeFullName = useCallback(
    (text: string) => {
      setFullName(text);
      clearFieldError('fullName');
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
    const emailTrim = email.trim();
    const usernameTrim = username.trim();
    const fullNameTrim = fullName.trim();
    const passwordTrim = password.trim();
    const nextField: FieldErrors = {};
    if (!emailTrim) nextField.email = 'Informe o e-mail.';
    if (!usernameTrim) nextField.username = 'Informe o nome de usuário.';
    else if (usernameTrim.length < 3) nextField.username = 'O nome de usuário deve ter pelo menos 3 caracteres.';
    if (!fullNameTrim) nextField.fullName = 'Informe o nome completo.';
    if (!passwordTrim) nextField.password = 'Informe a senha.';
    else if (passwordTrim.length < 6) nextField.password = 'A senha deve ter pelo menos 6 caracteres.';
    if (Object.keys(nextField).length > 0) {
      setFieldErrors(nextField);
      setApiError(null);
      return;
    }

    setFieldErrors({});
    setApiError(null);
    setLoading(true);
    try {
      await register({
        email: emailTrim,
        username: usernameTrim,
        fullName: fullNameTrim,
        password: passwordTrim,
      });
      navigation.navigate('Login', {
        successMessage: 'Conta criada! Faça login para continuar.',
      });
    } catch (e) {
      setApiError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [email, username, fullName, password, navigation]);

  return (
    <View style={styles.root} testID="register-root">
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
              <Text style={styles.eyebrow}>Sign up.</Text>
              <Text style={styles.welcome}>Create your M-Feed account</Text>
              <Text style={styles.subtitle}>Fill in the fields below to get started.</Text>

              {apiError ? (
                <Text style={styles.apiError} accessibilityRole="alert">
                  {apiError}
                </Text>
              ) : null}

              <Text style={styles.fieldLabel} accessibilityRole="text">
                E-mail
              </Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.email ? styles.inputError : null,
                  { marginBottom: fieldErrors.email ? spacing.xs : spacing.md },
                ]}
                value={email}
                onChangeText={onChangeEmail}
                placeholder="E-mail"
                placeholderTextColor={colors.loginPlaceholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                accessibilityLabel="E-mail"
                editable={!loading}
              />
              {fieldErrors.email ? <Text style={styles.inlineError}>{fieldErrors.email}</Text> : null}

              <Text style={styles.fieldLabel} accessibilityRole="text">
                Username
              </Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.username ? styles.inputError : null,
                  { marginBottom: fieldErrors.username ? spacing.xs : spacing.md },
                ]}
                value={username}
                onChangeText={onChangeUsername}
                placeholder="Username (min. 3 characters)"
                placeholderTextColor={colors.loginPlaceholder}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Username"
                editable={!loading}
              />
              {fieldErrors.username ? (
                <Text style={styles.inlineError}>{fieldErrors.username}</Text>
              ) : null}

              <Text style={styles.fieldLabel} accessibilityRole="text">
                Full name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  fieldErrors.fullName ? styles.inputError : null,
                  { marginBottom: fieldErrors.fullName ? spacing.xs : spacing.md },
                ]}
                value={fullName}
                onChangeText={onChangeFullName}
                placeholder="Full name"
                placeholderTextColor={colors.loginPlaceholder}
                accessibilityLabel="Full name"
                editable={!loading}
              />
              {fieldErrors.fullName ? (
                <Text style={styles.inlineError}>{fieldErrors.fullName}</Text>
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
                placeholder="Password (min. 6 characters)"
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
                accessibilityLabel="Create account"
                accessibilityState={{ disabled: loading }}
                disabled={loading}
              >
                <Text style={styles.submitLabel}>{loading ? 'Criando conta…' : 'Create account'}</Text>
              </Pressable>

              <View style={styles.footerRow}>
                <Text style={styles.footerMuted}>Já tem conta? </Text>
                <Pressable
                  onPress={() => navigation.navigate('Login')}
                  hitSlop={12}
                  accessibilityRole="link"
                  accessibilityLabel="Sign In"
                  disabled={loading}
                >
                  <Text style={styles.footerLink}>Sign In</Text>
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
