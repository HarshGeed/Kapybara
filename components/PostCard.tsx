"use client";

import Link from "next/link";

export default function PostCard({ post }: { post: any }) {
  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <Link href={`/blog/${post.slug}`}>
        <h2 className="text-2xl font-semibold text-blue-600 hover:underline">{post.title}</h2>
      </Link>
      <p className="text-gray-600 mt-2 line-clamp-3">{post.content}</p>
      <div className="text-sm text-gray-400 mt-3">
        {post.published ? "Published" : "Draft"} • {new Date(post.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
