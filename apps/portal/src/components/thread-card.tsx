import { useLanguage } from "@/context/language-context";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale'; // Import Vietnamese locale if needed

export default function ThreadCard({ thread }: { thread: any }) {
  const { t } = useLanguage();

  // Format the date to relative time
  const formattedDate = formatDistanceToNow(new Date(thread.updatedAt), {
    addSuffix: true,
    // locale: locale === 'vi' ? vi : undefined // Use Vietnamese locale if language is Vietnamese
    locale: vi
  });

  return (
    <Link
      href={`/thread/${thread._id}`}
      className="bg-white p-1 rounded-lg border border-gray-200 w-full hover:shadow-md transition-shadow duration-300"
    >
      <div className="p-4 flex flex-col gap-3">
        <div className="text-lg font-semibold line-clamp-2">
          {thread.name || `${t("thread.noTitle")}`}
        </div>
        <div className="text-sm text-gray-600 line-clamp-2">
          {thread.description || t("thread.noDescription")}
        </div>
        <div className="text-sm text-gray-600 line-clamp-2">
          {formattedDate}
        </div>
      </div>
    </Link>
  );
}
