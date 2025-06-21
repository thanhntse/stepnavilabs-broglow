"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import ThreadCard from "@/components/thread-card";
import { useImageContext } from "@/context/image-context";
import { useLanguage } from "@/context/language-context";
import { TokenStorage } from "@/lib/token-storage";
import { AIService } from "@/services/AI-service";
import { Camera, X, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_PUBLIC_ROUTE } from "@/utils/auth-routes";

export default function Home() {
  const { t } = useLanguage();
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [images, setImages] = useState<{ file: File; previewUrl: string }[]>(
    []
  );
  const {
    images: contextImages,
    setImages: setContextImages,
    addImage,
    clearImages,
  } = useImageContext();
  const toast = useRef<Toast>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [threads, setThreads] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync local and context images
  useEffect(() => {
    // If local images change, update context
    if (images.length !== contextImages.length) {
      clearImages();
      images.forEach((image) => addImage(image));
    }
  }, [images, contextImages, clearImages, addImage]);

  useEffect(() => {
    // If user is authenticated, they'll be redirected by RouteGuard
    // If not authenticated, redirect to login
    if (!TokenStorage.getTokens()) {
      router.push(DEFAULT_PUBLIC_ROUTE);
    }
  }, [router]);

  const handleFileUploadClick = () => {
    // Check if user is authenticated
    if (!TokenStorage.getTokens()) {
      toast.current?.show({
        severity: "warn",
        summary: t("common.loginRequired"),
        detail: t("home.loginToUpload"),
        life: 3000,
      });
      router.push("/login");
      return;
    }

    // If authenticated, trigger file input
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Lấy tên các file ảnh hiện tại
      const existingFileNames = images.map(image => image.file.name);

      // Lọc các file mới để loại bỏ những file trùng tên
      const newFiles = Array.from(files).filter(file => {
        const isDuplicate = existingFileNames.includes(file.name);
        if (isDuplicate) {
          // Hiển thị thông báo nếu phát hiện file trùng tên
          toast.current?.show({
            severity: "warn",
            summary: t("common.warning") || "Cảnh báo",
            detail: `${file.name} ${t("home.duplicateImage") || "đã tồn tại. Vui lòng chọn ảnh khác."}`,
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

      // Update both local and context state
      const newImages = [...images, ...uploadedFiles];
      setImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    // Remove image from local state
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);

    // Update context images
    setContextImages(updatedImages);
  };

  const createThread = async () => {
    if (!TokenStorage.getTokens()) {
      toast.current?.show({
        severity: "warn",
        summary: t("common.loginRequired"),
        detail: t("home.loginToUpload"),
        life: 3000,
      });
      router.push("/login");
      return;
    }

    if (images.length) {
      setLoadingUpload(true);
      try {
        const res = await AIService.createThread();
        router.push(`/thread/${res._id}`);
      } catch (error) {
        console.error("Failed to create thread:", error);
        toast.current?.show({
          severity: "error",
          summary: t("common.error"),
          detail: t("home.createThreadError"),
          life: 3000,
        });
      } finally {
        setLoadingUpload(false);
      }
    } else {
      toast.current?.show({
        severity: "contrast",
        summary: t("home.noImages"),
        detail: t("home.pleaseUpload"),
        life: 3000,
      });
    }
  };

  const sortThreadsByUpdateTime = (threads: any[]) => {
    return [...threads].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  useEffect(() => {
    const fetchThreads = async () => {
      if (!TokenStorage.getTokens()) return;
      try {
        setIsLoading(true);
        const response = await AIService.listThreadsByUser();
        setThreads(sortThreadsByUpdateTime(response.data));
        setShow(true);
      } catch (err) {
        console.error("Failed to fetch threads:", err);
        setError(t("recentPosts.error"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchThreads();
  }, [t]);

  // Show a simple loading screen while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary-blue/10 to-white">
      <Image
        src="/broglow-logo.png"
        width={220}
        height={70}
        alt="BroGlow Logo"
        className="mb-8"
        priority
      />
      <div className="flex space-x-2 justify-center items-center">
        <div className="w-3 h-3 rounded-full bg-primary-blue animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 rounded-full bg-primary-blue animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 rounded-full bg-primary-blue animate-bounce"></div>
      </div>
    </div>
  );
}
