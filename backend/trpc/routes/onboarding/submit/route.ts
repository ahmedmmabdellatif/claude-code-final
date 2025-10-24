import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import db from "../../../../db";
import { extractLabelsFromOnboarding } from "../../../../services/labelExtractor";

export const submitOnboardingProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
      age: z.number().optional(),
      height: z.number().optional(),
      weight: z.number().optional(),
      heightUnit: z.string().optional(),
      weightUnit: z.string().optional(),
      goal: z.string().optional(),
      experience: z.string().optional(),
      location: z.string().optional(),
      frequency: z.number().optional(),
      injuries: z.array(z.string()).optional(),
      medicalConditions: z.array(z.string()).optional(),
      dietaryRestrictions: z.array(z.string()).optional(),
      dietType: z.string().optional(),
      frontPhotoUrl: z.string().optional(),
      sidePhotoUrl: z.string().optional(),
      backPhotoUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Onboarding] Submitting onboarding data for client:", input.clientId);

    try {
      const onboardingData = await db.onboardingData.upsert({
        where: { clientId: input.clientId },
        create: {
          clientId: input.clientId,
          age: input.age,
          height: input.height,
          weight: input.weight,
          heightUnit: input.heightUnit,
          weightUnit: input.weightUnit,
          goal: input.goal,
          experience: input.experience,
          location: input.location,
          frequency: input.frequency,
          injuries: input.injuries || [],
          medicalConditions: input.medicalConditions || [],
          dietaryRestrictions: input.dietaryRestrictions || [],
          dietType: input.dietType,
          frontPhotoUrl: input.frontPhotoUrl,
          sidePhotoUrl: input.sidePhotoUrl,
          backPhotoUrl: input.backPhotoUrl,
        },
        update: {
          age: input.age,
          height: input.height,
          weight: input.weight,
          heightUnit: input.heightUnit,
          weightUnit: input.weightUnit,
          goal: input.goal,
          experience: input.experience,
          location: input.location,
          frequency: input.frequency,
          injuries: input.injuries || [],
          medicalConditions: input.medicalConditions || [],
          dietaryRestrictions: input.dietaryRestrictions || [],
          dietType: input.dietType,
          frontPhotoUrl: input.frontPhotoUrl,
          sidePhotoUrl: input.sidePhotoUrl,
          backPhotoUrl: input.backPhotoUrl,
          updatedAt: new Date(),
        },
      });

      console.log("[Onboarding] Onboarding data saved, extracting labels...");

      const extractedLabels = await extractLabelsFromOnboarding({
        age: input.age,
        height: input.height,
        weight: input.weight,
        heightUnit: input.heightUnit,
        weightUnit: input.weightUnit,
        goal: input.goal,
        experience: input.experience,
        location: input.location,
        frequency: input.frequency,
        injuries: input.injuries,
        medicalConditions: input.medicalConditions,
        dietaryRestrictions: input.dietaryRestrictions,
        dietType: input.dietType,
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

      console.log(`[Onboarding] Extracted ${createdLabels.count} labels`);

      await db.clientProfile.update({
        where: { id: input.clientId },
        data: {
          planStatus: "pending",
          updatedAt: new Date(),
        },
      });

      const labels = await db.clientLabel.findMany({
        where: { clientId: input.clientId },
        orderBy: [{ category: "asc" }, { key: "asc" }],
      });

      return {
        success: true,
        onboarding: onboardingData,
        labels,
        labelsCount: createdLabels.count,
        message: "Onboarding completed successfully. Labels extracted and saved.",
      };
    } catch (error) {
      console.error("[Onboarding] Error submitting onboarding:", error);
      throw error;
    }
  });

export const getOnboardingProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("[Onboarding] Fetching onboarding data for client:", input.clientId);

    try {
      const onboardingData = await db.onboardingData.findUnique({
        where: { clientId: input.clientId },
      });

      if (!onboardingData) {
        return {
          success: false,
          message: "Onboarding data not found",
        };
      }

      return {
        success: true,
        data: onboardingData,
      };
    } catch (error) {
      console.error("[Onboarding] Error fetching onboarding:", error);
      throw error;
    }
  });
