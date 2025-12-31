import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, questions, gameSessions, friendships } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Quiz feature queries

/**
 * Get all quiz categories
 */
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

/**
 * Get root categories (categories without parent)
 */
export async function getRootCategories() {
  const db = await getDb();
  if (!db) return [];
  const allCategories = await db.select().from(categories).orderBy(categories.name);
  return allCategories.filter(c => c.parentId === null);
}

/**
 * Get sub-categories for a specific parent category
 */
export async function getSubCategories(parentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.parentId, parentId)).orderBy(categories.name);
}

/**
 * Get random questions for a specific category
 */
export async function getRandomQuestions(categoryId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all questions for the category and shuffle on the backend
  const allQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.categoryId, categoryId));
  
  // Shuffle and take the limit
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

/**
 * Save a game session
 */
export async function saveGameSession(session: {
  userId: number;
  categoryId: number;
  score: number;
  maxCombo: number;
  correctAnswers: number;
  totalQuestions: number;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(gameSessions).values(session);
  return result;
}

/**
 * Get global leaderboard (top scores across all users)
 */
export async function getGlobalLeaderboard(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      userId: gameSessions.userId,
      userName: users.name,
      categoryId: gameSessions.categoryId,
      categoryName: categories.name,
      score: gameSessions.score,
      maxCombo: gameSessions.maxCombo,
      correctAnswers: gameSessions.correctAnswers,
      totalQuestions: gameSessions.totalQuestions,
      completedAt: gameSessions.completedAt,
    })
    .from(gameSessions)
    .innerJoin(users, eq(gameSessions.userId, users.id))
    .innerJoin(categories, eq(gameSessions.categoryId, categories.id))
    .orderBy(desc(gameSessions.score))
    .limit(limit);
}

/**
 * Get friends leaderboard (top scores among user's friends)
 */
export async function getFriendsLeaderboard(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  // Get user's friend IDs
  const friendsList = await db
    .select({ friendId: friendships.friendId })
    .from(friendships)
    .where(eq(friendships.userId, userId));
  
  const friendIds = friendsList.map(f => f.friendId);
  
  if (friendIds.length === 0) return [];
  
  return db
    .select({
      userId: gameSessions.userId,
      userName: users.name,
      categoryId: gameSessions.categoryId,
      categoryName: categories.name,
      score: gameSessions.score,
      maxCombo: gameSessions.maxCombo,
      correctAnswers: gameSessions.correctAnswers,
      totalQuestions: gameSessions.totalQuestions,
      completedAt: gameSessions.completedAt,
    })
    .from(gameSessions)
    .innerJoin(users, eq(gameSessions.userId, users.id))
    .innerJoin(categories, eq(gameSessions.categoryId, categories.id))
    .where(inArray(gameSessions.userId, friendIds))
    .orderBy(desc(gameSessions.score))
    .limit(limit);
}

/**
 * Get user's game history
 */
export async function getUserGameHistory(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      id: gameSessions.id,
      categoryId: gameSessions.categoryId,
      categoryName: categories.name,
      score: gameSessions.score,
      maxCombo: gameSessions.maxCombo,
      correctAnswers: gameSessions.correctAnswers,
      totalQuestions: gameSessions.totalQuestions,
      completedAt: gameSessions.completedAt,
    })
    .from(gameSessions)
    .innerJoin(categories, eq(gameSessions.categoryId, categories.id))
    .where(eq(gameSessions.userId, userId))
    .orderBy(desc(gameSessions.completedAt))
    .limit(limit);
}

/**
 * Add a friend
 */
export async function addFriend(userId: number, friendId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Check if friendship already exists
  const existing = await db
    .select()
    .from(friendships)
    .where(and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)))
    .limit(1);
  
  if (existing.length > 0) return existing[0];
  
  const result = await db.insert(friendships).values({ userId, friendId });
  return result;
}

/**
 * Get user's friends list
 */
export async function getUserFriends(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      friendId: friendships.friendId,
      friendName: users.name,
      friendEmail: users.email,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .innerJoin(users, eq(friendships.friendId, users.id))
    .where(eq(friendships.userId, userId));
}

/**
 * Get question by ID (including explanation)
 */
export async function getQuestionById(questionId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const stats = await db
    .select({
      totalGames: sql<number>`COUNT(*)`,
      totalScore: sql<number>`SUM(${gameSessions.score})`,
      avgScore: sql<number>`AVG(${gameSessions.score})`,
      maxScore: sql<number>`MAX(${gameSessions.score})`,
      totalCorrect: sql<number>`SUM(${gameSessions.correctAnswers})`,
      totalQuestions: sql<number>`SUM(${gameSessions.totalQuestions})`,
      bestCombo: sql<number>`MAX(${gameSessions.maxCombo})`,
    })
    .from(gameSessions)
    .where(eq(gameSessions.userId, userId));
  
  return stats[0] || null;
}
