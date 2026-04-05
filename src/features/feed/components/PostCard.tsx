import { Pressable, StyleSheet, Text, View } from 'react-native';

import { env } from '@constants/env';
import { RemoteImage } from '@shared/components/RemoteImage';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

import type { PostWithAuthor } from '../types';

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

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return 'agora';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
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
  const { user } = post;
  const likes = post.total_likes ?? 0;
  const comments = post.total_comments ?? 0;
  const avatarUri = user.avatar ? resolveMediaUri(user.avatar) : null;
  const imageUri = resolvePostImageUri(post.image);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={onAuthorPress} style={styles.authorBlock} hitSlop={4}>
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
        <Pressable onPress={onOptionsPress} hitSlop={12} style={styles.moreBtn}>
          <Text style={styles.moreDots}>⋯</Text>
        </Pressable>
      </View>

      <RemoteImage uri={imageUri} style={styles.postImage} contentFit="cover" />

      <View style={styles.footer}>
        <Pressable onPress={isLiked ? onUnlike : onLike} style={styles.stat} hitSlop={8}>
          <Text style={[styles.heart, isLiked && styles.heartActive]}>{isLiked ? '❤' : '🤍'}</Text>
          <Text style={styles.statLabel}>{likes}</Text>
        </Pressable>
        <Pressable onPress={onComment} style={styles.stat} hitSlop={8}>
          <Text style={styles.commentIcon}>💬</Text>
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
    backgroundColor: d.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    ...typography.subtitle,
    color: d.text,
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
  moreBtn: {
    paddingHorizontal: spacing.xs,
  },
  moreDots: {
    fontSize: 22,
    color: d.text,
    lineHeight: 24,
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: d.surface,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heart: {
    fontSize: 20,
  },
  heartActive: {
    color: d.likeActive,
  },
  commentIcon: {
    fontSize: 18,
  },
  statLabel: {
    ...typography.caption,
    color: d.text,
    fontWeight: '600',
  },
});
