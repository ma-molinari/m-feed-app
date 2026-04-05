import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainStackParamList } from '@navigation/types';
import { RemoteImage } from '@shared/components/RemoteImage';
import { colors } from '@theme/colors';
import { radii } from '@theme/radii';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

import { useFollowUser } from '../hooks/useFollowUser';
import { useUserById } from '../hooks/useUserById';
import { useUserPosts } from '../hooks/useUserPosts';
import type { PostWithAuthor } from '../types';
import { env } from '@/constants/env';

const { width } = Dimensions.get('window');
const GRID_COLS = 3;
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

function UserProfileSkeleton() {
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
      <SkeletonBlock
        width={'100%' as unknown as number}
        height={36}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
}

type UserProfileRoute = RouteProp<MainStackParamList, 'UserProfile'>;
type UserProfileNavigation = NativeStackNavigationProp<MainStackParamList, 'UserProfile'>;

export function UserProfileScreen() {
  const navigation = useNavigation<UserProfileNavigation>();
  const route = useRoute<UserProfileRoute>();
  const { userId } = route.params;

  const [isFollowing, setIsFollowing] = useState(false);

  const profileQuery = useUserById(userId);
  const profile = profileQuery.data;

  const postsQuery = useUserPosts(userId);
  const posts = useMemo(
    () => postsQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [],
    [postsQuery.data?.pages],
  );

  const { follow, unfollow } = useFollowUser(userId);

  const handleFollowToggle = useCallback(() => {
    if (isFollowing) {
      setIsFollowing(false);
      unfollow.mutate(undefined, {
        onError: () => setIsFollowing(true),
      });
    } else {
      setIsFollowing(true);
      follow.mutate(undefined, {
        onError: () => setIsFollowing(false),
      });
    }
  }, [isFollowing, follow, unfollow]);

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
          <RemoteImage uri={`${env.imageUrl}/${item.image}`} style={styles.gridImage} />
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
  const isMutating = follow.isPending || unfollow.isPending;

  const ListHeader = useMemo(() => {
    if (isLoading) return <UserProfileSkeleton />;
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

        <Pressable
          style={[
            styles.followButton,
            isFollowing && styles.followButtonActive,
            isMutating && styles.buttonDisabled,
          ]}
          onPress={handleFollowToggle}
          disabled={isMutating}
        >
          {isMutating ? (
            <ActivityIndicator color={isFollowing ? d.text : d.background} size="small" />
          ) : (
            <Text style={[styles.followButtonText, isFollowing && styles.followButtonTextActive]}>
              {isFollowing ? 'Seguindo' : 'Seguir'}
            </Text>
          )}
        </Pressable>

        <View style={styles.gridDivider} />
      </View>
    );
  }, [isLoading, profile, isFollowing, isMutating, handleFollowToggle]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {profile?.username ? `@${profile.username}` : ''}
        </Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: d.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: d.border,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 32,
    color: d.text,
    lineHeight: 36,
    marginTop: -4,
  },
  topBarTitle: {
    flex: 1,
    ...typography.subtitle,
    color: d.text,
    textAlign: 'center',
  },
  backButtonPlaceholder: {
    width: 32,
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
  followButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  followButtonActive: {
    backgroundColor: d.surface,
    borderWidth: 1,
    borderColor: d.border,
  },
  followButtonText: {
    ...typography.subtitle,
    color: d.text,
    fontWeight: '600',
  },
  followButtonTextActive: {
    color: d.textMuted,
  },
  buttonDisabled: {
    opacity: 0.6,
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
    padding: spacing.xs,
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
});
