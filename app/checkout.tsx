import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CreditCard, Check, ArrowLeft, AlertCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { Card, Button } from '@/components';
import { trpc } from '@/lib/trpc';
import { hapticFeedback } from '@/utils/haptics';
import { useToast } from '@/contexts/ToastContext';

export default function CheckoutScreen() {
  const { offerId } = useLocalSearchParams<{ offerId: string }>();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const offerQuery = trpc.payments.getOffer.useQuery(
    { id: offerId as string },
    { enabled: !!offerId }
  );

  const createPaymentMutation = trpc.payments.createPaymentIntent.useMutation();
  const confirmPaymentMutation = trpc.payments.confirmPayment.useMutation();

  const handlePayNow = async () => {
    if (!offerId) return;

    hapticFeedback.light();
    setIsProcessing(true);

    try {
      const paymentIntent = await createPaymentMutation.mutateAsync({
        offerId: offerId as string,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await confirmPaymentMutation.mutateAsync({
        paymentId: paymentIntent.paymentId,
        offerId: offerId as string,
        coachId: 'coach-1',
      });

      if (result.success) {
        hapticFeedback.success();
        showToast({ message: 'Payment successful! Welcome aboard!', type: 'success' });
        router.replace('/payment-success' as any);
      }
    } catch (error) {
      console.error('Payment error:', error);
      hapticFeedback.error();
      showToast({ message: 'Payment failed. Please try again.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (offerQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (offerQuery.isError || !offerQuery.data) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color={colors.semantic.error} />
          <Text style={styles.errorTitle}>Offer Not Found</Text>
          <Text style={styles.errorMessage}>
            We couldn&apos;t find the selected program offer.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  const offer = offerQuery.data;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={isProcessing}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.orderSummaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.offerInfo}>
            <Text style={styles.offerName}>{offer.name}</Text>
            <Text style={styles.offerDescription}>{offer.description}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.featuresList}>
            <Text style={styles.featuresTitle}>What&apos;s Included:</Text>
            {offer.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Check size={16} color={colors.semantic.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Subtotal:</Text>
            <Text style={styles.pricingValue}>
              ${(offer.price / 100).toFixed(2)}
            </Text>
          </View>

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>
              Duration: {offer.duration} {offer.durationUnit}
            </Text>
            <Text style={styles.pricingValue}>-</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              ${(offer.price / 100).toFixed(2)}
            </Text>
          </View>
        </Card>

        <Card style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <CreditCard size={24} color={colors.accent.primary} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <View style={styles.mockPaymentInfo}>
            <Text style={styles.mockPaymentText}>
              🔒 Secure Payment (Test Mode)
            </Text>
            <Text style={styles.mockPaymentSubtext}>
              This is a demo payment. No actual charges will be made.
            </Text>
          </View>
        </Card>

        <View style={styles.guaranteeBox}>
          <AlertCircle size={20} color={colors.accent.primary} />
          <View style={styles.guaranteeText}>
            <Text style={styles.guaranteeTitle}>7-Day Money-Back Guarantee</Text>
            <Text style={styles.guaranteeDescription}>
              Not satisfied? Get a full refund within 7 days, no questions asked.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isProcessing ? 'Processing...' : `Pay ${(offer.price / 100).toFixed(2)}`}
          onPress={handlePayNow}
          disabled={isProcessing}
          variant="primary"
        />
        {isProcessing && (
          <ActivityIndicator
            size="small"
            color={colors.accent.primary}
            style={styles.processingIndicator}
          />
        )}
      </View>
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
    fontWeight: typography.weight.bold as '700',
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  orderSummaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold as '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  offerInfo: {
    marginBottom: spacing.md,
  },
  offerName: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.semibold as '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  offerDescription: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    lineHeight: typography.size.body * typography.lineHeight.normal,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: spacing.md,
  },
  featuresList: {
    gap: spacing.sm,
  },
  featuresTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold as '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    flex: 1,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pricingLabel: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  pricingValue: {
    fontSize: typography.size.body,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold as '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold as '700',
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold as '700',
    color: colors.accent.primary,
  },
  paymentCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mockPaymentInfo: {
    backgroundColor: colors.bg.secondary,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
  },
  mockPaymentText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold as '600',
    color: colors.text.primary,
  },
  mockPaymentSubtext: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    lineHeight: typography.size.small * typography.lineHeight.relaxed,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent.primary + '30',
  },
  guaranteeText: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold as '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  guaranteeDescription: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    lineHeight: typography.size.small * typography.lineHeight.normal,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  processingIndicator: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold as '700',
    color: colors.text.primary,
  },
  errorMessage: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
