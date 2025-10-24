import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { extractLabelsFromOnboarding } from "../../../../services/labelExtractor";
import db from "../../../../db";

export const extractLabelsProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Labels] Extracting labels for client:", input.clientId);

    try {
      const onboardingData = await db.onboardingData.findUnique({
        where: { clientId: input.clientId },
      });

      if (!onboardingData) {
        throw new Error("Onboarding data not found");
      }

      const extractedLabels = await extractLabelsFromOnboarding({
        age: onboardingData.age ?? undefined,
        height: onboardingData.height ?? undefined,
        weight: onboardingData.weight ?? undefined,
        heightUnit: onboardingData.heightUnit ?? undefined,
        weightUnit: onboardingData.weightUnit ?? undefined,
        goal: onboardingData.goal ?? undefined,
        experience: onboardingData.experience ?? undefined,
        location: onboardingData.location ?? undefined,
        frequency: onboardingData.frequency ?? undefined,
        injuries: onboardingData.injuries,
        medicalConditions: onboardingData.medicalConditions,
        dietaryRestrictions: onboardingData.dietaryRestrictions,
        dietType: onboardingData.dietType ?? undefined,
      });

      await db.clientLabel.deleteMany({
        where: {
          clientId: input.clientId,
          source: "onboarding",
        },
      });

      const createdLabels = await db.clientLabel.createMany({
        data: extractedLabels.map((label) => ({
          clientId: input.clientId,
          category: label.category,
          key: label.key,
          value: label.value,
          confidence: label.confidence,
          source: "onboarding",
        })),
      });

      console.log(`[Labels] Created ${createdLabels.count} labels for client ${input.clientId}`);

      const allLabels = await db.clientLabel.findMany({
        where: { clientId: input.clientId },
        orderBy: [{ category: "asc" }, { key: "asc" }],
      });

      return {
        success: true,
        labels: allLabels,
        count: createdLabels.count,
      };
    } catch (error) {
      console.error("[Labels] Error extracting labels:", error);
      throw error;
    }
  });
