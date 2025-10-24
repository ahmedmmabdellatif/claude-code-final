import { publicProcedure } from "../../../create-context";
import prisma from "../../../../db";

// Hydration guidelines are read-only reference data
export const getHydrationGuidelinesProcedure = publicProcedure.query(async () => {
  try {
    const guidelines = await prisma.hydrationGuideline.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return { guidelines };
  } catch (error) {
    console.error('[CMS] Error fetching hydration guidelines:', error);
    throw new Error('Failed to fetch hydration guidelines');
  }
});
