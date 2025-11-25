import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatTime } from "@/lib/utils";
import type { Comment } from "@/types/announcement";
import { Shield, User as UserIcon, GraduationCap } from "lucide-react";

interface CommentCardProps {
  comment: Comment;
  commenterName?: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Shield className="size-3" />;
    case "warden":
      return <UserIcon className="size-3" />;
    case "student":
      return <GraduationCap className="size-3" />;
    default:
      return <UserIcon className="size-3" />;
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "admin":
      return "primary";
    case "warden":
      return "primary";
    case "student":
      return "secondary";
    default:
      return "outline";
  }
};

export function CommentCard({ comment, commenterName }: CommentCardProps) {
  const getInitials = (userValue: string | undefined, role?: string) => {
    if (!userValue) return "U";

    // If value looks like a Mongo ObjectId (24 hex chars), prefer role-based initials
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(userValue);
    if (isObjectId) {
      if (role) return role.slice(0, 2).toUpperCase(); // AD, WA, ST
      return userValue.substring(0, 2).toUpperCase();
    }

    // If it's an email, use first character
    if (userValue.includes("@")) return userValue.charAt(0).toUpperCase();

    // Otherwise treat as a name and return first letters of first and last name
    const parts = userValue.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName =
    commenterName ??
    (typeof comment.user === "string" && !/^[0-9a-fA-F]{24}$/.test(comment.user as string)
      ? (comment.user as string)
      : undefined);

  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-sm transition-all hover:bg-card">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 border-2 border-border">
            <AvatarFallback className="bg-muted text-xs font-semibold">
              {getInitials(commenterName ?? (comment.user as string), comment.role)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {/* prefer explicit commenterName passed from parent */}
                  {displayName ?? "Anonymous"}
                </p>
              </div>
              <Badge
                variant={getRoleBadgeVariant(comment.role)}
                className="h-5 gap-1 text-xs capitalize"
              >
                {getRoleIcon(comment.role)}
                {comment.role}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {comment.message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
