import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HomeTabNavigation } from '@navigation/types';
import { confirmSignOut } from '@features/auth/utils/confirmSignOut';
import { RemoteImage } from '@shared/components/RemoteImage';
import { useAuthStore } from '@store/authStore';
import { colors } from '@theme/colors';
import { radii } from '@theme/radii';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

import { useMyProfile } from '../hooks/useMyProfile';
import { useUpdatePassword } from '../hooks/useUpdatePassword';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useUserPosts } from '../hooks/useUserPosts';
import type { PostWithAuthor } from '../types';
import { env } from '@/constants/env';

const GRID_COLS = 2;
const GRID_GUTTER = 2;
const MIN_NEW_PASSWORD_LENGTH = 6;

const d = colors.dark;

function AvatarPlaceholder({ name, size }: { name: string; size: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarInitials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

function SkeletonBlock({
  width: w,
  height: h,
  style,
}: {
  width: number | string;
  height: number;
  style?: object;
}) {
  return (
    <View
      style={[
        {
          width: w as number,
          height: h,
          borderRadius: radii.input,
          backgroundColor: d.skeletonBase,
        },
        style,
      ]}
    />
  );
}

function ProfileSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <SkeletonBlock width={80} height={80} style={{ borderRadius: 40 }} />
        <View style={styles.skeletonCounters}>
          <SkeletonBlock width={48} height={20} />
          <SkeletonBlock width={48} height={20} />
          <SkeletonBlock width={48} height={20} />
        </View>
      </View>
      <SkeletonBlock width={140} height={16} style={{ marginTop: spacing.sm }} />
      <SkeletonBlock width={100} height={13} style={{ marginTop: spacing.xs }} />
      <SkeletonBlock width={200} height={13} style={{ marginTop: spacing.xs }} />
      <View style={styles.skeletonButtons}>
        <SkeletonBlock width={120} height={36} />
        <SkeletonBlock width={120} height={36} />
      </View>
    </View>
  );
}

type EditProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  initialValues: { fullName: string; username: string; bio: string };
};

function EditProfileModal({ visible, onClose, initialValues }: EditProfileModalProps) {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [username, setUsername] = useState(initialValues.username);
  const [bio, setBio] = useState(initialValues.bio);
  const [focusedField, setFocusedField] = useState<'fullName' | 'username' | 'bio' | null>(null);
  const updateProfile = useUpdateProfile();

  const handleSave = useCallback(() => {
    updateProfile.mutate(
      { fullName, username, bio },
      {
        onSuccess: () => {
          onClose();
          Alert.alert('Sucesso', 'Perfil atualizado.');
        },
        onError: () => Alert.alert('Erro', 'Não foi possível salvar o perfil.'),
      },
    );
  }, [fullName, username, bio, updateProfile, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          style={styles.modalScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalScrollContent}
        >
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Editar perfil</Text>

            <Text style={styles.fieldLabel}>Nome completo</Text>
            <TextInput
              style={[
                styles.sheetTextInput,
                focusedField === 'fullName' && styles.sheetTextInputFocused,
              ]}
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={d.textMuted}
              placeholder="Seu nome"
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField(null)}
            />

            <Text style={styles.fieldLabel}>Nome de usuário</Text>
            <TextInput
              style={[
                styles.sheetTextInput,
                focusedField === 'username' && styles.sheetTextInputFocused,
              ]}
              value={username}
              onChangeText={setUsername}
              placeholderTextColor={d.textMuted}
              placeholder="usuario"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
            />

            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[
                styles.sheetTextInput,
                styles.inputMultiline,
                focusedField === 'bio' && styles.sheetTextInputFocused,
              ]}
              value={bio}
              onChangeText={setBio}
              placeholderTextColor={d.textMuted}
              placeholder="Conte um pouco sobre você"
              multiline
              numberOfLines={3}
              onFocus={() => setFocusedField('bio')}
              onBlur={() => setFocusedField(null)}
            />

            <Pressable
              style={[styles.saveButton, updateProfile.isPending && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={updateProfile.isPending}
              accessibilityRole="button"
              accessibilityState={{ disabled: updateProfile.isPending }}
            >
              {updateProfile.isPending ? (
                <ActivityIndicator color={d.text} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancelar edição do perfil"
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type EditPasswordModalProps = {
  visible: boolean;
  onClose: () => void;
};

type SecurePasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
};

function SecurePasswordField({
  label,
  value,
  onChangeText,
  visible: passwordVisible,
  onToggleVisible,
  focused,
  onFocus,
  onBlur,
}: SecurePasswordFieldProps) {
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.secureInputRow, focused && styles.secureInputRowFocused]}>
        <TextInput
          style={styles.secureInput}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!passwordVisible}
          placeholderTextColor={d.textMuted}
          placeholder="••••••••"
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          onPress={onToggleVisible}
          style={styles.secureInputEye}
          accessibilityRole="button"
          accessibilityLabel={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
          hitSlop={8}
        >
          <Ionicons
            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={d.profileSecondary}
          />
        </Pressable>
      </View>
    </>
  );
}

function EditPasswordModal({ visible, onClose }: EditPasswordModalProps) {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<'current' | 'new' | 'confirm' | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const updatePassword = useUpdatePassword();

  const handleSave = useCallback(() => {
    setFormError(null);
    if (!password.trim()) {
      setFormError('Informe a senha atual.');
      return;
    }
    if (newPassword.length < MIN_NEW_PASSWORD_LENGTH) {
      setFormError(`A nova senha deve ter pelo menos ${MIN_NEW_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setFormError('A confirmação não coincide com a nova senha.');
      return;
    }
    updatePassword.mutate(
      { password, newPassword },
      {
        onSuccess: () => {
          onClose();
          Alert.alert('Sucesso', 'Senha alterada.');
        },
        onError: () => Alert.alert('Erro', 'Não foi possível alterar a senha.'),
      },
    );
  }, [password, newPassword, confirmNewPassword, updatePassword, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          style={styles.modalScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalScrollContent}
        >
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Alterar senha</Text>

            {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}

            <SecurePasswordField
              label="Senha atual"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setFormError(null);
              }}
              visible={showCurrent}
              onToggleVisible={() => setShowCurrent((s) => !s)}
              focused={focusedField === 'current'}
              onFocus={() => setFocusedField('current')}
              onBlur={() => setFocusedField(null)}
            />

            <SecurePasswordField
              label="Nova senha"
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                setFormError(null);
              }}
              visible={showNew}
              onToggleVisible={() => setShowNew((s) => !s)}
              focused={focusedField === 'new'}
              onFocus={() => setFocusedField('new')}
              onBlur={() => setFocusedField(null)}
            />

            <SecurePasswordField
              label="Confirmar nova senha"
              value={confirmNewPassword}
              onChangeText={(t) => {
                setConfirmNewPassword(t);
                setFormError(null);
              }}
              visible={showConfirm}
              onToggleVisible={() => setShowConfirm((s) => !s)}
              focused={focusedField === 'confirm'}
              onBlur={() => setFocusedField(null)}
              onFocus={() => setFocusedField('confirm')}
            />

            <Pressable
              style={[styles.saveButton, updatePassword.isPending && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={updatePassword.isPending}
              accessibilityRole="button"
              accessibilityState={{ disabled: updatePassword.isPending }}
            >
              {updatePassword.isPending ? (
                <ActivityIndicator color={d.text} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancelar alteração de senha"
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<HomeTabNavigation>();
  const { width } = useWindowDimensions();
  const tileSize = useMemo(() => (width - GRID_GUTTER) / GRID_COLS, [width]);
  const signOut = useAuthStore((s) => s.signOut);

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);
  const [editProfileKey, setEditProfileKey] = useState(0);
  const [editPasswordKey, setEditPasswordKey] = useState(0);

  const profileQuery = useMyProfile();
  const profile = profileQuery.data;

  const postsQuery = useUserPosts(profile?.id ?? 0);
  const posts = useMemo(
    () => postsQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [],
    [postsQuery.data?.pages],
  );

  const handleLogout = useCallback(() => {
    confirmSignOut(signOut);
  }, [signOut]);

  const onEndReached = useCallback(() => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
      void postsQuery.fetchNextPage();
    }
  }, [postsQuery]);

  const renderGridItem = useCallback(
    ({ item, index }: { item: PostWithAuthor; index: number }) => (
      <Pressable
        style={{
          width: tileSize,
          height: tileSize,
          marginBottom: GRID_GUTTER,
          marginRight: index % GRID_COLS !== GRID_COLS - 1 ? GRID_GUTTER : 0,
        }}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      >
        {item.image ? (
          <RemoteImage
            uri={`${env.imageUrl}/${item.image}`}
            style={{ width: tileSize, height: tileSize }}
          />
        ) : (
          <View style={[{ width: tileSize, height: tileSize }, styles.gridImageFallback]}>
            <Text style={styles.gridImageFallbackText} numberOfLines={3}>
              {item.content ?? ''}
            </Text>
          </View>
        )}
      </Pressable>
    ),
    [navigation, tileSize],
  );

  const keyExtractor = useCallback((item: PostWithAuthor) => String(item.id), []);

  const isLoading = profileQuery.isPending;

  const ListHeader = useMemo(() => {
    if (isLoading) return <ProfileSkeleton />;
    if (!profile) return null;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <Pressable
            style={styles.avatarTap}
            onPress={() =>
              Alert.alert('Em breve', 'Alterar foto do perfil estará disponível em breve.')
            }
            accessibilityRole="button"
            accessibilityLabel="Alterar foto do perfil"
          >
            {profile.avatar ? (
              <RemoteImage uri={profile.avatar} style={styles.avatar} />
            ) : (
              <AvatarPlaceholder name={profile.fullName} size={80} />
            )}
            <View style={styles.avatarCameraBadge} pointerEvents="none">
              <Ionicons name="camera" size={14} color={d.text} />
            </View>
          </Pressable>
          <View style={styles.counters}>
            <View style={styles.counterItem}>
              <Text style={styles.counterValue}>{profile.posts}</Text>
              <Text
                style={styles.counterLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
                Publicações
              </Text>
            </View>
            <View style={styles.counterItem}>
              <Text style={styles.counterValue}>{profile.followers}</Text>
              <Text
                style={styles.counterLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
                Seguidores
              </Text>
            </View>
            <View style={styles.counterItem}>
              <Text style={styles.counterValue}>{profile.following}</Text>
              <Text
                style={styles.counterLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
                Seguindo
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.fullName}>{profile.fullName}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              setEditProfileKey((k) => k + 1);
              setEditProfileVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Editar perfil"
          >
            <View style={styles.actionButtonInner}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
              <Text style={styles.actionButtonText}>Editar perfil</Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => {
              setEditPasswordKey((k) => k + 1);
              setEditPasswordVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Alterar senha"
          >
            <View style={styles.actionButtonInner}>
              <Ionicons name="key-outline" size={18} color={colors.primary} />
              <Text style={styles.actionButtonText}>Alterar senha</Text>
            </View>
          </Pressable>
        </View>

        <Pressable
          style={styles.logoutLink}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <Text style={styles.logoutLinkText}>Sair</Text>
        </Pressable>

        <View style={styles.gridDivider} />
      </View>
    );
  }, [isLoading, profile, handleLogout]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={posts}
        renderItem={renderGridItem}
        keyExtractor={keyExtractor}
        numColumns={GRID_COLS}
        ListHeaderComponent={ListHeader}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          postsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={d.textMuted} style={styles.footerSpinner} />
          ) : null
        }
      />

      {profile && (
        <>
          <EditProfileModal
            key={`edit-profile-${editProfileKey}`}
            visible={editProfileVisible}
            onClose={() => setEditProfileVisible(false)}
            initialValues={{
              fullName: profile.fullName,
              username: profile.username,
              bio: profile.bio ?? '',
            }}
          />
          <EditPasswordModal
            key={`edit-password-${editPasswordKey}`}
            visible={editPasswordVisible}
            onClose={() => setEditPasswordVisible(false)}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: d.background,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarTap: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: `${colors.primary}55`,
  },
  avatarCameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: d.background,
  },
  avatarPlaceholder: {
    backgroundColor: d.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${colors.primary}55`,
  },
  avatarInitials: {
    color: d.text,
    fontWeight: '600',
  },
  counters: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.xs,
    minWidth: 0,
  },
  counterItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  counterValue: {
    ...typography.subtitle,
    color: d.text,
    fontWeight: '700',
  },
  counterLabel: {
    ...typography.caption,
    color: d.profileSecondary,
    marginTop: 2,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  fullName: {
    ...typography.subtitle,
    color: d.text,
    marginTop: spacing.sm,
  },
  username: {
    ...typography.caption,
    color: d.profileSecondary,
    marginTop: 2,
  },
  bio: {
    ...typography.body,
    color: d.text,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    backgroundColor: d.surface,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionButtonText: {
    ...typography.caption,
    color: d.text,
    fontWeight: '600',
  },
  logoutLink: {
    alignSelf: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  logoutLinkText: {
    ...typography.caption,
    color: colors.dark.likeActive,
    fontWeight: '600',
  },
  gridDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: d.border,
    marginTop: spacing.md,
  },
  gridImageFallback: {
    backgroundColor: d.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  gridImageFallbackText: {
    ...typography.caption,
    color: d.textMuted,
    textAlign: 'center',
  },
  footerSpinner: {
    paddingVertical: spacing.md,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  skeletonCounters: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  skeletonButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: d.overlay,
  },
  modalScroll: {
    flex: 1,
    maxHeight: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: d.surface,
    borderTopLeftRadius: radii.sheetTop,
    borderTopRightRadius: radii.sheetTop,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: radii.sheetHandle,
    backgroundColor: d.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.subtitle,
    color: d.text,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.caption,
    color: d.textMuted,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  formErrorText: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  sheetTextInput: {
    backgroundColor: d.sheetInputFill,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: d.border,
    color: d.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
  sheetTextInputFocused: {
    borderColor: colors.primary,
  },
  secureInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: d.sheetInputFill,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: d.border,
    minHeight: 48,
    paddingLeft: spacing.md,
  },
  secureInputRowFocused: {
    borderColor: colors.primary,
  },
  secureInput: {
    flex: 1,
    color: d.text,
    paddingVertical: spacing.sm,
    paddingRight: spacing.xs,
    ...typography.body,
  },
  secureInputEye: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radii.button,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    ...typography.subtitle,
    color: d.text,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    color: d.textMuted,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
