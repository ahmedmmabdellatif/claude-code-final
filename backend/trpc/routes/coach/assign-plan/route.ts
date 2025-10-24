import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import db from "../../../../db";

const workoutDaySchema = z.object({
  day: z.string(),
  name: z.string(),
  description: z.string().optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string(),
      sets: z.number(),
      reps: z.string(),
      rest: z.number(),
      notes: z.string().optional(),
    })
  ),
});

const mealSchema = z.object({
  name: z.string(),
  time: z.string(),
  foods: z.array(
    z.object({
      foodId: z.string(),
      servings: z.number(),
      notes: z.string().optional(),
    })
  ),
  totalCalories: z.number(),
  totalProtein: z.number(),
  totalCarbs: z.number(),
  totalFat: z.number(),
});

export const assignPlanProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
      coachId: z.string(),
      planData: z.object({
        planName: z.string(),
        description: z.string(),
        goal: z.string(),
        durationWeeks: z.number(),
        workoutDays: z.array(workoutDaySchema),
        mealPlan: z.object({
          dailyMeals: z.array(mealSchema),
          targetCalories: z.number(),
          targetProtein: z.number(),
          targetCarbs: z.number(),
          targetFat: z.number(),
          notes: z.string().optional(),
        }),
      }),
      startDate: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Assign Plan] Assigning plan to client:", input.clientId);

    try {
      const existingClient = await db.clientProfile.findUnique({
        where: { id: input.clientId },
      });

      if (!existingClient) {
        throw new Error("Client not found");
      }

      const existingPlans = await db.plan.findMany({
        where: { clientId: input.clientId },
        orderBy: { version: "desc" },
        take: 1,
      });

      const newVersion = existingPlans.length > 0 ? existingPlans[0].version + 1 : 1;

      if (existingPlans.length > 0) {
        await db.plan.updateMany({
          where: {
            clientId: input.clientId,
            status: "active",
          },
          data: {
            status: "archived",
          },
        });
        console.log("[Assign Plan] Archived previous active plans");
      }

      const startDate = new Date(input.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + input.planData.durationWeeks * 7);

      const newPlan = await db.plan.create({
        data: {
          clientId: input.clientId,
          coachId: input.coachId,
          name: input.planData.planName,
          description: input.planData.description,
          goal: input.planData.goal,
          version: newVersion,
          status: "active",
          durationWeeks: input.planData.durationWeeks,
          startDate,
          endDate,
          workoutDays: input.planData.workoutDays as unknown as any,
          mealPlan: input.planData.mealPlan as unknown as any,
          changes: [
            newVersion === 1
              ? "Initial plan created"
              : `Version ${newVersion} - Updated plan`,
          ],
        },
      });

      console.log(`[Assign Plan] Created plan version ${newVersion} with ID: ${newPlan.id}`);

      const tasksToCreate = [];
      const currentDate = new Date(startDate);

      for (let week = 0; week < input.planData.durationWeeks; week++) {
        for (const workoutDay of input.planData.workoutDays) {
          const taskDate = new Date(currentDate);
          taskDate.setDate(currentDate.getDate() + week * 7);

          const dayIndex = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ].indexOf(workoutDay.day.toLowerCase());

          if (dayIndex !== -1) {
            taskDate.setDate(
              currentDate.getDate() + week * 7 + (dayIndex - currentDate.getDay() + 7) % 7
            );
          }

          if (workoutDay.exercises && workoutDay.exercises.length > 0) {
            tasksToCreate.push({
              planId: newPlan.id,
              clientId: input.clientId,
              type: "workout" as const,
              name: workoutDay.name,
              description: workoutDay.description || undefined,
              scheduledDate: taskDate,
              status: "pending" as const,
              exercises: workoutDay.exercises as unknown as any,
            });
          }
        }

        for (let day = 0; day < 7; day++) {
          const mealDate = new Date(currentDate);
          mealDate.setDate(currentDate.getDate() + week * 7 + day);

          for (const meal of input.planData.mealPlan.dailyMeals) {
            tasksToCreate.push({
              planId: newPlan.id,
              clientId: input.clientId,
              type: "meal" as const,
              name: meal.name,
              scheduledDate: mealDate,
              status: "pending" as const,
              mealType: meal.name,
              calories: meal.totalCalories,
            });
          }
        }
      }

      console.log(`[Assign Plan] Creating ${tasksToCreate.length} tasks...`);

      await db.task.createMany({
        data: tasksToCreate,
      });

      console.log(`[Assign Plan] Successfully created ${tasksToCreate.length} tasks`);

      const clientProfile = await db.clientProfile.update({
        where: { id: input.clientId },
        data: {
          planStatus: "active",
          updatedAt: new Date(),
        },
        include: { user: true },
      });

      const hasHabitQuestionnaire = await db.questionnaireResponse.findFirst({
        where: {
          clientId: input.clientId,
          templateType: "initial",
        },
      });

      if (!hasHabitQuestionnaire) {
        await db.notification.create({
          data: {
            userId: clientProfile.userId,
            type: "plan_assigned",
            title: "Your Plan is Ready!",
            body: "Complete the lifestyle questionnaire to help us personalize your plan scheduling and tracking.",
            data: {
              action: "open_habit_questionnaire",
              planId: newPlan.id,
            },
          },
        });
        console.log("[Assign Plan] Habit questionnaire notification sent");
      }

      const tasks = await db.task.findMany({
        where: { planId: newPlan.id },
        orderBy: { scheduledDate: "asc" },
        take: 10,
      });

      return {
        success: true,
        plan: {
          id: newPlan.id,
          name: newPlan.name,
          version: newPlan.version,
          status: newPlan.status,
          durationWeeks: newPlan.durationWeeks,
          startDate: newPlan.startDate,
          endDate: newPlan.endDate,
        },
        tasksCreated: tasksToCreate.length,
        sampleTasks: tasks,
      };
    } catch (error) {
      console.error("[Assign Plan] Error assigning plan:", error);
      throw new Error(
        `Failed to assign plan: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });
