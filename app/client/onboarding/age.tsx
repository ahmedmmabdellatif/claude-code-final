import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input, ProgressBar } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function AgeScreen() {
  const [age, setAge] = useState('');

  const handleContinue = () => {
    router.push('/client/onboarding/stats' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressBar current={2} total={10} />

      <View style={styles.content}>
        <Text style={styles.emoji}>🎂</Text>
        <Text style={styles.title}>How old are you?</Text>

        <View style={styles.inputContainer}>
          <Input
            value={age}
            onChangeText={setAge}
            placeholder="25"
            keyboardType="numeric"
            autoFocus
            style={styles.input}
          />
          <Text style={styles.unit}>years</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="CONTINUE"
          onPress={handleContinue}
          disabled={!age || parseInt(age) < 13 || parseInt(age) > 100}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.dark,
    padding: spacing.screen,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  input: {
    flex: 1,
  },
  unit: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});