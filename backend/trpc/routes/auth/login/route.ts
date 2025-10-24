import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import prisma from '../../../../db';
import * as bcrypt from 'bcryptjs';
import { JWTService } from '../../../../services/jwtService';

export const loginProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['client', 'coach']),
    })
  )
  .mutation(async ({ input }) => {
    const { email, password, role } = input;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          coachProfile: true,
          clientProfile: true,
        },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      if (user.role !== role) {
        throw new Error('Invalid role for this account');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

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
          role: user.role,
          name: user.name,
        },
        token,
      };
    } catch (error) {
      console.error('[Login] Error:', error);
      throw new Error('Invalid email or password');
    }
  });
