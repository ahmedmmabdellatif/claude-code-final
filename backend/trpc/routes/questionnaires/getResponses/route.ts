import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import db from "../../../../db";

export const getResponsesProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
      questionnaireId: z.string().optional(),
      templateType: z.string().optional(),
      limit: z.number().default(10),
    })
  )
  .query(async ({ input }) => {
    console.log("[Questionnaire] Fetching responses for:", input.clientId);

    const where: any = {
      clientId: input.clientId,
    };

    if (input.questionnaireId) {
      where.templateId = input.questionnaireId;
    }

    if (input.templateType) {
      where.templateType = input.templateType;
    }

    const [responses, total] = await Promise.all([
      db.questionnaireResponse.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: input.limit,
      }),
      db.questionnaireResponse.count({ where }),
    ]);

    return {
      success: true,
      data: responses.map((r: typeof responses[number]) => ({
        id: r.id,
        clientId: r.clientId,
        questionnaireId: r.templateId,
        questionnaireName: r.templateName,
        templateType: r.templateType,
        responses: r.responses as Record<string, any>,
        submittedAt: r.createdAt.toISOString(),
      })),
      total,
    };
  });
