import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import db from "../../../../db";

export const getClientLabelsProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
      category: z.enum(["goal", "health", "preference", "experience", "constraint", "metric"]).optional(),
    })
  )
  .query(async ({ input }) => {
    console.log("[Labels] Fetching labels for client:", input.clientId);

    try {
      const labels = await db.clientLabel.findMany({
        where: {
          clientId: input.clientId,
          ...(input.category && { category: input.category }),
        },
        orderBy: [
          { category: "asc" },
          { confidence: "desc" },
          { key: "asc" },
        ],
      });

      type LabelType = (typeof labels)[number];
      const groupedLabels: Record<string, LabelType[]> = {};
      for (const label of labels) {
        if (!groupedLabels[label.category]) {
          groupedLabels[label.category] = [];
        }
        groupedLabels[label.category].push(label);
      }

      return {
        success: true,
        labels,
        grouped: groupedLabels,
        count: labels.length,
      };
    } catch (error) {
      console.error("[Labels] Error fetching labels:", error);
      throw error;
    }
  });

export const getLabelSummaryProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("[Labels] Fetching label summary for client:", input.clientId);

    try {
      const labels = await db.clientLabel.findMany({
        where: { clientId: input.clientId },
        orderBy: [{ category: "asc" }, { confidence: "desc" }],
      });

      type LabelType = (typeof labels)[number];

      const goalLabels = labels.filter((l: LabelType) => l.category === "goal");
      const healthLabels = labels.filter((l: LabelType) => l.category === "health");
      const preferenceLabels = labels.filter((l: LabelType) => l.category === "preference");
      const experienceLabel = labels.find((l: LabelType) => l.category === "experience" && l.key === "training_level");
      const constraintLabels = labels.filter((l: LabelType) => l.category === "constraint");
      const metricLabels = labels.filter((l: LabelType) => l.category === "metric");

      const keyMetrics: Record<string, string> = {};
      for (const l of metricLabels) {
        keyMetrics[l.key] = l.value;
      }

      const summary = {
        goals: goalLabels.map((l: LabelType) => `${l.key}: ${l.value}`),
        healthConcerns: healthLabels.map((l: LabelType) => l.value),
        preferences: preferenceLabels.map((l: LabelType) => `${l.key}: ${l.value}`),
        experienceLevel: experienceLabel?.value || "unknown",
        constraints: constraintLabels.map((l: LabelType) => l.value),
        keyMetrics,
      };

      return {
        success: true,
        summary,
        totalLabels: labels.length,
      };
    } catch (error) {
      console.error("[Labels] Error fetching label summary:", error);
      throw error;
    }
  });
