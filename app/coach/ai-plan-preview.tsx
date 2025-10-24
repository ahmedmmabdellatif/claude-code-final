import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Target,
  TrendingUp,
  Utensils,
  Dumbbell,
  ChevronDown,
  ChevronRight,
} from 'lucide-react-native';
import { Card, Button } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { trpc } from '@/lib/trpc';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  rest: number;
  notes: string;
}

interface WorkoutDay {
  day: string;
  name: string;
  exercises: Exercise[];
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  const getColor = () => {
    if (percentage >= 85) return colors.semantic.success;
    if (percentage >= 70) return colors.semantic.warning;
    return colors.semantic.error;
  };

  return (
    <View style={styles.confidenceContainer}>
      <View style={styles.confidenceHeader}>
        <Text style={styles.confidenceLabel}>AI Confidence Score</Text>
        <Text style={[styles.confidenceValue, { color: getColor() }]}>
          {percentage}%
        </Text>
      </View>
      <View style={styles.confidenceBar}>
        <View
          style={[
            styles.confidenceBarFill,
            { width: `${percentage}%`, backgroundColor: getColor() },
          ]}
        />
      </View>
    </View>
  );
}

function ReasoningCard({ reasoning }: { reasoning: string[] }) {
  return (
    <Card style={styles.reasoningCard}>
      <Text style={styles.cardTitle}>AI Reasoning</Text>
      {reasoning.map((reason, index) => (
        <View key={index} style={styles.reasonItem}>
          <CheckCircle2 size={16} color={colors.accent.primary} />
          <Text style={styles.reasonText}>{reason}</Text>
        </View>
      ))}
    </Card>
  );
}

function WorkoutDayCard({ day, expanded, onToggle }: {
  day: WorkoutDay;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card style={styles.dayCard}>
      <Pressable onPress={onToggle}>
        <View style={styles.dayHeader}>
          <View style={styles.dayInfo}>
            <Text style={styles.dayName}>{day.day}</Text>
            <Text style={styles.dayTitle}>{day.name}</Text>
          </View>
          <View style={styles.dayMeta}>
            {day.exercises.length > 0 && (
              <Text style={styles.exerciseCount}>
                {day.exercises.length} exercises
              </Text>
            )}
            {expanded ? (
              <ChevronDown size={20} color={colors.text.secondary} />
            ) : (
              <ChevronRight size={20} color={colors.text.secondary} />
            )}
          </View>
        </View>
      </Pressable>

      {expanded && day.exercises.length > 0 && (
        <View style={styles.dayContent}>
          {day.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseRow}>
              <Text style={styles.exerciseNumber}>{index + 1}</Text>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.muscleGroup} • {exercise.sets} sets × {exercise.reps} reps
                </Text>
                {exercise.notes && (
                  <View style={styles.exerciseNote}>
                    <AlertCircle size={14} color={colors.accent.tertiary} />
                    <Text style={styles.exerciseNoteText}>{exercise.notes}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function NutritionCard({ nutrition }: {
  nutrition: {
    targetMacros: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
    mealStructure: string;
    proteinSources: string[];
    notes: string;
  };
}) {
  return (
    <Card style={styles.nutritionCard}>
      <View style={styles.nutritionHeader}>
        <Utensils size={24} color={colors.accent.secondary} />
        <Text style={styles.cardTitle}>Nutrition Guidelines</Text>
      </View>

      <View style={styles.macrosGrid}>
        <View style={styles.macroBox}>
          <Text style={styles.macroValue}>{nutrition.targetMacros.calories}</Text>
          <Text style={styles.macroLabel}>Calories</Text>
        </View>
        <View style={styles.macroBox}>
          <Text style={styles.macroValue}>{nutrition.targetMacros.protein}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroBox}>
          <Text style={styles.macroValue}>{nutrition.targetMacros.carbs}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroBox}>
          <Text style={styles.macroValue}>{nutrition.targetMacros.fats}g</Text>
          <Text style={styles.macroLabel}>Fats</Text>
        </View>
      </View>

      <View style={styles.nutritionDetail}>
        <Text style={styles.nutritionDetailLabel}>Meal Structure:</Text>
        <Text style={styles.nutritionDetailValue}>{nutrition.mealStructure}</Text>
      </View>

      <View style={styles.nutritionDetail}>
        <Text style={styles.nutritionDetailLabel}>Protein Sources:</Text>
        {nutrition.proteinSources.map((source, index) => (
          <Text key={index} style={styles.nutritionDetailValue}>
            • {source}
          </Text>
        ))}
      </View>

      {nutrition.notes && (
        <View style={styles.nutritionNotes}>
          <AlertCircle size={16} color={colors.accent.primary} />
          <Text style={styles.nutritionNotesText}>{nutrition.notes}</Text>
        </View>
      )}
    </Card>
  );
}

function ModificationsCard({ modifications }: {
  modifications: {
    category: string;
    items: string[];
  }[];
}) {
  return (
    <Card style={styles.modificationsCard}>
      <Text style={styles.cardTitle}>Plan Modifications</Text>
      {modifications.map((mod, index) => (
        <View key={index} style={styles.modificationSection}>
          <Text style={styles.modificationCategory}>{mod.category}</Text>
          {mod.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.modificationItem}>
              <CheckCircle2 size={14} color={colors.accent.primary} />
              <Text style={styles.modificationText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </Card>
  );
}

export default function AIPlanPreviewScreen() {
  const params = useLocalSearchParams();
  const clientId = Number(params.clientId);

  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const { data, isLoading, error } = trpc.coach.aiSuggestions.useQuery({
    clientId,
  });

  const assignPlanMutation = trpc.coach.assignPlan.useMutation({
    onSuccess: () => {
      Alert.alert(
        'Plan Assigned',
        'The AI-suggested plan has been assigned to the client.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleAssignPlan = () => {
    if (!data?.suggestedPlan) return;

    Alert.alert(
      'Assign Plan',
      'Are you sure you want to assign this AI-generated plan to the client?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: () => {
            assignPlanMutation.mutate({
              clientId,
              planId: data.suggestedPlan.id,
              startDate: new Date().toISOString(),
            });
          },
        },
      ]
    );
  };

  const handleEditPlan = () => {
    router.push({
      pathname: '/coach/create-plan',
      params: { 
        clientId,
        templateId: data?.suggestedPlan.id,
      },
    } as never);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>Generating AI Plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.semantic.error} />
          <Text style={styles.errorText}>Failed to generate plan</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const { clientProfile, suggestedPlan } = data;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>AI Plan Suggestion</Text>
          <Text style={styles.headerSubtitle}>{clientProfile.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.planOverviewCard}>
          <View style={styles.planHeader}>
            <Dumbbell size={28} color={colors.accent.primary} />
            <View style={styles.planHeaderText}>
              <Text style={styles.planName}>{suggestedPlan.name}</Text>
              <Text style={styles.planMeta}>
                {suggestedPlan.durationWeeks} weeks • {suggestedPlan.trainingDays} days/week
              </Text>
            </View>
          </View>
          <ConfidenceBar confidence={suggestedPlan.confidence} />
        </Card>

        <View style={styles.clientInfoCard}>
          <Text style={styles.sectionTitle}>Client Profile</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Target size={16} color={colors.accent.primary} />
              <Text style={styles.infoLabel}>Goal:</Text>
              <Text style={styles.infoValue}>{clientProfile.goal}</Text>
            </View>
            <View style={styles.infoItem}>
              <TrendingUp size={16} color={colors.accent.primary} />
              <Text style={styles.infoLabel}>Experience:</Text>
              <Text style={styles.infoValue}>{clientProfile.experience}</Text>
            </View>
            <View style={styles.infoItem}>
              <Calendar size={16} color={colors.accent.primary} />
              <Text style={styles.infoLabel}>Frequency:</Text>
              <Text style={styles.infoValue}>{clientProfile.trainingDays} days/week</Text>
            </View>
          </View>
        </View>

        <ReasoningCard reasoning={suggestedPlan.reasoning} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Schedule</Text>
          {suggestedPlan.workoutSchedule.map((day) => (
            <WorkoutDayCard
              key={day.day}
              day={day}
              expanded={expandedDay === day.day}
              onToggle={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
            />
          ))}
        </View>

        <NutritionCard nutrition={suggestedPlan.nutritionGuidelines} />

        <ModificationsCard modifications={suggestedPlan.modifications} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Edit Plan"
          variant="outline"
          onPress={handleEditPlan}
        />
        <Button
          title="Assign to Client"
          onPress={handleAssignPlan}
          loading={assignPlanMutation.isPending}
        />
      </View>
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
  headerTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.screen,
  },
  errorText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  planOverviewCard: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  planHeaderText: {
    flex: 1,
  },
  planName: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  planMeta: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  confidenceContainer: {
    gap: spacing.sm,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  confidenceValue: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.progress.bg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  clientInfoCard: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  reasoningCard: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  reasonText: {
    flex: 1,
    fontSize: typography.size.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  dayCard: {
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  dayTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  dayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseCount: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  dayContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.progress.bg,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent.primary,
    color: colors.text.primary,
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  exerciseMeta: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  exerciseNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.bg.dark,
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.xs,
  },
  exerciseNoteText: {
    flex: 1,
    fontSize: typography.size.small,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  nutritionCard: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  macroBox: {
    flex: 1,
    backgroundColor: colors.bg.dark,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  macroLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  nutritionDetail: {
    marginBottom: spacing.md,
  },
  nutritionDetailLabel: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  nutritionDetailValue: {
    fontSize: typography.size.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  nutritionNotes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.bg.dark,
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
  },
  nutritionNotesText: {
    flex: 1,
    fontSize: typography.size.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  modificationsCard: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  modificationSection: {
    marginBottom: spacing.lg,
  },
  modificationCategory: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.accent.secondary,
    marginBottom: spacing.sm,
  },
  modificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modificationText: {
    flex: 1,
    fontSize: typography.size.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.screen,
    borderTopWidth: 1,
    borderTopColor: colors.progress.bg,
    backgroundColor: colors.bg.dark,
  },
});
