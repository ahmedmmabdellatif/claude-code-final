import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import prisma from "./db";

const app = new Hono();

app.use("*", cors());

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: "/api/trpc",
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// Diagnostic endpoint to debug Railway issues
app.get("/debug", async (c) => {
  try {
    const results: any = {
      environment: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "...",
    };

    // Test database connection
    try {
      await prisma.$connect();
      results.databaseConnection = "✅ Connected";

      // Check if test users exist
      const users = await prisma.user.findMany({
        where: {
          email: {
            in: ['coach@test.com', 'client@test.com']
          }
        },
        select: { email: true, role: true }
      });

      results.testUsers = users;
      results.testUsersCount = users.length;

      await prisma.$disconnect();
    } catch (dbError: any) {
      results.databaseConnection = "❌ Failed";
      results.databaseError = dbError.message;
    }

    return c.json(results);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
