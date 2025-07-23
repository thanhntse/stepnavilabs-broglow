"use client";
import { useLanguage } from "@/context/language-context";
import { NotificationService, Notification } from "@/services/noti-service";
import { Bell, Trash, CheckSquare, SquaresFour, X, Check } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState, useCallback, useRef } from "react";
import { Toast } from "primereact/toast";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  // Utility function to sort notifications by creation time
  const sortNotificationsByTime = (notifications: Notification[]) => {
    return [...notifications].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // Get notification type color
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // Get notification type icon
  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check size={16} weight="bold" />;
      case 'warning':
        return <Bell size={16} weight="bold" />;
      case 'error':
        return <X size={16} weight="bold" />;
      default:
        return <Bell size={16} weight="bold" />;
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
    }
  };

  // Handle notification click to mark as read
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
      toast.current?.show({
        severity: 'success',
        summary: t("common.success") || "Success",
        detail: t("notifications.allMarkedAsRead") || "All notifications marked as read."
      });
    } catch {
      toast.current?.show({
        severity: 'error',
        summary: t("common.error") || "Error",
        detail: t("notifications.markAllAsReadError") || "Failed to mark all notifications as read."
      });
    }
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
          await NotificationService.deleteNotification(id);
          return { id, success: true };
        } catch {
          return { id, success: false };
        }
      }));
      const successIds = results.filter(r => r.success).map(r => r.id);
      const failedIds = results.filter(r => !r.success).map(r => r.id);
      setNotifications(prev => prev.filter(n => !successIds.includes(n._id)));
      setSelectedIds([]);
      setDeletingIds([]);
      const unreadCount = await NotificationService.getUnreadCount();
      setUnreadCount(unreadCount);
      if (failedIds.length === 0) {
        toast.current?.show({
          severity: 'success',
          summary: t("common.success") || "Success",
          detail: t("notifications.bulkDeleteSuccess") || "Notifications deleted successfully."
        });
      } else {
        toast.current?.show({
          severity: 'error',
          summary: t("common.error") || "Error",
          detail: t("notifications.bulkDeletePartial") || `${failedIds.length} notifications failed to delete.`
        });
      }
    } else if (pendingDelete) {
      // Single delete
      setDeletingIds([pendingDelete]);
      try {
        await NotificationService.deleteNotification(pendingDelete);
        setNotifications(prev => prev.filter(n => n._id !== pendingDelete));
        const unreadCount = await NotificationService.getUnreadCount();
        setUnreadCount(unreadCount);
        toast.current?.show({
          severity: 'success',
          summary: t("common.success") || "Success",
          detail: t("notifications.deleteSuccess") || "Notification deleted successfully."
        });
      } catch {
        toast.current?.show({
          severity: 'error',
          summary: t("common.error") || "Error",
          detail: t("notifications.deleteError") || "Failed to delete notification."
        });
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

  // Toggle selection for a notification
  const toggleSelectNotification = (notificationId: string) => {
    setSelectedIds(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Select all
  const selectAll = () => {
    setSelectedIds(notifications.map(n => n._id));
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedIds([]);
  };

  // Load more notifications
  const loadMoreNotifications = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const response = await NotificationService.getNotifications(page + 1, limit);
      const newNotifications = response.data;

      if (newNotifications.length === 0 || newNotifications.length < limit) {
        setHasMore(false);
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...prev, ...newNotifications]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to load more notifications:", err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, limit, isLoadingMore, hasMore]);

  // Intersection observer for infinite loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMoreNotifications();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreNotifications, hasMore, isLoadingMore, isLoading]);

  // Initial load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [notificationsResponse, unreadCountResponse] = await Promise.all([
          NotificationService.getNotifications(1, limit),
          NotificationService.getUnreadCount()
        ]);

        const sortedNotifications = sortNotificationsByTime(notificationsResponse.data);
        setNotifications(sortedNotifications);
        setUnreadCount(unreadCountResponse);
        setHasMore(notificationsResponse.data.length === limit);
        setPage(1);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError(t("notifications.error") || "Failed to load notifications");
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [t, limit]);

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
                  <Bell size={24} className="text-white" weight="bold" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {t("notifications.title") || "Notifications"}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {notifications.length === 0
                      && (t("notifications.noNotificationsYet") || "No notifications yet")
                    }
                    {unreadCount > 0 && (
                      <span className="text-primary-blue font-semibold">
                        {unreadCount} {t("notifications.unread") || "unread"}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleSelectMode}
                  className={`flex items-center gap-2 px-4 py-2 border ${selectMode ? 'border-primary-blue bg-primary-blue/10 text-primary-blue' : 'border-gray-300 text-gray-700 bg-white'} font-semibold rounded-xl hover:shadow transition-all duration-200`}
                >
                  {selectMode ? <X size={18} /> : <SquaresFour size={18} />}
                  {selectMode ? t("notifications.cancelSelect") || "Cancel" : t("notifications.select") || "Select"}
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold rounded-xl hover:bg-primary-darkblue transition-all duration-200"
                  >
                    <Check size={18} />
                    {t("notifications.markAllAsRead") || "Mark All Read"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="space-y-3">
                      <div className="h-5 bg-gray-200 rounded-lg"></div>
                      <div className="h-4 bg-gray-200 rounded-lg"></div>
                      <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-red-700 mb-2">
                  {t("common.error") || "Error"}
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  {t("common.tryAgain") || "Try Again"}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t("notifications.noNotifications") || "No notifications yet"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {t("notifications.noNotificationsDesc") || "You'll see your notifications here when they arrive."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {notifications.map((notification, index) => {
                  const isSelected = selectedIds.includes(notification._id);
                  return (
                    <div
                      key={notification._id}
                      className={`relative transform transition-all rounded-xl duration-300 hover:scale-102 ${selectMode && 'border border-primary-blue/30'} ${!notification.isRead ? 'border border-primary-blue/30 bg-blue-50/30' : ''}`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                        opacity: 0,
                        transform: 'translateY(20px)'
                      }}
                    >
                      {selectMode && (
                        <button
                          className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-primary-blue border-primary-blue' : 'bg-white border-gray-300'} transition-colors`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectNotification(notification._id);
                          }}
                          aria-label={isSelected ? t("notifications.deselect") || "Deselect" : t("notifications.select") || "Select"}
                        >
                          {isSelected ? <CheckSquare size={14} weight="fill" className="text-white" /> : <SquaresFour size={12} className="text-gray-400" />}
                        </button>
                      )}

                      <div
                        className={`bg-white flex justify-between rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${!notification.isRead ? 'hover:border-primary-blue/50' : ''}`}
                        onClick={() => {
                          handleNotificationClick(notification);
                          if (notification.category === 'blog') {
                            router.push(`/blog/${notification?.data?.blogId}`);
                          }
                        }}
                      >
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getNotificationTypeColor(notification.type)}`}>
                              {getNotificationTypeIcon(notification.type)}
                              {t(`notifications.${notification.category}`)}
                            </div>
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 text-sm">
                            {t(`notifications.${notification.title}`)}
                          </h3>

                          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                            {t(`notifications.${notification.message}`)}
                          </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                          <span className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>

                          <div className="flex gap-1">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                setPendingDelete(notification._id);
                                setShowConfirm(true);
                                setConfirmBulk(false);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                              title={t("common.delete") || "Delete"}
                            >
                              <Trash size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading more indicator */}
                {hasMore && (
                  <div ref={loadingRef} className="flex justify-center py-6">
                    {isLoadingMore ? (
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-solid border-primary-blue border-r-transparent"></div>
                        <span className="text-sm font-medium">{t("notifications.loadingMore") || "Loading more..."}</span>
                      </div>
                    ) : (
                      <div className="w-5 h-5"></div>
                    )}
                  </div>
                )}

                {/* No more notifications indicator */}
                {!hasMore && notifications.length > 0 && (
                  <div className="flex justify-center py-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <span className="text-sm">{t("notifications.noMoreNotifications") || "No more notifications"}</span>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                )}
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
                {t("notifications.selectAll") || "Select All"}
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {t("notifications.deselectAll") || "Deselect All"}
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
                {t("notifications.deleteSelected") || "Delete Selected"}
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
                  ? t("notifications.confirmBulkDelete") || "Delete selected notifications?"
                  : t("notifications.confirmDelete") || "Delete this notification?"}
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmBulk
                  ? (t("notifications.confirmBulkDeleteDesc") || `Are you sure you want to delete ${selectedIds.length} notifications? This cannot be undone.`)
                  : t("notifications.confirmDeleteDesc") || "This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  {t("common.cancel") || "Cancel"}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  {t("common.delete") || "Delete"}
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
