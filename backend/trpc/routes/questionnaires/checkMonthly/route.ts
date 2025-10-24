import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import db from "../../../../db";

export const checkMonthlyProcedure = publicProcedure
  .input(z.object({ clientId: z.string() }))
  .query(async ({ input }) => {
    console.log("[Monthly Check] Checking if monthly questionnaire is due for:", input.clientId);

    const activePlan = await db.plan.findFirst({
      where: {
        clientId: input.clientId,
        status: "active",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activePlan) {
      return {
        isDue: false,
        message: "No active plan found",
      };
    }

    const lastMonthlyResponse = await db.questionnaireResponse.findFirst({
      where: {
        clientId: input.clientId,
        templateType: "monthly",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!lastMonthlyResponse) {
      const daysSincePlanStart = activePlan.startDate
        ? Math.floor(
            (new Date().getTime() - activePlan.startDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;

      if (daysSincePlanStart >= 30) {
        return {
          isDue: true,
          message: "First monthly check-in is due (30+ days since plan start)",
          daysSinceLast: daysSincePlanStart,
          planVersion: activePlan.version,
        };
      }

      return {
        isDue: false,
        message: `First monthly check-in not yet due (${daysSincePlanStart} days since plan start)`,
      };
    }

    const daysSinceLastResponse = Math.floor(
      (new Date().getTime() - lastMonthlyResponse.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastResponse >= 30) {
      return {
        isDue: true,
        message: "Monthly check-in is due",
        daysSinceLast: daysSinceLastResponse,
        planVersion: activePlan.version,
      };
    }

    return {
      isDue: false,
      message: `Next check-in in ${30 - daysSinceLastResponse} days`,
      daysSinceLast: daysSinceLastResponse,
    };
  });

export const triggerMonthlyNotificationProcedure = publicProcedure
  .input(z.object({ clientId: z.string() }))
  .mutation(async ({ input }) => {
    console.log("[Monthly Check] Triggering notification for:", input.clientId);

    const client = await db.clientProfile.findUnique({
      where: { id: input.clientId },
      include: { user: true },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    await db.notification.create({
      data: {
        userId: client.userId,
        type: "system_update",
        title: "Monthly Check-In Time!",
        body: "It's time for your monthly progress check-in. This helps us track your progress and adjust your plan if needed.",
        data: {
          action: "open_questionnaire",
          questionnaireType: "monthly",
        },
      },
    });

    console.log("[Monthly Check] Notification created for client:", input.clientId);

    return {
      success: true,
      message: "Monthly questionnaire notification sent",
    };
  });
