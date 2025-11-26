import { Bell } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "./types";

interface NotificationDropdownProps {
  notifications: Notification[];
  onItemClick?: () => void;
}

export function NotificationDropdown({
  notifications,
  onItemClick,
}: NotificationDropdownProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-muted p-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            No notifications yet
          </p>
          <p className="text-xs text-muted-foreground">You're all caught up!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id || notification.id}
          notification={notification}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}
