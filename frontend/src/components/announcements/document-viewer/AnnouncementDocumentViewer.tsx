import { getCloudinaryDownloadUrl, getCloudinaryViewUrl, isImageUrl, isPdfUrl } from "@/lib/cloudinary-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { AnnouncementImageViewer } from "./AnnouncementImageViewer";
import { AnnouncementPDFViewer } from "./AnnouncementPDFViewer";
import { BlobUrlManager } from "@/components/fees/document-viewer/utils/blobUtils";

interface AnnouncementDocumentViewerProps {
  documentUrl: string;
  announcementTitle: string;
  className?: string;
}

export function AnnouncementDocumentViewer({
  documentUrl,
  announcementTitle,
  className,
}: AnnouncementDocumentViewerProps) {
  const blobManager = useState(() => new BlobUrlManager())[0];

  const isImage = isImageUrl(documentUrl);
  const isPdf = isPdfUrl(documentUrl);

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      const downloadUrl = getCloudinaryDownloadUrl(documentUrl);
      const response = await fetch(downloadUrl, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }

      const blob = await response.blob();
      const extension = isPdf
        ? ".pdf"
        : documentUrl.match(/\.(jpg|jpeg|png|gif|webp|doc|docx)$/i)?.[0] || "";
      const blobWithType = isPdf
        ? new Blob([blob], { type: "application/pdf" })
        : blob;

      const blobUrl = blobManager.createBlobUrl(blobWithType);
      const link = document.createElement("a");
      link.href = blobUrl;
      const sanitizedTitle = announcementTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      link.download = `announcement-${sanitizedTitle}${extension}`;
      link.style.display = "none";
      link.setAttribute("download", link.download);

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        blobManager.revokeBlobUrl(blobUrl);
      }, 200);
    } catch (error) {
      console.error("Failed to download document:", error);
      const downloadUrl = getCloudinaryDownloadUrl(documentUrl);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const extension = isPdf
        ? ".pdf"
        : documentUrl.match(/\.(jpg|jpeg|png|gif|webp|doc|docx)$/i)?.[0] || "";
      const sanitizedTitle = announcementTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      link.download = `announcement-${sanitizedTitle}${extension}`;
      link.style.display = "none";
      link.setAttribute("download", link.download);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 200);
    }
  };

  if (isImage) {
    return (
      <div className={cn(className)}>
        <AnnouncementImageViewer
          documentUrl={documentUrl}
          announcementTitle={announcementTitle}
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className={cn(className)}>
        <AnnouncementPDFViewer
          documentUrl={documentUrl}
          announcementTitle={announcementTitle}
        />
      </div>
    );
  }

  // Fallback for unsupported document types (doc, docx, etc.)
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="p-4 flex flex-col items-center justify-center gap-3 min-h-[192px]">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Document</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(getCloudinaryViewUrl(documentUrl), "_blank")
              }
              className="gap-2"
              type="button"
            >
              <Eye className="h-4 w-4" />
              View Document
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
              type="button"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

