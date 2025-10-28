"use client";

import { trpc } from "@/utils/trpc";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

function CategoryTags({ slug }: { slug: string }) {
  const { data: postCategories } = trpc.post.getCategoriesBySlug.useQuery({ slug });
  
  if (!postCategories || postCategories.length === 0) return null;
  
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {postCategories.map((cat) => (
        <span key={cat.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          {cat.name}
        </span>
      ))}
    </div>
  );
}

export default function SinglePostPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { data, isLoading, error } = trpc.post.getBySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading post: {error.message}</p>
          <Link
            href="/blog"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Post not found</p>
          <Link
            href="/blog"
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/blog"
          className="text-blue-600 hover:underline mb-8 inline-block"
        >
          ← Back to Blog
        </Link>

        <div className="mb-4 text-sm text-gray-500">
          {data.published ? "Published" : "Draft"} • {new Date(data.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          {data.title}
        </h1>

        <CategoryTags slug={slug} />

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {data.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
