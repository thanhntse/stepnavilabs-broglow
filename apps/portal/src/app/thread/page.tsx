"use client";

import Header from "@/components/header";
import { useLanguage } from "@/context/language-context";
import { AIService } from "@/services/AI-service";
import { TokenStorage } from "@/lib/token-storage";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ThreadCard from "@/components/thread-card";
import { Camera, X, ArrowRight } from "@phosphor-icons/react/dist/ssr";
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
      <div className="min-h-screen bg-gradient-to-b from-primary-blue/5 to-white">
        <Header
          variant="default"
          logoSrc="/broglow-logo.png"
          showCreateNew={true}
          onCreateNew={createThread}
        />

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Create new conversation section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t("thread.startNewConversation")}
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg px-4 py-2">
                <div
                  onClick={handleFileUploadClick}
                  className="cursor-pointer flex-1 text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 p-2 rounded"
                >
                  <Camera size={20} className="text-primary-blue" />
                  <span>{t("thread.uploadImages")}</span>
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
                <button
                  onClick={createThread}
                  className="bg-primary-blue hover:bg-primary-darkblue text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {loadingUpload ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      {t("thread.startChat")}
                      <ArrowRight size={16} weight="bold" />
                    </>
                  )}
                </button>
              </div>

              {/* Preview area */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 overflow-hidden rounded-md border border-gray-200"
                    >
                      <Image
                        src={image.previewUrl}
                        alt={`Preview ${index}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white text-gray-600 rounded-full p-1 shadow hover:bg-gray-100"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent conversations */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t("thread.recentConversations")}
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-200 animate-pulse rounded-lg h-40"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-10">{error}</div>
            ) : threads.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="text-gray-500 mb-4">
                  {t("thread.noConversationsYet")}
                </div>
                <button
                  onClick={createThread}
                  className="bg-primary-blue hover:bg-primary-darkblue text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {t("thread.startFirstChat")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {threads.map((thread) => (
                  <ThreadCard key={thread._id} thread={thread} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
