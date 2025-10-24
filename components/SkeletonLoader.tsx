import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import colors from '@/constants/colors';
import spacing from '@/constants/spacing';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={styles.cardHeaderText}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width="40%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
      <SkeletonLoader height={100} style={{ marginTop: spacing.md }} />
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

export function SkeletonTaskCard() {
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskRow}>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
        <SkeletonLoader width="70%" height={16} style={{ marginLeft: spacing.md }} />
      </View>
    </View>
  );
}

export function SkeletonDashboard() {
  return (
    <View style={styles.dashboard}>
      <View style={styles.header}>
        <SkeletonLoader width="50%" height={24} />
        <SkeletonLoader width="30%" height={16} style={{ marginTop: 8 }} />
      </View>

      <View style={styles.statsRow}>
        <SkeletonLoader width="30%" height={80} borderRadius={12} />
        <SkeletonLoader width="30%" height={80} borderRadius={12} />
        <SkeletonLoader width="30%" height={80} borderRadius={12} />
      </View>

      <SkeletonLoader height={12} style={{ marginVertical: spacing.md }} />

      <View style={styles.tasks}>
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonTaskCard key={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.progress.bg,
  },
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  list: {
    padding: spacing.screen,
  },
  taskCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboard: {
    padding: spacing.screen,
  },
  header: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  tasks: {
    marginTop: spacing.md,
  },
});
