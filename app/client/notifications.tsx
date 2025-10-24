import React, { useMemo } from 'react';
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
  Bell,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Award,
} from 'lucide-react-native';
import { Card } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { trpc } from '@/lib/trpc';

interface Notification {
  id: number;
  type: 'success' | 'info' | 'warning' | 'message' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}



function NotificationCard({ 
  notification,
  onMarkRead,
}: { 
  notification: Notification;
  onMarkRead: (id: number) => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={24} color={colors.semantic.success} />;
      case 'warning':
        return <AlertCircle size={24} color={colors.semantic.warning} />;
      case 'message':
        return <MessageCircle size={24} color={colors.accent.tertiary} />;
      case 'achievement':
        return <Award size={24} color={colors.accent.secondary} />;
      default:
        return <Bell size={24} color={colors.accent.primary} />;
    }
  };

  return (
    <Card
      style={[
        styles.notificationCard,
        !notification.read && styles.notificationCardUnread,
      ]}
      onPress={() => {
        if (!notification.read) {
          onMarkRead(notification.id);
        }
      }}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>{notification.timestamp}</Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </Card>
  );
}

export default function NotificationsScreen() {
  const notificationsQuery = trpc.notifications.list.useQuery(
    {},
    {
      refetchInterval: 5000,
      refetchIntervalInBackground: false,
    }
  );
  
  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      notificationsQuery.refetch();
    },
  });

  const notifications = notificationsQuery.data || [];
  const unreadCount = useMemo(
    () => notifications.filter((n: Notification) => !n.read).length,
    [notifications]
  );

  const handleMarkRead = (notificationId: number) => {
    markReadMutation.mutate({ notificationId });
  };

  const handleMarkAllRead = () => {
    const unreadIds = notifications
      .filter((n: Notification) => !n.read)
      .map((n: Notification) => n.id);
    unreadIds.forEach((id) => {
      markReadMutation.mutate({ notificationId: id });
    });
  };

  if (notificationsQuery.isLoading) {
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
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {unreadCount > 0 && (
          <Pressable 
            style={styles.markAllButton}
            onPress={handleMarkAllRead}
            disabled={markReadMutation.isPending}
          >
            {markReadMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.accent.primary} />
            ) : (
              <Text style={styles.markAllText}>Mark all as read</Text>
            )}
          </Pressable>
        )}

        {notifications.filter((n: Notification) =>
          n.timestamp.includes('hours ago')
        ).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            {notifications
              .filter((n: Notification) => n.timestamp.includes('hours ago'))
              .map((notification: Notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))}
          </View>
        )}

        {notifications.filter((n: Notification) =>
          n.timestamp.includes('day')
        ).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {notifications
              .filter((n: Notification) => n.timestamp.includes('day'))
              .map((notification: Notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))}
          </View>
        )}

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <CheckCircle size={64} color={colors.accent.primary} />
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateText}>You&apos;re all caught up!</Text>
          </View>
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
  badge: {
    backgroundColor: colors.semantic.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  markAllButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.screen,
    marginBottom: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
  },
  markAllText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.accent.primary,
  },
  section: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    position: 'relative',
  },
  notificationCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.primary,
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
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: typography.size.small,
    color: colors.text.disabled,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.primary,
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
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