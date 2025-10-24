import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Card, ProgressBar } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Experience {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const EXPERIENCE_LEVELS: Experience[] = [
  {
    id: 'beginner',
    emoji: '🐣',
    title: 'Beginner',
    description: 'New to fitness',
  },
  {
    id: 'intermediate',
    emoji: '🏃',
    title: 'Intermediate',
    description: '6+ months training',
  },
  {
    id: 'advanced',
    emoji: '🏆',
    title: 'Advanced',
    description: 'Years of experience',
  },
];

export default function ExperienceScreen() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleContinue = () => {
    router.push('/client/onboarding/location' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressBar current={5} total={10} />

      <View style={styles.content}>
        <Text style={styles.emoji}>👟</Text>
        <Text style={styles.title}>Training experience?</Text>

        <View style={styles.optionsContainer}>
          {EXPERIENCE_LEVELS.map((level) => (
            <Card
              key={level.id}
              style={[
                styles.optionCard,
                selectedLevel === level.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedLevel(level.id)}
            >
              <Text style={styles.optionEmoji}>{level.emoji}</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{level.title}</Text>
                <Text style={styles.optionDescription}>{level.description}</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="CONTINUE"
          onPress={handleContinue}
          disabled={!selectedLevel}
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