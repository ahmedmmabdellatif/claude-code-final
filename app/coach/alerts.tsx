import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  AlertTriangle,
  AlertCircle,
  Info,
  TrendingDown,
  Calendar,
  CheckCircle,
} from 'lucide-react-native';
import { Card } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { trpc } from '@/lib/trpc';

interface Alert {
  id: number;
  clientId: number;
  clientName: string;
  type: 'low_adherence' | 'missed_checkin' | 'no_progress' | 'injury_report';
  severity: 'low' | 'medium' | 'high';
  message: string;
  details: string;
  timestamp: string;
  resolved: boolean;
}

function AlertCard({ alert }: { alert: Alert }) {
  const getIcon = () => {
    switch (alert.type) {
      case 'low_adherence':
        return <TrendingDown size={24} color={getSeverityColor(alert.severity)} />;
      case 'missed_checkin':
        return <Calendar size={24} color={getSeverityColor(alert.severity)} />;
      case 'no_progress':
        return <AlertCircle size={24} color={getSeverityColor(alert.severity)} />;
      case 'injury_report':
        return <AlertTriangle size={24} color={getSeverityColor(alert.severity)} />;
      default:
        return <Info size={24} color={colors.text.secondary} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return colors.semantic.error;
      case 'medium':
        return colors.semantic.warning;
      case 'low':
        return colors.accent.tertiary;
      default:
        return colors.text.secondary;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'HIGH';
      case 'medium':
        return 'MEDIUM';
      case 'low':
        return 'LOW';
      default:
        return '';
    }
  };

  return (
    <Card
      style={[
        styles.alertCard,
        alert.resolved && styles.alertCardResolved,
        !alert.resolved && styles[`alertCard${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}` as keyof typeof styles],
      ]}
      onPress={() => {
        router.push({
          pathname: '/coach/client-profile',
          params: { id: alert.clientId },
        } as never);
      }}
    >
      <View style={styles.alertHeader}>
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.alertInfo}>
          <View style={styles.alertTitleRow}>
            <Text style={styles.clientName}>{alert.clientName}</Text>
            {!alert.resolved && (
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(alert.severity) },
                ]}
              >
                <Text style={styles.severityText}>
                  {getSeverityLabel(alert.severity)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.alertMessage}>{alert.message}</Text>
          <Text style={styles.alertDetails}>{alert.details}</Text>
          <Text style={styles.alertTime}>{alert.timestamp}</Text>
        </View>
      </View>

      {alert.resolved ? (
        <View style={styles.resolvedBadge}>
          <CheckCircle size={16} color={colors.semantic.success} />
          <Text style={styles.resolvedText}>Resolved</Text>
        </View>
      ) : (
        <View style={styles.alertActions}>
          <Pressable
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: '/coach/chat',
                params: { clientId: alert.clientId },
              } as never);
            }}
          >
            <Text style={styles.actionButtonText}>Message</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonPrimaryText]}>
              Mark Resolved
            </Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

export default function CoachAlertsScreen() {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');

  const alertsQuery = trpc.coach.alerts.useQuery({});
  const alerts = alertsQuery.data || [];

  const filteredAlerts = alerts.filter((alert: Alert) => {
    if (filter === 'active') return !alert.resolved;
    if (filter === 'resolved') return alert.resolved;
    return true;
  });

  const activeCount = alerts.filter((a: Alert) => !a.resolved).length;
  const highPriorityCount = alerts.filter(
    (a: Alert) => !a.resolved && a.severity === 'high'
  ).length;

  if (alertsQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Alerts</Text>
        {activeCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{activeCount}</Text>
          </View>
        )}
      </View>

      {highPriorityCount > 0 && (
        <View style={styles.priorityBanner}>
          <AlertTriangle size={20} color={colors.semantic.error} />
          <Text style={styles.priorityText}>
            {highPriorityCount} high priority alert{highPriorityCount > 1 ? 's' : ''} require attention
          </Text>
        </View>
      )}

      <View style={styles.filterContainer}>
        {(['all', 'active', 'resolved'] as const).map((filterOption) => (
          <Pressable
            key={filterOption}
            style={[
              styles.filterButton,
              filter === filterOption && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === filterOption && styles.filterButtonTextActive,
              ]}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
            {filterOption === 'active' && activeCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeCount}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={64} color={colors.accent.primary} />
            <Text style={styles.emptyStateTitle}>
              {filter === 'resolved'
                ? 'No resolved alerts'
                : 'All clear!'}
            </Text>
            <Text style={styles.emptyStateText}>
              {filter === 'resolved'
                ? 'Resolved alerts will appear here'
                : 'No alerts require your attention right now'}
            </Text>
          </View>
        ) : (
          filteredAlerts.map((alert: Alert) => <AlertCard key={alert.id} alert={alert} />)
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  headerBadge: {
    backgroundColor: colors.semantic.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  priorityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screen,
    gap: spacing.sm,
  },
  priorityText: {
    flex: 1,
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    gap: spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: colors.accent.primary,
  },
  filterButtonText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.text.primary,
  },
  filterBadge: {
    backgroundColor: colors.semantic.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.screen,
  },
  alertCard: {
    marginBottom: spacing.md,
    borderLeftWidth: 3,
  },
  alertCardHigh: {
    borderLeftColor: colors.semantic.error,
  },
  alertCardMedium: {
    borderLeftColor: colors.semantic.warning,
  },
  alertCardLow: {
    borderLeftColor: colors.accent.tertiary,
  },
  alertCardResolved: {
    borderLeftColor: colors.semantic.success,
    opacity: 0.7,
  },
  alertHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  clientName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 11,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  alertMessage: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  alertDetails: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  alertTime: {
    fontSize: typography.size.small,
    color: colors.text.disabled,
  },
  alertActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg.dark,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: colors.accent.primary,
  },
  actionButtonText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  actionButtonPrimaryText: {
    color: colors.text.primary,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  resolvedText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.semantic.success,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
