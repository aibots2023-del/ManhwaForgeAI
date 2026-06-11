import { bigint, boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Projects table
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  synopsis: text("synopsis"),
  genre: varchar("genre", { length: 64 }),
  coverImageKey: varchar("coverImageKey", { length: 255 }),
  coverImageUrl: text("coverImageUrl"),
  status: mysqlEnum("status", ["draft", "in_progress", "completed", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Characters table
export const characters = mysqlTable("characters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 128 }),
  personalityTraits: text("personalityTraits"),
  biography: text("biography"),
  clothingDescription: text("clothingDescription"),
  specialAbilities: text("specialAbilities"),
  visualNotes: text("visualNotes"),
  portraitImageKey: varchar("portraitImageKey", { length: 255 }),
  portraitImageUrl: text("portraitImageUrl"),
  aiGeneratedDescription: text("aiGeneratedDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = typeof characters.$inferInsert;

// Stories table
export const stories = mysqlTable("stories", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  genre: varchar("genre", { length: 64 }),
  plotOutline: text("plotOutline"),
  worldBuilding: text("worldBuilding"),
  themes: text("themes"),
  status: mysqlEnum("status", ["draft", "outline", "in_progress", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

// Chapters table
export const chapters = mysqlTable("chapters", {
  id: int("id").autoincrement().primaryKey(),
  storyId: int("storyId").notNull(),
  projectId: int("projectId").notNull(),
  chapterNumber: int("chapterNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary"),
  outline: text("outline"),
  dialogueSuggestions: text("dialogueSuggestions"),
  status: mysqlEnum("status", ["draft", "in_progress", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;

// Panels table
export const panels = mysqlTable("panels", {
  id: int("id").autoincrement().primaryKey(),
  chapterId: int("chapterId").notNull(),
  projectId: int("projectId").notNull(),
  panelNumber: int("panelNumber").notNull(),
  imageKey: varchar("imageKey", { length: 255 }),
  imageUrl: text("imageUrl"),
  width: int("width"),
  height: int("height"),
  positionX: int("positionX").default(0).notNull(),
  positionY: int("positionY").default(0).notNull(),
  zIndex: int("zIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Panel = typeof panels.$inferSelect;
export type InsertPanel = typeof panels.$inferInsert;

// Panel Elements (speech bubbles, narration)
export const panelElements = mysqlTable("panelElements", {
  id: int("id").autoincrement().primaryKey(),
  panelId: int("panelId").notNull(),
  type: mysqlEnum("type", ["speech_bubble", "narration", "thought"]).notNull(),
  content: text("content").notNull(),
  fontFamily: varchar("fontFamily", { length: 128 }).default("Arial").notNull(),
  fontSize: int("fontSize").default(16).notNull(),
  fontColor: varchar("fontColor", { length: 7 }).default("#000000").notNull(),
  positionX: int("positionX").default(0).notNull(),
  positionY: int("positionY").default(0).notNull(),
  width: int("width"),
  height: int("height"),
  characterId: int("characterId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PanelElement = typeof panelElements.$inferSelect;
export type InsertPanelElement = typeof panelElements.$inferInsert;

// Artwork Collections
export const artworkCollections = mysqlTable("artworkCollections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArtworkCollection = typeof artworkCollections.$inferSelect;
export type InsertArtworkCollection = typeof artworkCollections.$inferInsert;

// Artwork table
export const artwork = mysqlTable("artwork", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  type: mysqlEnum("type", ["character_portrait", "background", "action_scene", "props", "other"]).notNull(),
  style: varchar("style", { length: 64 }),
  prompt: text("prompt").notNull(),
  imageKey: varchar("imageKey", { length: 255 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  generationModel: varchar("generationModel", { length: 128 }),
  generationTime: int("generationTime"),
  isFavorite: boolean("isFavorite").default(false).notNull(),
  collectionId: int("collectionId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Artwork = typeof artwork.$inferSelect;
export type InsertArtwork = typeof artwork.$inferInsert;

// Exports table
export const exports = mysqlTable("exports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId").notNull(),
  chapterId: int("chapterId"),
  exportType: mysqlEnum("exportType", ["png", "pdf", "zip", "individual_panels"]).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: bigint("fileSize", { mode: "number" }),
  resolution: varchar("resolution", { length: 64 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Export = typeof exports.$inferSelect;
export type InsertExport = typeof exports.$inferInsert;

// Generation History
export const generationHistory = mysqlTable("generationHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  generationType: mysqlEnum("generationType", ["story", "character", "artwork", "dialogue"]).notNull(),
  prompt: text("prompt").notNull(),
  result: text("result"),
  model: varchar("model", { length: 128 }),
  tokensUsed: int("tokensUsed"),
  status: mysqlEnum("status", ["success", "failed", "partial"]).default("success").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GenerationHistory = typeof generationHistory.$inferSelect;
export type InsertGenerationHistory = typeof generationHistory.$inferInsert;