import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';

import type { HomeTabNavigation } from '@navigation/types';
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
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const [feedTab, setFeedTab] = useState<FeedTab>('foryou');
  const [optionsPost, setOptionsPost] = useState<PostWithAuthor | null>(null);

  const forYouEnabled = feedTab === 'foryou';
  const exploreEnabled = feedTab === 'explore';

  const feed = useFeed(forYouEnabled);
  const exploreFeed = useExploreFeed(exploreEnabled);
  const liked = useLikedPosts();
  const { likeMutation, unlikeMutation, deleteMutation } = useFeedMutations();

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
        isLiked={liked.isLiked(item.id)}
        onLike={() => likeMutation.mutate(item.id)}
        onUnlike={() => unlikeMutation.mutate(item.id)}
        onComment={() => navigation.navigate('PostDetail', { postId: item.id })}
        onOptionsPress={() => setOptionsPost(item)}
        onAuthorPress={() => navigation.navigate('UserProfile', { userId: item.user.id })}
      />
    ),
    [liked, likeMutation, unlikeMutation, navigation],
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
      <View style={[styles.topBar, { borderBottomColor: d.border }]}>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setFeedTab('foryou')}
            style={[styles.pill, feedTab === 'foryou' && styles.pillActive]}
          >
            <Text style={[styles.pillText, feedTab === 'foryou' && styles.pillTextActive]}>
              For You
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFeedTab('explore')}
            style={[styles.pill, feedTab === 'explore' && styles.pillActive]}
          >
            <Text style={[styles.pillText, feedTab === 'explore' && styles.pillTextActive]}>
              Explore
            </Text>
          </Pressable>
        </View>
        <Pressable onPress={signOut} hitSlop={12}>
          <Text style={styles.signOut}>Sair</Text>
        </Pressable>
      </View>

      {showExploreSkeleton ? (
        <View style={styles.skeletonWrap}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : exploreEnabled && exploreFeed.isError ? (
        <Text style={styles.errorText}>Não foi possível carregar o Explore.</Text>
      ) : emptyExplore ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Nenhuma publicação para explorar no momento.</Text>
        </View>
      ) : exploreEnabled ? (
        <FlashList
          data={flatExploreData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
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
        <Text style={styles.errorText}>Não foi possível carregar o feed.</Text>
      ) : emptyForYou ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Seu feed está vazio. Explore usuários para seguir.</Text>
          <Pressable style={styles.emptyButton} onPress={() => navigation.navigate('Search')}>
            <Text style={styles.emptyButtonText}>Abrir busca</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={flatData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
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
        onClose={() => setOptionsPost(null)}
        onDelete={() => {
          if (optionsPost) deleteMutation.mutate(optionsPost.id);
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#2C2C2E',
  },
  pillText: {
    ...typography.body,
    color: colors.dark.textMuted,
  },
  pillTextActive: {
    color: colors.dark.text,
    fontWeight: '700',
  },
  signOut: {
    color: colors.primary,
    fontWeight: '600',
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
    flex: 1,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
  },
  emptyButtonText: {
    ...typography.subtitle,
    color: colors.dark.text,
  },
  footerSpinner: {
    paddingVertical: spacing.md,
  },
});
