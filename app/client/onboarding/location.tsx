import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Card, ProgressBar } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Location {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

const LOCATIONS: Location[] = [
  {
    id: 'gym',
    emoji: '🏋️',
    title: 'Gym',
    description: 'Full equipment access',
  },
  {
    id: 'home',
    emoji: '🏠',
    title: 'Home',
    description: 'Basic equipment',
  },
];

export default function LocationScreen() {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const handleContinue = () => {
    router.push('/client/onboarding/frequency' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressBar current={6} total={10} />

      <View style={styles.content}>
        <Text style={styles.emoji}>🏠</Text>
        <Text style={styles.title}>Where will you train?</Text>

        <View style={styles.optionsContainer}>
          {LOCATIONS.map((location) => (
            <Card
              key={location.id}
              style={[
                styles.optionCard,
                selectedLocation === location.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedLocation(location.id)}
            >
              <Text style={styles.optionEmoji}>{location.emoji}</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{location.title}</Text>
                <Text style={styles.optionDescription}>
                  {location.description}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="CONTINUE"
          onPress={handleContinue}
          disabled={!selectedLocation}
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