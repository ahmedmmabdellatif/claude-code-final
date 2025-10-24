import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import colors from '@/constants/colors';
import spacing from '@/constants/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  style?: ViewStyle;
}

export default function Card({
  children,
  onPress,
  selected = false,
  style,
}: CardProps) {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: selected ? 1.02 : 1,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      Animated.spring(scaleValue, {
        toValue: selected ? 1.02 : 1,
        useNativeDriver: true,
      }).start();
    }
  }, [selected, scaleValue]);

  const cardStyle: ViewStyle = {
    ...styles.card,
    ...(selected && styles.cardSelected),
  };

  if (onPress) {
    if (Platform.OS === 'web') {
      return (
        <Pressable onPress={onPress}>
          <View style={[cardStyle, style]}>
            {children}
          </View>
        </Pressable>
      );
    }
    
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[cardStyle, style, { transform: [{ scale: scaleValue }] }]}
        >
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  cardSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: `${colors.accent.primary}1A`,
  },
});
