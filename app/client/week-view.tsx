import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Lock, Circle } from 'lucide-react-native';
import { Card } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

interface Task {
  id: number;
  type: 'workout' | 'meal' | 'cardio' | 'rest';
  name: string;
  status: 'complete' | 'pending' | 'locked';
  day: string;
}

const WEEK_TASKS: Task[] = [
  { id: 1, type: 'workout', name: 'Chest & Triceps', status: 'complete', day: 'Monday' },
  { id: 2, type: 'meal', name: 'Meal Plan', status: 'complete', day: 'Monday' },
  { id: 3, type: 'workout', name: 'Back & Biceps', status: 'complete', day: 'Tuesday' },
  { id: 4, type: 'meal', name: 'Meal Plan', status: 'complete', day: 'Tuesday' },
  { id: 5, type: 'rest', name: 'Rest Day', status: 'complete', day: 'Wednesday' },
  { id: 6, type: 'workout', name: 'Legs', status: 'pending', day: 'Thursday' },
  { id: 7, type: 'meal', name: 'Meal Plan', status: 'pending', day: 'Thursday' },
  { id: 8, type: 'cardio', name: '20min Bike', status: 'locked', day: 'Friday' },
  { id: 9, type: 'workout', name: 'Shoulders', status: 'locked', day: 'Friday' },
  { id: 10, type: 'rest', name: 'Rest Day', status: 'locked', day: 'Saturday' },
  { id: 11, type: 'workout', name: 'Full Body', status: 'locked', day: 'Sunday' },
];

function TaskNode({ task, index }: { task: Task; index: number }) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (task.status === 'pending') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [task.status, pulseAnim]);

  const getNodeIcon = () => {
    switch (task.status) {
      case 'complete':
        return <CheckCircle size={28} color={colors.text.primary} />;
      case 'locked':
        return <Lock size={24} color={colors.text.disabled} />;
      default:
        return <Circle size={28} color={colors.accent.primary} />;
    }
  };

  const getNodeStyle = () => {
    switch (task.status) {
      case 'complete':
        return styles.nodeComplete;
      case 'locked':
        return styles.nodeLocked;
      default:
        return styles.nodePending;
    }
  };

  const getTaskIcon = () => {
    switch (task.type) {
      case 'workout':
        return '💪';
      case 'meal':
        return '🍽️';
      case 'cardio':
        return '🏃';
      case 'rest':
        return '😴';
      default:
        return '⭐';
    }
  };

  const isLeft = index % 2 === 0;

  return (
    <View style={styles.taskNodeContainer}>
      <View style={[styles.taskRow, isLeft ? styles.taskRowLeft : styles.taskRowRight]}>
        {isLeft && (
          <Card style={styles.taskInfoCard}>
            <Text style={styles.taskEmoji}>{getTaskIcon()}</Text>
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>{task.name}</Text>
              <Text style={styles.taskDay}>{task.day}</Text>
            </View>
          </Card>
        )}

        {Platform.OS === 'web' ? (
          <View style={[styles.node, getNodeStyle()]}>
            {getNodeIcon()}
          </View>
        ) : (
          <Animated.View
            style={[
              styles.node,
              getNodeStyle(),
              task.status === 'pending' && { transform: [{ scale: pulseAnim }] },
            ]}
          >
            {getNodeIcon()}
          </Animated.View>
        )}

        {!isLeft && (
          <Card style={styles.taskInfoCard}>
            <Text style={styles.taskEmoji}>{getTaskIcon()}</Text>
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>{task.name}</Text>
              <Text style={styles.taskDay}>{task.day}</Text>
            </View>
          </Card>
        )}
      </View>

      {index < WEEK_TASKS.length - 1 && <View style={styles.pathLine} />}
    </View>
  );
}

export default function WeekViewScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>This Week</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.weekInfo}>
          <Text style={styles.weekTitle}>Week 1 • Body Recomposition</Text>
          <Text style={styles.weekProgress}>6/11 tasks complete</Text>
        </View>

        <View style={styles.pathContainer}>
          {WEEK_TASKS.map((task, index) => (
            <TaskNode key={task.id} task={task} index={index} />
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
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  weekInfo: {
    marginBottom: spacing.xl,
  },
  weekTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  weekProgress: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  pathContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  taskNodeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  taskRowLeft: {
    justifyContent: 'flex-start',
  },
  taskRowRight: {
    justifyContent: 'flex-end',
  },
  taskInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    maxWidth: '60%',
  },
  taskEmoji: {
    fontSize: 28,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  taskDay: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginTop: 2,
  },
  node: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  nodeComplete: {
    backgroundColor: colors.accent.primary,
  },
  nodePending: {
    backgroundColor: colors.bg.surface,
    borderWidth: 3,
    borderColor: colors.accent.primary,
  },
  nodeLocked: {
    backgroundColor: colors.progress.bg,
    opacity: 0.5,
  },
  pathLine: {
    width: 3,
    height: 40,
    backgroundColor: colors.progress.bg,
    marginVertical: spacing.xs,
  },
});
