import { z } from 'zod';
import { publicProcedure } from "../../../create-context";
import db from "../../../../db";

function formatTimeAgo(date: Date | null): string {
  if (!date) return 'Never';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export const listClientsProcedure = publicProcedure
  .input(
    z.object({
      coachId: z.string(),
    }).optional()
  )
  .query(async ({ input }) => {
    console.log('[List Clients] Fetching clients for coach:', input?.coachId);

    try {
      const whereClause = input?.coachId
        ? {
            coach: {
              userId: input.coachId,
            },
          }
        : {};

      const clientProfiles = await db.clientProfile.findMany({
        where: whereClause,
        include: {
          user: true,
          labels: {
            where: {
              category: 'goal',
              key: 'primary_goal',
            },
            take: 1,
          },
        },
        orderBy: {
          lastCheckin: 'desc',
        },
      });

      console.log(`[List Clients] Found ${clientProfiles.length} clients`);

      const clients = clientProfiles.map((profile: typeof clientProfiles[number]) => {
        const goalLabel = profile.labels[0];
        const goal = goalLabel
          ? goalLabel.value.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          : 'Not Set';

        return {
          id: profile.id,
          name: profile.user.name,
          membershipNumber: profile.membershipNumber || 'N/A',
          planStatus: profile.planStatus,
          adherence: profile.adherence,
          lastCheckin: formatTimeAgo(profile.lastCheckin),
          email: profile.user.email,
          startDate: profile.startDate?.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) || 'Not Set',
          goal,
        };
      });

      return { clients };
    } catch (error) {
      console.error('[List Clients] Error fetching clients:', error);
      throw new Error('Failed to fetch clients');
    }
  });
