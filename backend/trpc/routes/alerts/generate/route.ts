import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import db from '../../../../db';

interface AdherenceData {
  clientId: string;
  weeklyCompletion: number;
  lastActivityDate: Date | null;
  progressStagnation: boolean;
}

const calculateAdherence = async (clientId: string): Promise<AdherenceData> => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const weeklyTasks = await db.task.count({
    where: {
      clientId,
      scheduledDate: {
        gte: oneWeekAgo,
        lte: now,
      },
    },
  });

  const weeklyCompleted = await db.task.count({
    where: {
      clientId,
      scheduledDate: {
        gte: oneWeekAgo,
        lte: now,
      },
      status: {
        in: ['complete', 'partial'],
      },
    },
  });

  const weeklyCompletion = weeklyTasks > 0 ? Math.round((weeklyCompleted / weeklyTasks) * 100) : 0;

  const clientProfile = await db.clientProfile.findUnique({
    where: { id: clientId },
    select: { lastCheckin: true },
  });

  const recentMeasurements = await db.measurement.findMany({
    where: {
      clientId,
      date: {
        gte: twoWeeksAgo,
      },
    },
    orderBy: {
      date: 'desc',
    },
    take: 3,
  });

  let progressStagnation = false;
  if (recentMeasurements.length >= 3) {
    const weights = recentMeasurements.map((m: typeof recentMeasurements[number]) => m.weight).filter((w: number | null): w is number => w !== null);
    if (weights.length >= 3) {
      const avgChange = Math.abs(weights[0] - weights[weights.length - 1]);
      progressStagnation = avgChange < 0.5;
    }
  }

  return {
    clientId,
    weeklyCompletion,
    lastActivityDate: clientProfile?.lastCheckin || null,
    progressStagnation,
  };
};

const generateAlertsForClient = async (clientId: string, coachId: string) => {
  const data = await calculateAdherence(clientId);
  const alerts: any[] = [];
  const now = new Date();
  
  let daysSinceActivity = 999;
  if (data.lastActivityDate) {
    const lastActivity = new Date(data.lastActivityDate);
    daysSinceActivity = Math.floor(
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  if (data.weeklyCompletion < 40) {
    const existingAlert = await db.alert.findFirst({
      where: {
        clientId,
        type: 'very_low_adherence',
        isResolved: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!existingAlert) {
      const alert = await db.alert.create({
        data: {
          clientId,
          coachId,
          type: 'very_low_adherence',
          severity: 'high',
          title: 'Very Low Adherence Alert',
          message: `Client completion rate is critically low at ${data.weeklyCompletion}%. Immediate intervention recommended.`,
          data: {
            completionRate: data.weeklyCompletion,
            threshold: 40,
          },
        },
      });
      alerts.push(alert);
    }
  } else if (data.weeklyCompletion < 60) {
    const existingAlert = await db.alert.findFirst({
      where: {
        clientId,
        type: 'low_adherence',
        isResolved: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!existingAlert) {
      const alert = await db.alert.create({
        data: {
          clientId,
          coachId,
          type: 'low_adherence',
          severity: 'medium',
          title: 'Low Adherence Warning',
          message: `Client completion rate has dropped to ${data.weeklyCompletion}%. Consider checking in.`,
          data: {
            completionRate: data.weeklyCompletion,
            threshold: 60,
          },
        },
      });
      alerts.push(alert);
    }
  }

  if (daysSinceActivity >= 3) {
    const existingAlert = await db.alert.findFirst({
      where: {
        clientId,
        type: 'missed_checkin',
        isResolved: false,
        createdAt: {
          gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      },
    });

    if (!existingAlert) {
      const alert = await db.alert.create({
        data: {
          clientId,
          coachId,
          type: 'missed_checkin',
          severity: daysSinceActivity >= 5 ? 'high' : 'medium',
          title: 'Missed Check-In Alert',
          message: `Client hasn't logged activity in ${daysSinceActivity} days. Last activity: ${data.lastActivityDate?.toLocaleDateString() || 'Never'}.`,
          data: {
            daysSinceActivity,
            lastActivityDate: data.lastActivityDate?.toISOString(),
          },
        },
      });
      alerts.push(alert);
    }
  }

  if (data.progressStagnation) {
    const existingAlert = await db.alert.findFirst({
      where: {
        clientId,
        type: 'progress_plateau',
        isResolved: false,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!existingAlert) {
      const alert = await db.alert.create({
        data: {
          clientId,
          coachId,
          type: 'progress_plateau',
          severity: 'low',
          title: 'Progress Plateau Detected',
          message: 'Client progress has plateaued for 2+ weeks. Plan adjustment may be needed.',
          data: {
            stagnationWeeks: 2,
          },
        },
      });
      alerts.push(alert);
    }
  }

  return alerts;
};

export const generateAlertsProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string().optional(),
      coachId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[Generate Alerts] Generating alerts for coach:', input.coachId);

    try {
      let clientIds: string[] = [];

      if (input.clientId) {
        clientIds = [input.clientId];
      } else {
        const coachProfile = await db.coachProfile.findFirst({
          where: { userId: input.coachId },
          include: {
            clients: {
              select: { id: true },
            },
          },
        });

        if (coachProfile) {
          clientIds = coachProfile.clients.map((c: typeof coachProfile.clients[number]) => c.id);
        }
      }

      console.log(`[Generate Alerts] Checking ${clientIds.length} clients`);

      const allAlerts: any[] = [];

      for (const clientId of clientIds) {
        const alerts = await generateAlertsForClient(clientId, input.coachId);
        allAlerts.push(...alerts);
      }

      console.log(`[Generate Alerts] Generated ${allAlerts.length} new alerts`);

      return {
        success: true,
        alerts: allAlerts,
        generated: allAlerts.length,
        message: `Generated ${allAlerts.length} alert(s)`,
      };
    } catch (error) {
      console.error('[Generate Alerts] Error:', error);
      throw new Error(
        `Failed to generate alerts: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  });
