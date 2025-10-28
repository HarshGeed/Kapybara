import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db } from "@/server/db";
import { posts, postCategories, categories } from "@/server/db/schema";
import { eq, inArray, and, desc } from "drizzle-orm";
import slugify from "slugify";

export const postRouter = router({
  // Create post
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(3),
        content: z.string().min(10),
        published: z.boolean().optional().default(false),
        categoryIds: z.array(z.number()).optional(),
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

      // Add categories if provided
      if (input.categoryIds && input.categoryIds.length > 0) {
        await db.insert(postCategories).values(
          input.categoryIds.map((categoryId) => ({
            postId: newPost[0].id,
            categoryId,
          }))
        );
      }

      return newPost[0];
    }),

  // Get all posts (for dashboard - shows all posts)
  getAll: publicProcedure.query(async () => {
    return await db.select().from(posts).orderBy(desc(posts.createdAt));
  }),

  // Get all published posts
  getAllPublished: publicProcedure.query(async () => {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt));
  }),

  // Get paginated posts (for public pages - shows only published)
  getPaginated: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(6),
        categoryId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      
      let allPosts;
      
      if (input.categoryId) {
        // Filter posts by category using the join table
        const categoryPosts = await db
          .select({ postId: postCategories.postId })
          .from(postCategories)
          .where(eq(postCategories.categoryId, input.categoryId));
        
        const postIds = categoryPosts.map((cp) => cp.postId);
        
        if (postIds.length === 0) {
          return {
            posts: [],
            totalPosts: 0,
            totalPages: 0,
            currentPage: input.page,
          };
        }
        
        // Get only published posts with those IDs using inArray and published filter
        allPosts = await db
          .select()
          .from(posts)
          .where(and(inArray(posts.id, postIds), eq(posts.published, true)))
          .orderBy(desc(posts.createdAt));
      } else {
        // Get only published posts
        allPosts = await db
          .select()
          .from(posts)
          .where(eq(posts.published, true))
          .orderBy(desc(posts.createdAt));
      }
      
      return {
        posts: allPosts.slice(offset, offset + input.limit),
        totalPosts: allPosts.length,
        totalPages: Math.ceil(allPosts.length / input.limit),
        currentPage: input.page,
      };
    }),

  // Get single post by slug (only published posts for public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(posts)
        .where(and(eq(posts.slug, input.slug), eq(posts.published, true)));
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
        categoryIds: z.array(z.number()).optional(),
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

      // Replace post categories if provided
      if (input.categoryIds) {
        // Remove existing mappings
        await db.delete(postCategories).where(eq(postCategories.postId, input.id));
        if (input.categoryIds.length > 0) {
          // Insert new mappings (ensure uniqueness client-side not guaranteed)
          const uniqueCategoryIds = Array.from(new Set(input.categoryIds));
          await db.insert(postCategories).values(
            uniqueCategoryIds.map((categoryId) => ({ postId: input.id, categoryId }))
          );
        }
      }
      return { success: true };
    }),

  // Delete post
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),

  // Get categories for a post
  getCategoriesByPostId: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const postCategoryIds = await db
        .select({ categoryId: postCategories.categoryId })
        .from(postCategories)
        .where(eq(postCategories.postId, input.postId));

      if (postCategoryIds.length === 0) {
        return [];
      }

      const categoryIds = postCategoryIds.map((pc) => pc.categoryId);
      return await db
        .select()
        .from(categories)
        .where(inArray(categories.id, categoryIds));
    }),

  // Get categories by slug
  getCategoriesBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, input.slug)).limit(1);
      
      if (post.length === 0) {
        return [];
      }

      const postCategoryIds = await db
        .select({ categoryId: postCategories.categoryId })
        .from(postCategories)
        .where(eq(postCategories.postId, post[0].id));

      if (postCategoryIds.length === 0) {
        return [];
      }

      const categoryIds = postCategoryIds.map((pc) => pc.categoryId);
      return await db
        .select()
        .from(categories)
        .where(inArray(categories.id, categoryIds));
    }),
});
