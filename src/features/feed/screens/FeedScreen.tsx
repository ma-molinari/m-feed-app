import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HomeTabNavigation } from '@navigation/types';
import { getApiErrorMessage } from '@services/api/errors';
import { useAuthStore } from '@store/authStore';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

import { PostCard } from '../components/PostCard';
import { PostOptionsSheet } from '../components/PostOptionsSheet';
import { SkeletonCard } from '../components/SkeletonCard';
import { useExploreFeed } from '../hooks/useExploreFeed';
import { useFeed } from '../hooks/useFeed';
import { useFeedMutations } from '../hooks/useFeedMutations';
import { useLikedPosts } from '../hooks/useLikedPosts';
import type { PostWithAuthor } from '../types';

type FeedTab = 'foryou' | 'explore';

export function FeedScreen() {
  const navigation = useNavigation<HomeTabNavigation>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [feedTab, setFeedTab] = useState<FeedTab>('foryou');
  const [optionsPost, setOptionsPost] = useState<PostWithAuthor | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const forYouEnabled = feedTab === 'foryou';
  const exploreEnabled = feedTab === 'explore';

  const feed = useFeed(forYouEnabled);
  const exploreFeed = useExploreFeed(exploreEnabled);
  const liked = useLikedPosts();
  const { likePost, unlikePost, deleteMutation } = useFeedMutations();

  const flatData = useMemo(
    () => feed.data?.pages.flatMap((p) => p.data ?? []) ?? [],
    [feed.data?.pages],
  );

  const flatExploreData = useMemo(
    () => exploreFeed.data?.pages.flatMap((p) => p.data ?? []) ?? [],
    [exploreFeed.data?.pages],
  );

  const firstPage = feed.data?.pages[0];
  const totalCount = firstPage?.ct ?? 0;

  const exploreFirstPage = exploreFeed.data?.pages[0];
  const exploreTotalCount = exploreFirstPage?.ct ?? 0;

  const showInitialSkeleton =
    forYouEnabled && (feed.isPending || (feed.isFetching && flatData.length === 0));

  const showExploreSkeleton =
    exploreEnabled &&
    (exploreFeed.isPending || (exploreFeed.isFetching && flatExploreData.length === 0));

  const onEndReached = useCallback(() => {
    if (forYouEnabled) {
      if (feed.hasNextPage && !feed.isFetchingNextPage) {
        void feed.fetchNextPage();
      }
    } else if (exploreEnabled) {
      if (exploreFeed.hasNextPage && !exploreFeed.isFetchingNextPage) {
        void exploreFeed.fetchNextPage();
      }
    }
  }, [feed, exploreFeed, forYouEnabled, exploreEnabled]);

  const renderItem = useCallback(
    ({ item }: { item: PostWithAuthor }) => (
      <PostCard
        post={item}
        isLiked={liked.likedIdSet.has(item.id)}
        onLike={() => likePost(item.id)}
        onUnlike={() => unlikePost(item.id)}
        onComment={() => navigation.navigate('PostDetail', { postId: item.id })}
        onOptionsPress={() => {
          setDeleteError(null);
          setOptionsPost(item);
        }}
        onAuthorPress={() => navigation.navigate('UserProfile', { userId: item.user.id })}
      />
    ),
    [liked.likedIdSet, likePost, unlikePost, navigation],
  );

  const keyExtractor = useCallback((item: PostWithAuthor) => String(item.id), []);

  const emptyForYou =
    forYouEnabled &&
    !feed.isPending &&
    !feed.isFetching &&
    flatData.length === 0 &&
    totalCount === 0;

  const emptyExplore =
    exploreEnabled &&
    !exploreFeed.isPending &&
    !exploreFeed.isFetching &&
    flatExploreData.length === 0 &&
    exploreTotalCount === 0;

  const d = colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: d.background }]}>
      <View
        style={[
          styles.topBar,
          {
            borderBottomColor: d.border,
            backgroundColor: d.surface,
          },
        ]}
      >
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setFeedTab('foryou')}
            style={[styles.pill, feedTab === 'foryou' && styles.pillActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: feedTab === 'foryou' }}
            accessibilityLabel="Para você"
          >
            <Text style={[styles.pillText, feedTab === 'foryou' && styles.pillTextActive]}>
              Para você
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFeedTab('explore')}
            style={[styles.pill, feedTab === 'explore' && styles.pillActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: feedTab === 'explore' }}
            accessibilityLabel="Explorar"
          >
            <Text style={[styles.pillText, feedTab === 'explore' && styles.pillTextActive]}>
              Explorar
            </Text>
          </Pressable>
        </View>
      </View>

      {showExploreSkeleton ? (
        <View style={styles.skeletonWrap}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : exploreEnabled && exploreFeed.isError ? (
        <Text style={styles.errorText}>Não foi possível carregar o Explorar.</Text>
      ) : emptyExplore ? (
        <View style={[styles.emptyWrap, { paddingBottom: spacing.xl + insets.bottom }]}>
          <Ionicons name="compass-outline" size={48} color={d.textMuted} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>Nenhuma publicação para explorar no momento.</Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => {
              void exploreFeed.refetch();
            }}
          >
            <Text style={styles.emptyButtonText}>Atualizar</Text>
          </Pressable>
          <Pressable
            style={styles.emptyButtonSecondary}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.emptyButtonSecondaryText}>Abrir busca</Text>
          </Pressable>
        </View>
      ) : exploreEnabled ? (
        <FlashList
          data={flatExploreData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          drawDistance={480}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={exploreFeed.isRefetching}
              onRefresh={() => {
                void exploreFeed.refetch();
              }}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListFooterComponent={
            exploreFeed.isFetchingNextPage ? (
              <ActivityIndicator color={d.textMuted} style={styles.footerSpinner} />
            ) : null
          }
        />
      ) : showInitialSkeleton ? (
        <View style={styles.skeletonWrap}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : feed.isError ? (
        <Text style={styles.errorText}>Não foi possível carregar seu feed.</Text>
      ) : emptyForYou ? (
        <View style={[styles.emptyWrap, { paddingBottom: spacing.xl + insets.bottom }]}>
          <Ionicons name="people-outline" size={48} color={d.textMuted} style={styles.emptyIcon} />
          <Text style={styles.emptyText}>Seu feed está vazio. Encontre pessoas para seguir.</Text>
          <Pressable style={styles.emptyButton} onPress={() => navigation.navigate('Search')}>
            <Text style={styles.emptyButtonText}>Abrir busca</Text>
          </Pressable>
          <Pressable
            style={styles.emptyButtonSecondary}
            onPress={() => {
              void feed.refetch();
            }}
          >
            <Text style={styles.emptyButtonSecondaryText}>Atualizar</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={flatData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          drawDistance={480}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={feed.isRefetching}
              onRefresh={() => {
                void feed.refetch();
              }}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListFooterComponent={
            feed.isFetchingNextPage ? (
              <ActivityIndicator color={d.textMuted} style={styles.footerSpinner} />
            ) : null
          }
        />
      )}

      <PostOptionsSheet
        visible={optionsPost !== null}
        isOwner={optionsPost !== null && user?.id === optionsPost.userId}
        onClose={() => {
          setDeleteError(null);
          setOptionsPost(null);
        }}
        deletePending={deleteMutation.isPending}
        deleteError={deleteError}
        onDelete={() => {
          if (!optionsPost) return;
          deleteMutation.mutate(optionsPost.id, {
            onSuccess: () => {
              setOptionsPost(null);
              setDeleteError(null);
            },
            onError: (e) => setDeleteError(getApiErrorMessage(e, 'authenticated')),
          });
        }}
        onEdit={() => {
          if (optionsPost) {
            navigation.navigate('EditPost', {
              postId: optionsPost.id,
              content: optionsPost.content ?? '',
            });
          }
        }}
        onGoToPost={() => {
          if (optionsPost) {
            navigation.navigate('PostDetail', { postId: optionsPost.id });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: spacing.md,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: colors.dark.segmentActive,
  },
  pillText: {
    ...typography.body,
    color: colors.dark.feedTabInactive,
  },
  pillTextActive: {
    color: colors.dark.text,
    fontWeight: '700',
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  skeletonWrap: {
    paddingTop: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.dark.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyWrap: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.dark.textMuted,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
  },
  emptyButtonText: {
    ...typography.subtitle,
    color: colors.dark.text,
  },
  emptyButtonSecondary: {
    marginTop: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.dark.border,
  },
  emptyButtonSecondaryText: {
    ...typography.subtitle,
    color: colors.dark.textMuted,
  },
  footerSpinner: {
    paddingVertical: spacing.md,
  },
});
