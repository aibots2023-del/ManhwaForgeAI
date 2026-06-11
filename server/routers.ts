import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
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

  // Projects router
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProjects(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return project;
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          synopsis: z.string().optional(),
          genre: z.string().optional(),
          coverImageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.createProject(ctx.user.id, {
          title: input.title,
          synopsis: input.synopsis,
          genre: input.genre,
          coverImageUrl: input.coverImageUrl,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          synopsis: z.string().optional(),
          genre: z.string().optional(),
          status: z.enum(["draft", "in_progress", "completed", "archived"]).optional(),
          coverImageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const { id, ...updateData } = input;
        return db.updateProject(id, updateData);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        // Soft delete by archiving
        return db.updateProject(input.id, { status: "archived" });
      }),
  }),

  // Characters router
  characters: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCharacters(ctx.user.id);
    }),

    listByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.getProjectCharacters(input.projectId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const character = await db.getCharacterById(input.id);
        if (!character || character.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return character;
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number().optional(),
          name: z.string().min(1),
          role: z.string().optional(),
          personalityTraits: z.string().optional(),
          biography: z.string().optional(),
          clothingDescription: z.string().optional(),
          specialAbilities: z.string().optional(),
          visualNotes: z.string().optional(),
          portraitImageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (input.projectId) {
          const project = await db.getProjectById(input.projectId);
          if (!project || project.userId !== ctx.user.id) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }
        }
        return db.createCharacter(ctx.user.id, {
          ...input,
        });
      }),

    generateDescription: protectedProcedure
      .input(
        z.object({
          characterId: z.number(),
          name: z.string(),
          role: z.string().optional(),
          personalityTraits: z.string().optional(),
          specialAbilities: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const character = await db.getCharacterById(input.characterId);
        if (!character || character.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const prompt = `Create a detailed character description for a manhwa/webtoon character with the following details:
Name: ${input.name}
Role: ${input.role || "Not specified"}
Personality Traits: ${input.personalityTraits || "Not specified"}
Special Abilities: ${input.specialAbilities || "Not specified"}

Generate a compelling, detailed character description suitable for a manhwa series.`;

        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
        });

        const content = response.choices[0]?.message?.content;
        const description = typeof content === 'string' ? content : "";

        await db.updateCharacter(input.characterId, {
          aiGeneratedDescription: description,
        });

        return { description };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          role: z.string().optional(),
          personalityTraits: z.string().optional(),
          biography: z.string().optional(),
          clothingDescription: z.string().optional(),
          specialAbilities: z.string().optional(),
          visualNotes: z.string().optional(),
          portraitImageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const character = await db.getCharacterById(input.id);
        if (!character || character.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const { id, ...updateData } = input;
        return db.updateCharacter(id, updateData);
      }),
  }),

  // Stories router
  stories: router({
    listByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.getProjectStories(input.projectId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const story = await db.getStoryById(input.id);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return story;
      }),

    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          title: z.string().min(1),
          genre: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.createStory(ctx.user.id, input.projectId, {
          title: input.title,
          genre: input.genre,
        });
      }),

    generateOutline: protectedProcedure
      .input(
        z.object({
          storyId: z.number(),
          title: z.string(),
          genre: z.string(),
          prompt: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const story = await db.getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: `Create a detailed plot outline for a ${input.genre} manhwa/webtoon series titled "${input.title}". 
User prompt: ${input.prompt}

Generate a compelling 5-chapter outline with key plot points, character arcs, and story progression.`,
            },
          ],
        });

        const content = response.choices[0]?.message?.content;
        const outline = typeof content === 'string' ? content : "";

        await db.updateStory(input.storyId, {
          plotOutline: outline,
          status: "outline",
        });

        return { outline };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          genre: z.string().optional(),
          plotOutline: z.string().optional(),
          worldBuilding: z.string().optional(),
          status: z.enum(["draft", "outline", "in_progress", "completed"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const story = await db.getStoryById(input.id);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const { id, ...updateData } = input;
        return db.updateStory(id, updateData);
      }),
  }),

  // Chapters router
  chapters: router({
    listByStory: protectedProcedure
      .input(z.object({ storyId: z.number() }))
      .query(async ({ input, ctx }) => {
        const story = await db.getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.getStoryChapters(input.storyId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const chapter = await db.getChapterById(input.id);
        if (!chapter) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const story = await db.getStoryById(chapter.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return chapter;
      }),

    create: protectedProcedure
      .input(
        z.object({
          storyId: z.number(),
          projectId: z.number(),
          chapterNumber: z.number(),
          title: z.string().min(1),
          summary: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const story = await db.getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.createChapter(input.storyId, input.projectId, {
          chapterNumber: input.chapterNumber,
          title: input.title,
          summary: input.summary,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          summary: z.string().optional(),
          outline: z.string().optional(),
          status: z.enum(["draft", "in_progress", "completed"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const chapter = await db.getChapterById(input.id);
        if (!chapter) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const story = await db.getStoryById(chapter.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...updateData } = input;
        return db.updateChapter(id, updateData);
      }),
  }),

  // Artwork router
  artwork: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserArtwork(ctx.user.id);
    }),

    listByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.getProjectArtwork(input.projectId);
      }),

    generate: protectedProcedure
      .input(
        z.object({
          projectId: z.number().optional(),
          type: z.enum(["character_portrait", "background", "action_scene", "props", "other"]),
          style: z.enum(["anime", "webtoon", "fantasy", "semi-realistic"]),
          prompt: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (input.projectId) {
          const project = await db.getProjectById(input.projectId);
          if (!project || project.userId !== ctx.user.id) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }
        }

        const startTime = Date.now();
        const response = await generateImage({
          prompt: `Create a ${input.style} style ${input.type.replace(/_/g, " ")} for a manhwa/webtoon. ${input.prompt}`,
        });

        const generationTime = Math.round((Date.now() - startTime) / 1000);

        const result = await db.createArtwork(ctx.user.id, {
          projectId: input.projectId,
          type: input.type,
          style: input.style,
          prompt: input.prompt,
          imageKey: response.url || "",
          imageUrl: response.url,
          generationTime,
        });

        return { imageUrl: response.url, imageKey: response.url, generationTime };
      }),

    toggleFavorite: protectedProcedure
      .input(z.object({ id: z.number(), isFavorite: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const art = await db.getArtworkById(input.id);
        if (!art || art.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.updateArtwork(input.id, { isFavorite: input.isFavorite });
      }),
  }),

  // Panels router
  panels: router({
    listByChapter: protectedProcedure
      .input(z.object({ chapterId: z.number() }))
      .query(async ({ input, ctx }) => {
        const chapter = await db.getChapterById(input.chapterId);
        if (!chapter) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const story = await db.getStoryById(chapter.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.getChapterPanels(input.chapterId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const panel = await db.getPanelById(input.id);
        if (!panel) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const chapter = await db.getChapterById(panel.chapterId);
        if (!chapter) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const story = await db.getStoryById(chapter.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return panel;
      }),

    create: protectedProcedure
      .input(
        z.object({
          chapterId: z.number(),
          projectId: z.number(),
          panelNumber: z.number(),
          imageUrl: z.string().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const chapter = await db.getChapterById(input.chapterId);
        if (!chapter) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const story = await db.getStoryById(chapter.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.createPanel(input.chapterId, input.projectId, {
          panelNumber: input.panelNumber,
          imageUrl: input.imageUrl,
          width: input.width,
          height: input.height,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          imageUrl: z.string().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          positionX: z.number().optional(),
          positionY: z.number().optional(),
          zIndex: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const panel = await db.getPanelById(input.id);
        if (!panel) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const chapter = await db.getChapterById(panel.chapterId);
        if (!chapter) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const story = await db.getStoryById(chapter.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...updateData } = input;
        return db.updatePanel(id, updateData);
      }),
  }),

  // Panel Elements router
  panelElements: router({
    listByPanel: protectedProcedure
      .input(z.object({ panelId: z.number() }))
      .query(async ({ input, ctx }) => {
        const panel = await db.getPanelById(input.panelId);
        if (!panel) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const chapter = await db.getChapterById(panel.chapterId);
        if (!chapter) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const story = await db.getStoryById(chapter.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.getPanelElements(input.panelId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          panelId: z.number(),
          type: z.enum(["speech_bubble", "narration", "thought"]),
          content: z.string().min(1),
          fontFamily: z.string().optional(),
          fontSize: z.number().optional(),
          fontColor: z.string().optional(),
          positionX: z.number().optional(),
          positionY: z.number().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
          characterId: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const panel = await db.getPanelById(input.panelId);
        if (!panel) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const chapter = await db.getChapterById(panel.chapterId);
        if (!chapter) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const story = await db.getStoryById(chapter.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.createPanelElement(input.panelId, input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          content: z.string().optional(),
          fontFamily: z.string().optional(),
          fontSize: z.number().optional(),
          fontColor: z.string().optional(),
          positionX: z.number().optional(),
          positionY: z.number().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        return db.updatePanelElement(id, updateData);
      }),
  }),
});

export type AppRouter = typeof appRouter;
