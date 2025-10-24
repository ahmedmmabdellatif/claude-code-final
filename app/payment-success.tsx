import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { Card, Button } from '@/components';
import { hapticFeedback } from '@/utils/haptics';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentSuccessScreen() {
  const { user } = useAuth();

  useEffect(() => {
    hapticFeedback.success();
  }, []);

  const handleContinue = () => {
    hapticFeedback.light();
    if (user?.role === 'client') {
      router.replace('/client/dashboard');
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <CheckCircle size={80} color={colors.semantic.success} />
          </View>
        </View>

        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>
          Welcome to your fitness journey
        </Text>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Complete Your Profile</Text>
                <Text style={styles.stepDescription}>
                  Answer a few questions to help us understand your goals
                </Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Get Your Custom Plan</Text>
                <Text style={styles.stepDescription}>
                  Your coach will create a personalized workout and meal plan
                </Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Start Your Journey</Text>
                <Text style={styles.stepDescription}>
                  Track your progress and communicate with your coach
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.guaranteeCard}>
          <Text style={styles.guaranteeTitle}>
            💚 7-Day Money-Back Guarantee
          </Text>
          <Text style={styles.guaranteeText}>
            Not satisfied? Get a full refund within 7 days, no questions asked.
          </Text>
        </Card>

        <Card style={styles.supportCard}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            Contact your coach anytime through the app&apos;s messaging feature.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={handleContinue}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.dark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.semantic.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.size.stats,
    fontWeight: typography.weight.bold as '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.h3,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.size.h3,
    fontWeight: typography.weight.bold as '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  stepsList: {
    gap: 0,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold as '700',
    color: colors.text.primary,
  },
  stepContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  stepTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold as '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    lineHeight: typography.size.body * typography.lineHeight.normal,
  },
  stepDivider: {
    width: 2,
    height: spacing.md,
    backgroundColor: colors.accent.primary + '40',
    marginLeft: 15,
  },
  guaranteeCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.semantic.success + '10',
    borderWidth: 1,
    borderColor: colors.semantic.success + '30',
  },
  guaranteeTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold as '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  guaranteeText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    lineHeight: typography.size.body * typography.lineHeight.normal,
  },
  supportCard: {
    padding: spacing.lg,
  },
  supportTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold as '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  supportText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    lineHeight: typography.size.body * typography.lineHeight.normal,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
});
