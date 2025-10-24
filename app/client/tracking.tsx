import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import { Card, LineChartWrapper } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { trpc } from '@/lib/trpc';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MOCK_WEIGHT_DATA = [
  { date: 'Jan 1', weight: 73 },
  { date: 'Jan 8', weight: 72.5 },
  { date: 'Jan 15', weight: 72.2 },
  { date: 'Jan 22', weight: 71.8 },
  { date: 'Jan 29', weight: 71.5 },
  { date: 'Feb 5', weight: 71.2 },
];

const MOCK_MEASUREMENTS = [
  { label: 'Chest', value: '+2cm', trend: 'up' as const },
  { label: 'Waist', value: '-3cm', trend: 'down' as const },
  { label: 'Arms', value: '+1.5cm', trend: 'up' as const },
  { label: 'Thighs', value: '+2cm', trend: 'up' as const },
];

function StatCard({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string | number;
  label: string;
}) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function MeasurementRow({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: 'up' | 'down';
}) {
  const isPositive = trend === 'up';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? colors.semantic.success : colors.semantic.error;

  return (
    <View style={styles.measurementRow}>
      <Text style={styles.measurementLabel}>{label}</Text>
      <View style={styles.measurementValue}>
        <Text style={[styles.measurementText, { color: trendColor }]}>{value}</Text>
        <Icon size={18} color={trendColor} />
      </View>
    </View>
  );
}

export default function TrackingDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const statsQuery = trpc.tracking.stats.useQuery();
  const stats = statsQuery.data;

  const onRefresh = async () => {
    setRefreshing(true);
    await statsQuery.refetch();
    setRefreshing(false);
  };



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Your Progress</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
      >
        <View style={styles.statsRow}>
          <StatCard icon="🔥" value={stats?.streakDays || 0} label="Day Streak" />
          <StatCard icon="💪" value={stats?.completedWorkouts || 0} label="Workouts" />
          <StatCard icon="⚡" value={`${stats?.adherencePercent || 0}%`} label="Done" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Progress</Text>
          <Card style={styles.chartCard}>
            <LineChartWrapper
              data={{
                labels: (stats?.weightHistory || MOCK_WEIGHT_DATA).map((d) => d.date.split(' ')[1]),
                datasets: [
                  {
                    data: (stats?.weightHistory || MOCK_WEIGHT_DATA).map((d) => d.weight),
                  },
                ],
              }}
              width={SCREEN_WIDTH - 72}
              height={220}
            />
            <View style={styles.weightSummary}>
              <View>
                <Text style={styles.weightLabel}>Starting Weight</Text>
                <Text style={styles.weightValue}>73.0 kg</Text>
              </View>
              <View style={styles.weightChange}>
                <Text style={styles.weightLabel}>Change</Text>
                <Text style={[styles.weightValue, styles.weightChangeValue]}>
                  -1.8 kg
                </Text>
              </View>
              <View style={styles.weightAlignRight}>
                <Text style={styles.weightLabel}>Current Weight</Text>
                <Text style={styles.weightValue}>71.2 kg</Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Measurements</Text>
          <Card style={styles.measurementsCard}>
            {MOCK_MEASUREMENTS.map((measurement, index) => (
              <React.Fragment key={measurement.label}>
                <MeasurementRow
                  label={measurement.label}
                  value={measurement.value}
                  trend={measurement.trend}
                />
                {index < MOCK_MEASUREMENTS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Photos</Text>
          <Card style={styles.photosCard}>
            <View style={styles.photoComparison}>
              <View style={styles.photoContainer}>
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoEmoji}>📷</Text>
                  <Text style={styles.photoLabel}>Before</Text>
                  <Text style={styles.photoDate}>Jan 1</Text>
                </View>
              </View>
              <View style={styles.photoArrow}>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
              <View style={styles.photoContainer}>
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoEmoji}>📷</Text>
                  <Text style={styles.photoLabel}>Current</Text>
                  <Text style={styles.photoDate}>Feb 5</Text>
                </View>
              </View>
            </View>
            <Pressable style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Upload New Photos</Text>
            </Pressable>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Summary</Text>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Workouts</Text>
              <Text style={styles.summaryValue}>4/4 ✓</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Cardio Sessions</Text>
              <Text style={styles.summaryValue}>3/4</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Meal Adherence</Text>
              <Text style={styles.summaryValue}>90%</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rest Days Taken</Text>
              <Text style={styles.summaryValue}>2/2 ✓</Text>
            </View>
          </Card>
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.size.stats,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  section: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chartCard: {
    padding: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
  weightSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  weightLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  weightValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  weightChange: {
    alignItems: 'center',
  },
  weightChangeValue: {
    color: colors.semantic.success,
  },
  weightAlignRight: {
    alignItems: 'flex-end',
  },
  measurementsCard: {
    padding: spacing.md,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  measurementLabel: {
    fontSize: typography.size.body,
    color: colors.text.primary,
  },
  measurementValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  measurementText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.progress.bg,
  },
  photosCard: {
    padding: spacing.lg,
  },
  photoComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  photoContainer: {
    flex: 1,
  },
  photoPlaceholder: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.bg.dark,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.progress.bg,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  photoLabel: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  photoDate: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  photoArrow: {
    paddingHorizontal: spacing.md,
  },
  arrowIcon: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  uploadButton: {
    backgroundColor: colors.progress.bg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  summaryCard: {
    padding: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  summaryLabel: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
});
