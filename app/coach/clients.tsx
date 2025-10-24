import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Search, Filter } from 'lucide-react-native';
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

function ClientCard({ client }: { client: Client }) {
  const getStatusColor = (status: Client['planStatus']) => {
    switch (status) {
      case 'active':
        return colors.semantic.success;
      case 'pending':
        return colors.semantic.warning;
      case 'paused':
        return colors.text.secondary;
      case 'completed':
        return colors.accent.tertiary;
      default:
        return colors.text.disabled;
    }
  };

  const getStatusLabel = (status: Client['planStatus']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 80) return colors.semantic.success;
    if (adherence >= 60) return colors.semantic.warning;
    return colors.semantic.error;
  };

  return (
    <Card
      style={styles.clientCard}
      onPress={() =>
        router.push({
          pathname: '/coach/client-profile',
          params: { id: client.id },
        } as never)
      }
    >
      <View style={styles.clientHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {client.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Text>
        </View>
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.membershipNumber}>{client.membershipNumber}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(client.planStatus) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusLabel(client.planStatus)}</Text>
        </View>
      </View>

      <View style={styles.clientMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Goal</Text>
          <Text style={styles.metaValue}>{client.goal}</Text>
        </View>
        {client.planStatus === 'active' && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Adherence</Text>
            <Text
              style={[
                styles.metaValue,
                { color: getAdherenceColor(client.adherence) },
              ]}
            >
              {client.adherence}%
            </Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Last Checkin</Text>
          <Text style={styles.metaValue}>{client.lastCheckin}</Text>
        </View>
      </View>
    </Card>
  );
}

export default function ClientsListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Client['planStatus']>('all');

  const { data, isLoading } = trpc.coach.clients.useQuery();
  const allClients = data?.clients || [];

  const filteredClients = allClients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.planStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>All Clients</Text>
        </View>
        <View style={styles.loadingContainer}>
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
        <Text style={styles.headerTitle}>All Clients</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={styles.filterButton}>
          <Filter size={20} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {(['all', 'active', 'pending', 'paused'] as const).map((status) => (
          <Pressable
            key={status}
            style={[
              styles.filterChip,
              filterStatus === status && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === status && styles.filterChipTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        <Text style={styles.resultsCount}>
          {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
        </Text>
        {filteredClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
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
  searchSection: {
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
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filters: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
    maxHeight: 48,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.surface,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.accent.primary,
  },
  filterChipText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.text.primary,
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
  clientCard: {
    marginBottom: spacing.md,
  },
  clientHeader: {
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
  clientInfo: {
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
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
  clientMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
  },
});
