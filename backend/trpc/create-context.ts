import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  let user: { id: string; email: string; role: 'client' | 'coach'; name: string } | null = null;
  
  if (token && token.startsWith('mock-token-')) {
    const userId = token.replace('mock-token-', '');
    
    const MOCK_USERS: Record<string, { id: string; email: string; role: 'client' | 'coach'; name: string }> = {
      'coach-1': { id: 'coach-1', email: 'coach@test.com', role: 'coach', name: 'Coach Sarah' },
      'client-1': { id: 'client-1', email: 'client@test.com', role: 'client', name: 'Ahmed Hassan' },
    };
    
    user = MOCK_USERS[userId] || null;
  }
  
  return {
    req: opts.req,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new Error('Not authenticated');
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
