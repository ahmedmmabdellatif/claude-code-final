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
import { DollarSign, Check, ArrowLeft, ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { Card } from '@/components';
import { trpc } from '@/lib/trpc';
import { hapticFeedback } from '@/utils/haptics';

export default function ProgramOffersClientScreen() {
  const offersQuery = trpc.payments.listOffers.useQuery();

  const handleSelectOffer = (offerId: string) => {
    hapticFeedback.light();
    console.log('Selected offer:', offerId);
    router.push(`/checkout?offerId=${offerId}` as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Start your fitness journey with professional coaching
        </Text>

        {offersQuery.isLoading ? (
          <Text style={styles.loadingText}>Loading offers...</Text>
        ) : offersQuery.data && offersQuery.data.length > 0 ? (
          offersQuery.data.map((offer, index) => {
            const isPopular = index === 1;
            return (
              <Card key={offer.id} style={[styles.offerCard, isPopular && styles.popularCard]}>
                {isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <Text style={styles.offerName}>{offer.name}</Text>
                
                <View style={styles.priceContainer}>
                  <View style={styles.priceRow}>
                    <DollarSign size={28} color={colors.accent.primary} />
                    <Text style={styles.priceAmount}>${(offer.price / 100).toFixed(0)}</Text>
                  </View>
                  <Text style={styles.pricePeriod}>
                    per {offer.durationUnit === 'months' ? 'month' : offer.durationUnit === 'weeks' ? 'week' : 'day'}
                  </Text>
                </View>

                <Text style={styles.description}>{offer.description}</Text>

                <View style={styles.featuresContainer}>
                  {offer.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <Check size={18} color={colors.semantic.success} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.selectButton, isPopular && styles.selectButtonPopular]}
                  onPress={() => handleSelectOffer(offer.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.selectButtonText, isPopular && styles.selectButtonTextPopular]}>
                    Select Plan
                  </Text>
                  <ChevronRight size={20} color={isPopular ? colors.text.primary : colors.accent.primary} />
                </TouchableOpacity>
              </Card>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <DollarSign size={48} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>No Plans Available</Text>
            <Text style={styles.emptyMessage}>Please check back later for available coaching plans</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All plans include a 7-day money-back guarantee
          </Text>
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
  },
  subtitle: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loadingText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  offerCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    position: 'relative',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: spacing.md,
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: typography.size.small,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  offerName: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  priceContainer: {
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: typography.size.stats,
    fontWeight: typography.weight.bold,
    color: colors.accent.primary,
    marginLeft: 4,
  },
  pricePeriod: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  description: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: typography.size.body * typography.lineHeight.normal,
  },
  featuresContainer: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    gap: spacing.xs,
  },
  selectButtonPopular: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  selectButtonText: {
    fontSize: typography.size.button,
    fontWeight: typography.weight.bold,
    color: colors.accent.primary,
  },
  selectButtonTextPopular: {
    color: colors.text.primary,
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
  footer: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
