import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { isNull } from "drizzle-orm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  quiz: router({
    // Get all categories
    categories: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),

    // Get root categories (no parent)
    rootCategories: publicProcedure.query(async () => {
      return db.getRootCategories();
    }),

    // Get sub-categories for a parent
    subCategories: publicProcedure
      .input(z.object({ parentId: z.number() }))
      .query(async ({ input }) => {
        return db.getSubCategories(input.parentId);
      }),

    // Get random questions for a category
    questions: publicProcedure
      .input(
        z.object({
          categoryId: z.number(),
          limit: z.number().min(1).max(20).default(10),
        })
      )
      .query(async ({ input }) => {
        const questions = await db.getRandomQuestions(input.categoryId, input.limit);
        // Remove explanation from questions (will be shown after answering)
        return questions.map((q) => ({
          id: q.id,
          categoryId: q.categoryId,
          question: q.question,
          answers: [
            q.correctAnswer,
            q.wrongAnswer1,
            q.wrongAnswer2,
            q.wrongAnswer3,
          ].sort(() => Math.random() - 0.5), // Shuffle answers
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
        }));
      }),

    // Submit game session
    submitGame: protectedProcedure
      .input(
        z.object({
          categoryId: z.number(),
          score: z.number(),
          maxCombo: z.number(),
          correctAnswers: z.number(),
          totalQuestions: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.saveGameSession({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),

    // Get question with explanation
    getQuestionDetails: publicProcedure
      .input(z.object({ questionId: z.number() }))
      .query(async ({ input }) => {
        return db.getQuestionById(input.questionId);
      }),
  }),

  leaderboard: router({
    // Get global leaderboard
    global: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
      .query(async ({ input }) => {
        return db.getGlobalLeaderboard(input.limit);
      }),

    // Get friends leaderboard
    friends: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
      .query(async ({ ctx, input }) => {
        return db.getFriendsLeaderboard(ctx.user.id, input.limit);
      }),
  }),

  user: router({
    // Get user's game history
    history: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getUserGameHistory(ctx.user.id, input.limit);
      }),

    // Get user statistics
    stats: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserStats(ctx.user.id);
    }),

    // Get user's friends
    friends: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserFriends(ctx.user.id);
    }),

    // Add a friend
    addFriend: protectedProcedure
      .input(z.object({ friendId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.addFriend(ctx.user.id, input.friendId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
