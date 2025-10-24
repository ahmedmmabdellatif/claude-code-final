import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, CheckCircle, Play, Pause, SkipForward, Camera, Video, X } from 'lucide-react-native';
import { Button, Input, Card, ProgressBar, showToast } from '@/components';
import { hapticFeedback } from '@/utils/haptics';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { showCelebration } from '@/utils/celebrations';

interface Set {
  number: number;
  weight: string;
  reps: string;
  completed: boolean;
}

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  formTip: string;
}

const MOCK_EXERCISES: Exercise[] = [
  {
    id: 1,
    name: 'Incline Chest Press',
    sets: 3,
    reps: '8-12',
    restTime: 60,
    formTip: 'Keep your core tight and elbows at 45° angle',
  },
  {
    id: 2,
    name: 'Flat Dumbbell Press',
    sets: 3,
    reps: '10-12',
    restTime: 60,
    formTip: 'Lower the weights slowly, full range of motion',
  },
  {
    id: 3,
    name: 'Cable Flyes',
    sets: 3,
    reps: '12-15',
    restTime: 45,
    formTip: 'Slight bend in elbows, focus on the squeeze',
  },
];

function CircularProgress({ value, max }: { value: number; max: number }) {
  const progress = value / max;
  const rotation = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: progress,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [progress, rotation]);

  return (
    <View style={styles.circularProgressContainer}>
      <View style={styles.circularProgressInner}>
        <Text style={styles.circularProgressText}>{value}</Text>
        <Text style={styles.circularProgressLabel}>sec</Text>
      </View>
    </View>
  );
}

export default function TaskDetailScreen() {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState<Set[]>(
    Array.from({ length: 3 }, (_, i) => ({
      number: i + 1,
      weight: '',
      reps: '',
      completed: false,
    }))
  );
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentExercise = MOCK_EXERCISES[currentExerciseIndex];
  const totalExercises = MOCK_EXERCISES.length;
  const currentSet = sets.findIndex((s) => !s.completed) + 1 || sets.length;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRestTimer = (duration: number) => {
    setIsResting(true);
    setRestTimeLeft(duration);
    setIsPaused(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setIsResting(false);
          hapticFeedback.success();
          if (Platform.OS !== 'web') {
            hapticFeedback.heavy();
            hapticFeedback.heavy();
          }
          showToast({ message: 'Rest complete! Ready for next set', type: 'success' });
          return 0;
        }
        if (prev <= 4) {
          hapticFeedback.light();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseRestTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
    hapticFeedback.light();
  };

  const resumeRestTimer = () => {
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setIsResting(false);
          hapticFeedback.success();
          showToast({ message: 'Rest complete! Ready for next set', type: 'success' });
          return 0;
        }
        if (prev <= 4) {
          hapticFeedback.light();
        }
        return prev - 1;
      });
    }, 1000);
    hapticFeedback.light();
  };

  const skipRest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsResting(false);
    setRestTimeLeft(0);
    hapticFeedback.medium();
    showToast({ message: 'Rest skipped', type: 'info' });
  };

  const handleCompleteSet = (setNumber: number) => {
    const set = sets.find((s) => s.number === setNumber);
    if (!set || !set.weight || !set.reps) {
      showToast({ message: 'Please enter weight and reps', type: 'error' });
      return;
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const updatedSets = sets.map((s) =>
      s.number === setNumber ? { ...s, completed: true } : s
    );
    setSets(updatedSets);
    hapticFeedback.success();

    if (setNumber < sets.length) {
      startRestTimer(currentExercise.restTime);
    } else {
      showCelebration({ type: 'exercise-complete' });
      showToast({ 
        message: `${currentExercise.name} completed! 💪`, 
        type: 'success' 
      });
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSets(
        Array.from({ length: MOCK_EXERCISES[currentExerciseIndex + 1].sets }, (_, i) => ({
          number: i + 1,
          weight: '',
          reps: '',
          completed: false,
        }))
      );
      hapticFeedback.medium();
    } else {
      showCelebration({
        type: 'workout-complete',
        onComplete: () => {
          hapticFeedback.success();
          showToast({
            message: 'Workout crushed! Amazing work! 🎉',
            type: 'success',
            duration: 4000,
          });
          setTimeout(() => {
            router.push('/client/tracking' as never);
          }, 2000);
        },
      });
    }
  };

  const allSetsComplete = sets.every((s) => s.completed);

  const handlePickMedia = async (mediaType: 'photo' | 'video') => {
    try {  
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showToast({ message: 'Camera roll permission is required', type: 'error' });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedMedia([...uploadedMedia, result.assets[0].uri]);
        hapticFeedback.success();
        showToast({ 
          message: `${mediaType === 'video' ? 'Video' : 'Photo'} added!`, 
          type: 'success' 
        });
      }
    } catch (error) {
      showToast({ message: 'Failed to pick media', type: 'error' });
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showToast({ message: 'Camera permission is required', type: 'error' });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadedMedia([...uploadedMedia, result.assets[0].uri]);
        hapticFeedback.success();
        showToast({ message: 'Photo captured!', type: 'success' });
      }
    } catch (error) {
      showToast({ message: 'Failed to take photo', type: 'error' });
    }
  };

  const handleRemoveMedia = (index: number) => {
    setUploadedMedia(uploadedMedia.filter((_, i) => i !== index));
    hapticFeedback.light();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => {
            hapticFeedback.light();
            router.back();
          }} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Chest & Triceps</Text>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          Exercise {currentExerciseIndex + 1}/{totalExercises}
        </Text>
        <ProgressBar
          current={currentExerciseIndex}
          total={totalExercises}
          showLabel={false}
          animated
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoText}>🎥 Video Player</Text>
          <Text style={styles.videoSubtext}>(Exercise demonstration)</Text>
        </View>

        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.exerciseDetails}>
            {currentExercise.sets} sets × {currentExercise.reps} reps • {currentExercise.restTime}s rest
          </Text>
        </View>

        {isResting && (
          <Card style={styles.restCard}>
            <Text style={styles.restTitle}>
              {isPaused ? 'Rest Paused' : 'Rest Time'}
            </Text>
            <CircularProgress value={restTimeLeft} max={currentExercise.restTime} />
            
            <View style={styles.restControls}>
              <Pressable
                onPress={isPaused ? resumeRestTimer : pauseRestTimer}
                style={styles.restControlButton}
              >
                {isPaused ? (
                  <Play size={24} color={colors.text.primary} />
                ) : (
                  <Pause size={24} color={colors.text.primary} />
                )}
              </Pressable>
              <Pressable onPress={skipRest} style={styles.restControlButton}>
                <SkipForward size={24} color={colors.text.primary} />
              </Pressable>
            </View>
          </Card>
        )}

        <View style={styles.setsContainer}>
          {sets.map((set) => (
            <Animated.View
              key={set.number}
              style={[
                { transform: [{ scale: set.completed ? scaleAnim : 1 }] },
              ]}
            >
              <Card style={styles.setCard}>
                <View style={styles.setHeader}>
                  <Text style={styles.setLabel}>SET {set.number}</Text>
                  {set.completed && (
                    <CheckCircle size={20} color={colors.accent.primary} />
                  )}
                </View>

                {!set.completed ? (
                  <View style={styles.setInputs}>
                    <View style={styles.inputRow}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Weight (kg)</Text>
                        <Input
                          value={set.weight}
                          onChangeText={(text) => {
                            const updated = sets.map((s) =>
                              s.number === set.number ? { ...s, weight: text } : s
                            );
                            setSets(updated);
                          }}
                          placeholder="50"
                          keyboardType="numeric"
                          style={styles.setInput}
                          editable={currentSet === set.number}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Reps</Text>
                        <Input
                          value={set.reps}
                          onChangeText={(text) => {
                            const updated = sets.map((s) =>
                              s.number === set.number ? { ...s, reps: text } : s
                            );
                            setSets(updated);
                          }}
                          placeholder="10"
                          keyboardType="numeric"
                          style={styles.setInput}
                          editable={currentSet === set.number}
                        />
                      </View>
                    </View>

                    <Button
                      title={`Complete Set ${set.number}`}
                      onPress={() => handleCompleteSet(set.number)}
                      disabled={!set.weight || !set.reps || currentSet !== set.number}
                      size="small"
                      style={styles.completeButton}
                    />
                  </View>
                ) : (
                  <View style={styles.completedSet}>
                    <Text style={styles.completedText}>
                      {set.weight}kg × {set.reps} reps ✓
                    </Text>
                  </View>
                )}
              </Card>
            </Animated.View>
          ))}
        </View>

        <Card style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Form Tip</Text>
            <Text style={styles.tipText}>{currentExercise.formTip}</Text>
          </View>
        </Card>

        <Card style={styles.mediaCard}>
          <Text style={styles.mediaTitle}>Form Check (Optional)</Text>
          <Text style={styles.mediaSubtitle}>
            Upload a video or photo of your form for feedback
          </Text>
          
          {uploadedMedia.length > 0 && (
            <ScrollView 
              horizontal 
              style={styles.mediaPreview}
              showsHorizontalScrollIndicator={false}
            >
              {uploadedMedia.map((uri, index) => (
                <View key={index} style={styles.mediaItem}>
                  <Image source={{ uri }} style={styles.mediaThumbnail} />
                  <Pressable
                    style={styles.removeMediaButton}
                    onPress={() => handleRemoveMedia(index)}
                  >
                    <X size={16} color={colors.text.primary} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.mediaActions}>
            <Pressable
              style={styles.mediaButton}
              onPress={handleTakePhoto}
            >
              <Camera size={20} color={colors.text.primary} />
              <Text style={styles.mediaButtonText}>Take Photo</Text>
            </Pressable>
            <Pressable
              style={styles.mediaButton}
              onPress={() => handlePickMedia('photo')}
            >
              <Camera size={20} color={colors.text.primary} />
              <Text style={styles.mediaButtonText}>Photo</Text>
            </Pressable>
            <Pressable
              style={styles.mediaButton}
              onPress={() => handlePickMedia('video')}
            >
              <Video size={20} color={colors.text.primary} />
              <Text style={styles.mediaButtonText}>Video</Text>
            </Pressable>
          </View>
        </Card>

        <View style={styles.actions}>
          {allSetsComplete && (
            <Button
              title={
                currentExerciseIndex === totalExercises - 1
                  ? 'FINISH WORKOUT'
                  : 'NEXT EXERCISE'
              }
              onPress={handleNextExercise}
            />
          )}
          <Button 
            title="SKIP EXERCISE" 
            variant="outline" 
            onPress={() => {
              hapticFeedback.light();
              handleNextExercise();
            }} 
          />
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
  progressSection: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
  },
  progressText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  content: {
    flex: 1,
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: colors.bg.surface,
    marginHorizontal: spacing.screen,
    marginBottom: spacing.md,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: typography.size.h2,
    color: colors.text.primary,
  },
  videoSubtext: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  exerciseInfo: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
  },
  exerciseName: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  exerciseDetails: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  restCard: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.accent.tertiary,
    paddingVertical: spacing.lg,
  },
  restTitle: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  circularProgressContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.bg.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  circularProgressInner: {
    alignItems: 'center',
  },
  circularProgressText: {
    fontSize: 40,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  circularProgressLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  restControls: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  restControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsContainer: {
    paddingHorizontal: spacing.screen,
  },
  setCard: {
    marginBottom: spacing.md,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  setLabel: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  setInputs: {
    gap: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
  },
  setInput: {
    marginBottom: 0,
  },
  completeButton: {
    marginTop: spacing.sm,
  },
  completedSet: {
    paddingVertical: spacing.sm,
  },
  completedText: {
    fontSize: typography.size.body,
    color: colors.accent.primary,
    fontWeight: typography.weight.semibold,
  },
  tipCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  tipIcon: {
    fontSize: 28,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  mediaCard: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  mediaTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  mediaSubtitle: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  mediaPreview: {
    marginBottom: spacing.md,
  },
  mediaItem: {
    marginRight: spacing.md,
    position: 'relative' as const,
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.bg.dark,
  },
  removeMediaButton: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg.dark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.progress.bg,
  },
  mediaButtonText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
});
