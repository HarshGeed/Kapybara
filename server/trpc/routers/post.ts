import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db } from "@/server/db";
import { posts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import slugify from "slugify";

export const postRouter = router({
  // Create post
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(3),
        content: z.string().min(10),
        published: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const slug = slugify(input.title, { lower: true });
      const newPost = await db.insert(posts).values({
        title: input.title,
        content: input.content,
        slug,
        published: input.published,
      }).returning();

      return newPost[0];
    }),

  // Get all posts
  getAll: publicProcedure.query(async () => {
    return await db.select().from(posts).orderBy(posts.createdAt);
  }),

  // Get paginated posts
  getPaginated: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(6),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      const allPosts = await db.select().from(posts).orderBy(posts.createdAt);
      
      return {
        posts: allPosts.slice(offset, offset + input.limit),
        totalPosts: allPosts.length,
        totalPages: Math.ceil(allPosts.length / input.limit),
        currentPage: input.page,
      };
    }),

  // Get single post
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await db.select().from(posts).where(eq(posts.slug, input.slug));
      if (!result.length) throw new Error("Post not found");
      return result[0];
    }),

  // Update post
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
        published: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const slug = slugify(input.title, { lower: true });
      await db
        .update(posts)
        .set({
          title: input.title,
          content: input.content,
          published: input.published,
          slug,
        })
        .where(eq(posts.id, input.id));
      return { success: true };
    }),

  // Delete post
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});
