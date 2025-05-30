"use client";
import Header from "@/components/header";
import ThreadCard from "@/components/thread-card";
import { useLanguage } from "@/context/language-context";
import { AIService } from "@/services/AI-service";
import { useEffect, useState } from "react";

export default function ThreadsPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Utility function to sort threads by update time
  const sortThreadsByUpdateTime = (threads: any[]) => {
    return [...threads].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setIsLoading(true);
        const response = await AIService.listThreadsByUser();
        // Sort threads by update time
        setThreads(sortThreadsByUpdateTime(response.data));
      } catch (err) {
        console.error("Failed to fetch threads:", err);
        setError(t("recentPosts.error"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchThreads();
  }, [t]);

  return (
    <>
      <Header variant="default" />
      <section className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-10 lg:py-20">
        <div className="font-semibold text-xl lg:text-2xl mb-5">
          {t("recentPosts.title")}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 animate-pulse rounded-lg h-64"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : threads.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            {t("recentPosts.noPosts")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {threads.map((thread) => (
              <ThreadCard key={thread._id} thread={thread} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
