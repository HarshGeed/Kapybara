"use client";

import { trpc } from "@/utils/trpc";
import { useParams } from "next/navigation";

export default function SinglePostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = trpc.post.getBySlug.useQuery({ slug });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return <p>Post not found</p>;

  return (
    <article className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
      <div className="text-gray-500 mb-8">
        {new Date(data.createdAt).toLocaleDateString()}
      </div>
      <p className="text-lg leading-relaxed whitespace-pre-line">
        {data.content}
      </p>
    </article>
  );
}
