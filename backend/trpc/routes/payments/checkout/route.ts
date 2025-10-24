import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

type Payment = {
  id: string;
  userId: string;
  offerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  stripePaymentIntentId?: string;
  createdAt: Date;
  completedAt?: Date;
};

type Subscription = {
  id: string;
  userId: string;
  offerId: string;
  coachId: string;
  status: 'active' | 'canceled' | 'expired';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentId: string;
};

const mockPayments: Payment[] = [];
const mockSubscriptions: Subscription[] = [];

export const createPaymentIntentProcedure = protectedProcedure
  .input(
    z.object({
      offerId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const payment: Payment = {
      id: `payment-${Date.now()}`,
      userId: ctx.user.id,
      offerId: input.offerId,
      amount: 0,
      currency: 'usd',
      status: 'pending',
      stripePaymentIntentId: `pi_mock_${Date.now()}`,
      createdAt: new Date(),
    };

    mockPayments.push(payment);

    return {
      clientSecret: `pi_mock_${Date.now()}_secret`,
      paymentId: payment.id,
    };
  });

export const confirmPaymentProcedure = protectedProcedure
  .input(
    z.object({
      paymentId: z.string(),
      offerId: z.string(),
      coachId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const paymentIndex = mockPayments.findIndex((p) => p.id === input.paymentId);
    
    if (paymentIndex === -1) {
      throw new Error('Payment not found');
    }

    mockPayments[paymentIndex].status = 'succeeded';
    mockPayments[paymentIndex].completedAt = new Date();

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      userId: ctx.user.id,
      offerId: input.offerId,
      coachId: input.coachId,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
      paymentId: input.paymentId,
    };

    mockSubscriptions.push(subscription);

    return {
      success: true,
      subscription,
      payment: mockPayments[paymentIndex],
    };
  });

export const getPaymentStatusProcedure = protectedProcedure
  .input(z.object({ paymentId: z.string() }))
  .query(async ({ input }) => {
    const payment = mockPayments.find((p) => p.id === input.paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    return payment;
  });

export const listPaymentsProcedure = protectedProcedure.query(async ({ ctx }) => {
  return mockPayments.filter((p) => p.userId === ctx.user.id);
});

export const getSubscriptionProcedure = protectedProcedure.query(async ({ ctx }) => {
  const subscription = mockSubscriptions.find(
    (s) => s.userId === ctx.user.id && s.status === 'active'
  );

  return subscription || null;
});

export const cancelSubscriptionProcedure = protectedProcedure
  .input(z.object({ subscriptionId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const subIndex = mockSubscriptions.findIndex(
      (s) => s.id === input.subscriptionId && s.userId === ctx.user.id
    );

    if (subIndex === -1) {
      throw new Error('Subscription not found');
    }

    mockSubscriptions[subIndex].status = 'canceled';
    mockSubscriptions[subIndex].autoRenew = false;

    return {
      success: true,
      subscription: mockSubscriptions[subIndex],
    };
  });
