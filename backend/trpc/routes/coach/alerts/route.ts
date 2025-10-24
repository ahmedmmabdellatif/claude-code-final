import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

interface Alert {
  id: number;
  clientId: number;
  clientName: string;
  type: 'low_adherence' | 'missed_checkin' | 'no_progress' | 'injury_report';
  severity: 'low' | 'medium' | 'high';
  message: string;
  details: string;
  timestamp: string;
  resolved: boolean;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: 1,
    clientId: 1,
    clientName: 'Ahmed Hassan',
    type: 'low_adherence',
    severity: 'high',
    message: 'Low Workout Adherence',
    details: 'Completed only 2 out of 5 scheduled workouts this week. Last workout was 4 days ago.',
    timestamp: '2 hours ago',
    resolved: false,
  },
  {
    id: 2,
    clientId: 2,
    clientName: 'Sarah Mohamed',
    type: 'missed_checkin',
    severity: 'medium',
    message: 'Missed Weekly Check-in',
    details: 'Weekly progress photos and weight log are 2 days overdue.',
    timestamp: '5 hours ago',
    resolved: false,
  },
  {
    id: 3,
    clientId: 5,
    clientName: 'Youssef Ibrahim',
    type: 'no_progress',
    severity: 'medium',
    message: 'No Weight Change',
    details: 'Weight has plateaued for 3 weeks. Current: 82kg, Target: 78kg.',
    timestamp: '1 day ago',
    resolved: false,
  },
  {
    id: 4,
    clientId: 3,
    clientName: 'Omar Ali',
    type: 'injury_report',
    severity: 'high',
    message: 'Reported Lower Back Pain',
    details: 'Client reported discomfort during deadlifts. Skipped last workout.',
    timestamp: '1 day ago',
    resolved: false,
  },
  {
    id: 5,
    clientId: 4,
    clientName: 'Fatima Khalil',
    type: 'low_adherence',
    severity: 'low',
    message: 'Meal Plan Adherence',
    details: 'Logged only 4 out of 7 meals yesterday. Missing lunch and dinner logs.',
    timestamp: '2 days ago',
    resolved: false,
  },
  {
    id: 6,
    clientId: 1,
    clientName: 'Ahmed Hassan',
    type: 'missed_checkin',
    severity: 'low',
    message: 'Missed Check-in',
    details: 'Weekly check-in was completed after a delay.',
    timestamp: '5 days ago',
    resolved: true,
  },
];

export const coachAlertsProcedure = publicProcedure
  .input(
    z
      .object({
        filter: z.enum(['all', 'active', 'resolved']).optional(),
      })
      .optional()
  )
  .query(async ({ input }) => {
    const filter = input?.filter || 'all';

    let filteredAlerts = MOCK_ALERTS;

    if (filter === 'active') {
      filteredAlerts = MOCK_ALERTS.filter((alert) => !alert.resolved);
    } else if (filter === 'resolved') {
      filteredAlerts = MOCK_ALERTS.filter((alert) => alert.resolved);
    }

    return filteredAlerts.sort((a, b) => {
      if (a.severity === 'high' && b.severity !== 'high') return -1;
      if (a.severity !== 'high' && b.severity === 'high') return 1;
      if (a.severity === 'medium' && b.severity === 'low') return -1;
      if (a.severity === 'low' && b.severity === 'medium') return 1;
      return 0;
    });
  });

export const resolveAlertProcedure = publicProcedure
  .input(
    z.object({
      alertId: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Resolving alert:', input.alertId);

    return {
      success: true,
      alertId: input.alertId,
      message: 'Alert marked as resolved',
    };
  });
