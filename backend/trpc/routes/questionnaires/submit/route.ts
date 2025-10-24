import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import db from "../../../../db";

export const submitProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
      questionnaireId: z.string(),
      questionnaireName: z.string(),
      templateType: z.string().default("monthly"),
      responses: z.record(z.string(), z.any()),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Questionnaire] Submitting response:", input.clientId);

    const response = await db.questionnaireResponse.create({
      data: {
        clientId: input.clientId,
        templateId: input.questionnaireId,
        templateName: input.questionnaireName,
        templateType: input.templateType,
        responses: input.responses,
      },
    });

    console.log("[Questionnaire] Response saved:", response.id);

    if (input.templateType === "initial") {
      console.log("[Questionnaire] Habit questionnaire completed - client ready for tracking");
    } else if (input.templateType === "monthly") {
      console.log("[Questionnaire] Monthly check-in completed - ready for plan update analysis");
    }

    return {
      success: true,
      data: {
        id: response.id,
        clientId: response.clientId,
        questionnaireId: response.templateId,
        questionnaireName: response.templateName,
        responses: response.responses as Record<string, any>,
        submittedAt: response.createdAt.toISOString(),
      },
    };
  });
