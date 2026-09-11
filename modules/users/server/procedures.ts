import { db } from "@/db";
import { subscriptions, users, videos, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { clerkUserId } = ctx;

      let viewerId: string | undefined;

      if (clerkUserId) {
        const [viewer] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.clerkId, clerkUserId))
          .limit(1);

        if (viewer) {
          viewerId = viewer.id;
        }
      }

      let targetUserId = input.id;

      if (targetUserId === "current") {
        if (!viewerId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not logged in",
          });
        }
        targetUserId = viewerId;
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, targetUserId))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const [subscriberCount, videoCount] = await Promise.all([
        db.$count(subscriptions, eq(subscriptions.creatorId, user.id)),
        db.$count(
          videos,
          and(eq(videos.userId, user.id), eq(videos.visibility, "public"))
        ),
      ]);

      const [viewsResult] = await db
        .select({
          totalViews: count(videoViews.videoId),
        })
        .from(videoViews)
        .innerJoin(videos, eq(videoViews.videoId, videos.id))
        .where(
          and(eq(videos.userId, user.id), eq(videos.visibility, "public"))
        );

      let isSubscribed = false;
      if (viewerId) {
        const subCount = await db.$count(
          subscriptions,
          and(
            eq(subscriptions.creatorId, user.id),
            eq(subscriptions.viewerId, viewerId)
          )
        );
        isSubscribed = subCount > 0;
      }

      return {
        ...user,
        subscriberCount,
        videoCount,
        viewCount: Number(viewsResult?.totalViews ?? 0),
        isSubscribed,
        isOwner: Boolean(viewerId && viewerId === user.id),
      };
    }),
});
