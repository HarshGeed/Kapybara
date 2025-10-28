"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // 👈 Needed for SSR-safe import

// 👇 Dynamically import Markdown editor (prevents SSR issues)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; published: boolean; categoryIds: number[] }) => void;
  initialData?: { id: number; title: string; content: string; published: boolean };
  categories: Category[];
  isLoading?: boolean;
}

export default function PostForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  isLoading,
}: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && !initialData) {
      setTitle("");
      setContent("");
      setPublished(false);
      setCategoryIds([]);
    } else if (isOpen && initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setPublished(initialData.published);
      setCategoryIds([]);
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, published, categoryIds });
  };

  const handleCategoryToggle = (categoryId: number) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {initialData ? "Edit Post" : "Create New Post"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* 👇 Markdown Editor */}
          <div data-color-mode="light">
            <label className="block mb-2 text-gray-700 font-medium">Content (Markdown)</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={300}
                preview="edit"
              />
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-gray-700">
              Published
            </label>
          </div>

          {/* Category Checkboxes */}
          {categories && categories.length > 0 && (
            <div>
              <label className="block text-gray-700 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!title.trim() || !content.trim() || isLoading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Saving..." : initialData ? "Update Post" : "Create Post"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
