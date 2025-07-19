import { useLanguage } from "@/context/language-context";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock, ChatCircle } from "@phosphor-icons/react/dist/ssr";

export default function ThreadCard({ thread }: { thread: any }) {
  const { t } = useLanguage();

  // Format the date to relative time
  const formattedDate = formatDistanceToNow(new Date(thread.updatedAt), {
    addSuffix: true,
    locale: vi
  });

  return (
    <Link
      href={`/thread/${thread._id}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-primary-blue/30 hover:shadow-lg transition-all duration-300 ease-out overflow-hidden"
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-blue transition-colors duration-200">
              {thread.name || `${t("thread.noTitle")}`}
            </h3>
          </div>
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-blue/10 to-primary-darkblue/10 rounded-lg group-hover:scale-110 transition-transform duration-200">
            <ChatCircle size={16} className="text-primary-blue" weight="bold" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {thread.description || t("thread.noDescription")}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock size={14} className="text-gray-400" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-blue to-primary-darkblue transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
      </div>
    </Link>
  );
}
