import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export type NotificationType = 
  | 'new_message'
  | 'plan_assigned'
  | 'task_reminder'
  | 'alert_generated'
  | 'goal_achieved'
  | 'workout_completed'
  | 'measurement_due';

interface NotificationTrigger {
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  scheduledFor?: number;
}

const notificationQueue: NotificationTrigger[] = [];

export const triggerNotificationProcedure = publicProcedure
  .input(
    z.object({
      userId: z.number(),
      type: z.enum([
        'new_message',
        'plan_assigned',
        'task_reminder',
        'alert_generated',
        'goal_achieved',
        'workout_completed',
        'measurement_due',
      ]),
      title: z.string(),
      body: z.string(),
      data: z.record(z.string(), z.unknown()).optional(),
      scheduledFor: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const notification: NotificationTrigger = {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data,
      scheduledFor: input.scheduledFor,
    };

    notificationQueue.push(notification);

    console.log(`Notification triggered for user ${input.userId}: ${input.title}`);
    console.log(`Queue length: ${notificationQueue.length}`);

    return {
      success: true,
      notification,
    };
  });

export const sendPushNotificationProcedure = publicProcedure
  .input(
    z.object({
      pushToken: z.string(),
      title: z.string(),
      body: z.string(),
      data: z.record(z.string(), z.unknown()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Sending push notification:', input);

    return { success: true };
  });

export const getNotificationQueueProcedure = publicProcedure
  .input(
    z.object({
      userId: z.number().optional(),
    })
  )
  .query(async ({ input }) => {
    if (input.userId) {
      return notificationQueue.filter(n => n.userId === input.userId);
    }
    return notificationQueue;
  });
