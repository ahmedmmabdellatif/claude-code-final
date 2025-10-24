import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Card, ProgressBar } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Frequency {
  days: number;
  label: string;
}

const FREQUENCIES: Frequency[] = [
  { days: 3, label: 'Easy' },
  { days: 4, label: 'Good' },
  { days: 5, label: 'Great' },
  { days: 6, label: 'Beast' },
];

export default function FrequencyScreen() {
  const [selectedDays, setSelectedDays] = useState<number | null>(null);

  const handleContinue = () => {
    router.push('/client/onboarding/injuries' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressBar current={7} total={10} />

      <View style={styles.content}>
        <Text style={styles.emoji}>📅</Text>
        <Text style={styles.title}>Training days per week?</Text>

        <View style={styles.optionsContainer}>
          {FREQUENCIES.map((freq) => (
            <Card
              key={freq.days}
              style={[
                styles.optionCard,
                selectedDays === freq.days && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedDays(freq.days)}
            >
              <Text style={styles.optionDays}>{freq.days}</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{freq.days} days</Text>
                <Text style={styles.optionLabel}>{freq.label}</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="CONTINUE"
          onPress={handleContinue}
          disabled={selectedDays === null}
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
  optionsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: colors.accent.primary,
    backgroundColor: `${colors.accent.primary}15`,
  },
  optionDays: {
    fontSize: 40,
    fontWeight: typography.weight.bold,
    color: colors.accent.primary,
    width: 60,
    textAlign: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  optionLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});