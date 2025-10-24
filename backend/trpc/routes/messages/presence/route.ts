import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

interface PresenceStatus {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: number;
}

const presenceStatuses: Map<string, PresenceStatus> = new Map();

const ONLINE_TIMEOUT = 30000;

export const updatePresenceProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      status: z.enum(['online', 'offline', 'away']),
    })
  )
  .mutation(async ({ input }) => {
    presenceStatuses.set(input.userId, {
      userId: input.userId,
      status: input.status,
      lastSeen: Date.now(),
    });

    return { success: true };
  });

export const getPresenceProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const presence = presenceStatuses.get(input.userId);
    const now = Date.now();

    if (!presence) {
      return {
        status: 'offline' as const,
        lastSeen: null,
      };
    }

    if (presence.status === 'online' && now - presence.lastSeen > ONLINE_TIMEOUT) {
      presence.status = 'away';
    }

    return {
      status: presence.status,
      lastSeen: presence.lastSeen,
    };
  });

export const heartbeatProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const presence = presenceStatuses.get(input.userId);

    if (presence) {
      presence.lastSeen = Date.now();
      presence.status = 'online';
    } else {
      presenceStatuses.set(input.userId, {
        userId: input.userId,
        status: 'online',
        lastSeen: Date.now(),
      });
    }

    return { success: true };
  });
