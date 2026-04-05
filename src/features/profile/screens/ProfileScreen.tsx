import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import type { HomeTabNavigation } from '@navigation/types';
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

const { width } = Dimensions.get('window');
const GRID_COLS = 2;
const TILE_SIZE = width / GRID_COLS;

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

function SkeletonBlock({ width: w, height: h, style }: { width: number | string; height: number; style?: object }) {
  return <View style={[{ width: w as number, height: h, borderRadius: radii.input, backgroundColor: d.skeletonBase }, style]} />;
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
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [username, setUsername] = useState(initialValues.username);
  const [bio, setBio] = useState(initialValues.bio);
  const updateProfile = useUpdateProfile();

  const handleSave = useCallback(() => {
    updateProfile.mutate(
      { fullName, username, bio },
      {
        onSuccess: () => onClose(),
        onError: () => Alert.alert('Erro', 'Não foi possível salvar o perfil.'),
      },
    );
  }, [fullName, username, bio, updateProfile, onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Editar Perfil</Text>

          <Text style={styles.fieldLabel}>Nome completo</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholderTextColor={d.textMuted}
            placeholder="Nome completo"
          />

          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor={d.textMuted}
            placeholder="username"
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={bio}
            onChangeText={setBio}
            placeholderTextColor={d.textMuted}
            placeholder="Bio"
            multiline
            numberOfLines={3}
          />

          <Pressable
            style={[styles.saveButton, updateProfile.isPending && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <ActivityIndicator color={d.text} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

type EditPasswordModalProps = {
  visible: boolean;
  onClose: () => void;
};

function EditPasswordModal({ visible, onClose }: EditPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const updatePassword = useUpdatePassword();

  const handleSave = useCallback(() => {
    if (!password || !newPassword) {
      Alert.alert('Atenção', 'Preencha os dois campos.');
      return;
    }
    updatePassword.mutate(
      { password, newPassword },
      {
        onSuccess: () => {
          setPassword('');
          setNewPassword('');
          onClose();
        },
        onError: () => Alert.alert('Erro', 'Não foi possível alterar a senha.'),
      },
    );
  }, [password, newPassword, updatePassword, onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Alterar Senha</Text>

          <Text style={styles.fieldLabel}>Senha atual</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={d.textMuted}
            placeholder="••••••••"
          />

          <Text style={styles.fieldLabel}>Nova senha</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor={d.textMuted}
            placeholder="••••••••"
          />

          <Pressable
            style={[styles.saveButton, updatePassword.isPending && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={updatePassword.isPending}
          >
            {updatePassword.isPending ? (
              <ActivityIndicator color={d.text} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<HomeTabNavigation>();
  const signOut = useAuthStore((s) => s.signOut);

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);

  const profileQuery = useMyProfile();
  const profile = profileQuery.data;

  const postsQuery = useUserPosts(profile?.id ?? 0);
  const posts = useMemo(
    () => postsQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [],
    [postsQuery.data?.pages],
  );

  const handleLogout = useCallback(() => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  }, [signOut]);

  const onEndReached = useCallback(() => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
      void postsQuery.fetchNextPage();
    }
  }, [postsQuery]);

  const renderGridItem = useCallback(
    ({ item }: { item: PostWithAuthor }) => (
      <Pressable
        style={styles.gridItem}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      >
        {item.image ? (
          <RemoteImage uri={item.image} style={styles.gridImage} />
        ) : (
          <View style={[styles.gridImage, styles.gridImageFallback]}>
            <Text style={styles.gridImageFallbackText} numberOfLines={3}>
              {item.content ?? ''}
            </Text>
          </View>
        )}
      </Pressable>
    ),
    [navigation],
  );

  const keyExtractor = useCallback((item: PostWithAuthor) => String(item.id), []);

  const isLoading = profileQuery.isPending;

  const ListHeader = useMemo(() => {
    if (isLoading) return <ProfileSkeleton />;
    if (!profile) return null;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          {profile.avatar ? (
            <RemoteImage uri={profile.avatar} style={styles.avatar} />
          ) : (
            <AvatarPlaceholder name={profile.fullName} size={80} />
          )}
          <View style={styles.counters}>
            <View style={styles.counterItem}>
              <Text style={styles.counterValue}>{profile.posts}</Text>
              <Text style={styles.counterLabel}>Posts</Text>
            </View>
            <View style={styles.counterItem}>
              <Text style={styles.counterValue}>{profile.followers}</Text>
              <Text style={styles.counterLabel}>Seguidores</Text>
            </View>
            <View style={styles.counterItem}>
              <Text style={styles.counterValue}>{profile.following}</Text>
              <Text style={styles.counterLabel}>Seguindo</Text>
            </View>
          </View>
        </View>

        <Text style={styles.fullName}>{profile.fullName}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={() => setEditProfileVisible(true)}>
            <Text style={styles.actionButtonText}>Editar Perfil</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setEditPasswordVisible(true)}>
            <Text style={styles.actionButtonText}>Alterar Senha</Text>
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
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
            visible={editProfileVisible}
            onClose={() => setEditProfileVisible(false)}
            initialValues={{
              fullName: profile.fullName,
              username: profile.username,
              bio: profile.bio ?? '',
            }}
          />
          <EditPasswordModal
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
    gap: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: d.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: d.text,
    fontWeight: '600',
  },
  counters: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  counterItem: {
    alignItems: 'center',
  },
  counterValue: {
    ...typography.subtitle,
    color: d.text,
    fontWeight: '700',
  },
  counterLabel: {
    ...typography.caption,
    color: d.textMuted,
    marginTop: 2,
  },
  fullName: {
    ...typography.subtitle,
    color: d.text,
    marginTop: spacing.sm,
  },
  username: {
    ...typography.caption,
    color: d.textMuted,
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
  },
  actionButtonText: {
    ...typography.caption,
    color: d.text,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: d.border,
    alignItems: 'center',
  },
  logoutButtonText: {
    ...typography.caption,
    color: colors.dark.likeActive,
    fontWeight: '600',
  },
  gridDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: d.border,
    marginTop: spacing.md,
  },
  gridItem: {
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  gridImage: {
    width: TILE_SIZE,
    height: TILE_SIZE,
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
  modalSheet: {
    backgroundColor: d.surface,
    borderTopLeftRadius: radii.sheetTop,
    borderTopRightRadius: radii.sheetTop,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
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
  input: {
    backgroundColor: d.background,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: d.border,
    color: d.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
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
