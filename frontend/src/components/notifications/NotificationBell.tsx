import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { NotificationDropdown } from "./NotificationDropdown";
import type { Notification } from "./types";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch initial notifications and unread count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [notificationsRes, countRes] = await Promise.all([
          apiClient.get("/notifications"),
          apiClient.get("/notifications/unread-count")
        ]);

        if (notificationsRes.data?.success) {
          setNotifications(notificationsRes.data.notifications || []);
        }

        if (countRes.data?.success) {
          setUnreadCount(countRes.data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Establish SSE connection
  useEffect(() => {
    const baseURL =
      import.meta.env.VITE_API_BASE_URL ??
      (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3000/api" : "/api");

    const eventSource = new EventSource(`${baseURL}/notifications/stream`, {
      withCredentials: true
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Ignore ping/connection messages
        if (data.type === "connected" || data.type === "ping") {
          return;
        }

        // Handle new notification
        const notification: Notification = {
          _id: data.id,
          id: data.id,
          userId: "", // Not needed for display
          type: data.type,
          title: data.title,
          message: data.message,
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          read: data.read || false,
          readAt: null,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.createdAt || new Date().toISOString()
        };

        // Add notification to the beginning of the list
        setNotifications((prev) => [notification, ...prev]);
        // Increment unread count
        setUnreadCount((prev) => prev + 1);
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      // Optionally reconnect here
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Mark all as read when dropdown closes
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);

    if (!open && unreadCount > 0) {
      try {
        await apiClient.patch("/notifications/read-all");
        // Update all notifications to read
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
        setUnreadCount(0);
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  // Mark all as read when item is clicked (before closing)
  const handleItemClick = async () => {
    if (unreadCount > 0) {
      try {
        await apiClient.patch("/notifications/read-all");
        // Update all notifications to read
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
        setUnreadCount(0);
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 border border-border" aria-label="Notifications">
          <Bell className="h-9 w-9" />
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold min-w-5 bg-red-500/90 hover:bg-red-500 text-white border-0"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b border-border bg-muted/30 px-4 py-3">
          <DropdownMenuLabel className="px-0 py-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </DropdownMenuLabel>
        </div>
        <NotificationDropdown notifications={notifications} onItemClick={handleItemClick} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
