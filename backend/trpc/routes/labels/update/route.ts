import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import db from "../../../../db";

export const updateLabelProcedure = publicProcedure
  .input(
    z.object({
      labelId: z.string(),
      value: z.string().optional(),
      confidence: z.number().min(0).max(1).optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Labels] Updating label:", input.labelId);

    try {
      const updatedLabel = await db.clientLabel.update({
        where: { id: input.labelId },
        data: {
          ...(input.value && { value: input.value }),
          ...(input.confidence !== undefined && { confidence: input.confidence }),
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        label: updatedLabel,
      };
    } catch (error) {
      console.error("[Labels] Error updating label:", error);
      throw error;
    }
  });

export const deleteLabelProcedure = publicProcedure
  .input(
    z.object({
      labelId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Labels] Deleting label:", input.labelId);

    try {
      await db.clientLabel.delete({
        where: { id: input.labelId },
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("[Labels] Error deleting label:", error);
      throw error;
    }
  });

export const addLabelProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
      category: z.enum(["goal", "health", "preference", "experience", "constraint", "metric"]),
      key: z.string(),
      value: z.string(),
      confidence: z.number().min(0).max(1).default(1.0),
      source: z.string().default("manual"),
    })
  )
  .mutation(async ({ input }) => {
    console.log("[Labels] Adding label for client:", input.clientId);

    try {
      const newLabel = await db.clientLabel.create({
        data: {
          clientId: input.clientId,
          category: input.category,
          key: input.key,
          value: input.value,
          confidence: input.confidence,
          source: input.source,
        },
      });

      return {
        success: true,
        label: newLabel,
      };
    } catch (error) {
      console.error("[Labels] Error adding label:", error);
      throw error;
    }
  });
