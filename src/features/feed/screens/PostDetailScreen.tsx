import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import type { MainStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { RemoteImage } from '@shared/components/RemoteImage';

import { useComments } from '../hooks/useComments';
import { useCreateComment } from '../hooks/useCreateComment';
import { usePostDetail } from '../hooks/usePostDetail';
import type { CommentWithUser } from '../types';

const d = colors.dark;

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return new Date(dateString).toLocaleDateString();
}

function SkeletonBlock({ width, height, borderRadius = 4 }: { width: number | string; height: number; borderRadius?: number }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useMemo(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [d.skeletonBase, d.skeletonHighlight],
  });

  return <Animated.View style={[{ width, height, borderRadius }, { backgroundColor }]} />;
}

function PostDetailSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      <SkeletonBlock width="100%" height={300} borderRadius={0} />
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
  const avatarUri = comment.user.avatar
    ? `${comment.user.avatar}`
    : null;

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

  const [commentText, setCommentText] = useState('');

  const postQuery = usePostDetail(postId);
  const commentsQuery = useComments(postId);
  const createComment = useCreateComment(postId);

  const flatComments = useMemo(
    () => commentsQuery.data?.pages.flatMap((p) => p.data ?? []) ?? [],
    [commentsQuery.data?.pages],
  );

  const onEndReached = useCallback(() => {
    if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
      void commentsQuery.fetchNextPage();
    }
  }, [commentsQuery]);

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
    const baseUrl = post.image.startsWith('http') ? post.image : `${post.image}`;
    await Share.share({
      message: post.content ?? '',
      url: baseUrl,
    });
  }, [postQuery.data]);

  const renderComment = useCallback(
    ({ item }: { item: CommentWithUser }) => <CommentItem comment={item} />,
    [],
  );

  const keyExtractor = useCallback((item: CommentWithUser) => String(item.id), []);

  const post = postQuery.data;

  const ListHeader = useMemo(() => {
    if (postQuery.isPending) {
      return <PostDetailSkeleton />;
    }

    if (!post) return null;

    const avatarUri = post.user.avatar ?? null;

    return (
      <View>
        <RemoteImage uri={post.image} style={styles.postImage} contentFit="cover" />
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
              <Text style={styles.postTime}>{formatRelativeTime(post.createdAt)}</Text>
            </View>
          </View>

          {post.content ? <Text style={styles.postText}>{post.content}</Text> : null}

          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              {post.total_likes ?? 0} curtidas
            </Text>
            <Text style={styles.statSep}>·</Text>
            <Text style={styles.statText}>
              {post.total_comments ?? 0} comentários
            </Text>
          </View>
        </View>
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionLabel}>Comentários</Text>
      </View>
    );
  }, [post, postQuery.isPending]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backIcon}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Post</Text>
        <Pressable onPress={handleShare} style={styles.shareButton} hitSlop={12}>
          <Text style={styles.shareText}>Compartilhar</Text>
        </Pressable>
      </View>

      <FlashList
        data={flatComments}
        renderItem={renderComment}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        estimatedItemSize={80}
        ListFooterComponent={
          commentsQuery.isFetchingNextPage ? (
            <ActivityIndicator color={d.textMuted} style={styles.footerSpinner} />
          ) : null
        }
      />

      <View style={styles.inputBar}>
        <TextInput
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
          style={[styles.sendButton, (!commentText.trim() || createComment.isPending) && styles.sendButtonDisabled]}
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
    paddingTop: spacing.xl + spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: d.border,
  },
  backButton: {
    width: 40,
  },
  backIcon: {
    fontSize: 32,
    color: d.text,
    lineHeight: 36,
  },
  headerTitle: {
    ...typography.subtitle,
    color: d.text,
  },
  shareButton: {
    width: 100,
    alignItems: 'flex-end',
  },
  shareText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  postImage: {
    width: '100%',
    height: 300,
  },
  postContent: {
    padding: spacing.md,
    gap: spacing.sm,
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: d.textMuted,
  },
  statSep: {
    ...typography.caption,
    color: d.textMuted,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: d.border,
    marginHorizontal: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    color: d.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    paddingVertical: spacing.sm,
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
