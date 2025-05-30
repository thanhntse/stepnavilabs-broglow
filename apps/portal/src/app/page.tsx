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

export default function HeroSection() {
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

  return (
    <>
      <Toast ref={toast} />
      <section className="bg-[#f5f5dc] p-3 h-[40rem]">
        <div className="relative flex justify-center h-full rounded-xl bg-cover bg-center bg-no-repeat bg-[url(/home-img.jpg)] text-white">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black rounded-xl opacity-35" />

          <div className="relative z-10 w-full">
            <Header
              variant="home"
              logoSrc="/logo-white.svg"
              showCreateNew={false}
            />
            <div className="flex flex-col gap-10 items-center justify-center px-4 text-center w-full">
              <div>
                <Image
                  src="/home-logo-img.svg"
                  width={300}
                  height={300}
                  className="mx-auto h-36 lg:h-auto"
                  alt="Logo"
                />
                <h1 className="text-3xl font-semibold mb-4 -mt-10 leading-10">
                  {t("home.title")}
                </h1>
                <p className="text-lg font-normal leading-6">
                  {t("home.subtitle")}
                </p>
              </div>

              {/* Input upload và Preview */}
              <div className="flex flex-col items-center gap-2.5">
                <div className="flex items-center justify-center gap-4 bg-white w-full md:w-96 rounded-xl px-4 py-2">
                  <div
                    onClick={handleFileUploadClick}
                    className="cursor-pointer w-full text-gray-500 text-lg hover:bg-gray-100 transition flex items-center gap-1 leading-6 rounded-lg"
                  >
                    <span className="p-3.5">
                      <Camera size={20} weight="fill" className="w-5 h-5" />
                    </span>
                    {t("home.uploadImages")}
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
                    className={`p-2 rounded-full cursor-pointer flex items-center gap-2 ${loadingUpload ? "bg-primary-dark" : "bg-primary-orange"
                      } hover:bg-primary-dark transition ease-in-out duration-200`}
                  >
                    {loadingUpload ? (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <svg
                          aria-hidden="true"
                          className="inline w-3 h-3 text-primary-orange animate-spin fill-gray-200"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                      </div>
                    ) : images.length > 0 ? (
                      <ArrowRight size={14} weight="bold" className="text-white" />
                    ) : (
                      <Image
                        src="/logo-icon-white.svg"
                        width={174}
                        height={32}
                        className="w-auto"
                        alt="Logo"
                      />
                    )}
                  </button>
                </div>

                {/* Preview các ảnh đã upload */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-4 bg-white p-2 rounded-lg">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="relative w-24 h-14 overflow-hidden rounded"
                      >
                        <Image
                          src={image.previewUrl}
                          alt={`${t("chat.imagePlaceholder")} ${index}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-0.5 right-0.5 bg-white text-primary-dark rounded-full shadow p-1 cursor-pointer hover:bg-gray-100 ease-in-out duration-200"
                        >
                          <X size={8} weight="bold" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {TokenStorage.getTokens() && show && (
        <section className="bg-gradient-to-b from-white via-[#FFFFFF] to-[#F5F5DC] pt-20 pb-32">
          <div className="max-w-7xl mx-3 xl:mx-auto flex flex-col gap-5">
            <div className="font-semibold text-xl">
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
          </div>
        </section>
      )}

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-20 xl:mx-auto flex flex-col lg:flex-row gap-6 items-center justify-center">
          <div className="flex flex-col gap-6 w-full lg:w-1/3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary-orange text-white w-fit px-3 py-1 rounded-full font-semibold leading-6">
                  1
                </div>
                <span className="font-semibold text-2xl">
                  {t("home.step1Title")}
                </span>
              </div>
              <div className="text-gray-500 font-normal text-xl leading-7">
                {t("home.step1Text")}
              </div>
            </div>
            <Image
              src="/home-upload-img.svg"
              width={200}
              height={200}
              alt="home-upload-img"
            />
          </div>

          <div className="flex flex-col gap-6 w-full lg:w-1/3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary-orange text-white w-fit px-3 py-1 rounded-full font-semibold leading-6">
                  2
                </div>
                <span className="font-semibold text-2xl">
                  {t("home.step2Title")}
                </span>
              </div>
              <div className="text-gray-500 font-normal text-xl leading-7">
                {t("home.step2Text")}
              </div>
            </div>
            <Image
              src="/home-chat-img.svg"
              width={200}
              height={200}
              alt="home-chat-img"
            />
          </div>

          <div className="flex flex-col gap-6 w-full lg:w-1/3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary-orange text-white w-fit px-3 py-1 rounded-full font-semibold leading-6">
                  3
                </div>
                <span className="font-semibold text-2xl">
                  {t("home.step3Title")}
                </span>
              </div>
              <div className="text-gray-500 font-normal text-xl leading-7">
                {t("home.step3Text")}
              </div>
            </div>
            <Image
              src="/home-share-img.svg"
              width={200}
              height={200}
              alt="home-share-img"
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
