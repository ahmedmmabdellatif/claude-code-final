import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import prisma from '../../../../db';
import * as bcrypt from 'bcryptjs';
import { JWTService } from '../../../../services/jwtService';

export const registerProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
      role: z.enum(['client', 'coach']),
    })
  )
  .mutation(async ({ input }) => {
    const { email, password, name, role } = input;

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          ...(role === 'coach'
            ? { coachProfile: { create: {} } }
            : {
                clientProfile: {
                  create: {
                    membershipNumber: `#${Date.now().toString().slice(-6)}`,
                    startDate: new Date(),
                    planStatus: 'pending',
                  },
                },
              }),
        },
        include: {
          coachProfile: true,
          clientProfile: true,
        },
      });

      console.log('[Register] Created user:', user.id, user.email, user.role);

      // Generate JWT token
      const token = JWTService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role as 'client' | 'coach',
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    } catch (error) {
      console.error('[Register] Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create account');
    }
  });
