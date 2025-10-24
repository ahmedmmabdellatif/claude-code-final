import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input, ProgressBar } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function NameScreen() {
  const [name, setName] = useState('');

  const handleContinue = () => {
    router.push('/client/onboarding/age' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressBar current={1} total={10} />

      <View style={styles.content}>
        <Text style={styles.emoji}>💪</Text>
        <Text style={styles.title}>What&apos;s your name?</Text>

        <Input
          value={name}
          onChangeText={setName}
          placeholder="Your name..."
          autoFocus
          style={styles.input}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="CONTINUE"
          onPress={handleContinue}
          disabled={!name.trim()}
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
  input: {
    width: '100%',
  },
  footer: {
    paddingTop: spacing.lg,
  },
});
