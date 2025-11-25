import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "@/hooks";
import apiClient from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CommentSection } from "./CommentSection";
import type { Announcement, CommentFormData } from "@/types/announcement";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  ExternalLink,
  Megaphone,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

interface AnnouncementDetailProps {
  announcement: Announcement;
  onDelete?: (id: string) => void;
  canDelete: boolean;
  isDeleting: boolean;
}


// role badge variants removed — badges are no longer displayed

export function AnnouncementDetail({
  announcement,
  onDelete,
  canDelete,
  isDeleting,
}: AnnouncementDetailProps) {
  const [comments, setComments] = useState(announcement.comments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const handleAddComment = async (data: CommentFormData) => {
    try {
      setIsSubmitting(true);
      const response = await apiClient.post(
        `/announcement/${announcement._id}/comments`,
        data
      );
      
      // Update local comments state
      if (response.data.success && response.data.data.comments) {
        setComments(response.data.data.comments);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this announcement? This action cannot be undone."
      )
    ) {
      onDelete?.(announcement._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <Link
            to="/announcements"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to announcements
          </Link>
          <div className="mt-4 flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Megaphone className="size-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {announcement.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="size-4" />
                  <span className="font-medium">{announcement.postedBy.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {formatTime(announcement.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {canDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="shrink-0"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                Delete
              </>
            )}
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Message Card */}
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
              <CardDescription>
                Read the complete announcement details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {announcement.message}
              </p>
            </CardContent>
          </Card>

          {/* Attachment Card */}
          {announcement.fileUrl && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="size-5 text-primary" />
                  Attachment
                </CardTitle>
              </CardHeader>
              <CardContent>
                  {/* Attachment block (images and other files use same attachment UI) */}
                  <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">View Attachment</p>
                        <p className="text-xs text-muted-foreground">
                          Click to view or download the file
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={/\.pdf(\?|$)/i.test(announcement.fileUrl) || /pdf/i.test(announcement.fileUrl)
                          ? `https://docs.google.com/viewer?url=${encodeURIComponent(
                              announcement.fileUrl
                            )}&embedded=true`
                          : announcement.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="size-4" />
                        View
                      </a>
                    </Button>
                  </div>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <CommentSection
            comments={comments}
            onAddComment={handleAddComment}
            isSubmitting={isSubmitting}
            isAuthenticated={isAuthenticated}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Posted By Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Posted By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {announcement.postedBy.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {announcement.postedBy.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {announcement.postedBy.email}
                  </p>
                </div>
              </div>
              {/* role display removed */}
            </CardContent>
          </Card>

          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-right font-medium">
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(announcement.createdAt))}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-right font-medium">
                  {new Intl.DateTimeFormat("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(announcement.updatedAt))}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-muted-foreground">Comments</span>
                <span className="font-medium">{comments.length}</span>
              </div>
              {announcement.fileUrl && (
                <div className="flex items-start justify-between">
                  <span className="text-muted-foreground">Attachment</span>
                  <span className="font-medium text-green-600">Yes</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
