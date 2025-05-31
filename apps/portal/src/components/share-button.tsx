import React from "react";
import { ShareFat } from "@phosphor-icons/react";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "primereact/toast";
import { useLanguage } from "@/context/language-context";

interface ShareButtonProps {
  content: string;
  title?: string;
  url?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  content,
  title = "BroGlow AI",
  url = window.location.href,
}) => {
  const { toast, showSuccess, showError } = useToast();
  const { t } = useLanguage();

  const handleShare = async () => {
    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content,
          url: url,
        });
      } catch (error) {
        // If user cancels sharing, don't show an error
        if (error instanceof Error && error.name !== "AbortError") {
          showError({
            summary: t("errors.requiredField"),
            detail: t("chat.shareError"),
          });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(content);
        showSuccess({
          summary: t("common.copied"),
          detail: t("chat.copiedFallback"),
        });
      } catch (error) {
        console.error("Copy error: ", error);
        showError({
          summary: t("errors.requiredField"),
          detail: t("chat.copyError"),
        });
      }
    }
  };

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <div
        onClick={handleShare}
        className="justify-center bg-primary-orange text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 cursor-pointer hover:bg-primary-dark ease-in-out duration-200"
      >
        {t("common.share")}
        <ShareFat size={16} weight="fill" />
      </div>
    </>
  );
};

export default ShareButton;
