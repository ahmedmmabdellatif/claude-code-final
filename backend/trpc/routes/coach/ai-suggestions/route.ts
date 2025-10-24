import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import db from "../../../../db";
import { generateAIPlan } from "../../../../services/aiPlanGenerator";

export const aiSuggestionsProcedure = publicProcedure
  .input(z.object({ clientId: z.string() }))
  .query(async ({ input }) => {
    console.log("[AI Suggestions] Fetching suggestions for client:", input.clientId);

    const onboarding = await db.onboardingData.findUnique({
      where: { clientId: input.clientId },
    });

    if (!onboarding) {
      throw new Error("Onboarding data not found");
    }

    const labels = await db.clientLabel.findMany({
      where: { clientId: input.clientId },
      orderBy: [{ category: "asc" }, { confidence: "desc" }],
    });

    console.log(`[AI Suggestions] Found ${labels.length} labels for client`);

    try {
      const aiPlanResult = await generateAIPlan({
        clientId: input.clientId,
        onboarding: {
          age: onboarding.age,
          height: onboarding.height,
          weight: onboarding.weight,
          heightUnit: onboarding.heightUnit,
          weightUnit: onboarding.weightUnit,
          goal: onboarding.goal,
          experience: onboarding.experience,
          location: onboarding.location,
          frequency: onboarding.frequency,
          injuries: onboarding.injuries,
          medicalConditions: onboarding.medicalConditions,
          dietaryRestrictions: onboarding.dietaryRestrictions,
          dietType: onboarding.dietType,
        },
        labels: labels.map((l: typeof labels[number]) => ({
          category: l.category,
          key: l.key,
          value: l.value,
          confidence: l.confidence,
        })),
      });

      console.log("[AI Suggestions] Plan generated successfully");

      return {
        success: true,
        clientProfile: {
          id: input.clientId,
          age: onboarding.age || 0,
          height: onboarding.height || 0,
          weight: onboarding.weight || 0,
          goal: onboarding.goal || "general_fitness",
          experience: onboarding.experience || "beginner",
          trainingDays: onboarding.frequency || 3,
          location: onboarding.location || "gym",
          dietType: onboarding.dietType || "none",
          labels: labels.length,
        },
        suggestedPlan: aiPlanResult.plan,
        metadata: aiPlanResult.metadata,
      };
    } catch (error) {
      console.error("[AI Suggestions] Error generating plan:", error);
      throw new Error(
        `Failed to generate AI suggestions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });
