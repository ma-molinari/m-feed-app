import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

const d = colors.dark;

export function SkeletonCard() {
  const [shimmer] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [d.skeletonBase, d.skeletonHighlight],
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Animated.View style={[styles.avatarLg, { backgroundColor }]} />
        <View style={styles.headerText}>
          <Animated.View style={[styles.line120, { backgroundColor }]} />
          <Animated.View style={[styles.line60, { backgroundColor }]} />
        </View>
      </View>
      <Animated.View style={[styles.imageBlock, { backgroundColor }]} />
      <View style={styles.footerRow}>
        <Animated.View style={[styles.iconSm, { backgroundColor }]} />
        <Animated.View style={[styles.iconSm, { backgroundColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatarLg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  line120: {
    height: 12,
    width: 120,
    borderRadius: 4,
  },
  line60: {
    height: 10,
    width: 60,
    borderRadius: 4,
  },
  imageBlock: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconSm: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
