import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  X,
  Calendar,
  Target,
  Clock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react-native';
import { Card, Button, Input } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  notes: string;
}

interface WorkoutDay {
  id: string;
  day: string;
  name: string;
  exercises: Exercise[];
  type: 'workout' | 'rest' | 'cardio';
  cardioType?: string;
  cardioDuration?: number;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SAMPLE_EXERCISES = [
  'Barbell Bench Press',
  'Incline Dumbbell Press',
  'Cable Flyes',
  'Barbell Squats',
  'Romanian Deadlifts',
  'Leg Press',
  'Pull-ups',
  'Barbell Rows',
  'Lat Pulldowns',
];

function DayCard({
  day,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  day: WorkoutDay;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card style={styles.dayCard}>
      <Pressable onPress={onToggle}>
        <View style={styles.dayHeader}>
          <View style={styles.dayHeaderLeft}>
            <Text style={styles.dayName}>{day.day}</Text>
            <Text style={styles.dayTitle}>{day.name}</Text>
          </View>
          <View style={styles.dayHeaderRight}>
            {day.type === 'workout' && (
              <Text style={styles.exerciseCount}>{day.exercises.length} exercises</Text>
            )}
            {day.type === 'rest' && (
              <View style={styles.restBadge}>
                <Text style={styles.restBadgeText}>Rest Day</Text>
              </View>
            )}
            {day.type === 'cardio' && (
              <View style={styles.cardioBadge}>
                <Text style={styles.cardioBadgeText}>Cardio</Text>
              </View>
            )}
            {expanded ? (
              <ChevronDown size={20} color={colors.text.secondary} />
            ) : (
              <ChevronRight size={20} color={colors.text.secondary} />
            )}
          </View>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.dayContent}>
          {day.type === 'workout' &&
            day.exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseRow}>
                <Text style={styles.exerciseNumber}>{index + 1}</Text>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exercise.sets} sets × {exercise.reps} reps • {exercise.rest}s rest
                  </Text>
                </View>
              </View>
            ))}

          {day.type === 'cardio' && (
            <View style={styles.cardioInfo}>
              <Text style={styles.cardioDetail}>
                {day.cardioType} • {day.cardioDuration} minutes
              </Text>
            </View>
          )}

          <View style={styles.dayActions}>
            <Button title="Edit Day" variant="outline" size="small" onPress={onEdit} />
            <Button title="Delete" variant="outline" size="small" onPress={onDelete} />
          </View>
        </View>
      )}
    </Card>
  );
}

function AddExerciseModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (exercise: Omit<Exercise, 'id'>) => void;
}) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10-12');
  const [rest, setRest] = useState('60');
  const [notes, setNotes] = useState('');
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const handleAdd = () => {
    if (!name || !sets || !reps || !rest) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    onAdd({
      name,
      sets: Number(sets),
      reps,
      rest: Number(rest),
      notes,
    });

    setName('');
    setSets('3');
    setReps('10-12');
    setRest('60');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <Pressable onPress={onClose}>
              <X size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>Exercise Name</Text>
            <Pressable
              style={styles.exercisePicker}
              onPress={() => setShowExercisePicker(!showExercisePicker)}
            >
              <Text style={name ? styles.exercisePickerText : styles.exercisePickerPlaceholder}>
                {name || 'Select or type exercise'}
              </Text>
              <ChevronDown size={20} color={colors.text.secondary} />
            </Pressable>

            {showExercisePicker && (
              <View style={styles.exerciseList}>
                {SAMPLE_EXERCISES.map((ex) => (
                  <Pressable
                    key={ex}
                    style={styles.exerciseListItem}
                    onPress={() => {
                      setName(ex);
                      setShowExercisePicker(false);
                    }}
                  >
                    <Text style={styles.exerciseListItemText}>{ex}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Input
              label="Sets"
              value={sets}
              onChangeText={setSets}
              placeholder="3"
              keyboardType="numeric"
            />
            <Input
              label="Reps"
              value={reps}
              onChangeText={setReps}
              placeholder="10-12"
            />
            <Input
              label="Rest (seconds)"
              value={rest}
              onChangeText={setRest}
              placeholder="60"
              keyboardType="numeric"
            />
            <Input
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Form tips or modifications"
              multiline
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button title="Cancel" variant="outline" onPress={onClose} />
            <Button title="Add Exercise" onPress={handleAdd} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CreatePlanScreen() {
  const params = useLocalSearchParams();
  const clientId = params.clientId;

  const [planName, setPlanName] = useState('');
  const [planGoal, setPlanGoal] = useState('');
  const [planDuration, setPlanDuration] = useState('');
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);

  const handleAddWorkoutDay = (day: string) => {
    const newDay: WorkoutDay = {
      id: Date.now().toString(),
      day,
      name: `${day} Workout`,
      exercises: [],
      type: 'workout',
    };
    setWorkoutDays([...workoutDays, newDay]);
    setExpandedDay(newDay.id);
  };

  const handleAddRestDay = (day: string) => {
    const newDay: WorkoutDay = {
      id: Date.now().toString(),
      day,
      name: 'Rest & Recovery',
      exercises: [],
      type: 'rest',
    };
    setWorkoutDays([...workoutDays, newDay]);
  };

  const handleAddExercise = (exercise: Omit<Exercise, 'id'>) => {
    if (!editingDayId) return;

    const newExercise: Exercise = {
      ...exercise,
      id: Date.now().toString(),
    };

    setWorkoutDays(
      workoutDays.map((day) =>
        day.id === editingDayId
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      )
    );
  };

  const handleDeleteDay = (dayId: string) => {
    Alert.alert('Delete Day', 'Are you sure you want to delete this day?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setWorkoutDays(workoutDays.filter((day) => day.id !== dayId));
        },
      },
    ]);
  };

  const handleSavePlan = () => {
    if (!planName || !planGoal || !planDuration || workoutDays.length === 0) {
      Alert.alert('Error', 'Please fill in all plan details and add at least one workout day');
      return;
    }

    Alert.alert(
      'Plan Created',
      `Successfully created plan "${planName}" with ${workoutDays.length} days`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const usedDays = new Set(workoutDays.map((d) => d.day));
  const availableDays = DAYS.filter((day) => !usedDays.has(day));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Training Plan</Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.planDetailsCard}>
          <Text style={styles.sectionTitle}>Plan Details</Text>
          <Input
            label="Plan Name"
            value={planName}
            onChangeText={setPlanName}
            placeholder="e.g., Body Recomposition - Week 1"
          />
          <Input
            label="Goal"
            value={planGoal}
            onChangeText={setPlanGoal}
            placeholder="e.g., Build Muscle, Fat Loss"
          />
          <Input
            label="Duration (weeks)"
            value={planDuration}
            onChangeText={setPlanDuration}
            placeholder="4"
            keyboardType="numeric"
          />

          {clientId && (
            <View style={styles.assignedInfo}>
              <Text style={styles.assignedLabel}>Assigned to:</Text>
              <Text style={styles.assignedValue}>Client #{clientId}</Text>
            </View>
          )}
        </Card>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workout Schedule</Text>
            <Text style={styles.dayCount}>
              {workoutDays.length}/7 days
            </Text>
          </View>

          {workoutDays.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              expanded={expandedDay === day.id}
              onToggle={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
              onEdit={() => {
                setEditingDayId(day.id);
                setShowAddExerciseModal(true);
              }}
              onDelete={() => handleDeleteDay(day.id)}
            />
          ))}

          {availableDays.length > 0 && (
            <Card style={styles.addDayCard}>
              <Text style={styles.addDayTitle}>Add Day</Text>
              <View style={styles.dayButtonsGrid}>
                {availableDays.map((day) => (
                  <View key={day} style={styles.dayButtonContainer}>
                    <Pressable
                      style={styles.dayButton}
                      onPress={() => handleAddWorkoutDay(day)}
                    >
                      <Text style={styles.dayButtonText}>{day.slice(0, 3)}</Text>
                    </Pressable>
                    <Pressable
                      style={styles.restDayButton}
                      onPress={() => handleAddRestDay(day)}
                    >
                      <Text style={styles.restDayButtonText}>Rest</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Save as Template" variant="outline" onPress={() => {}} />
        <Button title="Create & Assign Plan" onPress={handleSavePlan} />
      </View>

      <AddExerciseModal
        visible={showAddExerciseModal}
        onClose={() => {
          setShowAddExerciseModal(false);
          setEditingDayId(null);
        }}
        onAdd={handleAddExercise}
      />
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
  planDetailsCard: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  dayCount: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.progress.bg,
  },
  assignedLabel: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  assignedValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.accent.primary,
  },
  dayCard: {
    marginBottom: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayHeaderLeft: {
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
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseCount: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  restBadge: {
    backgroundColor: colors.accent.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  restBadgeText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  cardioBadge: {
    backgroundColor: colors.accent.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  cardioBadgeText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
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
  },
  cardioInfo: {
    paddingVertical: spacing.sm,
  },
  cardioDetail: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  dayActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  addDayCard: {
    padding: spacing.lg,
  },
  addDayTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  dayButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  dayButtonContainer: {
    width: '30%',
    gap: spacing.xs,
  },
  dayButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  restDayButton: {
    backgroundColor: colors.bg.dark,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  restDayButtonText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.screen,
    borderTopWidth: 1,
    borderTopColor: colors.progress.bg,
    backgroundColor: colors.bg.dark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.screen,
    borderBottomWidth: 1,
    borderBottomColor: colors.progress.bg,
  },
  modalTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  modalBody: {
    padding: spacing.screen,
  },
  inputLabel: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  exercisePicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bg.dark,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  exercisePickerText: {
    fontSize: typography.size.body,
    color: colors.text.primary,
  },
  exercisePickerPlaceholder: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  exerciseList: {
    backgroundColor: colors.bg.dark,
    borderRadius: 12,
    marginBottom: spacing.md,
    maxHeight: 200,
  },
  exerciseListItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.progress.bg,
  },
  exerciseListItemText: {
    fontSize: typography.size.body,
    color: colors.text.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.screen,
    borderTopWidth: 1,
    borderTopColor: colors.progress.bg,
  },
});
