"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";

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

  const { mutate, isPending: isPosting } = trpc.post.create.useMutation({
    onSuccess: () => {
      utils.post.getPaginated.invalidate();
      utils.post.getAll.invalidate();
      utils.post.getAllPublished.invalidate();
      setTitle("");
      setContent("");
      setShowForm(false);
    },
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            + New blog post
          </button>
        </div>

        {/* Create Post Form */}
        {showForm && (
          <div className="mb-12 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
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
              <div className="flex gap-3">
                <button
                  onClick={() => mutate({ title, content, published: true })}
                  disabled={isPosting || !title.trim() || !content.trim()}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isPosting ? "Publishing..." : "Publish Post"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setTitle("");
                    setContent("");
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
                    <p className="text-gray-600 line-clamp-3">
                      {recentPosts[0].content}
                    </p>
                    {/* <div className="mt-4 flex gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Design</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Research</span>
                    </div> */}
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
                        <p className="text-gray-600 line-clamp-2 text-sm">
                          {post.content}
                        </p>
                        {/* <div className="mt-3 flex gap-2">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Design</span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Research</span>
                        </div> */}
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
                      {/* <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Product</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Research</span>
                      </div> */}
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
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
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
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
