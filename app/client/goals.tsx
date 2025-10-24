import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Target, Trophy, TrendingUp, Calendar, Plus, X, Check } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/contexts/ToastContext';
import performHaptic from '@/utils/haptics';
import { Button, SkeletonLoader, EmptyState, ProgressBar } from '@/components';
import COLORS from '@/constants/colors';
import SPACING from '@/constants/spacing';
import TYPOGRAPHY from '@/constants/typography';

type GoalType = 'weight' | 'measurement' | 'performance' | 'habit';

interface CreateGoalForm {
  type: GoalType;
  title: string;
  description: string;
  targetValue: string;
  currentValue: string;
  unit: string;
  deadline: string;
  measurementType?: string;
}

export default function GoalsScreen() {
  const { showToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<GoalType>('weight');
  const [formData, setFormData] = useState<CreateGoalForm>({
    type: 'weight',
    title: '',
    description: '',
    targetValue: '',
    currentValue: '',
    unit: 'kg',
    deadline: '',
  });

  const { data: goalsData, isLoading } = trpc.goals.list.useQuery({
    clientId: 'client-1',
    status: 'active',
  });

  const utils = trpc.useUtils();

  const createGoalMutation = trpc.goals.create.useMutation({
    onSuccess: (data) => {
      performHaptic('success');
      showToast({ message: data.message || 'Goal created!', type: 'success' });
      utils.goals.list.invalidate();
      setShowCreateModal(false);
      resetForm();
    },
    onError: () => {
      performHaptic('error');
      showToast({ message: 'Failed to create goal', type: 'error' });
    },
  });

  const updateGoalMutation = trpc.goals.update.useMutation({
    onSuccess: (data) => {
      performHaptic('success');
      showToast({ message: data.message || 'Goal updated!', type: 'success' });
      utils.goals.list.invalidate();
    },
    onError: () => {
      performHaptic('error');
      showToast({ message: 'Failed to update goal', type: 'error' });
    },
  });

  const completeGoalMutation = trpc.goals.complete.useMutation({
    onSuccess: (data) => {
      performHaptic('success');
      showToast({ message: data.message || 'Goal achieved! 🎉', type: 'success' });
      utils.goals.list.invalidate();
    },
    onError: () => {
      performHaptic('error');
      showToast({ message: 'Failed to complete goal', type: 'error' });
    },
  });

  const resetForm = () => {
    setFormData({
      type: 'weight',
      title: '',
      description: '',
      targetValue: '',
      currentValue: '',
      unit: 'kg',
      deadline: '',
    });
    setSelectedType('weight');
  };

  const handleCreate = () => {
    if (!formData.title || !formData.targetValue || !formData.currentValue) {
      showToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    createGoalMutation.mutate({
      clientId: 'client-1',
      type: selectedType,
      title: formData.title,
      description: formData.description,
      targetValue: parseFloat(formData.targetValue),
      currentValue: parseFloat(formData.currentValue),
      unit: formData.unit,
      deadline: formData.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      measurementType: formData.measurementType,
    });
  };

  const handleQuickUpdate = (goalId: string, newValue: number) => {
    performHaptic('light');
    updateGoalMutation.mutate({
      id: goalId,
      currentValue: newValue,
    });
  };

  const handleMarkComplete = (goalId: string, value: number) => {
    performHaptic('light');
    completeGoalMutation.mutate({
      id: goalId,
      completedValue: value,
    });
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return TrendingUp;
      case 'measurement':
        return Target;
      case 'performance':
        return Trophy;
      case 'habit':
        return Calendar;
      default:
        return Target;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weight':
        return COLORS.accent.secondary;
      case 'measurement':
        return COLORS.accent.tertiary;
      case 'performance':
        return COLORS.accent.primary;
      case 'habit':
        return '#FF6B9D';
      default:
        return COLORS.accent.primary;
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Text style={styles.title}>My Goals</Text>
        </View>
        <ScrollView>
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const goals = goalsData?.goals || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Goals</Text>
        <TouchableOpacity
          onPress={() => {
            performHaptic('light');
            setShowCreateModal(true);
          }}
          style={styles.addButton}
        >
          <Plus size={24} color={COLORS.accent.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No Goals Yet"
              message="Set goals to track your progress and stay motivated"
              actionLabel="Create Goal"
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            goals.map((goal: any) => {
              const Icon = getGoalIcon(goal.type);
              const typeColor = getTypeColor(goal.type);
              const daysLeft = getDaysRemaining(goal.deadline);

              return (
                <TouchableOpacity
                  key={goal.id}
                  style={styles.goalCard}
                  onPress={() => performHaptic('light')}
                  activeOpacity={0.7}
                >
                  <View style={styles.goalHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
                      <Icon size={24} color={typeColor} />
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      {goal.description && (
                        <Text style={styles.goalDescription}>{goal.description}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.valuesRow}>
                      <View>
                        <Text style={styles.valueLabel}>Current</Text>
                        <Text style={styles.valueText}>
                          {goal.currentValue} {goal.unit}
                        </Text>
                      </View>
                      <View style={styles.arrow}>
                        <Text style={styles.arrowText}>→</Text>
                      </View>
                      <View>
                        <Text style={styles.valueLabel}>Target</Text>
                        <Text style={[styles.valueText, { color: typeColor }]}>
                          {goal.targetValue} {goal.unit}
                        </Text>
                      </View>
                    </View>

                    <View>
                      <ProgressBar
                        current={goal.progress || 0}
                        total={100}
                        animated
                      />
                      <Text style={styles.progressText}>{goal.progress || 0}%</Text>
                    </View>

                    <View style={styles.footerRow}>
                      <Text style={styles.deadline}>
                        <Calendar size={14} color={COLORS.textSecondary} /> {daysLeft} days left
                      </Text>
                      {goal.progress >= 100 ? (
                        <TouchableOpacity
                          onPress={() => handleMarkComplete(goal.id, goal.targetValue)}
                          style={[styles.completeButton, { backgroundColor: typeColor }]}
                        >
                          <Check size={16} color="#FFFFFF" />
                          <Text style={styles.completeButtonText}>Complete</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() =>
                            handleQuickUpdate(
                              goal.id,
                              goal.currentValue + (goal.targetValue > goal.currentValue ? 1 : -1)
                            )
                          }
                          style={styles.updateButton}
                        >
                          <Text style={styles.updateButtonText}>Update</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Goal</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                <X size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>Goal Type</Text>
              <View style={styles.typeRow}>
                {(['weight', 'measurement', 'performance', 'habit'] as GoalType[]).map((type) => {
                  const Icon = getGoalIcon(type);
                  const isSelected = selectedType === type;
                  const typeColor = getTypeColor(type);

                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        isSelected && { backgroundColor: typeColor + '20', borderColor: typeColor },
                      ]}
                      onPress={() => {
                        performHaptic('light');
                        setSelectedType(type);
                        setFormData({ ...formData, type });
                      }}
                    >
                      <Icon size={20} color={isSelected ? typeColor : COLORS.textSecondary} />
                      <Text
                        style={[
                          styles.typeText,
                          isSelected && { color: typeColor, fontWeight: '600' },
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="e.g., Reach 70kg"
                placeholderTextColor={COLORS.text.disabled}
              />

              <Text style={styles.sectionLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Optional details..."
                placeholderTextColor={COLORS.text.disabled}
                multiline
                numberOfLines={3}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.sectionLabel}>Current Value *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.currentValue}
                    onChangeText={(text) => setFormData({ ...formData, currentValue: text })}
                    placeholder="0"
                    placeholderTextColor={COLORS.text.disabled}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.halfInput}>
                  <Text style={styles.sectionLabel}>Target Value *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.targetValue}
                    onChangeText={(text) => setFormData({ ...formData, targetValue: text })}
                    placeholder="0"
                    placeholderTextColor={COLORS.text.disabled}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <Text style={styles.sectionLabel}>Unit</Text>
              <TextInput
                style={styles.input}
                value={formData.unit}
                onChangeText={(text) => setFormData({ ...formData, unit: text })}
                placeholder="kg, cm, reps, etc."
                placeholderTextColor={COLORS.text.disabled}
              />

              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Create Goal"
                  onPress={handleCreate}
                  loading={createGoalMutation.isPending}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.h1,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  goalCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: '600' as const,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  progressSection: {
    gap: SPACING.sm,
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueLabel: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
  },
  arrow: {
    marginHorizontal: SPACING.sm,
  },
  arrowText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  deadline: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  updateButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.bgDark,
    borderRadius: 8,
  },
  updateButtonText: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: '600' as const,
    color: COLORS.primary,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    gap: 4,
  },
  completeButtonText: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bgDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: '700' as const,
    color: COLORS.textPrimary,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: SPACING.xs,
  },
  typeText: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 12,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.body,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    marginBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
  },
});
