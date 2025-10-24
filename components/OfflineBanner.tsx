import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { useNetworkStatus } from '@/utils/networkStatus';

export default function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOffline) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOffline, translateY, opacity]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <WifiOff size={20} color={colors.text.primary} />
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 0,
    left: 0,
    right: 0,
    backgroundColor: colors.semantic.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    zIndex: 9999,
  },
  text: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
});
