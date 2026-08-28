import { db } from "@/db";
import { commentReactions, comments, users } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  lt,
  or,
} from "drizzle-orm";
import z from "zod";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { videoId, comment } = input;
      const { id: userId } = ctx.user;

      const [createdComment] = await db
        .insert(comments)
        .values({
          userId,
          videoId,
          comment,
        })
        .returning();

      return createdComment;
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { id: userId } = ctx.user;

      const [deletedComment] = await db
        .delete(comments)
        .where(and(eq(comments.id, id), eq(comments.userId, userId)))
        .returning();

      if (!deletedComment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return deletedComment;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(),
        cursor: z
          .object({ id: z.string().uuid(), updatedAt: z.date() })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;
      const { videoId, cursor, limit } = input;

      let userId;

      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id;
      }

      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            commentId: commentReactions.commentId,
            reaction: commentReactions.reaction,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      );

      const [totalComments] = await db
        .select({
          count: count(),
        })
        .from(comments)
        .where(eq(comments.videoId, videoId));

      const data = await db
        .with(viewerReactions)
        .select({
          ...getTableColumns(comments),
          users: users,
          likeCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.reaction, "like"),
              eq(commentReactions.commentId, comments.id)
            )
          ),
          dislikeCount: db.$count(
            commentReactions,
            and(
              eq(commentReactions.reaction, "dislike"),
              eq(commentReactions.commentId, comments.id)
            )
          ),
          viewerReaction: viewerReactions.reaction,
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .leftJoin(viewerReactions, eq(viewerReactions.commentId, comments.id))
        .where(
          and(
            eq(comments.videoId, videoId),
            cursor
              ? or(
                  lt(comments.updatedAt, cursor.updatedAt),
                  and(
                    eq(comments.updatedAt, cursor.updatedAt),
                    lt(comments.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(comments.updatedAt), desc(comments.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const nextCursor = hasMore
        ? {
            id: items[items.length - 1].id,
            updatedAt: items[items.length - 1].updatedAt,
          }
        : null;
      return {
        totalComments: totalComments.count,
        items,
        nextCursor,
      };
    }),
});
