import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

export const listAlertsProcedure = publicProcedure
  .input(
    z.object({
      coachId: z.string().optional(),
      clientId: z.string().optional(),
      severity: z.enum(['low', 'medium', 'high', 'all']).optional().default('all'),
      resolved: z.boolean().optional(),
    })
  )
  .query(async ({ input }) => {
    const mockAlerts = [
      {
        id: '1',
        clientId: 'client-2',
        clientName: 'John Doe',
        coachId: 'coach-1',
        type: 'low_adherence',
        severity: 'medium',
        title: 'Low Adherence Warning',
        message: 'Client completion rate has dropped to 45%. Consider checking in.',
        data: {
          completionRate: 45,
          threshold: 60,
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        resolvedAt: null,
      },
      {
        id: '2',
        clientId: 'client-3',
        clientName: 'Sarah Smith',
        coachId: 'coach-1',
        type: 'missed_checkin',
        severity: 'high',
        title: 'Missed Check-In Alert',
        message: "Client hasn't logged activity in 5 days.",
        data: {
          daysSinceActivity: 5,
          lastActivityDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        resolvedAt: null,
      },
      {
        id: '3',
        clientId: 'client-3',
        clientName: 'Sarah Smith',
        coachId: 'coach-1',
        type: 'low_adherence',
        severity: 'high',
        title: 'Very Low Adherence Alert',
        message: 'Client completion rate is critically low at 30%. Immediate intervention recommended.',
        data: {
          completionRate: 30,
          threshold: 40,
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        resolvedAt: null,
      },
      {
        id: '4',
        clientId: 'client-1',
        clientName: 'Ahmed Hassan',
        coachId: 'coach-1',
        type: 'progress_plateau',
        severity: 'low',
        title: 'Progress Plateau Detected',
        message: 'Client progress has plateaued for 2+ weeks. Plan adjustment may be needed.',
        data: {
          stagnationWeeks: 2,
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        resolved: true,
        resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    let filteredAlerts = mockAlerts;

    if (input.coachId) {
      filteredAlerts = filteredAlerts.filter((a) => a.coachId === input.coachId);
    }

    if (input.clientId) {
      filteredAlerts = filteredAlerts.filter((a) => a.clientId === input.clientId);
    }

    if (input.severity && input.severity !== 'all') {
      filteredAlerts = filteredAlerts.filter((a) => a.severity === input.severity);
    }

    if (input.resolved !== undefined) {
      filteredAlerts = filteredAlerts.filter((a) => a.resolved === input.resolved);
    }

    const stats = {
      total: filteredAlerts.length,
      high: filteredAlerts.filter((a) => a.severity === 'high').length,
      medium: filteredAlerts.filter((a) => a.severity === 'medium').length,
      low: filteredAlerts.filter((a) => a.severity === 'low').length,
      unresolved: filteredAlerts.filter((a) => !a.resolved).length,
    };

    return {
      alerts: filteredAlerts,
      stats,
    };
  });
