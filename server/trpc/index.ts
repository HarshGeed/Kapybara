import { router } from "./trpc";
import { postRouter } from "./routers/post";
import { categoryRouter } from "./routers/category";

export const appRouter = router({
  post: postRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;
