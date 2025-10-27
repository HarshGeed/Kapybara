"use client";

import { trpc } from "@/utils/trpc";
import PostCard from "@/components/PostCard";

export default function BlogListPage() {
  const { data, isLoading, error } = trpc.post.getAll.useQuery();

  if (isLoading) return <p className="text-center mt-8">Loading posts...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error.message}</p>;

  if (!data || data.length === 0)
    return <p className="text-center mt-8">No posts available yet.</p>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 grid gap-6">
      <h1 className="text-3xl font-bold mb-4 text-center">All Blog Posts</h1>
      {data.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
