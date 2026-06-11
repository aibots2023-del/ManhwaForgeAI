import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, characters, stories, chapters, panels, panelElements, artwork, artworkCollections, exports, generationHistory } from "../drizzle/schema";
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

// Projects queries
export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createProject(userId: number, data: { title: string; synopsis?: string; genre?: string; coverImageKey?: string; coverImageUrl?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values({ userId, ...data });
  return result;
}

export async function updateProject(projectId: number, data: Partial<typeof projects.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(projects).set(data).where(eq(projects.id, projectId));
}

// Characters queries
export async function getUserCharacters(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(characters).where(eq(characters.userId, userId)).orderBy(desc(characters.createdAt));
}

export async function getProjectCharacters(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(characters).where(eq(characters.projectId, projectId)).orderBy(desc(characters.createdAt));
}

export async function getCharacterById(characterId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(characters).where(eq(characters.id, characterId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createCharacter(userId: number, data: Partial<typeof characters.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(characters).values({ userId, ...data } as any);
}

export async function updateCharacter(characterId: number, data: Partial<typeof characters.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(characters).set(data).where(eq(characters.id, characterId));
}

// Stories queries
export async function getProjectStories(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stories).where(eq(stories.projectId, projectId)).orderBy(desc(stories.createdAt));
}

export async function getStoryById(storyId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(stories).where(eq(stories.id, storyId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createStory(userId: number, projectId: number, data: Partial<typeof stories.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(stories).values({ userId, projectId, ...data } as any);
}

export async function updateStory(storyId: number, data: Partial<typeof stories.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(stories).set(data).where(eq(stories.id, storyId));
}

// Chapters queries
export async function getStoryChapters(storyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chapters).where(eq(chapters.storyId, storyId)).orderBy(chapters.chapterNumber);
}

export async function getChapterById(chapterId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(chapters).where(eq(chapters.id, chapterId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createChapter(storyId: number, projectId: number, data: Partial<typeof chapters.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(chapters).values({ storyId, projectId, ...data } as any);
}

export async function updateChapter(chapterId: number, data: Partial<typeof chapters.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(chapters).set(data).where(eq(chapters.id, chapterId));
}

// Panels queries
export async function getChapterPanels(chapterId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(panels).where(eq(panels.chapterId, chapterId)).orderBy(panels.panelNumber);
}

export async function getPanelById(panelId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(panels).where(eq(panels.id, panelId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPanel(chapterId: number, projectId: number, data: Partial<typeof panels.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(panels).values({ chapterId, projectId, ...data } as any);
}

export async function updatePanel(panelId: number, data: Partial<typeof panels.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(panels).set(data).where(eq(panels.id, panelId));
}

// Panel Elements queries
export async function getPanelElements(panelId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(panelElements).where(eq(panelElements.panelId, panelId));
}

export async function createPanelElement(panelId: number, data: Partial<typeof panelElements.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(panelElements).values({ panelId, ...data } as any);
}

export async function updatePanelElement(elementId: number, data: Partial<typeof panelElements.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(panelElements).set(data).where(eq(panelElements.id, elementId));
}

// Artwork queries
export async function getUserArtwork(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artwork).where(eq(artwork.userId, userId)).orderBy(desc(artwork.createdAt));
}

export async function getProjectArtwork(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artwork).where(eq(artwork.projectId, projectId)).orderBy(desc(artwork.createdAt));
}

export async function getArtworkById(artworkId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(artwork).where(eq(artwork.id, artworkId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createArtwork(userId: number, data: Partial<typeof artwork.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(artwork).values({ userId, ...data } as any);
}

export async function updateArtwork(artworkId: number, data: Partial<typeof artwork.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(artwork).set(data).where(eq(artwork.id, artworkId));
}

// Artwork Collections queries
export async function getUserArtworkCollections(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artworkCollections).where(eq(artworkCollections.userId, userId)).orderBy(desc(artworkCollections.createdAt));
}

export async function createArtworkCollection(userId: number, data: Partial<typeof artworkCollections.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(artworkCollections).values({ userId, ...data } as any);
}

// Exports queries
export async function getUserExports(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exports).where(eq(exports.userId, userId)).orderBy(desc(exports.createdAt));
}

export async function createExport(userId: number, data: Partial<typeof exports.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(exports).values({ userId, ...data } as any);
}

export async function updateExport(exportId: number, data: Partial<typeof exports.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(exports).set(data).where(eq(exports.id, exportId));
}

// Generation History queries
export async function createGenerationHistory(userId: number, data: Partial<typeof generationHistory.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(generationHistory).values({ userId, ...data } as any);
}

export async function getUserGenerationHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generationHistory).where(eq(generationHistory.userId, userId)).orderBy(desc(generationHistory.createdAt)).limit(limit);
}
