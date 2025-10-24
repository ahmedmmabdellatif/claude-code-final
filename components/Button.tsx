import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  Pressable,
  Platform,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'large',
  style,
}: ButtonProps) {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
    };

    if (disabled) {
      return { ...baseStyle, opacity: 0.4 };
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    return {
      ...styles.text,
      ...styles[`${variant}Text`],
    };
  };

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    if (Platform.OS === 'web') {
      return (
        <Pressable onPress={onPress} disabled={isDisabled}>
          <View style={[getButtonStyle(), style]}>
            <View style={[styles.gradient, styles.webGradient]}>
              {loading ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <Text style={getTextStyle()}>{title.toUpperCase()}</Text>
              )}
            </View>
          </View>
        </Pressable>
      );
    }
    
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        <Animated.View
          style={[
            getButtonStyle(),
            style,
            { transform: [{ scale: scaleValue }] },
          ]}
        >
          <LinearGradient
            colors={['#58CC02', '#4CAF00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <Text style={getTextStyle()}>{title.toUpperCase()}</Text>
            )}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled}>
        <View
          style={[
            getButtonStyle(),
            styles[`${variant}Container`],
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              color={
                variant === 'secondary'
                  ? colors.text.primary
                  : colors.accent.primary
              }
            />
          ) : (
            <Text style={getTextStyle()}>{title.toUpperCase()}</Text>
          )}
        </View>
      </Pressable>
    );
  }
  
  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          getButtonStyle(),
          styles[`${variant}Container`],
          style,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={
              variant === 'secondary'
                ? colors.text.primary
                : colors.accent.primary
            }
          />
        ) : (
          <Text style={getTextStyle()}>{title.toUpperCase()}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webGradient: {
    backgroundColor: '#58CC02',
  },
  largeButton: {
    height: 56,
  },
  mediumButton: {
    height: 48,
  },
  smallButton: {
    height: 40,
  },
  text: {
    fontSize: typography.size.button,
    fontWeight: typography.weight.semibold,
  },
  primaryText: {
    color: colors.text.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.accent.secondary,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.text.primary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent.primary,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: colors.accent.primary,
  },
});
