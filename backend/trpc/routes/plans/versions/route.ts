import { publicProcedure } from "../../../create-context";
import { z } from "zod";

interface PlanVersion {
  id: string;
  clientId: number;
  planName: string;
  version: number;
  createdAt: string;
  createdBy: number;
  createdByName: string;
  status: 'active' | 'archived' | 'draft';
  durationWeeks: number;
  goal: string;
  workoutDays: {
    day: string;
    name: string;
    exercises: {
      name: string;
      sets: number;
      reps: string;
      rest: number;
    }[];
  }[];
  changes?: string[];
}

let mockPlanVersions: PlanVersion[] = [
  {
    id: 'v1',
    clientId: 1,
    planName: 'Body Recomposition Phase 1',
    version: 1,
    createdAt: '2025-09-15T10:00:00Z',
    createdBy: 1,
    createdByName: 'Coach Mike',
    status: 'archived',
    durationWeeks: 4,
    goal: 'Fat Loss & Muscle Building',
    workoutDays: [
      {
        day: 'Monday',
        name: 'Upper Body Push',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: 90 },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Shoulder Press', sets: 3, reps: '10-12', rest: 60 },
        ],
      },
    ],
  },
  {
    id: 'v2',
    clientId: 1,
    planName: 'Body Recomposition Phase 1',
    version: 2,
    createdAt: '2025-10-15T10:00:00Z',
    createdBy: 1,
    createdByName: 'Coach Mike',
    status: 'active',
    durationWeeks: 4,
    goal: 'Fat Loss & Muscle Building',
    workoutDays: [
      {
        day: 'Monday',
        name: 'Upper Body Push',
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: 120 },
          { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: 90 },
          { name: 'Shoulder Press', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Tricep Dips', sets: 3, reps: '10-12', rest: 60 },
        ],
      },
    ],
    changes: [
      'Increased weight intensity (lower rep ranges)',
      'Added tricep dips for better arm development',
      'Extended rest periods for heavier lifts',
    ],
  },
];

let nextId = 3;

export const listPlanVersionsProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.number(),
      planName: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    let versions = mockPlanVersions.filter((v) => v.clientId === input.clientId);
    
    if (input.planName) {
      versions = versions.filter((v) => v.planName === input.planName);
    }
    
    versions.sort((a, b) => b.version - a.version);
    
    return {
      versions: versions.map((v) => ({
        id: v.id,
        planName: v.planName,
        version: v.version,
        createdAt: v.createdAt,
        createdByName: v.createdByName,
        status: v.status,
        durationWeeks: v.durationWeeks,
        goal: v.goal,
        exerciseCount: v.workoutDays.reduce((sum, day) => sum + day.exercises.length, 0),
        dayCount: v.workoutDays.length,
        changes: v.changes,
      })),
    };
  });

export const getPlanVersionDetailProcedure = publicProcedure
  .input(
    z.object({
      versionId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const version = mockPlanVersions.find((v) => v.id === input.versionId);
    
    if (!version) {
      throw new Error('Plan version not found');
    }
    
    return { version };
  });

export const comparePlanVersionsProcedure = publicProcedure
  .input(
    z.object({
      versionId1: z.string(),
      versionId2: z.string(),
    })
  )
  .query(async ({ input }) => {
    const v1 = mockPlanVersions.find((v) => v.id === input.versionId1);
    const v2 = mockPlanVersions.find((v) => v.id === input.versionId2);
    
    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }
    
    const differences: string[] = [];
    
    if (v1.durationWeeks !== v2.durationWeeks) {
      differences.push(`Duration changed from ${v1.durationWeeks} to ${v2.durationWeeks} weeks`);
    }
    
    if (v1.workoutDays.length !== v2.workoutDays.length) {
      differences.push(`Workout days changed from ${v1.workoutDays.length} to ${v2.workoutDays.length}`);
    }
    
    const v1ExerciseCount = v1.workoutDays.reduce((sum, day) => sum + day.exercises.length, 0);
    const v2ExerciseCount = v2.workoutDays.reduce((sum, day) => sum + day.exercises.length, 0);
    
    if (v1ExerciseCount !== v2ExerciseCount) {
      differences.push(`Total exercises changed from ${v1ExerciseCount} to ${v2ExerciseCount}`);
    }
    
    return {
      version1: v1,
      version2: v2,
      differences,
    };
  });

export const createPlanVersionProcedure = publicProcedure
  .input(
    z.object({
      clientId: z.number(),
      planName: z.string(),
      durationWeeks: z.number(),
      goal: z.string(),
      workoutDays: z.array(
        z.object({
          day: z.string(),
          name: z.string(),
          exercises: z.array(
            z.object({
              name: z.string(),
              sets: z.number(),
              reps: z.string(),
              rest: z.number(),
            })
          ),
        })
      ),
      changes: z.array(z.string()).optional(),
      coachId: z.number(),
      coachName: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const existingVersions = mockPlanVersions.filter(
      (v) => v.clientId === input.clientId && v.planName === input.planName
    );
    
    existingVersions.forEach((v) => {
      if (v.status === 'active') {
        v.status = 'archived';
      }
    });
    
    const newVersion: PlanVersion = {
      id: `v${nextId++}`,
      clientId: input.clientId,
      planName: input.planName,
      version: existingVersions.length + 1,
      createdAt: new Date().toISOString(),
      createdBy: input.coachId,
      createdByName: input.coachName,
      status: 'active',
      durationWeeks: input.durationWeeks,
      goal: input.goal,
      workoutDays: input.workoutDays,
      changes: input.changes,
    };
    
    mockPlanVersions.push(newVersion);
    
    return {
      success: true,
      version: {
        id: newVersion.id,
        version: newVersion.version,
        createdAt: newVersion.createdAt,
      },
    };
  });

export const revertToPlanVersionProcedure = publicProcedure
  .input(
    z.object({
      versionId: z.string(),
      clientId: z.number(),
      coachId: z.number(),
      coachName: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const versionToRevert = mockPlanVersions.find((v) => v.id === input.versionId);
    
    if (!versionToRevert) {
      throw new Error('Version not found');
    }
    
    const existingVersions = mockPlanVersions.filter(
      (v) => v.clientId === input.clientId && v.planName === versionToRevert.planName
    );
    
    existingVersions.forEach((v) => {
      if (v.status === 'active') {
        v.status = 'archived';
      }
    });
    
    const newVersion: PlanVersion = {
      ...versionToRevert,
      id: `v${nextId++}`,
      version: existingVersions.length + 1,
      createdAt: new Date().toISOString(),
      createdBy: input.coachId,
      createdByName: input.coachName,
      status: 'active',
      changes: [`Reverted to version ${versionToRevert.version}`],
    };
    
    mockPlanVersions.push(newVersion);
    
    return {
      success: true,
      version: {
        id: newVersion.id,
        version: newVersion.version,
      },
    };
  });
