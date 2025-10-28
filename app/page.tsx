"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import PostForm from "@/components/PostForm";

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

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const postsPerPage = 6;

  const utils = trpc.useUtils();
  const { data: paginatedData, isLoading } = trpc.post.getPaginated.useQuery({
    page: currentPage,
    limit: postsPerPage,
  });

  const { data: allPosts } = trpc.post.getAllPublished.useQuery();
  const recentPosts = allPosts?.slice(0, 3) || [];
  const { data: categories } = trpc.category.getAll.useQuery();

  const createPost = trpc.post.create.useMutation({
    onSuccess: () => {
      utils.post.getPaginated.invalidate();
      utils.post.getAll.invalidate();
      utils.post.getAllPublished.invalidate();
      setShowForm(false);
    },
  });

  const handleNext = () => {
    if (paginatedData && currentPage < paginatedData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handlePostSubmit = (data: { title: string; content: string; published: boolean; categoryIds: number[] }) => {
    createPost.mutate(data);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header with New Blog Button */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 mb-2">Blog</h1>
            <p className="text-gray-600">Thoughts, stories and ideas.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer"
          >
            + New blog post
          </button>
        </div>

        {/* Post Form Modal */}
        <PostForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handlePostSubmit}
          categories={categories || []}
          isLoading={createPost.isPending}
        />

        {/* Recent Blog Posts Section */}
        {recentPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent blog posts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Large Featured Post */}
              <Link href={`/blog/${recentPosts[0]?.slug}`} className="lg:col-span-2 group">
                <div className="h-full border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                  <div className="h-64 bg-gradient-to-br from-purple-400 via-pink-300 to-white flex items-center justify-center">
                    <span className="text-6xl">📝</span>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-600 mb-2">
                      Author • {new Date(recentPosts[0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                      {recentPosts[0].title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 mb-3">
                      {recentPosts[0].content}
                    </p>
                    <CategoryTags postId={recentPosts[0].id} />
                  </div>
                </div>
              </Link>

              {/* Two Smaller Posts */}
              <div className="space-y-6">
                {recentPosts.slice(1, 3).map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                    <div className="h-full border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center">
                        <span className="text-4xl">📊</span>
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-600 mb-2">
                          Author • {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2 text-sm mb-2">
                          {post.content}
                        </p>
                        <CategoryTags postId={post.id} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Blog Posts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">All blog posts</h2>
          {isLoading ? (
            <p className="text-center text-gray-500 py-12">Loading posts...</p>
          ) : paginatedData?.posts && paginatedData.posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedData.posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <div className="h-full border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                    <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-300 flex items-center justify-center">
                      <span className="text-4xl">🎨</span>
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-gray-600 mb-2">
                        Author • {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2 text-sm mb-3">
                        {post.content}
                      </p>
                      <CategoryTags postId={post.id} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No posts yet. Create one above!</p>
          )}
        </section>

        {/* Pagination */}
        {paginatedData && paginatedData.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-8 border-t border-gray-200">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {Array.from({ length: Math.min(paginatedData.totalPages, 5) }, (_, i) => {
                let pageNum;
                if (paginatedData.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= paginatedData.totalPages - 2) {
                  pageNum = paginatedData.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => handlePageClick(pageNum)}
                    className={`px-4 py-2 border rounded-lg transition ${
                      currentPage === pageNum
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={currentPage === paginatedData.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
