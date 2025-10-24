import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CheckSquare, Square } from 'lucide-react-native';
import { Button, Card, ProgressBar } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Injury {
  id: string;
  label: string;
}

const INJURIES: Injury[] = [
  { id: 'none', label: 'None' },
  { id: 'lower_back', label: 'Lower back' },
  { id: 'knee', label: 'Knee problems' },
  { id: 'shoulder', label: 'Shoulder pain' },
  { id: 'diabetes', label: 'Diabetes' },
];

export default function InjuriesScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    if (id === 'none') {
      setSelected(selected.includes('none') ? [] : ['none']);
    } else {
      const filtered = selected.filter((s) => s !== 'none');
      if (selected.includes(id)) {
        setSelected(filtered.filter((s) => s !== id));
      } else {
        setSelected([...filtered, id]);
      }
    }
  };

  const handleContinue = () => {
    router.push('/client/onboarding/diet' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressBar current={8} total={10} />

      <View style={styles.content}>
        <Text style={styles.emoji}>⚕️</Text>
        <Text style={styles.title}>Any injuries or conditions?</Text>

        <View style={styles.optionsContainer}>
          {INJURIES.map((injury) => {
            const isSelected = selected.includes(injury.id);
            return (
              <Card
                key={injury.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => handleToggle(injury.id)}
              >
                {isSelected ? (
                  <CheckSquare size={24} color={colors.accent.primary} />
                ) : (
                  <Square size={24} color={colors.text.secondary} />
                )}
                <Text style={styles.optionText}>{injury.label}</Text>
              </Card>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="CONTINUE" onPress={handleContinue} />
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
  optionText: {
    flex: 1,
    fontSize: typography.size.body,
    color: colors.text.primary,
  },
  footer: {
    paddingTop: spacing.lg,
  },
});