import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { db } from "@/server/db";
import { categories } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import slugify from "slugify";

export const categoryRouter = router({
  create: publicProcedure
    .input(z.object({ name: z.string().min(2), description: z.string().optional() }))
    .mutation(async ({ input }) => {
      const slug = slugify(input.name, { lower: true });
      const newCategory = await db.insert(categories).values({
        name: input.name,
        description: input.description,
        slug,
      }).returning();
      return newCategory[0];
    }),

  getAll: publicProcedure.query(async () => {
    return await db.select().from(categories);
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: { name?: string; slug?: string; description?: string } = {};
      if (input.name !== undefined) {
        updateData.name = input.name;
        updateData.slug = slugify(input.name, { lower: true });
      }
      if (input.description !== undefined) {
        updateData.description = input.description;
      }
      const updatedCategory = await db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, input.id))
        .returning();
      return updatedCategory[0];
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),
});
