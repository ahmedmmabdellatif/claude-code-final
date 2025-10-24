import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  Animated,
  Platform,
} from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const shakeAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const getBorderColor = () => {
    if (error) return colors.semantic.error;
    if (isFocused) return colors.accent.primary;
    return colors.progress.bg;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            transform: [{ translateX: shakeAnimation }],
          },
          isFocused && styles.inputFocused,
        ]}
      >
        <TextInput
          {...props}
          style={[styles.input, style]}
          placeholderTextColor={colors.text.disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Animated.View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.bg.surface,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    fontSize: typography.size.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  error: {
    fontSize: typography.size.small,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
});
