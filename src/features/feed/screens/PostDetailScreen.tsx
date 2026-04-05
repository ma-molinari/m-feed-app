import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DimensionValue } from 'react-native';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MainStackParamList } from '@navigation/types';
import { useScreenTopInset } from '@navigation/screenTopInset';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { RemoteImage } from '@shared/components/RemoteImage';

import { useComments } from '../hooks/useComments';
import { useCreateComment } from '../hooks/useCreateComment';
import { useFeedMutations } from '../hooks/useFeedMutations';
import { useLikedPosts } from '../hooks/useLikedPosts';
import { usePostDetail } from '../hooks/usePostDetail';
import type { CommentWithUser } from '../types';
import { formatRelativeTime } from '../utils/formatRelativeTime';
import { env } from '@/constants/env';

const d = colors.dark;

/** Altura da mídia: largura / proporção, limitada (evita número mágico solto no layout). */
const POST_DETAIL_MEDIA_ASPECT = 4 / 3;
const POST_DETAIL_MEDIA_MAX_HEIGHT = 360;
const POST_DETAIL_MEDIA_MIN_HEIGHT = 200;

/** Barra interna (título + ações) abaixo do padding global do shell — usada no offset do teclado (iOS). */
const POST_DETAIL_HEADER_BAR_HEIGHT = 52;

const HIT_SLOP = 12;

function usePostDetailMediaHeight(): number {
  const { width } = useWindowDimensions();
  const byAspect = width / POST_DETAIL_MEDIA_ASPECT;
  return Math.round(
    Math.min(POST_DETAIL_MEDIA_MAX_HEIGHT, Math.max(POST_DETAIL_MEDIA_MIN_HEIGHT, byAspect)),
  );
}

function formatAbsolutePostDate(dateString: string): string {
  return new Date(dateString).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isPostOlderThanSevenDays(dateString: string): boolean {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return diffDays >= 7;
}

function SkeletonBlock({
  width,
  height,
  borderRadius = 4,
}: {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
}) {
  const shimmer = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [shimmer]);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [d.skeletonBase, d.skeletonHighlight],
  });

  return <Animated.View style={[{ width, height, borderRadius }, { backgroundColor }]} />;
}

function PostDetailSkeleton({ imageHeight }: { imageHeight: number }) {
  return (
    <View style={styles.skeletonContainer}>
      <SkeletonBlock width="100%" height={imageHeight} borderRadius={0} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonAuthorRow}>
          <SkeletonBlock width={36} height={36} borderRadius={18} />
          <View style={styles.skeletonAuthorText}>
            <SkeletonBlock width={120} height={12} />
            <SkeletonBlock width={80} height={10} />
          </View>
        </View>
        <SkeletonBlock width="90%" height={14} />
        <SkeletonBlock width="70%" height={14} />
        <View style={styles.skeletonStats}>
          <SkeletonBlock width={60} height={12} />
          <SkeletonBlock width={80} height={12} />
        </View>
      </View>
    </View>
  );
}

function CommentItem({ comment }: { comment: CommentWithUser }) {
  const avatarUri = comment.user.avatar ? `${comment.user.avatar}` : null;

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        {avatarUri ? (
          <RemoteImage uri={avatarUri} style={styles.avatarImage} />
        ) : (
          <View style={[styles.avatarImage, styles.avatarFallback]}>
            <Text style={styles.avatarFallbackText}>
              {comment.user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{comment.user.username}</Text>
          <Text style={styles.commentTime}>{formatRelativeTime(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
      </View>
    </View>
  );
}

export function PostDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList, 'PostDetail'>>();
  const route = useRoute<RouteProp<MainStackParamList, 'PostDetail'>>();
  const { postId } = route.params;
  const insets = useSafeAreaInsets();
  const shellTopInset = useScreenTopInset();
  const mediaHeight = usePostDetailMediaHeight();

  const [commentText, setCommentText] = useState('');
  const [inputBarHeight, setInputBarHeight] = useState(72);
  const commentInputRef = useRef<TextInput>(null);

  const postQuery = usePostDetail(postId);
  const commentsQuery = useComments(postId);
  const createComment = useCreateComment(postId);
  const liked = useLikedPosts();
  const { likePost, unlikePost } = useFeedMutations();

  const flatComments = useMemo(
    () => commentsQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [],
    [commentsQuery.data?.pages],
  );

  const onEndReached = useCallback(() => {
    if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
      void commentsQuery.fetchNextPage();
    }
  }, [commentsQuery]);

  const onRefresh = useCallback(() => {
    void Promise.all([postQuery.refetch(), commentsQuery.refetch()]);
  }, [postQuery, commentsQuery]);

  const listRefreshing = postQuery.isRefetching || commentsQuery.isRefetching;

  const handleSubmitComment = useCallback(() => {
    const trimmed = commentText.trim();
    if (!trimmed || createComment.isPending) return;
    createComment.mutate(trimmed, {
      onSuccess: () => setCommentText(''),
    });
  }, [commentText, createComment]);

  const handleShare = useCallback(async () => {
    const post = postQuery.data;
    if (!post) return;
    const baseUrl = post.image.startsWith('http') ? post.image : `${env.imageUrl}/${post.image}`;
    await Share.share({
      message: post.content ?? '',
      url: baseUrl,
    });
  }, [postQuery.data]);

  const focusCommentInput = useCallback(() => {
    commentInputRef.current?.focus();
  }, []);

  const onInputBarLayout = useCallback((e: LayoutChangeEvent) => {
    setInputBarHeight(e.nativeEvent.layout.height);
  }, []);

  const renderComment = useCallback(
    ({ item }: { item: CommentWithUser }) => <CommentItem comment={item} />,
    [],
  );

  const keyExtractor = useCallback((item: CommentWithUser) => String(item.id), []);

  const post = postQuery.data;
  const isLiked = post ? liked.likedIdSet.has(post.id) : false;

  const keyboardVerticalOffset =
    Platform.OS === 'ios' ? shellTopInset + POST_DETAIL_HEADER_BAR_HEIGHT : 0;

  const ListHeader = useMemo(() => {
    if (postQuery.isPending) {
      return <PostDetailSkeleton imageHeight={mediaHeight} />;
    }

    if (!post) return null;

    const avatarUri = post.user.avatar ?? null;
    const likes = post.total_likes ?? 0;
    const commentsCount = post.total_comments ?? 0;
    const relativeTime = formatRelativeTime(post.createdAt);
    const showAbsoluteDate = isPostOlderThanSevenDays(post.createdAt);

    return (
      <View>
        <RemoteImage
          uri={`${env.imageUrl}/${post.image}`}
          style={[styles.postImage, { height: mediaHeight }]}
          contentFit="cover"
        />
        <View style={styles.postContent}>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              {avatarUri ? (
                <RemoteImage uri={avatarUri} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, styles.avatarFallback]}>
                  <Text style={styles.avatarFallbackText}>
                    {post.user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Text style={styles.authorName}>{post.user.username}</Text>
              <Text style={styles.postTime}>
                {showAbsoluteDate ? formatAbsolutePostDate(post.createdAt) : relativeTime}
              </Text>
            </View>
          </View>

          {post.content ? <Text style={styles.postText}>{post.content}</Text> : null}

          <View style={styles.engagementRow}>
            <Pressable
              onPress={() => (isLiked ? unlikePost(post.id) : likePost(post.id))}
              style={styles.statBtn}
              accessibilityRole="button"
              accessibilityLabel={isLiked ? 'Descurtir' : 'Curtir'}
              accessibilityHint={likes === 1 ? '1 curtida' : `${likes} curtidas`}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? d.likeActive : d.text}
              />
              <Text style={styles.statLabel}>{likes}</Text>
            </Pressable>
            <Pressable
              onPress={focusCommentInput}
              style={styles.statBtn}
              accessibilityRole="button"
              accessibilityLabel="Comentários"
              accessibilityHint={
                commentsCount === 1 ? '1 comentário' : `${commentsCount} comentários`
              }
            >
              <Ionicons name="chatbubble-outline" size={20} color={d.text} />
              <Text style={styles.statLabel}>{commentsCount}</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Comentários</Text>
        {commentsQuery.isError ? (
          <View style={styles.commentsErrorBanner}>
            <Text style={styles.commentsErrorText}>Não foi possível carregar os comentários.</Text>
            <Pressable
              onPress={() => {
                void commentsQuery.refetch();
              }}
              style={styles.commentsRetryBtn}
              accessibilityRole="button"
              accessibilityLabel="Tentar carregar comentários novamente"
            >
              <Text style={styles.commentsRetryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }, [
    post,
    postQuery.isPending,
    mediaHeight,
    isLiked,
    likePost,
    unlikePost,
    focusCommentInput,
    commentsQuery,
  ]);

  const renderListEmpty = useCallback(() => {
    if (commentsQuery.isPending) {
      return (
        <View style={styles.commentsLoading}>
          <ActivityIndicator color={d.textMuted} />
        </View>
      );
    }
    if (commentsQuery.isError) {
      return null;
    }
    return (
      <Text style={styles.emptyCommentsText}>Nenhum comentário ainda. Seja o primeiro!</Text>
    );
  }, [commentsQuery.isPending, commentsQuery.isError]);

  const listFooterSpinner =
    commentsQuery.isFetchingNextPage ? (
      <ActivityIndicator color={d.textMuted} style={styles.footerSpinner} />
    ) : null;

  if (postQuery.isError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.headerIconButton}
            hitSlop={HIT_SLOP}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Ionicons name="chevron-back" size={28} color={d.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerIconButton} />
        </View>
        <View style={styles.errorState}>
          <Text style={styles.errorStateText}>Não foi possível carregar o post.</Text>
          <Pressable
            onPress={() => {
              void postQuery.refetch();
            }}
            style={styles.errorRetryBtn}
            accessibilityRole="button"
            accessibilityLabel="Tentar carregar o post novamente"
          >
            <Text style={styles.errorRetryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerIconButton}
          hitSlop={HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Ionicons name="chevron-back" size={28} color={d.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Post</Text>
        <Pressable
          onPress={handleShare}
          style={styles.headerIconButton}
          hitSlop={HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel="Compartilhar"
        >
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <FlashList
        data={flatComments}
        renderItem={renderComment}
        keyExtractor={keyExtractor}
        drawDistance={320}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderListEmpty}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: inputBarHeight }}
        refreshControl={
          <RefreshControl
            refreshing={listRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListFooterComponent={listFooterSpinner}
      />

      <View
        style={[styles.inputBar, { paddingBottom: spacing.sm + insets.bottom }]}
        onLayout={onInputBarLayout}
      >
        <TextInput
          ref={commentInputRef}
          style={styles.textInput}
          placeholder="Adicione um comentário..."
          placeholderTextColor={d.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSubmitComment}
          style={[
            styles.sendButton,
            (!commentText.trim() || createComment.isPending) && styles.sendButtonDisabled,
          ]}
          disabled={!commentText.trim() || createComment.isPending}
        >
          {createComment.isPending ? (
            <ActivityIndicator color={d.text} size="small" />
          ) : (
            <Text style={styles.sendText}>Enviar</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: d.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: d.border,
    minHeight: POST_DETAIL_HEADER_BAR_HEIGHT,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.subtitle,
    color: d.text,
  },
  postImage: {
    width: '100%',
    backgroundColor: d.surface,
  },
  postContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authorAvatar: {
    width: 36,
    height: 36,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    backgroundColor: d.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    ...typography.caption,
    color: d.textMuted,
    fontWeight: '700',
  },
  authorName: {
    ...typography.subtitle,
    color: d.text,
  },
  postTime: {
    ...typography.caption,
    color: d.textMuted,
  },
  postText: {
    ...typography.body,
    color: d.text,
    lineHeight: 22,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: d.text,
    fontWeight: '600',
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: d.border,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    color: d.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  commentsErrorBanner: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: d.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: d.border,
    gap: spacing.sm,
  },
  commentsErrorText: {
    ...typography.body,
    color: d.textMuted,
  },
  commentsRetryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  commentsRetryText: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '600',
  },
  commentsLoading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCommentsText: {
    ...typography.body,
    color: d.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  errorStateText: {
    ...typography.body,
    color: d.textMuted,
    textAlign: 'center',
  },
  errorRetryBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: d.surface,
    borderRadius: 12,
  },
  errorRetryText: {
    ...typography.subtitle,
    color: d.text,
    fontWeight: '600',
  },
  commentItem: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    flexShrink: 0,
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  commentUsername: {
    ...typography.caption,
    color: d.text,
    fontWeight: '600',
  },
  commentTime: {
    ...typography.caption,
    color: d.textMuted,
    fontSize: 11,
  },
  commentContent: {
    ...typography.body,
    color: d.text,
    fontSize: 15,
    lineHeight: 20,
  },
  footerSpinner: {
    paddingVertical: spacing.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: d.border,
    backgroundColor: d.surface,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    color: d.text,
    backgroundColor: d.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: d.border,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendText: {
    ...typography.caption,
    color: d.text,
    fontWeight: '600',
  },
  skeletonContainer: {
    gap: 0,
  },
  skeletonContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  skeletonAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  skeletonAuthorText: {
    gap: spacing.xs,
  },
  skeletonStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
});
