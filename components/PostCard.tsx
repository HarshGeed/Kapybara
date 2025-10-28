"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";

export default function PostCard({ post }: { post: any }) {
  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white">
      <Link href={`/blog/${post.slug}`}>
        <h2 className="text-2xl font-semibold text-blue-600 hover:underline mb-2">
          {post.title}
        </h2>
      </Link>

      {/* 👇 Render markdown directly (not inside <p>) */}
      <div className="prose prose-blue max-w-none text-gray-800">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}  // ✅ Enables **bold**, lists, tables, etc.
          rehypePlugins={[rehypeRaw]}   // ✅ Allows HTML inside markdown
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="text-sm text-gray-400 mt-3">
        {post.published ? "Published" : "Draft"} •{" "}
        {new Date(post.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
