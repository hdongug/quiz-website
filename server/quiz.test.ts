import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("quiz.categories", () => {
  it("should return all quiz categories", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.quiz.categories();

    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    
    // Check category structure
    if (categories.length > 0) {
      const category = categories[0];
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("description");
      expect(category).toHaveProperty("icon");
    }
  });
});

describe("quiz.questions", () => {
  it("should return shuffled questions for a category", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get categories first
    const categories = await caller.quiz.categories();
    expect(categories.length).toBeGreaterThan(0);

    const categoryId = categories[0]!.id;
    const questions = await caller.quiz.questions({ categoryId, limit: 5 });

    expect(questions).toBeDefined();
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.length).toBeLessThanOrEqual(5);

    // Check question structure
    const question = questions[0];
    expect(question).toHaveProperty("id");
    expect(question).toHaveProperty("question");
    expect(question).toHaveProperty("answers");
    expect(question).toHaveProperty("correctAnswer");
    expect(question.answers).toHaveLength(4);
    expect(question.answers).toContain(question.correctAnswer);
  });

  it("should not include explanation in questions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.quiz.categories();
    const categoryId = categories[0]!.id;
    const questions = await caller.quiz.questions({ categoryId, limit: 1 });

    const question = questions[0];
    expect(question).not.toHaveProperty("explanation");
  });
});

describe("quiz.submitGame", () => {
  it("should save game session for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.quiz.categories();
    const categoryId = categories[0]!.id;

    const result = await caller.quiz.submitGame({
      categoryId,
      score: 500,
      maxCombo: 5,
      correctAnswers: 8,
      totalQuestions: 10,
    });

    expect(result).toEqual({ success: true });
  });
});

describe("leaderboard.global", () => {
  it("should return global leaderboard", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const leaderboard = await caller.leaderboard.global({ limit: 10 });

    expect(leaderboard).toBeDefined();
    expect(Array.isArray(leaderboard)).toBe(true);

    // If there are entries, check structure
    if (leaderboard.length > 0) {
      const entry = leaderboard[0];
      expect(entry).toHaveProperty("userId");
      expect(entry).toHaveProperty("userName");
      expect(entry).toHaveProperty("score");
      expect(entry).toHaveProperty("maxCombo");
      expect(entry).toHaveProperty("correctAnswers");
      expect(entry).toHaveProperty("totalQuestions");
    }
  });
});

describe("user.stats", () => {
  it("should return user statistics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.user.stats();

    expect(stats).toBeDefined();
    
    if (stats) {
      expect(stats).toHaveProperty("totalGames");
      expect(stats).toHaveProperty("totalScore");
      expect(stats).toHaveProperty("avgScore");
      expect(stats).toHaveProperty("maxScore");
      expect(stats).toHaveProperty("bestCombo");
    }
  });
});

describe("user.history", () => {
  it("should return user game history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.user.history({ limit: 5 });

    expect(history).toBeDefined();
    expect(Array.isArray(history)).toBe(true);

    // If there are entries, check structure
    if (history.length > 0) {
      const game = history[0];
      expect(game).toHaveProperty("id");
      expect(game).toHaveProperty("categoryName");
      expect(game).toHaveProperty("score");
      expect(game).toHaveProperty("maxCombo");
      expect(game).toHaveProperty("correctAnswers");
      expect(game).toHaveProperty("totalQuestions");
      expect(game).toHaveProperty("completedAt");
    }
  });
});
