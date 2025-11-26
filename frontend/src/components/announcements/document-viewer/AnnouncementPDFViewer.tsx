import { Button } from "@/components/ui/button";
import { getCloudinaryDownloadUrl } from "@/lib/cloudinary-utils";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { BlobUrlManager, openBlobUrlInNewTab } from "@/components/fees/document-viewer/utils/blobUtils";
import {
  createPdfHtmlPage,
  fetchPdfBlob,
} from "@/components/fees/document-viewer/utils/pdfUtils";

interface AnnouncementPDFViewerProps {
  documentUrl: string;
  announcementTitle: string;
  onDownload?: () => void;
}

export function AnnouncementPDFViewer({
  documentUrl,
  announcementTitle,
  onDownload,
}: AnnouncementPDFViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const blobManager = useState(() => new BlobUrlManager())[0];

  const handleViewInNewTab = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setIsLoading(true);
    try {
      const pdfBlob = await fetchPdfBlob(documentUrl);
      const pdfBlobUrl = blobManager.createBlobUrl(pdfBlob);

      const title = `Announcement: ${announcementTitle}`;
      const htmlContent = createPdfHtmlPage(pdfBlobUrl, title);

      const htmlBlob = new Blob([htmlContent], { type: "text/html" });
      const htmlBlobUrl = blobManager.createBlobUrl(htmlBlob);

      openBlobUrlInNewTab(htmlBlobUrl, pdfBlobUrl, blobManager);
    } catch (error) {
      console.error("Failed to open PDF in new tab:", error);
      // Fallback: open original URL directly
      const viewUrl = documentUrl.includes("res.cloudinary.com")
        ? documentUrl.split("?")[0].split("&")[0]
        : documentUrl;
      window.open(viewUrl, "_blank");
    } finally {
      setIsLoading(false);
    }
  };

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
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const blobUrl = blobManager.createBlobUrl(pdfBlob);

      const link = document.createElement("a");
      link.href = blobUrl;
      // Sanitize filename from announcement title
      const sanitizedTitle = announcementTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      link.download = `announcement-${sanitizedTitle}.pdf`;
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

      onDownload?.();
    } catch (error) {
      console.error("Failed to download document:", error);
      // Fallback: use Cloudinary download URL directly
      const downloadUrl = getCloudinaryDownloadUrl(documentUrl);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const sanitizedTitle = announcementTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      link.download = `announcement-${sanitizedTitle}.pdf`;
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

  return (
    <div
      className="relative group h-48 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer"
      onClick={handleViewInNewTab}
    >
      <div className="rounded-lg bg-white dark:bg-gray-900 p-4 mb-3 shadow-lg border border-blue-200 dark:border-blue-800">
        <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">
        PDF Document
      </p>
      <p className="text-xs text-muted-foreground mb-3 text-center">
        Click to view or download
      </p>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewInNewTab}
          className="gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          type="button"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" /> View
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          type="button"
          disabled={isLoading}
        >
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}

