import { z } from 'zod';
import { publicProcedure } from "../../../create-context";
import db from "../../../../db";
import * as bcrypt from 'bcryptjs';

export const createClientProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log('[Create Client] Creating new client:', input.email);

    try {
      // Check if user with this email already exists
      const existingUser = await db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      // Get the coach's profile
      // For now, we'll get the first coach in the database
      // TODO: Use ctx.user to get the authenticated coach
      const coachUser = await db.user.findFirst({
        where: { role: 'coach' },
        include: { coachProfile: true },
      });

      if (!coachUser || !coachUser.coachProfile) {
        throw new Error('Coach profile not found');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Generate a unique membership number
      const membershipNumber = `#${Date.now().toString().slice(-6)}`;

      // Create the client user with profile
      const newClient = await db.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: 'client',
          clientProfile: {
            create: {
              membershipNumber,
              startDate: new Date(),
              planStatus: 'pending',
              adherence: 0,
              lastCheckin: new Date(),
              coachId: coachUser.coachProfile.id,
            },
          },
        },
        include: {
          clientProfile: true,
        },
      });

      console.log('[Create Client] Client created successfully:', newClient.email);

      return {
        success: true,
        client: {
          id: newClient.id,
          name: newClient.name,
          email: newClient.email,
          membershipNumber: newClient.clientProfile?.membershipNumber,
        },
      };
    } catch (error: any) {
      console.error('[Create Client] Error:', error);
      throw new Error(error.message || 'Failed to create client');
    }
  });
