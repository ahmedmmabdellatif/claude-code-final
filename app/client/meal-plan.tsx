import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Card } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Meal {
  id: number;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  foods: string[];
  completed: boolean;
}

const MOCK_MEALS: Meal[] = [
  {
    id: 1,
    name: 'Breakfast',
    time: '7:00 AM',
    calories: 520,
    protein: 35,
    carbs: 55,
    fats: 15,
    foods: ['4 Egg Whites + 1 Whole Egg', 'Oatmeal (60g)', 'Banana', 'Almond Butter (15g)'],
    completed: true,
  },
  {
    id: 2,
    name: 'Mid-Morning Snack',
    time: '10:30 AM',
    calories: 200,
    protein: 25,
    carbs: 15,
    fats: 5,
    foods: ['Greek Yogurt (200g)', 'Mixed Berries'],
    completed: true,
  },
  {
    id: 3,
    name: 'Lunch',
    time: '1:00 PM',
    calories: 650,
    protein: 50,
    carbs: 60,
    fats: 20,
    foods: ['Grilled Chicken (200g)', 'Brown Rice (80g)', 'Mixed Vegetables', 'Olive Oil (1 tbsp)'],
    completed: false,
  },
  {
    id: 4,
    name: 'Pre-Workout',
    time: '4:00 PM',
    calories: 250,
    protein: 20,
    carbs: 30,
    fats: 5,
    foods: ['Protein Shake', 'Rice Cakes (2)', 'Honey'],
    completed: false,
  },
  {
    id: 5,
    name: 'Post-Workout',
    time: '6:00 PM',
    calories: 350,
    protein: 40,
    carbs: 35,
    fats: 8,
    foods: ['Whey Protein (40g)', 'Sweet Potato (200g)', 'Spinach'],
    completed: false,
  },
  {
    id: 6,
    name: 'Dinner',
    time: '8:00 PM',
    calories: 580,
    protein: 45,
    carbs: 40,
    fats: 25,
    foods: ['Grilled Salmon (200g)', 'Quinoa (60g)', 'Broccoli', 'Avocado (1/2)'],
    completed: false,
  },
];

function MacroRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {value}
        <Text style={styles.macroUnit}>{unit}</Text>
      </Text>
    </View>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  return (
    <Card style={[styles.mealCard, meal.completed && styles.mealCardCompleted]}>
      <View style={styles.mealHeader}>
        <View>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealTime}>{meal.time}</Text>
        </View>
        {meal.completed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.macrosContainer}>
        <MacroRow label="Cal" value={meal.calories} unit=" kcal" />
        <MacroRow label="Protein" value={meal.protein} unit="g" />
        <MacroRow label="Carbs" value={meal.carbs} unit="g" />
        <MacroRow label="Fats" value={meal.fats} unit="g" />
      </View>

      <View style={styles.foodsList}>
        {meal.foods.map((food, index) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodBullet}>•</Text>
            <Text style={styles.foodText}>{food}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export default function MealPlanScreen() {
  const totalCalories = MOCK_MEALS.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = MOCK_MEALS.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = MOCK_MEALS.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = MOCK_MEALS.reduce((sum, meal) => sum + meal.fats, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Today&apos;s Meal Plan</Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Daily Targets</Text>
          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLargeValue}>{totalCalories}</Text>
              <Text style={styles.macroLargeLabel}>Calories</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLargeValue}>{totalProtein}g</Text>
              <Text style={styles.macroLargeLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLargeValue}>{totalCarbs}g</Text>
              <Text style={styles.macroLargeLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLargeValue}>{totalFats}g</Text>
              <Text style={styles.macroLargeLabel}>Fats</Text>
            </View>
          </View>
        </Card>

        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Meals</Text>
          {MOCK_MEALS.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.screen,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  macroItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.bg.dark,
    borderRadius: 12,
  },
  macroLargeValue: {
    fontSize: typography.size.stats,
    fontWeight: typography.weight.bold,
    color: colors.accent.primary,
    marginBottom: spacing.xs,
  },
  macroLargeLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  mealsSection: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  mealCard: {
    marginBottom: spacing.md,
  },
  mealCardCompleted: {
    opacity: 0.7,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  mealName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  mealTime: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 18,
    color: colors.text.primary,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.progress.bg,
  },
  macroRow: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  macroUnit: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.regular,
  },
  foodsList: {
    gap: spacing.xs,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  foodBullet: {
    fontSize: typography.size.body,
    color: colors.accent.primary,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  foodText: {
    flex: 1,
    fontSize: typography.size.small,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
