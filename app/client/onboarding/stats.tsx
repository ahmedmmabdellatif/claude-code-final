import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Input, ProgressBar } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function StatsScreen() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleContinue = () => {
    router.push('/client/onboarding/goal' as never);
  };

  const isValid = height && weight && parseInt(height) > 100 && parseInt(weight) > 30;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressBar current={3} total={10} />

      <View style={styles.content}>
        <Text style={styles.emoji}>📏</Text>
        <Text style={styles.title}>Tell us your stats</Text>

        <View style={styles.inputsContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height</Text>
            <View style={styles.inputRow}>
              <Input
                value={height}
                onChangeText={setHeight}
                placeholder="178"
                keyboardType="numeric"
                style={styles.input}
              />
              <Text style={styles.unit}>cm</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight</Text>
            <View style={styles.inputRow}>
              <Input
                value={weight}
                onChangeText={setWeight}
                placeholder="73"
                keyboardType="numeric"
                style={styles.input}
              />
              <Text style={styles.unit}>kg</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="CONTINUE" onPress={handleContinue} disabled={!isValid} />
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
  inputsContainer: {
    width: '100%',
    gap: spacing.lg,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputRow: {
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