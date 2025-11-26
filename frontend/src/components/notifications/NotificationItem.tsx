import { Badge } from "@/components/ui/badge";
import { cn, formatTime } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import type { Notification } from "./types";

interface NotificationItemProps {
  notification: Notification;
  onItemClick?: () => void;
}

export function NotificationItem({ notification, onItemClick }: NotificationItemProps) {
  const isUnread = !notification.read;
  const navigate = useNavigate();

  const handleClick = () => {
    if (notification.relatedEntityType === "announcement") {
      navigate("/announcements");
    } else if (notification.relatedEntityType === "problem") {
      navigate(`/complaints/${notification.relatedEntityId}`);
    } else if (notification.relatedEntityType === "fee") {
      navigate("/fees");
    }
    // Add more types as needed in the future

    // Close dropdown after navigation
    onItemClick?.();
  };

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      problem: "Problem",
      announcement: "Announcement",
      fee: "Fee",
      transit: "Transit",
      mess: "Mess"
    };
    return labels[type] || type;
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "px-4 py-3 border-b border-border/60 last:border-b-0 transition-colors cursor-pointer",
        isUnread ? "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary" : "bg-background hover:bg-accent/50"
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={cn("text-sm font-medium leading-tight", isUnread ? "text-foreground font-semibold" : "text-foreground")}>
              {notification.title}
            </h4>
          </div>
          {isUnread && <div className="h-2 w-2 rounded-full bg-primary shrink-0 ring-2 ring-primary/20" />}
        </div>
        <p className={cn("text-sm leading-snug break-words", isUnread ? "text-foreground" : "text-muted-foreground")}>{notification.message}</p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <Badge variant="outline" className="text-xs h-5 px-1.5">
            {getEntityTypeLabel(notification.relatedEntityType)}
          </Badge>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(notification.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
