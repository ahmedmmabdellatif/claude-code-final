import { publicProcedure } from "../../../create-context";
import { z } from "zod";

type Question = {
  id: string;
  type: "text" | "number" | "radio" | "checkbox" | "scale";
  question: string;
  options?: string[];
  required: boolean;
  min?: number;
  max?: number;
};

type QuestionnaireTemplate = {
  id: string;
  name: string;
  type: "monthly" | "initial" | "custom";
  questions: Question[];
};

const HABIT_QUESTIONNAIRE: QuestionnaireTemplate = {
  id: "habit-form-v1",
  name: "Habit & Lifestyle Questionnaire",
  type: "initial",
  questions: [
    {
      id: "preferred-training-time",
      type: "radio",
      question: "When do you prefer to train?",
      options: ["Early Morning (5-8 AM)", "Morning (8-11 AM)", "Afternoon (12-4 PM)", "Evening (5-8 PM)", "Night (8 PM+)"],
      required: true,
    },
    {
      id: "energy-peak",
      type: "radio",
      question: "When is your energy typically highest?",
      options: ["Morning", "Afternoon", "Evening", "Varies daily"],
      required: true,
    },
    {
      id: "typical-sleep-hours",
      type: "number",
      question: "How many hours do you typically sleep per night?",
      required: true,
      min: 3,
      max: 12,
    },
    {
      id: "work-schedule",
      type: "radio",
      question: "What is your work schedule like?",
      options: ["9-5 desk job", "Shift work", "Irregular hours", "Remote/flexible", "Physical job", "Not currently working"],
      required: true,
    },
    {
      id: "meal-prep-ability",
      type: "radio",
      question: "How would you rate your meal prep ability?",
      options: ["Expert - I love cooking", "Moderate - Can follow recipes", "Beginner - Prefer simple meals", "None - Rarely cook"],
      required: true,
    },
    {
      id: "eating-out-frequency",
      type: "radio",
      question: "How often do you eat out or order takeout?",
      options: ["Rarely (0-1x/week)", "Occasionally (2-3x/week)", "Often (4-5x/week)", "Very often (6+ times/week)"],
      required: true,
    },
    {
      id: "stress-triggers",
      type: "checkbox",
      question: "What are your main stress triggers?",
      options: ["Work", "Family", "Finances", "Health concerns", "Relationships", "Time pressure", "None/Low stress"],
      required: false,
    },
    {
      id: "recovery-methods",
      type: "checkbox",
      question: "What recovery methods do you currently use?",
      options: ["Stretching", "Foam rolling", "Massage", "Hot/cold therapy", "Yoga", "Rest days", "None"],
      required: false,
    },
    {
      id: "lifestyle-notes",
      type: "text",
      question: "Any other lifestyle factors we should know about? (travel, irregular schedule, etc.)",
      required: false,
    },
  ],
};

const MONTHLY_QUESTIONNAIRE: QuestionnaireTemplate = {
  id: "monthly-checkin-v1",
  name: "Monthly Progress Check-In",
  type: "monthly",
  questions: [
    {
      id: "energy-level",
      type: "scale",
      question: "How would you rate your energy levels this month?",
      required: true,
      min: 1,
      max: 10,
    },
    {
      id: "hunger-level",
      type: "scale",
      question: "How would you rate your hunger levels?",
      required: true,
      min: 1,
      max: 10,
    },
    {
      id: "sleep-quality",
      type: "scale",
      question: "How is your sleep quality?",
      required: true,
      min: 1,
      max: 10,
    },
    {
      id: "mood",
      type: "radio",
      question: "How has your overall mood been?",
      options: ["Excellent", "Good", "Neutral", "Below Average", "Poor"],
      required: true,
    },
    {
      id: "workout-difficulty",
      type: "radio",
      question: "How do the workouts feel?",
      options: ["Too Easy", "Just Right", "Challenging but Doable", "Too Hard"],
      required: true,
    },
    {
      id: "meal-satisfaction",
      type: "radio",
      question: "Are you satisfied with your meal plan?",
      options: ["Very Satisfied", "Satisfied", "Neutral", "Unsatisfied", "Very Unsatisfied"],
      required: true,
    },
    {
      id: "stress-level",
      type: "scale",
      question: "How would you rate your stress levels?",
      required: true,
      min: 1,
      max: 10,
    },
    {
      id: "noticed-changes",
      type: "checkbox",
      question: "What changes have you noticed?",
      options: [
        "Increased strength",
        "Better endurance",
        "Weight loss",
        "Muscle gain",
        "Better mood",
        "Improved sleep",
        "More energy",
        "Better recovery",
        "No noticeable changes",
      ],
      required: false,
    },
    {
      id: "challenges",
      type: "checkbox",
      question: "What challenges are you facing?",
      options: [
        "Time management",
        "Lack of motivation",
        "Too hungry",
        "Too tired",
        "Workouts too hard",
        "Meal prep difficulties",
        "Travel/schedule disruptions",
        "Injury or pain",
        "No challenges",
      ],
      required: false,
    },
    {
      id: "additional-comments",
      type: "text",
      question: "Any additional comments or feedback?",
      required: false,
    },
  ],
};

export const getTemplateProcedure = publicProcedure
  .input(
    z.object({
      type: z.enum(["monthly", "initial", "custom"]).default("monthly"),
    })
  )
  .query(async ({ input }) => {
    console.log("[Questionnaire] Fetching template:", input.type);

    if (input.type === "monthly") {
      return {
        success: true,
        data: MONTHLY_QUESTIONNAIRE,
      };
    }

    if (input.type === "initial") {
      return {
        success: true,
        data: HABIT_QUESTIONNAIRE,
      };
    }

    return {
      success: false,
      error: "Template not found",
    };
  });
