import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type VideoGetOneOutput =
  inferRouterOutputs<AppRouter>["videos"]["getOne"];

export type VideoGetManyOutput =
  inferRouterOutputs<AppRouter>["videos"]["getMany"];

export type VideoGetManySubscribedOutput =
  inferRouterOutputs<AppRouter>["videos"]["getManySubscribed"];

export type VideoGetManyHistoryOutput =
  inferRouterOutputs<AppRouter>["videos"]["getManyHistory"];

export type VideoGetManyLikedOutput =
  inferRouterOutputs<AppRouter>["videos"]["getManyLiked"];

