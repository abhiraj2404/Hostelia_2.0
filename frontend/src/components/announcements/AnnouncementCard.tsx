import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Megaphone,
  FileText,
  Download,
  Trash2,
  Loader2,
  Calendar,
  User,
} from "lucide-react";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  fileUrl?: string;
  postedBy: {
    name: string;
    role: string;
  };
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  canDelete: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function AnnouncementCard({
  announcement,
  canDelete,
  onDelete,
  isDeleting,
}: AnnouncementCardProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  return (
    <Card className="border shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Compact Header */}
      <CardHeader className="pb-2 pt-3 px-3 bg-muted/30 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 mb-1.5">
              <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30 shrink-0">
                <Megaphone className="size-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="truncate">{announcement.title}</span>
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <User className="size-3" />
                <span className="font-medium">{announcement.postedBy.name}</span>
                <span className="text-gray-400 dark:text-gray-600">({announcement.postedBy.role})</span>
              </span>
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                <Calendar className="size-3" />
                {formatDate(announcement.createdAt)}
              </span>
            </CardDescription>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(announcement._id)}
              disabled={isDeleting}
              className="shrink-0 h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              {isDeleting ? (
                <Loader2 className="size-3.5 animate-spin text-gray-400" />
              ) : (
                <Trash2 className="size-3.5 text-red-600 dark:text-red-400" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Compact Content */}
      <CardContent className="p-3 pt-2">
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-3">
          {announcement.message}
        </p>

        {announcement.fileUrl && (
          <div className="mt-2 p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30 shrink-0">
                <FileText className="size-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Attachment</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                  Click to view or download
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="h-7 px-2.5 text-xs border-gray-300 dark:border-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors shrink-0"
            >
              <a
                href={announcement.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <Download className="size-3" />
                <span className="font-semibold">View</span>
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
