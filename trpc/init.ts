import { db } from '@/db';
import { users } from '@/db/schema';
import { rateLimit } from '@/lib/ratelimit';
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
//  
// /**
//  * This context creator accepts `headers` so it can be reused in both
//  * the RSC server caller (where you pass `next/headers`) and the
//  * API route handler (where you pass the request headers).
//  */
// export const createTRPCContext = async (opts: { headers: Headers }) => {
//   // const user = await auth(opts.headers);
//   return { userId: 'user_123' };
// };
//  
// // Avoid exporting the entire t-object
// // since it's not very descriptive.
// // For instance, the use of a t variable
// // is common in i18n libraries.
// const t = initTRPC
//   .context<Awaited<ReturnType<typeof createTRPCContext>>>()
//   .create({
//     /**
//      * @see https://trpc.io/docs/server/data-transformers
//      */
//     // transformer: superjson,
//   });
//  
// // Base router and procedure helpers
// export const createTRPCRouter = t.router;
// export const createCallerFactory = t.createCallerFactory;
// export const baseProcedure = t.procedure;
import {cache} from 'react';
import superjson from 'superjson';

export const createTRPCContext = cache(async () => {
  const { userId } = await auth();

  console.log("=== TRPC CONTEXT DEBUG ===");
  console.log("User ID:", userId);
  console.log("==========================");

  return { clerkUserId: userId };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const {ctx} = opts;

  console.log("--> 1. ctx.clerkUserId:", ctx.clerkUserId);

  if(!ctx.clerkUserId) {
    console.log("--> FAILED AT STEP 1: ctx.clerkUserId is missing or undefined");
    throw new TRPCError({ code: 'UNAUTHORIZED'});
  }

  const [user] = await db
  .select()
  .from(users)
  .where(eq(users.clerkId, ctx.clerkUserId))
  .limit(1);

  console.log("--> 2. Database query result:", user);

  if(!user) {
    console.log(`--> FAILED AT STEP 2: No user in DB matching clerkId = "${ctx.clerkUserId}"`);
    throw new TRPCError({ code: 'UNAUTHORIZED'});
  }

  const {success} = await rateLimit.limit(user.id);

  if(!success) {
    throw new TRPCError({code: "TOO_MANY_REQUESTS"});
  }

  return opts.next({
    ctx: {
      ...ctx,
      user
    }
  })
})