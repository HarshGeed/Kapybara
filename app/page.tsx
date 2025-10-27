"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-blue-600">Kapybara Blog</h1>
          <nav className="space-x-4">
            <Link href="/blog" className="hover:text-blue-600">Blog</Link>
            <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <Link href="#features" className="hover:text-blue-600">Features</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 bg-gradient-to-b from-blue-50 to-white">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
          Write. Publish. Inspire.
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          A full-stack blogging platform built with Next.js 15, Drizzle ORM, and tRPC.
          Create, manage, and share your thoughts effortlessly.
        </p>
        <div className="space-x-4">
          <Link
            href="/blog"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Explore Blogs
          </Link>
          <Link
            href="/dashboard"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50"
          >
            Create Post
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center px-4">
          <h3 className="text-3xl font-semibold mb-6">Platform Highlights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-bold mb-2 text-blue-600">Type-Safe APIs</h4>
              <p className="text-gray-600">tRPC ensures end-to-end type safety with zero boilerplate.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-bold mb-2 text-blue-600">Modern Stack</h4>
              <p className="text-gray-600">Built with Next.js 15, Drizzle ORM, and PostgreSQL on Neon.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-bold mb-2 text-blue-600">Responsive UI</h4>
              <p className="text-gray-600">Beautiful, mobile-first design with Tailwind CSS and shadcn/ui.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Kapybara Blog. Built by Harsh Kumar Geed 🚀
      </footer>
    </main>
  );
}
