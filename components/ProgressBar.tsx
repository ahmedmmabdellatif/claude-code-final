import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface ProgressBarProps {
  current: number;
  total: number;
  animated?: boolean;
  showLabel?: boolean;
}

export default function ProgressBar({
  current,
  total,
  animated = true,
  showLabel = true,
}: ProgressBarProps) {
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const percentage = total > 0 ? (current / total) * 100 : 0;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(percentage);
    }
  }, [percentage, animated]);

  const width = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>
          {current}/{total} done • {Math.round(percentage)}%
        </Text>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.fillContainer, { width }]}>
          {Platform.OS === 'web' ? (
            <View style={[styles.fill, styles.webFill]} />
          ) : (
            <LinearGradient
              colors={[colors.progress.gradient.start, colors.progress.gradient.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fill}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  label: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  track: {
    height: 12,
    backgroundColor: colors.progress.bg,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fillContainer: {
    height: '100%',
  },
  fill: {
    flex: 1,
    borderRadius: 5,
  },
  webFill: {
    backgroundColor: colors.progress.gradient.start,
  },
});
