import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

interface PushToken {
  userId: number;
  token: string;
  platform: 'ios' | 'android' | 'web';
  registeredAt: number;
}

const pushTokens: Map<number, PushToken[]> = new Map();

export const registerPushTokenProcedure = publicProcedure
  .input(
    z.object({
      userId: z.number(),
      token: z.string(),
      platform: z.enum(['ios', 'android', 'web']),
    })
  )
  .mutation(async ({ input }) => {
    const userTokens = pushTokens.get(input.userId) || [];
    
    const existingIndex = userTokens.findIndex(
      t => t.token === input.token && t.platform === input.platform
    );

    if (existingIndex >= 0) {
      userTokens[existingIndex].registeredAt = Date.now();
    } else {
      userTokens.push({
        userId: input.userId,
        token: input.token,
        platform: input.platform,
        registeredAt: Date.now(),
      });
    }

    pushTokens.set(input.userId, userTokens);

    return { success: true };
  });

export const unregisterPushTokenProcedure = publicProcedure
  .input(
    z.object({
      userId: z.number(),
      token: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const userTokens = pushTokens.get(input.userId) || [];
    const filtered = userTokens.filter(t => t.token !== input.token);
    
    if (filtered.length > 0) {
      pushTokens.set(input.userId, filtered);
    } else {
      pushTokens.delete(input.userId);
    }

    return { success: true };
  });

export const getUserPushTokensProcedure = publicProcedure
  .input(
    z.object({
      userId: z.number(),
    })
  )
  .query(async ({ input }) => {
    return pushTokens.get(input.userId) || [];
  });
