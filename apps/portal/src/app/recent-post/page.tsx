"use client";
import ThreadCard from "@/components/thread-card";
import { useLanguage } from "@/context/language-context";
import { AIService } from "@/services/AI-service";
import { Clock, Plus, ArrowRight, Trash, CheckSquare, SquaresFour, X } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toast } from "primereact/toast";
import { useToast } from "@/hooks/use-toast";

export default function ThreadsPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]); // for multi-delete
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  // Utility function to sort threads by update time
  const sortThreadsByUpdateTime = (threads: any[]) => {
    return [...threads].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  // Bulk delete: open confirm modal
  const handleBulkDelete = () => {
    setShowConfirm(true);
    setConfirmBulk(true);
  };

  // Confirm delete (single or bulk)
  const confirmDelete = async () => {
    setShowConfirm(false);
    if (confirmBulk) {
      // Bulk delete
      setDeletingIds(selectedIds);
      const results = await Promise.all(selectedIds.map(async (id) => {
        try {
          await AIService.deleteThread(id);
          return { id, success: true };
        } catch {
          return { id, success: false };
        }
      }));
      const successIds = results.filter(r => r.success).map(r => r.id);
      const failedIds = results.filter(r => !r.success).map(r => r.id);
      setThreads(prev => prev.filter(t => !successIds.includes(t._id)));
      setSelectedIds([]);
      setDeletingIds([]);
      if (failedIds.length === 0) {
        toast.current?.show({ severity: 'success', summary: t("common.success"), detail: t("recentPosts.bulkDeleteSuccess") || "Threads deleted successfully." });
      } else {
        toast.current?.show({ severity: 'error', summary: t("common.error"), detail: t("recentPosts.bulkDeletePartial") || `${failedIds.length} threads failed to delete.` });
      }
    } else if (pendingDelete) {
      // Single delete
      setDeletingIds([pendingDelete]);
      try {
        await AIService.deleteThread(pendingDelete);
        setThreads(prev => prev.filter(t => t._id !== pendingDelete));
        toast.current?.show({ severity: 'success', summary: t("common.success"), detail: t("recentPosts.deleteSuccess") || "Thread deleted successfully." });
      } catch {
        toast.current?.show({ severity: 'error', summary: t("common.error"), detail: t("recentPosts.deleteError") || "Failed to delete thread." });
      } finally {
        setDeletingIds([]);
        setPendingDelete(null);
      }
    }
  };

  // Cancel modal
  const cancelDelete = () => {
    setShowConfirm(false);
    setPendingDelete(null);
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(v => !v);
    setSelectedIds([]);
  };

  // Toggle selection for a thread
  const toggleSelectThread = (threadId: string) => {
    setSelectedIds(prev => prev.includes(threadId) ? prev.filter(id => id !== threadId) : [...prev, threadId]);
  };

  // Select all
  const selectAll = () => {
    setSelectedIds(threads.map(t => t._id));
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedIds([]);
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
        <Toast ref={toast} />
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

              <div className="flex gap-2">
                <button
                  onClick={toggleSelectMode}
                  className={`flex items-center gap-2 px-4 py-2 border ${selectMode ? 'border-primary-blue bg-primary-blue/10 text-primary-blue' : 'border-gray-300 text-gray-700 bg-white'} font-semibold rounded-xl hover:shadow transition-all duration-200`}
                >
                  {selectMode ? <X size={18} /> : <SquaresFour size={18} />}
                  {selectMode ? t("recentPosts.cancelSelect") || "Cancel" : t("recentPosts.select") || "Select"}
                </button>
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
                {threads.map((thread, index) => {
                  const isSelected = selectedIds.includes(thread._id);
                  return (
                    <div
                      key={thread._id}
                      className={`relative transform transition-all duration-300 hover:scale-105 ${selectMode && 'ring-2 ring-primary-blue/30'}`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                        opacity: 0,
                        transform: 'translateY(20px)'
                      }}
                    >
                      {selectMode && (
                        <button
                          className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-primary-blue border-primary-blue' : 'bg-white border-gray-300'} transition-colors`}
                          onClick={() => toggleSelectThread(thread._id)}
                          aria-label={isSelected ? t("recentPosts.deselect") : t("recentPosts.select")}
                        >
                          {isSelected ? <CheckSquare size={18} weight="fill" className="text-white" /> : <SquaresFour size={16} className="text-gray-400" />}
                        </button>
                      )}
                      {/* Single delete button removed */}
                      <ThreadCard thread={thread} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        {/* Bulk delete bar */}
        {selectMode && selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-0 w-full flex justify-center z-50">
            <div className="flex gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-6 py-3">
              <button
                onClick={selectAll}
                className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {t("recentPosts.selectAll") || "Select All"}
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {t("recentPosts.deselectAll") || "Deselect All"}
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                disabled={deletingIds.length > 0}
              >
                {deletingIds.length > 0 ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em]" />
                ) : (
                  <Trash size={18} />
                )}
                {t("recentPosts.deleteSelected") || "Delete Selected"}
              </button>
            </div>
          </div>
        )}
        {/* Confirm modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {confirmBulk
                  ? t("recentPosts.confirmBulkDelete") || "Delete selected threads?"
                  : t("recentPosts.confirmDelete") || "Delete this thread?"}
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmBulk
                  ? (t("recentPosts.confirmBulkDeleteDesc") || `Are you sure you want to delete ${selectedIds.length} threads? This cannot be undone.`)
                  : t("recentPosts.confirmDeleteDesc") || "This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        )}
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
