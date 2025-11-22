import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Megaphone } from "lucide-react";
import { AnnouncementCard } from "./AnnouncementCard";

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

interface AnnouncementListProps {
  items: Announcement[];
  status: "idle" | "loading" | "succeeded" | "failed";
  canDelete: boolean;
  onDelete: (id: string) => void;
  deletingId: string | null;
}

export function AnnouncementList({
  items,
  status,
  canDelete,
  onDelete,
  deletingId,
}: AnnouncementListProps) {
  if (status === "loading") {
    return (
      <Card className="border shadow-sm bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Loading announcements...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "failed") {
    return (
      <Card className="border shadow-sm bg-red-50 dark:bg-red-950/20">
        <CardContent className="flex items-center gap-2 text-red-700 dark:text-red-300 py-4 justify-center">
          <AlertCircle className="size-4" />
          <span className="font-semibold text-sm">Failed to load announcements</span>
        </CardContent>
      </Card>
    );
  }

  if (status === "succeeded" && items.length === 0) {
    return (
      <Card className="border shadow-sm bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="mx-auto w-14 h-14 bg-muted rounded-xl flex items-center justify-center shadow-sm">
            <Megaphone className="size-7 text-gray-400 dark:text-gray-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              No Announcements Yet
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 max-w-sm">
              Check back later for updates and important notices
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">{items.map((announcement) => (
        <AnnouncementCard
          key={announcement._id}
          announcement={announcement}
          canDelete={canDelete}
          onDelete={onDelete}
          isDeleting={deletingId === announcement._id}
        />
      ))}
    </div>
  );
}
