import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

type ProgramOffer = {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months';
  features: string[];
  description: string;
  isActive: boolean;
  stripePriceId?: string;
  coachId: string;
  createdAt: Date;
  updatedAt: Date;
};

const mockOffers: ProgramOffer[] = [
  {
    id: 'offer-1',
    name: 'Basic Plan',
    price: 4999,
    currency: 'usd',
    duration: 1,
    durationUnit: 'months',
    features: [
      'Custom workout plan',
      'Weekly check-ins',
      'Email support',
      'Progress tracking',
    ],
    description: 'Perfect for getting started with professional coaching',
    isActive: true,
    coachId: 'coach-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'offer-2',
    name: 'Plus Plan',
    price: 9999,
    currency: 'usd',
    duration: 1,
    durationUnit: 'months',
    features: [
      'Everything in Basic',
      'Custom meal plan',
      'Daily check-ins',
      'Video form reviews',
      'Priority support',
    ],
    description: 'Complete coaching experience with nutrition guidance',
    isActive: true,
    coachId: 'coach-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'offer-3',
    name: 'Premium Plan',
    price: 19999,
    currency: 'usd',
    duration: 1,
    durationUnit: 'months',
    features: [
      'Everything in Plus',
      'Unlimited messaging',
      '24/7 support',
      'Weekly video calls',
      'Supplement recommendations',
      'Monthly progress reviews',
    ],
    description: 'Maximum support and personalized attention',
    isActive: true,
    coachId: 'coach-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const listOffersProcedure = protectedProcedure.query(async ({ ctx }) => {
  const coachId = ctx.user.role === 'coach' ? ctx.user.id : undefined;
  
  if (coachId) {
    return mockOffers.filter((offer) => offer.coachId === coachId);
  }
  
  return mockOffers.filter((offer) => offer.isActive);
});

export const getOfferProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const offer = mockOffers.find((o) => o.id === input.id);
    if (!offer) {
      throw new Error('Offer not found');
    }
    return offer;
  });

export const createOfferProcedure = protectedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      price: z.number().positive(),
      currency: z.string().default('usd'),
      duration: z.number().positive(),
      durationUnit: z.enum(['days', 'weeks', 'months']),
      features: z.array(z.string()),
      description: z.string(),
      isActive: z.boolean().default(true),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== 'coach') {
      throw new Error('Only coaches can create offers');
    }

    const newOffer: ProgramOffer = {
      id: `offer-${Date.now()}`,
      ...input,
      coachId: ctx.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockOffers.push(newOffer);
    return newOffer;
  });

export const updateOfferProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      price: z.number().positive().optional(),
      duration: z.number().positive().optional(),
      durationUnit: z.enum(['days', 'weeks', 'months']).optional(),
      features: z.array(z.string()).optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== 'coach') {
      throw new Error('Only coaches can update offers');
    }

    const offerIndex = mockOffers.findIndex((o) => o.id === input.id);
    if (offerIndex === -1) {
      throw new Error('Offer not found');
    }

    if (mockOffers[offerIndex].coachId !== ctx.user.id) {
      throw new Error('Not authorized to update this offer');
    }

    const { id, ...updates } = input;
    mockOffers[offerIndex] = {
      ...mockOffers[offerIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return mockOffers[offerIndex];
  });

export const deleteOfferProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== 'coach') {
      throw new Error('Only coaches can delete offers');
    }

    const offerIndex = mockOffers.findIndex((o) => o.id === input.id);
    if (offerIndex === -1) {
      throw new Error('Offer not found');
    }

    if (mockOffers[offerIndex].coachId !== ctx.user.id) {
      throw new Error('Not authorized to delete this offer');
    }

    mockOffers.splice(offerIndex, 1);
    return { success: true };
  });
