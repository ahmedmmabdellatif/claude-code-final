import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Animated, Platform, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bell, User, Utensils } from 'lucide-react-native';
import { ProgressBar, Card, Button } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';

function TaskCard({ task, index, onPress }: { task: any; index: number; onPress: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, slideAnim]);

  if (Platform.OS === 'web') {
    return (
      <Card style={styles.taskCard} onPress={onPress}>
        <View style={styles.taskContent}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskIcon}>
              {task.type === 'workout' ? '💪' : '🍽️'}
            </Text>
            <Text style={styles.taskName}>{task.name}</Text>
          </View>
          {task.status === 'complete' && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </Card>
    );
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card style={styles.taskCard} onPress={onPress}>
        <View style={styles.taskContent}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskIcon}>
              {task.type === 'workout' ? '💪' : '🍽️'}
            </Text>
            <Text style={styles.taskName}>{task.name}</Text>
          </View>
          {task.status === 'complete' && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </Card>
    </Animated.View>
  );
}

interface Task {
  id: string;
  type: string;
  name: string;
  status: string;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const todayTasksQuery = trpc.plans.today.useQuery({ clientId: String(user?.id) });
  const statsQuery = trpc.tracking.stats.useQuery({ clientId: String(user?.id) });

  const tasks = todayTasksQuery.data || [];
  const stats = statsQuery.data;
  const completedCount = stats?.completedCount || 0;
  const totalCount = stats?.totalCount || 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      todayTasksQuery.refetch(),
      statsQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  if (todayTasksQuery.isLoading || statsQuery.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>Loading your plan...</Text>
        </View>
      </View>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}!</Text>
            <Text style={styles.subtitle}>Let&apos;s crush today</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerButton}
              onPress={() => router.push('/client/notifications' as never)}
            >
              <Bell size={24} color={colors.text.primary} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.headerButton}
              onPress={() => router.push('/client/profile' as never)}
            >
              <User size={24} color={colors.text.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.stats}>
          <ProgressBar
            current={completedCount}
            total={totalCount}
            animated
          />
          <Card style={styles.streakCard}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakNumber}>{stats?.streakDays || 0}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Tasks</Text>
          {tasks.map((task: Task, index: number) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onPress={() => {
                if (task.type === 'workout') {
                  router.push('/client/task-detail' as never);
                } else if (task.type === 'meal') {
                  router.push('/client/meal-plan' as never);
                }
              }}
            />
          ))}
          
          <Card
            style={styles.mealPlanCard}
            onPress={() => router.push('/client/meal-plan' as never)}
          >
            <Utensils size={24} color={colors.accent.secondary} />
            <View style={styles.mealPlanInfo}>
              <Text style={styles.mealPlanTitle}>View Full Meal Plan</Text>
              <Text style={styles.mealPlanSubtitle}>6 meals • 2550 calories</Text>
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button
            title="VIEW FULL WEEK"
            variant="secondary"
            onPress={() => router.push('/client/week-view' as never)}
          />
          <Button
            title="VIEW PROGRESS"
            variant="outline"
            onPress={() => router.push('/client/tracking' as never)}
          />
        </View>
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    padding: spacing.screen,
    paddingBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  stats: {
    padding: spacing.screen,
    paddingTop: 0,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  streakNumber: {
    fontSize: typography.size.stats,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  streakLabel: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  section: {
    padding: spacing.screen,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  taskCard: {
    marginBottom: spacing.sm,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  taskName: {
    fontSize: typography.size.body,
    color: colors.text.primary,
  },
  checkmark: {
    fontSize: 24,
    color: colors.accent.primary,
  },
  footer: {
    padding: spacing.screen,
    paddingTop: 0,
    gap: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.semantic.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  mealPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.accent.secondary,
  },
  mealPlanInfo: {
    flex: 1,
  },
  mealPlanTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  mealPlanSubtitle: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
});
