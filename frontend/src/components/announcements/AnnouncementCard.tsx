import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  FileText,
  Trash2,
  Loader2,
  Calendar,
  User,
  MessageSquare,
  ExternalLink,
  Shield,
  GraduationCap,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  fileUrl?: string;
  postedBy: {
    name: string;
    role: string;
  };
  comments?: Array<any>;
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  canDelete: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "admin":
      return <Shield className="size-3" />;
    case "warden":
      return <User className="size-3" />;
    case "student":
      return <GraduationCap className="size-3" />;
    default:
      return <User className="size-3" />;
  }
};

const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" | "primary" => {
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

export function AnnouncementCard({
  announcement,
  canDelete,
  onDelete,
  isDeleting,
}: AnnouncementCardProps) {
  const commentCount = announcement.comments?.length || 0;

  return (
    <Card className="overflow-hidden border-border/60 transition-all hover:shadow-lg">
      {/* Header Section */}
      <div className="relative bg-muted/30">
        <CardHeader className="pb-3 pt-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="rounded-lg bg-primary/15 p-1.5 shrink-0 ring-1 ring-primary/20">
                  <Megaphone className="size-4 text-primary" />
                </div>
                <Badge
                  variant={getRoleBadgeVariant(announcement.postedBy.role)}
                  className="h-5 gap-1 text-xs capitalize shadow-sm"
                >
                  {getRoleIcon(announcement.postedBy.role)}
                  {announcement.postedBy.role}
                </Badge>
              </div>
              <Link to={`/announcements/${announcement._id}`}>
                <CardTitle className="text-base font-semibold line-clamp-2 transition-colors hover:text-primary cursor-pointer leading-snug">
                  {announcement.title}
                </CardTitle>
              </Link>
              <CardDescription className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="flex items-center gap-1.5">
                  <User className="size-3.5" />
                  <span className="font-medium">{announcement.postedBy.name}</span>
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground/80">
                  <Calendar className="size-3.5" />
                  {formatTime(announcement.createdAt)}
                </span>
              </CardDescription>
            </div>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(announcement._id);
                }}
                disabled={isDeleting}
                className="h-8 w-8 p-0 shrink-0 hover:bg-destructive/10 hover:text-destructive"
              >
                {isDeleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>
      </div>

      {/* Content Section */}
      <CardContent className="flex-1 pt-4 pb-4 px-5 space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {announcement.message}
        </p>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {announcement.fileUrl && (
              <div className="flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary/60" />
                <span className="font-medium">Attachment</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-primary/60" />
              <span className="font-medium">{commentCount}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {announcement.fileUrl && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 px-2.5 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {/* For PDFs use Google Docs viewer to force in-browser viewing; images open directly */}
                <a
                  href={/\.pdf(\?|$)/i.test(announcement.fileUrl) || /pdf/i.test(announcement.fileUrl)
                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(
                        announcement.fileUrl
                      )}&embedded=true`
                    : announcement.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5"
                >
                  <ExternalLink className="size-3.5" />
                  View
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 px-2.5 text-xs text-primary hover:bg-primary/10 font-medium transition-colors"
            >
              <Link to={`/announcements/${announcement._id}`} className="flex items-center gap-1.5">
                Details
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
