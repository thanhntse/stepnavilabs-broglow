"use client";
import ThreadCard from "@/components/thread-card";
import { useLanguage } from "@/context/language-context";
import { AIService } from "@/services/AI-service";
import { Clock, Plus, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ThreadsPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const router = useRouter();

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
      <div className="min-h-[calc(100vh-100px)] bg-gradient-to-b from-gray-50 to-white">
        <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header Section */}
          <div className="mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-blue to-primary-darkblue rounded-xl">
                  <Clock size={24} className="text-white" weight="bold" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {t("recentPosts.title")}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {threads.length > 0
                      ? `${threads.length} conversation${threads.length !== 1 ? 's' : ''} found`
                      : t("thread.noConversationsYet")
                    }
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push('/thread')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 ease-out"
              >
                <Plus size={20} weight="bold" />
                {t("common.createNew")}
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="space-y-4">
                      <div className="h-6 bg-gray-200 rounded-lg"></div>
                      <div className="h-4 bg-gray-200 rounded-lg"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  {t("common.error")}
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  {t("common.tryAgain")}
                </button>
              </div>
            ) : threads.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t("recentPosts.noPosts")}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {t("thread.startFirstChatDescription")}
                </p>
                <button
                  onClick={() => router.push('/thread')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 ease-out mx-auto"
                >
                  <Plus size={20} weight="bold" />
                  {t("common.createNew")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {threads.map((thread, index) => (
                  <div
                    key={thread._id}
                    className="transform transition-all duration-300 hover:scale-105"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.6s ease-out forwards',
                      opacity: 0,
                      transform: 'translateY(20px)'
                    }}
                  >
                    <ThreadCard thread={thread} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
