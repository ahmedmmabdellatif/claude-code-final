import { serve } from '@hono/node-server';
import app from './backend/hono';

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Server is running on port ${port}`);
console.log(`📡 TRPC endpoint: /api/trpc`);
console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);

serve({
  fetch: app.fetch,
  port
});
