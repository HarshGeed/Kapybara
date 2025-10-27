"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";

export default function DashboardPage() {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingPost, setEditingPost] = useState<{ id: number; title: string; content: string; published: boolean } | null>(null);

  const utils = trpc.useUtils();
  const { data: posts, isLoading: postsLoading } = trpc.post.getAll.useQuery();
  const { data: categories, isLoading: categoriesLoading } = trpc.category.getAll.useQuery();

  const createPost = trpc.post.create.useMutation({
    onSuccess: () => {
      utils.post.getAll.invalidate();
      setTitle("");
      setContent("");
      setPublished(false);
      setPostCategoryIds([]);
      setShowPostForm(false);
    },
  });

  const updatePost = trpc.post.update.useMutation({
    onSuccess: () => {
      utils.post.getAll.invalidate();
      setEditingPost(null);
      setTitle("");
      setContent("");
      setPublished(false);
      setPostCategoryIds([]);
      setShowPostForm(false);
    },
  });

  const deletePost = trpc.post.delete.useMutation({
    onSuccess: () => {
      utils.post.getAll.invalidate();
    },
  });

  const createCategory = trpc.category.create.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate();
      setCategoryName("");
      setCategoryDescription("");
      setShowCategoryForm(false);
    },
  });

  const deleteCategory = trpc.category.delete.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate();
    },
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [postCategoryIds, setPostCategoryIds] = useState<number[]>([]);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const handleEditPost = (post: { id: number; title: string; content: string; published: boolean }) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setPublished(post.published);
    setShowPostForm(true);
  };

  const handleSavePost = () => {
    if (editingPost) {
      updatePost.mutate({ id: editingPost.id, title, content, published });
    } else {
      createPost.mutate({ title, content, published, categoryIds: postCategoryIds });
    }
  };

  const handleDeletePost = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate({ id });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Blog
          </Link>
          <h1 className="text-4xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your posts and categories</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              setShowPostForm(!showPostForm);
              setShowCategoryForm(false);
              setEditingPost(null);
              setTitle("");
              setContent("");
              setPublished(false);
              setPostCategoryIds([]);
            }}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            + New Post
          </button>
          <button
            onClick={() => {
              setShowCategoryForm(!showCategoryForm);
              setShowPostForm(false);
            }}
            className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition"
          >
            + New Category
          </button>
        </div>

        {/* Create/Edit Post Form */}
        {showPostForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingPost ? "Edit Post" : "Create New Post"}
            </h2>
            <div className="space-y-4">
        <input
                type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <textarea
                placeholder="Write your content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-black"
              />
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
              {categories && categories.length > 0 && (
                <div>
                  <label className="block text-gray-700 mb-2">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={postCategoryIds.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPostCategoryIds([...postCategoryIds, category.id]);
                            } else {
                              setPostCategoryIds(postCategoryIds.filter((id) => id !== category.id));
                            }
                          }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSavePost}
                  disabled={!title.trim() || !content.trim() || createPost.isPending || updatePost.isPending}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {createPost.isPending || updatePost.isPending ? "Saving..." : "Save Post"}
                </button>
                <button
                  onClick={() => {
                    setShowPostForm(false);
                    setEditingPost(null);
                    setTitle("");
                    setContent("");
                    setPublished(false);
                    setPostCategoryIds([]);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Category Form */}
        {showCategoryForm && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Category</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <textarea
                placeholder="Enter category description (optional)"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-black"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    createCategory.mutate({ name: categoryName, description: categoryDescription });
                  }}
                  disabled={!categoryName.trim() || createCategory.isPending}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {createCategory.isPending ? "Creating..." : "Create Category"}
                </button>
                <button
                  onClick={() => {
                    setShowCategoryForm(false);
                    setCategoryName("");
                    setCategoryDescription("");
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">All Posts</h2>
          </div>
          <div className="p-6">
            {postsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading posts...</p>
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {post.content.substring(0, 100)}...
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{post.published ? "Published" : "Draft"}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-sm"
                        >
                          Edit
                        </button>
        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition text-sm"
                        >
                          Delete
        </button>
      </div>
    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-12">No posts yet. Create one above!</p>
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">All Categories</h2>
          </div>
          <div className="p-6">
            {categoriesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading categories...</p>
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <button
                        onClick={() => {
                          if (confirm(`Delete category "${category.name}"?`)) {
                            deleteCategory.mutate({ id: category.id });
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    {category.description && (
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-12">No categories yet. Create one above!</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
