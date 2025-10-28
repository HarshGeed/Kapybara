"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import PostForm from "@/components/PostForm";
import CategoryForm from "@/components/CategoryForm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

function CategoryTags({ postId }: { postId: number }) {
  const { data: postCategories } = trpc.post.getCategoriesByPostId.useQuery({ postId });
  
  if (!postCategories || postCategories.length === 0) return null;
  
  return (
    <div className="flex gap-2 flex-wrap mt-2">
      {postCategories.map((cat) => (
        <span key={cat.id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
          {cat.name}
        </span>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingPost, setEditingPost] = useState<{ id: number; title: string; content: string; published: boolean } | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ id: number; name: string; description: string | null } | null>(null);

  const utils = trpc.useUtils();
  const { data: posts, isLoading: postsLoading } = trpc.post.getAll.useQuery();
  const { data: categories, isLoading: categoriesLoading } = trpc.category.getAll.useQuery();
  const { data: editingPostCategories } = trpc.post.getCategoriesByPostId.useQuery(
    { postId: editingPost?.id as number },
    { enabled: Boolean(editingPost?.id) }
  );

  const createPost = trpc.post.create.useMutation({
    onSuccess: () => {
      utils.post.getAll.invalidate();
      setShowPostForm(false);
      setEditingPost(null);
    },
    onError: (err) => {
      alert(err.message || "Failed to create post");
    },
  });

  const updatePost = trpc.post.update.useMutation({
    onSuccess: () => {
      utils.post.getAll.invalidate();
      setShowPostForm(false);
      setEditingPost(null);
    },
    onError: (err) => {
      alert(err.message || "Failed to update post");
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
      setShowCategoryForm(false);
      setEditingCategory(null);
    },
  });

  const updateCategory = trpc.category.update.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate();
      setShowCategoryForm(false);
      setEditingCategory(null);
    },
  });

  const deleteCategory = trpc.category.delete.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate();
    },
  });

  const handleEditPost = (post: { id: number; title: string; content: string; published: boolean }) => {
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handleEditCategory = (category: { id: number; name: string; description: string | null }) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handlePostSubmit = (data: { title: string; content: string; published: boolean; categoryIds: number[] }) => {
    if (editingPost) {
      updatePost.mutate({ id: editingPost.id, title: data.title, content: data.content, published: data.published, categoryIds: data.categoryIds });
    } else {
      createPost.mutate({ ...data });
    }
  };

  const handleCategorySubmit = (data: { name: string; description: string }) => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, name: data.name, description: data.description });
    } else {
      createCategory.mutate(data);
    }
  };

  const handleDeletePost = (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate({ id });
    }
  };

  const handleDeleteCategory = (id: number, name: string) => {
    if (confirm(`Delete category "${name}"?`)) {
      deleteCategory.mutate({ id });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your posts and categories</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              setEditingPost(null);
              setShowPostForm(true);
            }}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
          >
            + New Post
          </button>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryForm(true);
            }}
            className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            + New Category
          </button>
        </div>

        {/* Post Form Modal */}
        <PostForm
          key={editingPost?.id ?? "new"}
          isOpen={showPostForm}
          onClose={() => {
            setShowPostForm(false);
            setEditingPost(null);
          }}
          onSubmit={handlePostSubmit}
          initialData={editingPost || undefined}
          categories={categories || []}
          initialCategoryIds={(editingPostCategories || []).map((c) => c.id)}
          isLoading={createPost.isPending || updatePost.isPending}
        />

        {/* Category Form Modal */}
        <CategoryForm
          isOpen={showCategoryForm}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onSubmit={handleCategorySubmit}
          initialData={editingCategory || undefined}
          isLoading={createCategory.isPending || updateCategory.isPending}
        />

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
                        <div className="text-gray-600 text-sm mt-1 prose max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {post.content.length > 100 ? post.content.substring(0, 100) + "..." : post.content}
                          </ReactMarkdown>
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{post.published ? "Published" : "Draft"}</span>
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <CategoryTags postId={post.id} />
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition text-sm cursor-pointer"
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
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
