"use client";

import Header from "@/components/header";
import { useLanguage } from "@/context/language-context";
import { AIService } from "@/services/AI-service";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ThreadCard from "@/components/thread-card";
import { Camera, X, ArrowRight, Sparkle, ChatCircle, Upload } from "@phosphor-icons/react/dist/ssr";
import { useImageContext } from "@/context/image-context";

export default function ThreadListPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [threads, setThreads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toastRef = useRef<Toast>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);

  // For image upload
  const [images, setImages] = useState<{ file: File; previewUrl: string }[]>([]);
  const {
    images: contextImages,
    setImages: setContextImages,
    addImage,
    clearImages,
  } = useImageContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local and context images
  useEffect(() => {
    if (images.length !== contextImages.length) {
      clearImages();
      images.forEach((image) => addImage(image));
    }
  }, [images, contextImages, clearImages, addImage]);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const existingFileNames = images.map(image => image.file.name);
      const newFiles = Array.from(files).filter(file => {
        const isDuplicate = existingFileNames.includes(file.name);
        if (isDuplicate) {
          toastRef.current?.show({
            severity: "warn",
            summary: t("common.warning") || "Warning",
            detail: `${file.name} ${t("home.duplicateImage") || "already exists. Please select a different image."}`,
            life: 3000,
          });
        }
        return !isDuplicate;
      });

      if (newFiles.length === 0) return;

      const uploadedFiles = newFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      const newImages = [...images, ...uploadedFiles];
      setImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    setContextImages(updatedImages);
  };

  const createThread = async () => {
    if (images.length) {
      setLoadingUpload(true);
      try {
        const res = await AIService.createThread();
        router.push(`/thread/${res._id}`);
      } catch (error) {
        console.error("Failed to create thread:", error);
        toastRef.current?.show({
          severity: "error",
          summary: t("common.error"),
          detail: t("home.createThreadError"),
          life: 3000,
        });
      } finally {
        setLoadingUpload(false);
      }
    } else {
      // Create empty thread
      try {
        const res = await AIService.createThread();
        router.push(`/thread/${res._id}`);
      } catch (error) {
        console.error("Failed to create thread:", error);
        toastRef.current?.show({
          severity: "error",
          summary: t("common.error"),
          detail: t("home.createThreadError"),
          life: 3000,
        });
      }
    }
  };

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
      <Toast ref={toastRef} position="top-right" />
      <div className="min-h-screen bg-gradient-to-b from-primary-blue/5 via-white to-gray-50">
        <Header
          variant="default"
          logoSrc="/broglow-logo.png"
          showCreateNew={true}
          onCreateNew={createThread}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12">
          {/* Create new conversation section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-blue to-primary-darkblue rounded-xl">
                <Sparkle size={24} className="text-white" weight="bold" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t("thread.startNewConversation")}
                </h2>
                <p className="text-gray-600 mt-1">
                  {t("thread.uploadImagesDescription")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-blue transition-colors duration-200">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-blue/10 to-primary-darkblue/10 rounded-full flex items-center justify-center">
                    <Camera size={32} className="text-primary-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("thread.uploadImages")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t("thread.uploadImagesDescription")}
                    </p>
                    <button
                      onClick={handleFileUploadClick}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 ease-out mx-auto"
                    >
                      <Upload size={20} weight="bold" />
                      {t("thread.chooseImages")}
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*"
                />
              </div>

              {/* Preview area */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-blue rounded-full"></div>
                    <h4 className="font-semibold text-gray-900">
                      {t("thread.selectedImages")} ({images.length})
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                      >
                        <Image
                          src={image.previewUrl}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/90 text-gray-600 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Chat Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={createThread}
                  disabled={loadingUpload}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loadingUpload ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      {t("thread.creating")}
                    </>
                  ) : (
                    <>
                      <ChatCircle size={20} weight="bold" />
                      {t("thread.startChat")}
                      <ArrowRight size={16} weight="bold" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Recent conversations */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl">
                <ChatCircle size={20} className="text-gray-600" weight="bold" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("thread.recentConversations")}
                </h2>
                <p className="text-gray-600">
                  {threads.length > 0
                    ? `${threads.length} conversation${threads.length !== 1 ? 's' : ''} found`
                    : t("thread.noConversationsYet")
                  }
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <ChatCircle size={24} className="text-red-500" />
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
                  <ChatCircle size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t("thread.noConversationsYet")}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {t("thread.startFirstChatDescription")}
                </p>
                <button
                  onClick={createThread}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 ease-out mx-auto"
                >
                  <Sparkle size={20} weight="bold" />
                  {t("thread.startFirstChat")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
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
