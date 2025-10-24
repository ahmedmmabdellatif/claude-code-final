import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, DollarSign, Check, ArrowLeft } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { Card } from '@/components';
import { trpc } from '@/lib/trpc';
import { hapticFeedback } from '@/utils/haptics';

export default function ProgramOffersScreen() {

  const offersQuery = trpc.payments.listOffers.useQuery();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Program Offers</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {offersQuery.isLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : offersQuery.data && offersQuery.data.length > 0 ? (
          offersQuery.data.map((offer) => (
            <Card key={offer.id} style={styles.offerCard}>
              <Text style={styles.offerName}>{offer.name}</Text>
              <View style={styles.priceRow}>
                <DollarSign size={20} color={colors.accent.primary} />
                <Text style={styles.priceText}>${(offer.price / 100).toFixed(2)}</Text>
                <Text style={styles.periodText}>/ {offer.duration} {offer.durationUnit}</Text>
              </View>
              <Text style={styles.description}>{offer.description}</Text>
              <View style={styles.features}>
                {offer.features.slice(0, 3).map((feature, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Check size={14} color={colors.semantic.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <DollarSign size={48} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>No Program Offers</Text>
            <Text style={styles.emptyMessage}>Create your first program offer to start accepting clients</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          hapticFeedback.light();
        }}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  offerCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  offerName: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 4,
  },
  priceText: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.accent.primary,
  },
  periodText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  description: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  features: {
    gap: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.size.body,
    color: colors.text.primary,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  emptyMessage: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
