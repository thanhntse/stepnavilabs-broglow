import CopyButton from "@/components/copy-button";
import { useLanguage } from "@/context/language-context";
import { X } from "@phosphor-icons/react";
import Markdown from "react-markdown";

type FullScreenPreviewProps = {
  content: string;
  onClose: () => void;
};

const FullScreenPreview = ({ content, onClose }: FullScreenPreviewProps) => {
  const { t } = useLanguage();

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-gray-100">
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <div className="flex justify-between items-center pr-4 pl-2 py-2">
          <div className="flex items-center gap-1">
            <button onClick={onClose} className="p-2">
              <X size={16} weight="bold" />
            </button>
            <div className="font-semibold text-lg">{t("common.preview")}</div>
          </div>
          <CopyButton content={content} />
        </div>
        <div className="flex-1 overflow-y-auto p-1">
          <div className="bg-white w-full h-full flex flex-col rounded">
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        </div>
        {/* Footer */}
        {/* <div className="p-3">
          <ShareButton content={content} />
        </div> */}
      </div>
    </div>
  );
};

export default FullScreenPreview;
