import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CheckSquare, Square } from 'lucide-react-native';
import { Button, Card, ProgressBar } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Diet {
  id: string;
  label: string;
}

const DIETS: Diet[] = [
  { id: 'none', label: 'No restrictions' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
];

export default function DietScreen() {
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
    router.push('/client/onboarding/complete' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ProgressBar current={9} total={10} />

      <View style={styles.content}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={styles.title}>Dietary preferences?</Text>

        <View style={styles.optionsContainer}>
          {DIETS.map((diet) => {
            const isSelected = selected.includes(diet.id);
            return (
              <Card
                key={diet.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => handleToggle(diet.id)}
              >
                {isSelected ? (
                  <CheckSquare size={24} color={colors.accent.primary} />
                ) : (
                  <Square size={24} color={colors.text.secondary} />
                )}
                <Text style={styles.optionText}>{diet.label}</Text>
              </Card>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="FINISH" onPress={handleContinue} />
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