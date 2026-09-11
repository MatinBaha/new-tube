import { db } from "@/db";
import {
  playlists,
  playlistVideos,
  users,
  videoReactions,
  videos,
  videoViews,
} from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, isNotNull, lt, or } from "drizzle-orm";
import z from "zod";

export const playlistsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Playlist name is required"),
        description: z.string().optional(),
        videoId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [playlist] = await db
        .insert(playlists)
        .values({
          name: input.name,
          description: input.description,
          userId,
        })
        .returning();

      if (input.videoId) {
        await db.insert(playlistVideos).values({
          playlistId: playlist.id,
          videoId: input.videoId,
        });
      }

      return playlist;
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
          user: users,
        })
        .from(playlists)
        .innerJoin(users, eq(playlists.userId, users.id))
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      const itemsWithThumbnail = await Promise.all(
        items.map(async (playlist) => {
          const [firstVideo] = await db
            .select({
              thumbnailUrl: videos.thumbnailUrl,
              id: videos.id,
            })
            .from(playlistVideos)
            .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
            .where(eq(playlistVideos.playlistId, playlist.id))
            .orderBy(desc(playlistVideos.createdAt))
            .limit(1);

          return {
            ...playlist,
            thumbnailUrl: firstVideo?.thumbnailUrl ?? null,
            firstVideoId: firstVideo?.id ?? null,
          };
        })
      );

      return {
        items: itemsWithThumbnail,
        nextCursor,
      };
    }),

  getManyByUserId: baseProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { userId, cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
          user: users,
        })
        .from(playlists)
        .innerJoin(users, eq(playlists.userId, users.id))
        .where(
          and(
            eq(playlists.userId, userId),
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt),
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt),
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      const itemsWithThumbnail = await Promise.all(
        items.map(async (playlist) => {
          const [firstVideo] = await db
            .select({
              thumbnailUrl: videos.thumbnailUrl,
              id: videos.id,
            })
            .from(playlistVideos)
            .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
            .where(eq(playlistVideos.playlistId, playlist.id))
            .orderBy(desc(playlistVideos.createdAt))
            .limit(1);

          return {
            ...playlist,
            thumbnailUrl: firstVideo?.thumbnailUrl ?? null,
            firstVideoId: firstVideo?.id ?? null,
          };
        })
      );

      return {
        items: itemsWithThumbnail,
        nextCursor,
      };
    }),

  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [playlist] = await db
        .select({
          ...getTableColumns(playlists),
          user: users,
          videoCount: db.$count(
            playlistVideos,
            eq(playlistVideos.playlistId, playlists.id)
          ),
        })
        .from(playlists)
        .innerJoin(users, eq(playlists.userId, users.id))
        .where(eq(playlists.id, input.id));

      if (!playlist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [firstVideo] = await db
        .select({
          thumbnailUrl: videos.thumbnailUrl,
          id: videos.id,
        })
        .from(playlistVideos)
        .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
        .where(eq(playlistVideos.playlistId, playlist.id))
        .orderBy(desc(playlistVideos.createdAt))
        .limit(1);

      return {
        ...playlist,
        thumbnailUrl: firstVideo?.thumbnailUrl ?? null,
        firstVideoId: firstVideo?.id ?? null,
      };
    }),

  getVideos: baseProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        cursor: z
          .object({
            id: z.string().uuid(),
            addedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ input }) => {
      const { playlistId, cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: users,
          addedAt: playlistVideos.createdAt,
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.reaction, "like")
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.reaction, "dislike")
            )
          ),
        })
        .from(playlistVideos)
        .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            cursor
              ? or(
                  lt(playlistVideos.createdAt, cursor.addedAt),
                  and(
                    eq(playlistVideos.createdAt, cursor.addedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(playlistVideos.createdAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            addedAt: lastItem.addedAt,
          }
        : null;

      return {
        items,
        nextCursor,
      };
    }),

  addVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { playlistId, videoId } = input;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(
          and(eq(playlists.id, playlistId), eq(playlists.userId, userId))
        );

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [existingVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        );

      if (existingVideo) {
        return existingVideo;
      }

      const [entry] = await db
        .insert(playlistVideos)
        .values({ playlistId, videoId })
        .returning();

      await db
        .update(playlists)
        .set({ updatedAt: new Date() })
        .where(eq(playlists.id, playlistId));

      return entry;
    }),

  removeVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(),
        videoId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { playlistId, videoId } = input;

      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(
          and(eq(playlists.id, playlistId), eq(playlists.userId, userId))
        );

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [removedEntry] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .returning();

      await db
        .update(playlists)
        .set({ updatedAt: new Date() })
        .where(eq(playlists.id, playlistId));

      return removedEntry;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [removedPlaylist] = await db
        .delete(playlists)
        .where(and(eq(playlists.id, input.id), eq(playlists.userId, userId)))
        .returning();

      if (!removedPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return removedPlaylist;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [updatedPlaylist] = await db
        .update(playlists)
        .set({
          name: input.name,
          description: input.description,
          updatedAt: new Date(),
        })
        .where(and(eq(playlists.id, input.id), eq(playlists.userId, userId)))
        .returning();

      if (!updatedPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updatedPlaylist;
    }),

  getManyForVideo: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      const userPlaylists = await db
        .select({
          ...getTableColumns(playlists),
          containsVideo: isNotNull(playlistVideos.videoId).mapWith(Boolean),
        })
        .from(playlists)
        .leftJoin(
          playlistVideos,
          and(
            eq(playlistVideos.playlistId, playlists.id),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .where(eq(playlists.userId, userId))
        .orderBy(desc(playlists.updatedAt));

      return userPlaylists;
    }),
});
