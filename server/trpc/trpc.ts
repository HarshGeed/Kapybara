import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

export const t = initTRPC.create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      message:
        error.cause instanceof ZodError
          ? "Validation failed"
          : error.message,
    };
  },
});

// Middlewares, if needed (auth/logging, etc.)
export const router = t.router;
export const publicProcedure = t.procedure;
