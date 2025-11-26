import { Bell, Loader2 } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import type { Notification } from "./types";

interface NotificationDropdownProps {
  notifications: Notification[];
  onItemClick?: () => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export function NotificationDropdown({
  notifications,
  onItemClick,
  onLoadMore,
  isLoading = false,
  hasMore = false
}: NotificationDropdownProps) {
  const scrollContainerRef = useInfiniteScroll({
    onLoadMore: onLoadMore || (() => {}),
    isLoading,
    hasMore,
    threshold: 100,
    throttleMs: 150
  });

  // Show loading state when initially loading and no notifications yet
  if (notifications.length === 0 && isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-muted p-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No notifications yet</p>
          <p className="text-xs text-muted-foreground">You're all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="max-h-[400px] overflow-y-auto overflow-x-hidden">
      {notifications.map((notification) => (
        <NotificationItem key={notification._id || notification.id} notification={notification} onItemClick={onItemClick} />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && notifications.length > 0 && (
        <div className="text-center p-4 text-xs text-muted-foreground border-t border-border/60">
          You've reached the end of your notifications
        </div>
      )}
    </div>
  );
}
