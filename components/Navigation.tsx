"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="border-b sticky top-0 bg-white z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Kapybara Blog
          </Link>
          <div className="flex gap-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? "text-black font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                } transition`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

