"use client";

// Render announcement as an open list row (no boxed card)
import { Button } from "@/components/ui/button";
// badge not used in this variant; kept commented intentionally
import { FullScreenViewer } from "@/components/fees/document-viewer/FullScreenViewer";
import {
  BlobUrlManager,
  openBlobUrlInNewTab,
} from "@/components/fees/document-viewer/utils/blobUtils";
import {
  createPdfHtmlPage,
  fetchPdfBlob,
} from "@/components/fees/document-viewer/utils/pdfUtils";
import { isImageUrl, isPdfUrl } from "@/lib/cloudinary-utils";
import type { Comment } from "@/types/announcement";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Announcement {
  _id: string;
  title: string;
  message: string;
  fileUrl?: string;
  postedBy: {
    name: string;
    role: string;
  };
  comments?: Comment[];
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  canDelete: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const formatDateBadge = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.toLocaleDateString("en-US", { day: "2-digit" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { day, month, year, time, fullDate: date };
};

export function AnnouncementCard({
  announcement,
  canDelete,
  onDelete,
  isDeleting,
}: AnnouncementCardProps) {
  const { day, month, year, time } = formatDateBadge(announcement.createdAt);
  const hasAttachment = Boolean(announcement.fileUrl);
  const navigate = useNavigate();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const blobManager = useState(() => new BlobUrlManager())[0];

  const isImage = announcement.fileUrl
    ? isImageUrl(announcement.fileUrl)
    : false;
  const isPdf = announcement.fileUrl ? isPdfUrl(announcement.fileUrl) : false;

  // Prepare download filename for images (same format as PDFs)
  const imageDownloadFileName =
    hasAttachment && announcement.fileUrl && isImage
      ? (() => {
          const extension =
            announcement.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] ||
            ".jpg";
          const sanitizedTitle = announcement.title
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
          return `announcement-${sanitizedTitle}${extension}`;
        })()
      : undefined;

  const handleAttachmentClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!announcement.fileUrl) return;

    if (isPdf) {
      // For PDFs, open in new tab with custom title
      try {
        const pdfBlob = await fetchPdfBlob(announcement.fileUrl);
        const pdfBlobUrl = blobManager.createBlobUrl(pdfBlob);

        const title = `Announcement: ${announcement.title}`;
        const htmlContent = createPdfHtmlPage(pdfBlobUrl, title);

        const htmlBlob = new Blob([htmlContent], { type: "text/html" });
        const htmlBlobUrl = blobManager.createBlobUrl(htmlBlob);

        openBlobUrlInNewTab(htmlBlobUrl, pdfBlobUrl, blobManager);
      } catch (error) {
        console.error("Failed to open PDF in new tab:", error);
        // Fallback: open original URL directly
        const viewUrl = announcement.fileUrl.includes("res.cloudinary.com")
          ? announcement.fileUrl.split("?")[0].split("&")[0]
          : announcement.fileUrl;
        window.open(viewUrl, "_blank");
      }
    } else if (isImage) {
      // For images, open in full-screen modal (same as fees)
      setIsImageModalOpen(true);
    } else {
      // Fallback: open in new tab
      window.open(announcement.fileUrl, "_blank");
    }
  };

  return (
    <Link to={`/announcements/${announcement._id}`} className="block group">
      <div className="py-0 sm:py-0">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Left Date Badge */}
          <div className="sm:w-20 sm:min-w-20 flex sm:flex-col items-center justify-center gap-1 sm:gap-1 px-2 py-0.5 sm:py-1">
            <div className="text-center">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {month}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground leading-none my-1">
                {day}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                {year}
              </div>
              <div className="text-xs text-muted-foreground/70 mt-1 hidden sm:block">
                {time}
              </div>
            </div>
          </div>

          {/* short vertical separator (centered) */}
          <div className="hidden sm:flex items-center px-2">
            <div className="h-10 border-r-2 border-border/80"></div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 p-1 sm:p-2">
            {/* useNavigate is used by the 'View Details' button to avoid nested link issues */}
            <div className="flex items-start justify-between gap-3 mb-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-foreground leading-snug mb-0 group-hover:text-foreground/80 transition-colors line-clamp-2">
                  {announcement.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-0">
                  {announcement.message}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-[10px] font-medium text-muted-foreground bg-muted/10 px-1 py-0.5 rounded">
                  {announcement.postedBy.role
                    ? announcement.postedBy.role.charAt(0).toUpperCase() +
                      announcement.postedBy.role.slice(1).toLowerCase()
                    : ""}
                </div>
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(announcement._id);
                    }}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 shrink-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* attachment rendered in footer (moved) */}

            {/* comments preview removed as requested */}

            {/* Footer Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-0.5 border-t border-border/80 justify-between">
              {/* <Badge variant="secondary" className="text-xs font-medium">
                {announcement.postedBy.role}
              </Badge> */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/announcements/${announcement._id}`);
                  }}
                  className="h-8 px-3 text-xs text-foreground hover:bg-muted font-medium transition-all"
                >
                  View Details
                </Button>

                {hasAttachment && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAttachmentClick}
                    className="h-8 px-3 text-xs text-foreground hover:bg-muted font-medium transition-all"
                  >
                    <FileText className="size-4 mr-1.5" />
                    <span>Attachment</span>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {announcement.comments && announcement.comments.length > 0 && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span>
                      {announcement.comments.length}{" "}
                      {announcement.comments.length === 1
                        ? "comment"
                        : "comments"}
                    </span>
                  </>
                )}
                <span className="sm:hidden text-muted-foreground/70">
                  • {time}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attachment Viewer Modal for Images (same as fees) */}
      {hasAttachment && announcement.fileUrl && isImage && (
        <FullScreenViewer
          open={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          documentUrl={announcement.fileUrl}
          documentType="hostel"
          title={`Announcement Attachment: ${announcement.title}`}
          isImage={true}
          isPdf={false}
          showDownload={true}
          downloadFileName={imageDownloadFileName}
        />
      )}
    </Link>
  );
}
