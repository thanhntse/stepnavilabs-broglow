import React, { useState } from "react";
import { Copy, CheckCircle } from "@phosphor-icons/react";
import { Toast } from "primereact/toast";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

const CopyButton = ({ content }: { content: string }) => {
  const { toast, showSuccess, showError } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);

      // Show success toast
      showSuccess({
        summary: t("common.copied"),
        detail: t("chat.copiedSuccess"),
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);

      // Show error toast
      showError({
        summary: t("errors.requiredField"),
        detail: t("chat.copyError"),
      });
    }
  };

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <div
        onClick={handleCopy}
        className="bg-white border border-gray-300 px-4 py-2 rounded-full font-semibold flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        {isCopied ? (
          <>
            {t("common.copied")}
            <CheckCircle size={16} weight="fill" className="text-green-500" />
          </>
        ) : (
          <>
            {t("common.copyContent")}
            <Copy size={16} weight="fill" />
          </>
        )}
      </div>
    </>
  );
};

export default CopyButton;
