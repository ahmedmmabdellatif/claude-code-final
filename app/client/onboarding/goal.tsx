import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Card, ProgressBar } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Goal {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const GOALS: Goal[] = [
  {
    id: 'build_muscle',
    emoji: '🔥',
    title: 'Build Muscle',
    description: 'Gain lean muscle mass',
  },
  {
    id: 'lose_fat',
    emoji: '⚡',
    title: 'Lose Fat',
    description: 'Burn fat and get leaner',
  },
  {
    id: 'recomposition',
    emoji: '✨',
    title: 'Body Recomposition',
    description: 'Build muscle & lose fat',
  },
];

export default function GoalScreen() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleContinue = () => {
    router.push('/client/onboarding/experience' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressBar current={4} total={10} />

      <View style={styles.content}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>What&apos;s your main goal?</Text>

        <View style={styles.optionsContainer}>
          {GOALS.map((goal) => (
            <Card
              key={goal.id}
              style={[
                styles.optionCard,
                selectedGoal === goal.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedGoal(goal.id)}
            >
              <Text style={styles.optionEmoji}>{goal.emoji}</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{goal.title}</Text>
                <Text style={styles.optionDescription}>{goal.description}</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="CONTINUE"
          onPress={handleContinue}
          disabled={!selectedGoal}
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
  optionEmoji: {
    fontSize: 40,
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
  optionDescription: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});