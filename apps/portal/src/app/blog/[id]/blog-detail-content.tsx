"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { BlogService, Blog, CreateCommentDto } from "@/services/blog-service";
import Image from "next/image";
import Link from "next/link";
import { useUserContext } from "@/context/profile-context";
import { Toast } from "primereact/toast";
import { useToast } from "@/hooks/use-toast";

interface BlogDetailContentProps {
  id: string;
}

export default function BlogDetailContent({ id }: BlogDetailContentProps) {
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const { user } = useUserContext();
  const displayName = user?.firstName + " " + user?.lastName;
  const toast = useToast();

  // Share popup state
  const [showSharePopup, setShowSharePopup] = useState(false);
  const sharePopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      setLoading(true);
      try {
        const blogData = await BlogService.getBlog(id);
        setBlog(blogData);

        // Fetch related blogs with same tag if blog has tags
        if (blogData.tags && blogData.tags.length > 0) {
          const relatedBlogsResponse = await BlogService.getBlogs({
            page: 1,
            limit: 3,
            sortBy: "createdAt",
            sortOrder: "desc"
          });

          // Filter out the current blog and limit to 3 items
          const filteredRelated = relatedBlogsResponse.data
            .filter(b => b._id !== blogData._id)
            .slice(0, 3);

          setRelatedBlogs(filteredRelated);
        }
      } catch (error) {
        setError("Failed to load blog. It might have been removed or is unavailable.");
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogDetail();
    }
  }, [id]);

  // Close share popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sharePopupRef.current && !sharePopupRef.current.contains(event.target as Node)) {
        setShowSharePopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const commentDto: CreateCommentDto = {
        content: comment
      };

      const updatedBlog = await BlogService.addComment(id, commentDto);
      setBlog(updatedBlog);
      setComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to submit comment. Please login to try again.",
        life: 3000
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeBlog = async () => {
    try {
      const updatedBlog = await BlogService.likeBlog(id);
      setBlog(updatedBlog);
    } catch (error) {
      console.error("Error liking blog:", error);
      toast.toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to like blog. Please login to try again.",
        life: 3000
      });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const updatedBlog = await BlogService.likeComment(id, commentId);
      setBlog(updatedBlog);
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to like comment. Please login to try again.",
        life: 3000
      });
    }
  };

  const handleShareBlog = () => {
    // Toggle the share popup instead of immediately copying
    setShowSharePopup(!showSharePopup);
  };

  const handleCopyLink = async () => {
    try {
      // const result = await BlogService.shareBlog(id);
      // console.log("Blog shared:", result);

      if (navigator.clipboard && window) {
        await navigator.clipboard.writeText(window.location.href);
        toast.toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Link copied to clipboard!",
          life: 3000
        });
      }
    } catch (error) {
      console.error("Error sharing blog:", error);
      toast.toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to share blog. Please try again.",
        life: 3000
      });
    }
    setShowSharePopup(false);
  };

  const handleShareFacebook = () => {
    try {
      const url = encodeURIComponent(window.location.href);
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      window.open(facebookUrl, '_blank');
    } catch (error) {
      console.error("Error sharing to Facebook:", error);
      toast.toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Could not open Facebook sharing dialog",
        life: 3000
      });
    }
    setShowSharePopup(false);
  };

  const handleShareTwitter = () => {
    try {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(blog?.title || "Check out this article on BroGlow");
      const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      window.open(twitterUrl, '_blank');
    } catch (error) {
      console.error("Error sharing to Twitter:", error);
      toast.toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Could not open X (Twitter) sharing dialog",
        life: 3000
      });
    }
    setShowSharePopup(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="animate-pulse">
            <div className="h-10 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="h-80 bg-slate-200 rounded mb-6"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-slate-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <div className="py-12 space-y-4">
            <h2 className="text-2xl font-bold text-red-500">{error || "Blog not found"}</h2>
            <p className="text-gray-600">The blog post you&apos;re looking for might have been removed or is temporarily unavailable.</p>
            <button
              onClick={() => router.push('/blog')}
              className="mt-4 bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-primary-lightblue transition-colors"
            >
              Back to Blog List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="broglow-landing-page min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Toast ref={toast.toast} />
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-r from-primary-blue to-primary-lightblue text-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex flex-col items-center">
            <button
              onClick={() => router.push('/blog')}
              className="self-start flex items-center text-blue-100 hover:text-white mb-8 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </button>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-center">{blog.title}</h1>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-blue-100">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
              </span>
              {blog.tags && blog.tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {blog.tags.join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                {blog.comments?.length || 0} Comments
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="lg:grid lg:grid-cols-4 lg:gap-12">
            {/* Main Content */}
            <div
              className="lg:col-span-3"
            >
              <div className={`transform transition-all duration-1000`}>
                {/* Feature Image */}
                {blog.images && blog.images[0] && (
                  <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.images[0].url}
                      alt={blog.images[0].caption || blog.title}
                      className="w-full h-auto object-cover max-h-[500px]"
                    />
                    {blog.images[0].caption && (
                      <div className="p-4 bg-gray-100 text-gray-600 italic text-sm">
                        {blog.images[0].caption}
                      </div>
                    )}
                  </div>
                )}

                {/* Blog Content */}
                <div className="prose prose-lg prose-slate max-w-none mb-12 blog-content">
                  {blog.content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: blog.content }}
                      className="blog-content"
                    />
                  ) : (
                    <p className="text-gray-600">No content available for this article.</p>
                  )}
                </div>

                {/* Tags and Social Sharing */}
                <div className="flex flex-wrap items-center justify-between py-6 border-t border-b border-gray-200 mb-8">
                  <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                    {blog.tags && blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-4 relative">
                    <button
                      onClick={handleLikeBlog}
                      className="flex items-center gap-2 hover:text-primary-blue transition-colors"
                    >
                      <svg className="w-5 h-5" fill={blog.likedBy?.length ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {blog.likesCount || 0}
                    </button>

                    <button
                      onClick={handleShareBlog}
                      className="flex items-center gap-2 hover:text-primary-blue transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share
                    </button>

                    {/* Share Popup */}
                    {showSharePopup && (
                      <div
                        ref={sharePopupRef}
                        className="absolute right-0 bottom-12 bg-white rounded-lg shadow-xl p-4 min-w-[180px] z-10 border border-gray-200 animate-fade-in"
                      >
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={handleShareFacebook}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-md text-blue-600 transition-colors text-left"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                          </button>

                          <button
                            onClick={handleShareTwitter}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-md text-black transition-colors text-left"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            X (Twitter)
                          </button>

                          <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 rounded-md text-gray-700 transition-colors text-left"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copy Link
                          </button>
                        </div>
                        <div className="absolute w-3 h-3 bg-white transform rotate-45 right-4 -bottom-1.5 border-r border-b border-gray-200"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div
                className="mt-12"
              >
                <div className={`transform transition-all duration-1000`}>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6">Comments ({blog.comments?.length || 0})</h3>

                  {/* Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="mb-12">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none bg-white"
                      rows={4}
                      required
                    ></textarea>
                    <button
                      type="submit"
                      disabled={submitting || !comment.trim()}
                      className={`mt-4 px-6 py-2 bg-primary-blue text-white rounded-full hover:bg-primary-lightblue transition-colors ${submitting || !comment.trim() ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {submitting ? "Posting..." : "Post Comment"}
                    </button>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-6">
                    {blog.comments && blog.comments.length > 0 ? (
                      blog.comments.map((comment) => (
                        <div key={comment._id} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-500">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-primary-blue to-primary-lightblue rounded-full flex items-center justify-center text-white">
                                {comment?.author && comment?.author?.avatar ? (
                                  <Image
                                    src={comment?.author?.avatar}
                                    alt="User Avatar"
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover h-10 w-10"
                                  />
                                ) : (
                                  <span className="text-white">
                                    {
                                      comment?.author?.firstName && comment?.author?.lastName
                                        ? comment?.author?.firstName?.charAt(0) + comment?.author?.lastName?.charAt(0)
                                        : "U"
                                    }
                                  </span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {comment?.author && typeof comment?.author === 'object' && (comment?.author?.firstName + " " + comment?.author?.lastName)
                                    ? comment?.author?.firstName + " " + comment?.author?.lastName
                                    : "Anonymous User"}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {comment.createdAt
                                    ? new Date(comment.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric"
                                    })
                                    : ""}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => comment._id && handleLikeComment(comment._id)}
                              className="flex items-center gap-1 text-gray-500 hover:text-primary-blue transition-colors"
                            >
                              <svg className="w-4 h-4" fill={comment.likedBy?.length ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {comment.likes || 0}
                            </button>
                          </div>
                          <div className="mt-4">
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-6">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div
              className="lg:col-span-1 mt-12 lg:mt-0"
            >
              <div className={`sticky top-24 transform transition-all duration-1000`}>
                {/* About Author */}
                <div className="bg-slate-50 p-6 rounded-xl mb-8 hover:shadow-lg transition-all duration-500">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">About the Author</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-primary-lightblue rounded-full flex items-center justify-center text-white">
                      {blog?.author && blog?.author?.avatar ? (
                        <Image
                          src={blog?.author?.avatar}
                          alt="User Avatar"
                          width={40}
                          height={40}
                          className="rounded-full object-cover h-10 w-10"
                        />
                      ) : (
                        <span className="text-white">
                          {
                            blog?.author?.firstName && blog?.author?.lastName
                              ? blog?.author?.firstName?.charAt(0) + blog?.author?.lastName?.charAt(0)
                              : "U"
                          }
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {blog?.author && typeof blog?.author === 'object' && (blog?.author?.firstName + " " + blog?.author?.lastName)
                          ? blog?.author?.firstName + " " + blog?.author?.lastName
                          : "BroGlow Author"}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Related Articles */}
                {relatedBlogs.length > 0 && (
                  <div className="bg-slate-50 p-6 rounded-xl hover:shadow-lg transition-all duration-500">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      {relatedBlogs.map((relatedBlog) => (
                        <div
                          key={relatedBlog._id}
                          onClick={() => router.push(`/blog/${relatedBlog._id}`)}
                          className="group cursor-pointer"
                        >
                          <div className="relative h-24 rounded-lg overflow-hidden mb-2">
                            {relatedBlog.images && relatedBlog.images[0]?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={relatedBlog.images[0].url}
                                alt={relatedBlog.title}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-r from-primary-blue to-primary-lightblue"></div>
                            )}
                          </div>
                          <h4 className="font-medium text-slate-800 group-hover:text-primary-blue transition-colors duration-300">
                            {relatedBlog.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {relatedBlog.createdAt
                              ? new Date(relatedBlog.createdAt).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
