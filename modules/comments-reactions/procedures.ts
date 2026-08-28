import { db } from "@/db";
import { commentReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const commentsReactionsRouter = createTRPCRouter({
  like: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { commentId } = input;

      const [existingCommentReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.userId, userId),
            eq(commentReactions.reaction, "like")
          )
        );

      if (existingCommentReaction) {
        const [deletedCommentReaction] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.userId, userId),
              eq(commentReactions.commentId, commentId)
            )
          )
          .returning();

        return deletedCommentReaction;
      }

      const [createdCommentReaction] = await db
        .insert(commentReactions)
        .values({ userId, commentId, reaction: "like" })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: {
            reaction: "like",
          },
        })
        .returning();

      return createdCommentReaction;
    }),
  dislike: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { id: userId } = ctx.user;
      const { commentId } = input;

      const [existingCommentReaction] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.userId, userId),
            eq(commentReactions.reaction, "dislike")
          )
        );

      if (existingCommentReaction) {
        const [deletedCommentReaction] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.userId, userId),
              eq(commentReactions.commentId, commentId)
            )
          )
          .returning();

        return deletedCommentReaction;
      }

      const [createdCommentReaction] = await db
        .insert(commentReactions)
        .values({ userId, commentId, reaction: "dislike" })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: {
            reaction: "dislike",
          },
        })
        .returning();

      return createdCommentReaction;
    }),
});
