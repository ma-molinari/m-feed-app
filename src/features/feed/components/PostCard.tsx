import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { env } from '@constants/env';
import { RemoteImage } from '@shared/components/RemoteImage';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

import type { PostWithAuthor } from '../types';
import { formatRelativeTime } from '../utils/formatRelativeTime';

const d = colors.dark;

function resolveMediaUri(raw: string): string {
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = (env.apiUrl ?? '').replace(/\/$/, '');
  if (!base) return raw;
  return `${base}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function resolvePostImageUri(raw: string): string {
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const base = (env.imageUrl ?? '').replace(/\/$/, '');
  if (!base) return resolveMediaUri(raw);
  return `${base}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

function authorInitial(fullName: string): string {
  const t = fullName.trim();
  return t.length > 0 ? t[0]!.toUpperCase() : '?';
}

type Props = {
  post: PostWithAuthor;
  isLiked: boolean;
  onLike: () => void;
  onUnlike: () => void;
  onComment: () => void;
  onOptionsPress: () => void;
  onAuthorPress: () => void;
};

export function PostCard({
  post,
  isLiked,
  onLike,
  onUnlike,
  onComment,
  onOptionsPress,
  onAuthorPress,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const postImageHeight = useMemo(
    () => Math.min(240, Math.round(windowWidth * 0.58)),
    [windowWidth],
  );
  const { user } = post;
  const likes = post.total_likes ?? 0;
  const comments = post.total_comments ?? 0;
  const avatarUri = user.avatar ? resolveMediaUri(user.avatar) : null;
  const imageUri = resolvePostImageUri(post.image);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={onAuthorPress}
          style={styles.authorBlock}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={`${user.fullName}, @${user.username}`}
        >
          {avatarUri ? (
            <RemoteImage uri={avatarUri} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarLetter}>{authorInitial(user.fullName)}</Text>
            </View>
          )}
          <View style={styles.authorMeta}>
            <Text style={styles.fullName} numberOfLines={1}>
              {user.fullName}
            </Text>
            <Text style={styles.handleTime} numberOfLines={1}>
              @{user.username} · {formatRelativeTime(post.createdAt)}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={onOptionsPress}
          style={styles.moreBtn}
          accessibilityRole="button"
          accessibilityLabel="Opções da publicação"
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={d.moreIcon} />
        </Pressable>
      </View>

      {!!post.content?.trim() && (
        <Text style={styles.caption} numberOfLines={6}>
          {post.content.trim()}
        </Text>
      )}

      <RemoteImage
        uri={imageUri}
        style={[styles.postImage, { height: postImageHeight }]}
        contentFit="cover"
      />

      <View style={styles.footer}>
        <Pressable
          onPress={isLiked ? onUnlike : onLike}
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
          onPress={onComment}
          style={styles.statBtn}
          accessibilityRole="button"
          accessibilityLabel="Comentários"
          accessibilityHint={comments === 1 ? '1 comentário' : `${comments} comentários`}
        >
          <Ionicons name="chatbubble-outline" size={20} color={d.text} />
          <Text style={styles.statLabel}>{comments}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: d.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  authorBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: d.avatarFallbackBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    ...typography.subtitle,
    color: d.avatarFallbackText,
    fontWeight: '600',
  },
  authorMeta: {
    flex: 1,
    minWidth: 0,
  },
  fullName: {
    ...typography.subtitle,
    color: d.text,
  },
  handleTime: {
    ...typography.caption,
    color: d.textMuted,
    marginTop: 2,
  },
  caption: {
    ...typography.body,
    lineHeight: 24,
    color: d.text,
    marginBottom: spacing.sm,
  },
  moreBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postImage: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: d.surface,
  },
  footer: {
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
});
