import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Users, Calendar, Library, Bell, MessageCircle, UserPlus } from 'lucide-react-native';
import { Card } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { trpc } from '@/lib/trpc';

interface Client {
  id: number;
  name: string;
  membershipNumber: string;
  planStatus: 'active' | 'pending' | 'completed' | 'paused';
  adherence: number;
  lastCheckin: string;
  email: string;
  startDate: string;
  goal: string;
}

export default function CoachDashboard() {
  const insets = useSafeAreaInsets();
  const { data, isLoading } = trpc.coach.clients.useQuery();
  
  const clients = data?.clients || [];
  const activeClients = clients.filter((c: Client) => c.planStatus === 'active').length;
  const pendingPlans = clients.filter((c: Client) => c.planStatus === 'pending').length;

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Coach Dashboard</Text>
          <Pressable style={styles.notificationButton}>
            <Bell size={24} color={colors.text.primary} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Users size={28} color={colors.accent.primary} />
            <Text style={styles.statNumber}>{activeClients}</Text>
            <Text style={styles.statLabel}>Active Clients</Text>
          </Card>

          <Card style={styles.statCard}>
            <Calendar size={28} color={colors.accent.secondary} />
            <Text style={styles.statNumber}>{pendingPlans}</Text>
            <Text style={styles.statLabel}>Pending Plans</Text>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Clients</Text>
            <Pressable onPress={() => router.push('/coach/clients' as never)}>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>

          {clients.slice(0, 3).map((client: Client) => (
            <Card
              key={client.id}
              style={styles.clientCard}
              onPress={() =>
                router.push({
                  pathname: '/coach/client-profile',
                  params: { id: client.id },
                } as never)
              }
            >
              <View style={styles.clientInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {client.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </Text>
                </View>
                <View style={styles.clientDetails}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.membershipNumber}>
                    {client.membershipNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.clientMeta}>
                {client.planStatus === 'active' ? (
                  <>
                    <View style={styles.adherenceContainer}>
                      <Text style={styles.adherenceLabel}>Adherence</Text>
                      <Text
                        style={[
                          styles.adherenceValue,
                          client.adherence >= 80 && styles.adherenceHigh,
                          client.adherence < 80 &&
                            client.adherence >= 60 &&
                            styles.adherenceMedium,
                          client.adherence < 60 && styles.adherenceLow,
                        ]}
                      >
                        {client.adherence}%
                      </Text>
                    </View>
                    <Text style={styles.lastCheckin}>{client.lastCheckin}</Text>
                  </>
                ) : (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>Pending Plan</Text>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Card
            style={styles.actionCard}
            onPress={() => router.push('/coach/messages' as never)}
          >
            <MessageCircle size={24} color={colors.accent.primary} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Client Messages</Text>
              <Text style={styles.actionDescription}>
                View and respond to messages
              </Text>
            </View>
          </Card>

          <Card
            style={styles.actionCard}
            onPress={() => router.push('/coach/create-client' as never)}
          >
            <UserPlus size={24} color={colors.semantic.success} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Create New Client</Text>
              <Text style={styles.actionDescription}>
                Add a new client to your roster
              </Text>
            </View>
          </Card>

          <Card
            style={styles.actionCard}
            onPress={() => router.push('/coach/cms-library' as never)}
          >
            <Library size={24} color={colors.accent.tertiary} />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Manage CMS Library</Text>
              <Text style={styles.actionDescription}>
                Add exercises, foods, and templates
              </Text>
            </View>
          </Card>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.screen,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  notificationButton: {
    padding: spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.semantic.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  statsGrid: {
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
  statNumber: {
    fontSize: typography.size.stats,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginTop: spacing.xs,
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
  },
  viewAll: {
    fontSize: typography.size.small,
    color: colors.accent.primary,
    fontWeight: typography.weight.semibold,
  },
  clientCard: {
    marginBottom: spacing.md,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  membershipNumber: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  clientMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adherenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adherenceLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  adherenceValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
  },
  adherenceHigh: {
    color: colors.semantic.success,
  },
  adherenceMedium: {
    color: colors.semantic.warning,
  },
  adherenceLow: {
    color: colors.semantic.error,
  },
  lastCheckin: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  pendingBadge: {
    backgroundColor: colors.accent.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  quickActions: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
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
});
