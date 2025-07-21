"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { BlogService, Blog } from "@/services/blog-service";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/profile-context";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const blogAnimation = useScrollAnimation(0.1, 120);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();
  const { user } = useUserContext();
  const displayName = user?.firstName + " " + user?.lastName;

  // Initial load of blogs
  useEffect(() => {
    const fetchInitialBlogs = async () => {
      setInitialLoading(true);
      try {
        const response = await BlogService.getBlogs({ page: 1, limit: 6, sortBy: "createdAt", sortOrder: "desc" });
        setBlogs(response.data);
        setHasMore(response.pagination.page < response.pagination.totalPages);
        setPage(2); // Next page to fetch would be page 2
      } catch (error) {
        setError("Failed to load blog posts. Please try again later.");
        console.error("Error fetching blogs:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialBlogs();
  }, []);

  // Load more blogs
  const loadMoreBlogs = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await BlogService.getBlogs({
        page,
        limit: 6,
        sortBy: "createdAt",
        sortOrder: "desc"
      });

      if (response.data.length > 0) {
        setBlogs(prevBlogs => [...prevBlogs, ...response.data]);
        setPage(prev => prev + 1);
      }

      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (error) {
      console.error("Error loading more blogs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // Setup IntersectionObserver for infinite loading
  useEffect(() => {
    observer.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !initialLoading) {
          loadMoreBlogs();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.current.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef && observer.current) {
        observer.current.unobserve(currentLoaderRef);
      }
    };
  }, [loadMoreBlogs, hasMore, loading, initialLoading]);

  // Scroll detection for blog animation
  useEffect(() => {
    const animateBlogs = async () => {
      const blogSection = document.getElementById('blog-section');
      if (blogSection) {
        for (const blog of blogs) {
          const blogElement = document.getElementById(blog._id);
          if (blogElement) {
            blogElement.classList.add('animate-in');
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
    }
    animateBlogs();
  }, [blogs]);

  return (
    <div className="broglow-landing-page min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 translate-y-0 opacity-100 backdrop-blur-md bg-white/90 shadow-lg border-b border-gray-200`}>
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/broglow-logo.png"
                width={120}
                height={36}
                alt="BroGlow Logo"
                className="cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => router.push("/")}
              />
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => router.push("/#features-section")}
                className="text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => router.push("/#how-it-works-section")}
                className="text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => router.push("/#benefits-section")}
                className="text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
              >
                Benefits
              </button>
              <button
                onClick={() => router.push("/#testimonials-section")}
                className="text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
              >
                Reviews
              </button>
              <button
                onClick={() => router.push("/#blog-section")}
                className="text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300 hover:scale-105 transform cursor-pointer"
              >
                Blog
              </button>
            </nav>

            {/* CTA Buttons */}
            {user ? (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group cursor-pointer"
                onClick={() => router.push("/thread")}
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold text-sm">
                    {user?.avatar ? (
                      <Image
                        src={user?.avatar}
                        alt="User Avatar"
                        width={32}
                        height={32}
                        className="rounded-full object-cover h-8 w-8"
                      />
                    ) : (

                      displayName
                        .toString()
                        .split(" ")
                        .map((name: string, index: number) => (
                          <span key={index}>{name.charAt(0)}</span>
                        ))
                    )}
                  </div>
                  <span className="hidden sm:block font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    {displayName}
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="hidden sm:block text-slate-700 hover:text-primary-blue font-medium transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-primary-blue to-primary-lightblue text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:scale-105 transform transition-all duration-300 magnetic-btn"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Blog Section */}
      <section id="blog-section" className="pt-40 pb-20 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div
            ref={blogAnimation.ref}
            className={`text-center mb-16 scroll-fade-up ${blogAnimation.isVisible ? 'animate-in' : ''}`}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Latest <span className="text-primary-blue">Insights</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert tips, guides, and the latest trends in men&apos;s skincare to help you achieve your best skin
            </p>
          </div>

          {initialLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg p-8 animate-pulse h-80" />
              ))}
            </div>
          ) : error ? (
            <div className="col-span-3 text-center text-red-500 py-12">{error}</div>
          ) : blogs.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-12">No blog articles found.</div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <div
                    id={blog._id}
                    key={blog._id}
                    onClick={() => router.push(`/blog/${blog._id}`)}
                  className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 enhanced-glow stagger-item group cursor-pointer`}
                  >
                    {/* Article Image */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-blue-100 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-r from-primary-blue to-primary-lightblue opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                      {blog.images && blog.images[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={blog.images[0].url}
                          alt={blog.images[0].caption || blog.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-primary-blue to-primary-lightblue rounded-full flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category Badge (if tags) */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-gradient-to-r from-primary-blue to-primary-lightblue text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                          {blog.tags[0] || "Unknown"}
                        </span>
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {"3 min read"}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-primary-blue transition-colors duration-300">
                        {blog.title}
                      </h3>

                      <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                        {blog.content?.replace(/<[^>]+>/g, '').slice(0, 120) || ""}
                        {blog.content && blog.content.length > 120 ? "..." : ""}
                      </p>

                      <div className="flex items-center justify-between">
                        <button className="text-primary-blue font-semibold hover:text-primary-darkblue transition-colors duration-300 flex items-center gap-2 group">
                          Read More
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>

                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 group">
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-primary-blue transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300 group">
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-primary-blue transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loader at the bottom for infinite scrolling */}
              <div
                ref={loaderRef}
                className="flex justify-center items-center py-12"
              >
                {loading && (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading more articles...</p>
                  </div>
                )}
                {!loading && !hasMore && blogs.length > 0 && (
                  <p className="text-gray-500">You&apos;ve reached the end of our articles</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="hover:transform hover:scale-105 transition-all duration-300">
              <Image
                src="/broglow-logo.png"
                width={150}
                height={45}
                alt="BroGlow Logo"
                className="mb-4 filter brightness-0 invert hover:brightness-100 hover:invert-0 transition-all duration-300"
              />
              <p className="text-sm leading-relaxed">
                Revolutionary AI-powered skincare designed specifically for men who want real results.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "How it Works", "Pricing", "FAQ"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Contact"] },
              { title: "Support", links: ["Help Center", "Privacy Policy", "Terms of Service", "Contact Support"] }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 BroGlow by STEPNAVI Labs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
