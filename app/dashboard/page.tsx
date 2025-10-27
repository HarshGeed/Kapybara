"use client";

import { trpc } from "@/utils/trpc";
import { useState } from "react";

export default function DashboardPage() {
  const utils = trpc.useUtils();

  const { mutate, isLoading } = trpc.post.create.useMutation({
    onSuccess: () => {
      utils.post.getAll.invalidate();
      alert("Post created!");
    },
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Create a New Post</h1>

      <div className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border p-2 rounded h-40"
          placeholder="Write content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          disabled={isLoading}
          onClick={() => mutate({ title, content, published: true })}
          className={`text-white py-2 rounded ${
            isLoading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Publishing..." : "Publish Post"}
        </button>
      </div>
    </div>
  );
}
