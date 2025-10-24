import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  MessageCircle,
  Edit,
  FileText,
} from 'lucide-react-native';
import { Card, Button, LineChartWrapper } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { trpc } from '@/lib/trpc';

const SCREEN_WIDTH = Dimensions.get('window').width;

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

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

export default function ClientProfileScreen() {
  const params = useLocalSearchParams();
  const clientId = params.id as string;

  const { data, isLoading } = trpc.coach.clientDetail.useQuery(
    { clientId: parseInt(clientId) },
    { enabled: !!clientId }
  );

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const client = data.client;



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{client.name}</Text>
        <Pressable style={styles.messageButton}>
          <MessageCircle size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.membershipNumber}>{client.membershipNumber}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: client.planStatus === 'active'
                  ? colors.semantic.success
                  : colors.semantic.warning
              },
            ]}
          >
            <Text style={styles.statusText}>
              {client.planStatus.charAt(0).toUpperCase() + client.planStatus.slice(1)}
            </Text>
          </View>
        </Card>

        <View style={styles.statsRow}>
          <StatCard icon="🔥" value={client.streakDays} label="Day Streak" />
          <StatCard icon="⚡" value={`${client.adherence}%`} label="Adherence" />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Pressable>
              <Edit size={20} color={colors.accent.primary} />
            </Pressable>
          </View>
          <Card style={styles.infoCard}>
            <InfoRow label="Email" value={client.email} />
            <InfoRow label="Age" value={`${client.age} years`} />
            <InfoRow label="Height" value={`${client.height} cm`} />
            <InfoRow label="Current Weight" value={`${client.currentWeight} kg`} />
            <InfoRow label="Start Weight" value={`${client.startWeight} kg`} />
            <InfoRow
              label="Weight Change"
              value={`${(client.currentWeight - client.startWeight).toFixed(1)} kg`}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Profile</Text>
          <Card style={styles.infoCard}>
            <InfoRow label="Goal" value={client.goal} />
            <InfoRow label="Experience" value={client.experience} />
            <InfoRow label="Training Days/Week" value={client.trainingDays} />
            <InfoRow label="Location" value={client.location} />
            <InfoRow label="Diet" value={client.diet} />
            {client.injuries.length > 0 && (
              <InfoRow label="Injuries/Conditions" value={client.injuries.join(', ')} />
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Progress</Text>
          <Card style={styles.chartCard}>
            <LineChartWrapper
              data={{
                labels: client.weightHistory.map((d) => d.date.split(' ')[1]),
                datasets: [
                  {
                    data: client.weightHistory.map((d) => d.weight),
                  },
                ],
              }}
              width={SCREEN_WIDTH - 72}
              height={180}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Card style={styles.actionCard} onPress={() => {}}>
            <Calendar size={24} color={colors.accent.primary} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>View Current Plan</Text>
              <Text style={styles.actionDescription}>Week 5 • Body Recomposition</Text>
            </View>
          </Card>

          <Card
            style={styles.actionCard}
            onPress={() =>
              router.push({
                pathname: '/coach/ai-plan-preview',
                params: { clientId: client.id },
              } as never)
            }
          >
            <Edit size={24} color={colors.accent.secondary} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>View AI Plan Suggestion</Text>
              <Text style={styles.actionDescription}>AI-generated personalized plan</Text>
            </View>
          </Card>

          <Card
            style={styles.actionCard}
            onPress={() =>
              router.push({
                pathname: '/coach/create-plan',
                params: { clientId: client.id },
              } as never)
            }
          >
            <Edit size={24} color={colors.accent.primary} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Create Custom Plan</Text>
              <Text style={styles.actionDescription}>Build from scratch</Text>
            </View>
          </Card>

          <Card style={styles.actionCard} onPress={() => {}}>
            <TrendingUp size={24} color={colors.accent.tertiary} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>View Full Progress</Text>
              <Text style={styles.actionDescription}>Charts, photos, measurements</Text>
            </View>
          </Card>

          <Card style={styles.actionCard} onPress={() => {}}>
            <FileText size={24} color={colors.semantic.warning} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Onboarding Responses</Text>
              <Text style={styles.actionDescription}>View questionnaire answers</Text>
            </View>
          </Card>
        </View>

        <View style={styles.dangerZone}>
          <Button title="PAUSE PLAN" variant="outline" onPress={() => {}} />
          <Button
            title="END MEMBERSHIP"
            variant="outline"
            onPress={() => {}}
            style={styles.dangerButton}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.screen,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  messageButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    alignItems: 'center',
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  clientName: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  membershipNumber: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  statusText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
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
  infoCard: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
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
  chartCard: {
    padding: spacing.md,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  dangerZone: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  dangerButton: {
    borderColor: colors.semantic.error,
  },
});
