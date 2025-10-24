import { publicProcedure } from "../../../create-context";
import { z } from "zod";

type QuestionnaireResponse = {
  id: string;
  clientId: string;
  questionnaireId: string;
  questionnaireName: string;
  responses: Record<string, any>;
  submittedAt: string;
};

let mockResponses: QuestionnaireResponse[] = [
  {
    id: "resp-1",
    clientId: "client-1",
    questionnaireId: "monthly-checkin-v1",
    questionnaireName: "Monthly Progress Check-In",
    responses: {
      "energy-level": 8,
      "hunger-level": 5,
      "sleep-quality": 7,
      mood: "Good",
      "workout-difficulty": "Just Right",
      "meal-satisfaction": "Satisfied",
      "stress-level": 4,
      "noticed-changes": ["Increased strength", "Better endurance", "More energy"],
      challenges: ["No challenges"],
      "additional-comments": "Feeling great! Workouts are challenging but rewarding.",
    },
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "resp-2",
    clientId: "client-1",
    questionnaireId: "monthly-checkin-v1",
    questionnaireName: "Monthly Progress Check-In",
    responses: {
      "energy-level": 7,
      "hunger-level": 6,
      "sleep-quality": 6,
      mood: "Neutral",
      "workout-difficulty": "Challenging but Doable",
      "meal-satisfaction": "Neutral",
      "stress-level": 6,
      "noticed-changes": ["Increased strength", "Muscle gain"],
      challenges: ["Time management", "Too hungry"],
      "additional-comments": "Workouts are getting harder, but I'm seeing results.",
    },
    submittedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

type ComparisonResult = {
  questionId: string;
  question: string;
  type: string;
  current: any;
  previous: any;
  change?: number | string;
  trend?: "improved" | "declined" | "stable";
};

export const compareProcedure = publicProcedure
  .input(
    z.object({
      currentResponseId: z.string(),
      previousResponseId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("[Questionnaire] Comparing responses:", input);

    const current = mockResponses.find((r) => r.id === input.currentResponseId);
    const previous = mockResponses.find((r) => r.id === input.previousResponseId);

    if (!current || !previous) {
      return {
        success: false,
        error: "Responses not found",
      };
    }

    const comparison: ComparisonResult[] = [];

    const questionDefinitions = {
      "energy-level": { question: "Energy Levels", type: "scale" },
      "hunger-level": { question: "Hunger Levels", type: "scale" },
      "sleep-quality": { question: "Sleep Quality", type: "scale" },
      "stress-level": { question: "Stress Levels", type: "scale" },
      mood: { question: "Overall Mood", type: "radio" },
      "workout-difficulty": { question: "Workout Difficulty", type: "radio" },
      "meal-satisfaction": { question: "Meal Satisfaction", type: "radio" },
      "noticed-changes": { question: "Noticed Changes", type: "checkbox" },
      challenges: { question: "Challenges", type: "checkbox" },
      "additional-comments": { question: "Additional Comments", type: "text" },
    };

    Object.keys(current.responses).forEach((key) => {
      const def = questionDefinitions[key as keyof typeof questionDefinitions];
      if (!def) return;

      const currentValue = current.responses[key];
      const previousValue = previous.responses[key];

      const result: ComparisonResult = {
        questionId: key,
        question: def.question,
        type: def.type,
        current: currentValue,
        previous: previousValue,
      };

      if (def.type === "scale" && typeof currentValue === "number" && typeof previousValue === "number") {
        result.change = currentValue - previousValue;
        if (key === "stress-level") {
          result.trend = currentValue < previousValue ? "improved" : currentValue > previousValue ? "declined" : "stable";
        } else {
          result.trend = currentValue > previousValue ? "improved" : currentValue < previousValue ? "declined" : "stable";
        }
      }

      comparison.push(result);
    });

    return {
      success: true,
      data: {
        current: {
          id: current.id,
          submittedAt: current.submittedAt,
        },
        previous: {
          id: previous.id,
          submittedAt: previous.submittedAt,
        },
        comparison,
      },
    };
  });
