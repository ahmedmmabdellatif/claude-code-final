import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const labelSchema = z.object({
  labels: z.array(
    z.object({
      category: z.enum(["goal", "health", "preference", "experience", "constraint", "metric"]),
      key: z.string(),
      value: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
});

type OnboardingData = {
  age?: number;
  height?: number;
  weight?: number;
  heightUnit?: string;
  weightUnit?: string;
  goal?: string;
  experience?: string;
  location?: string;
  frequency?: number;
  injuries?: string[];
  medicalConditions?: string[];
  dietaryRestrictions?: string[];
  dietType?: string;
};

export async function extractLabelsFromOnboarding(
  onboardingData: OnboardingData
): Promise<{
  category: "goal" | "health" | "preference" | "experience" | "constraint" | "metric";
  key: string;
  value: string;
  confidence: number;
}[]> {
  console.log("[LabelExtractor] Starting label extraction from onboarding data");

  const prompt = `You are a fitness coach assistant. Analyze the following client onboarding data and extract meaningful labels that will be used to create a personalized fitness plan.

Client Data:
${JSON.stringify(onboardingData, null, 2)}

Extract labels in the following categories:
1. "goal" - Main fitness goals (e.g., fat_loss, muscle_gain, body_recomposition, strength, endurance)
2. "health" - Health-related concerns (e.g., knee_injury, lower_back_issue, diabetes, high_blood_pressure)
3. "preference" - Training preferences (e.g., gym_access, home_workout, prefers_cardio, prefers_weights)
4. "experience" - Training experience level (e.g., beginner, intermediate, advanced)
5. "constraint" - Limitations or constraints (e.g., limited_mobility, time_constrained, equipment_limited)
6. "metric" - Important metrics (e.g., starting_weight, target_weight, bmi, age_group)

Guidelines:
- Be specific and actionable
- Use snake_case for keys and values
- Assign confidence scores based on how explicit the data is (0.9-1.0 for explicit, 0.6-0.8 for inferred)
- Extract multiple labels if applicable
- Focus on labels that will help AI and coach create better plans

Example labels:
- { category: "goal", key: "primary_goal", value: "fat_loss", confidence: 1.0 }
- { category: "health", key: "injury", value: "knee_pain", confidence: 0.9 }
- { category: "preference", key: "training_location", value: "gym", confidence: 1.0 }
- { category: "experience", key: "training_level", value: "beginner", confidence: 0.95 }
- { category: "constraint", key: "dietary", value: "pescatarian", confidence: 1.0 }
- { category: "metric", key: "starting_weight_kg", value: "71.2", confidence: 1.0 }`;

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: process.env.AI_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse the JSON response
    const result = JSON.parse(content.text);
    const validatedResult = labelSchema.parse(result);

    console.log(`[LabelExtractor] Extracted ${validatedResult.labels.length} labels`);
    return validatedResult.labels;
  } catch (error) {
    console.error("[LabelExtractor] Error extracting labels:", error);
    throw new Error("Failed to extract labels from onboarding data");
  }

  /* Original code using Rork SDK - commented out for reference:
  try {
    const result = await generateObject({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      schema: labelSchema,
    });

    console.log(`[LabelExtractor] Extracted ${result.labels.length} labels`);
    return result.labels;
  } catch (error) {
    console.error("[LabelExtractor] Error extracting labels:", error);
    throw new Error("Failed to extract labels from onboarding data");
  }
  */
}

export async function extractLabelsFromQuestionnaire(
  questionnaireData: Record<string, any>,
  questionnaireName: string
): Promise<{
  category: "goal" | "health" | "preference" | "experience" | "constraint" | "metric";
  key: string;
  value: string;
  confidence: number;
}[]> {
  console.log("[LabelExtractor] Starting label extraction from questionnaire");

  const prompt = `You are a fitness coach assistant. Analyze the following client questionnaire responses and extract updated or new labels.

Questionnaire: ${questionnaireName}
Responses:
${JSON.stringify(questionnaireData, null, 2)}

Extract labels that show:
1. Changes in goals or motivation
2. New health concerns or improvements
3. Changed preferences (workout difficulty, meal satisfaction, timing)
4. Progress indicators (strength gains, energy levels, mood)
5. New constraints or challenges

Use the same categories and format as before:
- "goal", "health", "preference", "experience", "constraint", "metric"

Focus on actionable insights that can help update the client's plan.`;

  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await client.messages.create({
      model: process.env.AI_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse the JSON response
    const result = JSON.parse(content.text);
    const validatedResult = labelSchema.parse(result);

    console.log(`[LabelExtractor] Extracted ${validatedResult.labels.length} labels from questionnaire`);
    return validatedResult.labels;
  } catch (error) {
    console.error("[LabelExtractor] Error extracting labels from questionnaire:", error);
    throw new Error("Failed to extract labels from questionnaire");
  }

  /* Original code using Rork SDK - commented out for reference:
  try {
    const result = await generateObject({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      schema: labelSchema,
    });

    console.log(`[LabelExtractor] Extracted ${result.labels.length} labels from questionnaire`);
    return result.labels;
  } catch (error) {
    console.error("[LabelExtractor] Error extracting labels from questionnaire:", error);
    throw new Error("Failed to extract labels from questionnaire");
  }
  */
}
