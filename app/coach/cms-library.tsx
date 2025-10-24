import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  Dumbbell,
  Utensils,
  Edit2,
  Trash2,
  Flame,
  Activity,
  Wind,
  Heart,
  Apple,
  ChefHat,
  Pill,
  Droplet
} from 'lucide-react-native';
import { Card, Button, Input, showToast, SkeletonList, EmptyState } from '@/components';
import { trpc } from '@/lib/trpc';
import { hapticFeedback } from '@/utils/haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

type LibraryTab =
  | 'warmup'
  | 'workout'
  | 'stretching'
  | 'cardio'
  | 'nutrition'
  | 'recipes'
  | 'supplements'
  | 'hydration';

const TAB_CONFIG = [
  { key: 'warmup' as LibraryTab, label: 'Warmup', icon: Flame, color: colors.semantic.warning },
  { key: 'workout' as LibraryTab, label: 'Workout', icon: Dumbbell, color: colors.accent.primary },
  { key: 'stretching' as LibraryTab, label: 'Stretching', icon: Wind, color: colors.accent.tertiary },
  { key: 'cardio' as LibraryTab, label: 'Cardio', icon: Heart, color: colors.semantic.error },
  { key: 'nutrition' as LibraryTab, label: 'Nutrition', icon: Apple, color: colors.semantic.success },
  { key: 'recipes' as LibraryTab, label: 'Recipes', icon: ChefHat, color: colors.accent.secondary },
  { key: 'supplements' as LibraryTab, label: 'Supplements', icon: Pill, color: colors.accent.tertiary },
  { key: 'hydration' as LibraryTab, label: 'Hydration', icon: Droplet, color: colors.accent.primary },
];

interface Exercise {
  id: number;
  name: string;
  category: string;
  muscleGroup: string;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
  videoUrl?: string;
  contraindicatedConditions?: string[];
}

interface Food {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
  dietaryTags?: string[];
}

function ExerciseCard({ 
  exercise, 
  onEdit, 
  onDelete 
}: { 
  exercise: Exercise;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemIcon}>
          <Dumbbell size={20} color={colors.accent.primary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{exercise.name}</Text>
          <Text style={styles.itemMeta}>
            {exercise.muscleGroup} • {exercise.equipment}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <Pressable onPress={onEdit} style={styles.actionButton}>
            <Edit2 size={18} color={colors.accent.tertiary} />
          </Pressable>
          <Pressable onPress={onDelete} style={styles.actionButton}>
            <Trash2 size={18} color={colors.semantic.error} />
          </Pressable>
        </View>
      </View>
      <View style={styles.tags}>
        <View style={[styles.tag, styles.tagCategory]}>
          <Text style={styles.tagText}>{exercise.category}</Text>
        </View>
        <View style={[styles.tag, styles.tagDifficulty]}>
          <Text style={styles.tagText}>{exercise.difficulty}</Text>
        </View>
      </View>
    </Card>
  );
}

function FoodCard({ 
  food, 
  onEdit, 
  onDelete 
}: { 
  food: Food;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemIcon}>
          <Utensils size={20} color={colors.accent.secondary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{food.name}</Text>
          <Text style={styles.itemMeta}>
            {food.calories} cal • {food.servingSize}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <Pressable onPress={onEdit} style={styles.actionButton}>
            <Edit2 size={18} color={colors.accent.tertiary} />
          </Pressable>
          <Pressable onPress={onDelete} style={styles.actionButton}>
            <Trash2 size={18} color={colors.semantic.error} />
          </Pressable>
        </View>
      </View>
      <View style={styles.macrosRow}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>P</Text>
          <Text style={styles.macroValue}>{food.protein}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>C</Text>
          <Text style={styles.macroValue}>{food.carbs}g</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>F</Text>
          <Text style={styles.macroValue}>{food.fats}g</Text>
        </View>
      </View>
      <View style={styles.tags}>
        <View style={[styles.tag, styles.tagCategory]}>
          <Text style={styles.tagText}>{food.category}</Text>
        </View>
      </View>
    </Card>
  );
}

function ExerciseModal({
  visible,
  onClose,
  onSave,
  initialData,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (exercise: Omit<Exercise, 'id'> & { id?: number }) => void;
  initialData?: Exercise;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [muscleGroup, setMuscleGroup] = useState(initialData?.muscleGroup || '');
  const [equipment, setEquipment] = useState(initialData?.equipment || '');
  const [difficulty, setDifficulty] = useState<Exercise['difficulty']>(
    initialData?.difficulty || 'Beginner'
  );

  const handleSave = () => {
    if (!name || !category || !muscleGroup || !equipment) {
      showToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    onSave({
      id: initialData?.id,
      name,
      category,
      muscleGroup,
      equipment,
      difficulty,
    });

    setName('');
    setCategory('');
    setMuscleGroup('');
    setEquipment('');
    setDifficulty('Beginner');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialData ? 'Edit Exercise' : 'Add Exercise'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <Input
              label="Exercise Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Barbell Bench Press"
            />
            <Input
              label="Category"
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Compound, Isolation"
            />
            <Input
              label="Muscle Group"
              value={muscleGroup}
              onChangeText={setMuscleGroup}
              placeholder="e.g., Chest, Back, Legs"
            />
            <Input
              label="Equipment"
              value={equipment}
              onChangeText={setEquipment}
              placeholder="e.g., Barbell, Dumbbells"
            />

            <Text style={styles.inputLabel}>Difficulty</Text>
            <View style={styles.difficultyButtons}>
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.difficultyButton,
                    difficulty === level && styles.difficultyButtonActive,
                  ]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text
                    style={[
                      styles.difficultyButtonText,
                      difficulty === level && styles.difficultyButtonTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button title="Cancel" variant="outline" onPress={onClose} />
            <Button title={initialData ? 'Update' : 'Save'} onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FoodModal({
  visible,
  onClose,
  onSave,
  initialData,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (food: Omit<Food, 'id'> & { id?: number }) => void;
  initialData?: Food;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [calories, setCalories] = useState(initialData?.calories.toString() || '');
  const [protein, setProtein] = useState(initialData?.protein.toString() || '');
  const [carbs, setCarbs] = useState(initialData?.carbs.toString() || '');
  const [fats, setFats] = useState(initialData?.fats.toString() || '');
  const [servingSize, setServingSize] = useState(initialData?.servingSize || '');

  const handleSave = () => {
    if (!name || !category || !calories || !protein || !carbs || !fats || !servingSize) {
      showToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    onSave({
      id: initialData?.id,
      name,
      category,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
      servingSize,
    });

    setName('');
    setCategory('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setServingSize('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialData ? 'Edit Food' : 'Add Food'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <Input
              label="Food Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Chicken Breast"
            />
            <Input
              label="Category"
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Protein, Carbs, Fats"
            />
            <Input
              label="Serving Size"
              value={servingSize}
              onChangeText={setServingSize}
              placeholder="e.g., 100g, 1 cup"
            />
            <Input
              label="Calories (per serving)"
              value={calories}
              onChangeText={setCalories}
              placeholder="e.g., 165"
              keyboardType="numeric"
            />
            <Input
              label="Protein (g)"
              value={protein}
              onChangeText={setProtein}
              placeholder="e.g., 31"
              keyboardType="numeric"
            />
            <Input
              label="Carbs (g)"
              value={carbs}
              onChangeText={setCarbs}
              placeholder="e.g., 0"
              keyboardType="numeric"
            />
            <Input
              label="Fats (g)"
              value={fats}
              onChangeText={setFats}
              placeholder="e.g., 3.6"
              keyboardType="numeric"
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button title="Cancel" variant="outline" onPress={onClose} />
            <Button title={initialData ? 'Update' : 'Save'} onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function CMSLibraryScreen() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('warmup');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
  const [editingFood, setEditingFood] = useState<Food | undefined>();

  const utils = trpc.useUtils();
  
  const { data: exercisesData, isLoading: exercisesLoading } = trpc.cms.listExercises.useQuery();
  const { data: foodsData, isLoading: foodsLoading } = trpc.cms.listFoods.useQuery();

  const createExercise = trpc.cms.createExercise.useMutation({
    onSuccess: () => {
      utils.cms.listExercises.invalidate();
      hapticFeedback.success();
      showToast({ message: 'Exercise added! 💪', type: 'success' });
    },
    onError: () => {
      hapticFeedback.error();
      showToast({ message: 'Failed to add exercise', type: 'error' });
    },
  });

  const updateExercise = trpc.cms.updateExercise.useMutation({
    onSuccess: () => {
      utils.cms.listExercises.invalidate();
      hapticFeedback.success();
      showToast({ message: 'Exercise updated! ✓', type: 'success' });
    },
    onError: () => {
      hapticFeedback.error();
      showToast({ message: 'Failed to update exercise', type: 'error' });
    },
  });

  const deleteExercise = trpc.cms.deleteExercise.useMutation({
    onSuccess: () => {
      utils.cms.listExercises.invalidate();
      hapticFeedback.success();
      showToast({ message: 'Exercise deleted', type: 'info' });
    },
    onError: () => {
      hapticFeedback.error();
      showToast({ message: 'Failed to delete exercise', type: 'error' });
    },
  });

  const createFood = trpc.cms.createFood.useMutation({
    onSuccess: () => {
      utils.cms.listFoods.invalidate();
      hapticFeedback.success();
      showToast({ message: 'Food added! 🍽️', type: 'success' });
    },
    onError: () => {
      hapticFeedback.error();
      showToast({ message: 'Failed to add food', type: 'error' });
    },
  });

  const updateFood = trpc.cms.updateFood.useMutation({
    onSuccess: () => {
      utils.cms.listFoods.invalidate();
      hapticFeedback.success();
      showToast({ message: 'Food updated! ✓', type: 'success' });
    },
    onError: () => {
      hapticFeedback.error();
      showToast({ message: 'Failed to update food', type: 'error' });
    },
  });

  const deleteFood = trpc.cms.deleteFood.useMutation({
    onSuccess: () => {
      utils.cms.listFoods.invalidate();
      hapticFeedback.success();
      showToast({ message: 'Food deleted', type: 'info' });
    },
    onError: () => {
      hapticFeedback.error();
      showToast({ message: 'Failed to delete food', type: 'error' });
    },
  });

  const exercises = exercisesData?.exercises || [];
  const foods = foodsData?.foods || [];

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveExercise = (exercise: Omit<Exercise, 'id'> & { id?: number }) => {
    if (exercise.id) {
      updateExercise.mutate(exercise as Exercise);
    } else {
      createExercise.mutate(exercise);
    }
    setEditingExercise(undefined);
  };

  const handleSaveFood = (food: Omit<Food, 'id'> & { id?: number }) => {
    if (food.id) {
      updateFood.mutate(food as Food);
    } else {
      createFood.mutate(food);
    }
    setEditingFood(undefined);
  };

  const handleDeleteExercise = (id: number) => {
    hapticFeedback.warning();
    deleteExercise.mutate({ id });
  };

  const handleDeleteFood = (id: number) => {
    hapticFeedback.warning();
    deleteFood.mutate({ id });
  };

  const isLoading = activeTab === 'exercises' ? exercisesLoading : foodsLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>CMS Library</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContainer}
      >
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => {
                setActiveTab(tab.key);
                hapticFeedback.light();
              }}
            >
              <Icon
                size={20}
                color={isActive ? colors.text.primary : colors.text.secondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${TAB_CONFIG.find(t => t.key === activeTab)?.label?.toLowerCase()}...`}
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            hapticFeedback.medium();
            if (activeTab === 'exercises') {
              setEditingExercise(undefined);
              setShowExerciseModal(true);
            } else {
              setEditingFood(undefined);
              setShowFoodModal(true);
            }
          }}
        >
          <Plus size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : (
        <ScrollView style={styles.content}>
          {activeTab === 'exercises' && (
            <>
              <Text style={styles.resultsCount}>
                {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''}
              </Text>
              {filteredExercises.length === 0 ? (
                <EmptyState
                  icon={Dumbbell}
                  title="No exercises found"
                  message="Add your first exercise to get started"
                  actionLabel="Add Exercise"
                  onAction={() => setShowExerciseModal(true)}
                />
              ) : (
                filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onEdit={() => {
                      hapticFeedback.light();
                      setEditingExercise(exercise);
                      setShowExerciseModal(true);
                    }}
                    onDelete={() => handleDeleteExercise(exercise.id)}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'foods' && (
            <>
              <Text style={styles.resultsCount}>
                {filteredFoods.length} food{filteredFoods.length !== 1 ? 's' : ''}
              </Text>
              {filteredFoods.length === 0 ? (
                <EmptyState
                  icon={Utensils}
                  title="No foods found"
                  message="Add your first food item to get started"
                  actionLabel="Add Food"
                  onAction={() => setShowFoodModal(true)}
                />
              ) : (
                filteredFoods.map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onEdit={() => {
                      hapticFeedback.light();
                      setEditingFood(food);
                      setShowFoodModal(true);
                    }}
                    onDelete={() => handleDeleteFood(food.id)}
                  />
                ))
              )}
            </>
          )}

          {(activeTab === 'warmup' || activeTab === 'workout' || activeTab === 'stretching' ||
            activeTab === 'cardio' || activeTab === 'nutrition' || activeTab === 'recipes' ||
            activeTab === 'supplements' || activeTab === 'hydration') && (
            <Card style={styles.comingSoonCard}>
              <Text style={styles.comingSoonTitle}>
                {TAB_CONFIG.find(t => t.key === activeTab)?.label} Section
              </Text>
              <Text style={styles.comingSoonText}>
                Full CRUD interface coming soon. Backend API is ready and functional.
              </Text>
              <Text style={styles.comingSoonHint}>
                Data is already seeded in the database and available via tRPC endpoints.
              </Text>
            </Card>
          )}
        </ScrollView>
      )}

      <ExerciseModal
        visible={showExerciseModal}
        onClose={() => {
          setShowExerciseModal(false);
          setEditingExercise(undefined);
        }}
        onSave={handleSaveExercise}
        initialData={editingExercise}
      />

      <FoodModal
        visible={showFoodModal}
        onClose={() => {
          setShowFoodModal(false);
          setEditingFood(undefined);
        }}
        onSave={handleSaveFood}
        initialData={editingFood}
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
  tabsScroll: {
    marginBottom: spacing.md,
  },
  tabsContainer: {
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    minWidth: 120,
  },
  tabActive: {
    backgroundColor: colors.accent.primary,
  },
  tabText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.accent.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screen,
  },
  resultsCount: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  tagCategory: {
    backgroundColor: colors.accent.primary,
  },
  tagDifficulty: {
    backgroundColor: colors.accent.tertiary,
  },
  tagText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  macroLabel: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: colors.text.secondary,
  },
  macroValue: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
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
  closeButton: {
    padding: spacing.sm,
  },
  modalBody: {
    padding: spacing.screen,
  },
  inputLabel: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg.dark,
    borderRadius: 12,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: colors.accent.primary,
  },
  difficultyButtonText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
  },
  difficultyButtonTextActive: {
    color: colors.text.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.screen,
    borderTopWidth: 1,
    borderTopColor: colors.progress.bg,
  },
  comingSoonCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
    marginTop: spacing.xl,
  },
  comingSoonTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  comingSoonText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  comingSoonHint: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
