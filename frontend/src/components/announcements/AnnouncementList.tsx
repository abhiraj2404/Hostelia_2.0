import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Megaphone } from "lucide-react";
import { AnnouncementCard } from "./AnnouncementCard";
import type { Announcement } from "@/types/announcement";

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse border-border/60">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                  <div className="h-3 w-20 bg-muted rounded"></div>
                  <div className="h-5 w-full bg-muted rounded"></div>
                  <div className="h-3 w-3/4 bg-muted rounded"></div>
                </div>
              </div>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center justify-center gap-3 py-8 text-destructive">
          <AlertCircle className="size-5" />
          <div>
            <p className="font-semibold">Failed to load announcements</p>
            <p className="text-sm text-muted-foreground">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "succeeded" && items.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Megaphone className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No Announcements Yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Check back later for important updates and notices from the administration
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
      {items.map((announcement) => (
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
