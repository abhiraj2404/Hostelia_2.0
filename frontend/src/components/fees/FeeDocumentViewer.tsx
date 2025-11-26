import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/hooks";
import {
  getCloudinaryDownloadUrl,
  getCloudinaryViewUrl,
  isImageUrl,
  isPdfUrl,
} from "@/lib/cloudinary-utils";
import { cn } from "@/lib/utils";
import { Download, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { FullScreenDocumentViewer } from "./components/FullScreenDocumentViewer";

interface FeeDocumentViewerProps {
  documentUrl: string;
  feeType: "hostel" | "mess";
  className?: string;
}

export function FeeDocumentViewer({
  documentUrl,
  feeType,
  className,
}: FeeDocumentViewerProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const studentRollNo = user?.rollNo;

  const isImage = isImageUrl(documentUrl);
  const isPdf = isPdfUrl(documentUrl);

  const handleViewPdfInNewTab = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isPdf) return;

    try {
      // Use the raw Cloudinary URL without fl_attachment for preview
      const viewUrl = documentUrl.includes("res.cloudinary.com")
        ? documentUrl.split("?")[0].split("&")[0] // Get base URL without query params
        : documentUrl;

      const response = await fetch(viewUrl, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await response.blob();

      // Create a new blob with explicit PDF MIME type
      const pdfBlob = new Blob([blob], { type: "application/pdf" });

      // Create object URL from blob
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Create a meaningful title
      const rollNoPart = studentRollNo ? ` (${studentRollNo})` : "";
      const title = `${
        feeType === "hostel" ? "Hostel" : "Mess"
      } Fee Document${rollNoPart}`;

      // Create an HTML page with the PDF embedded and proper title
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                overflow: hidden;
                background-color: #525252;
              }
              iframe {
                width: 100%;
                height: 100vh;
                border: none;
              }
            </style>
          </head>
          <body>
            <iframe src="${blobUrl}" type="application/pdf"></iframe>
          </body>
        </html>
      `;

      // Create blob URL for the HTML content
      const htmlBlob = new Blob([htmlContent], { type: "text/html" });
      const htmlBlobUrl = URL.createObjectURL(htmlBlob);

      // Open in new tab
      const newWindow = window.open(htmlBlobUrl, "_blank");

      // Clean up HTML blob URL after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(htmlBlobUrl);
      }, 100);

      // Clean up PDF blob URL after a delay (browser will keep it alive while tab is open)
      if (newWindow) {
        newWindow.addEventListener("beforeunload", () => {
          URL.revokeObjectURL(blobUrl);
        });
      } else {
        // Fallback: clean up after delay if we can't track the window
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to open PDF in new tab:", error);
      // Fallback: open original URL directly
      const viewUrl = documentUrl.includes("res.cloudinary.com")
        ? documentUrl.split("?")[0].split("&")[0]
        : documentUrl;
      window.open(viewUrl, "_blank");
    }
  };

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      // Use Cloudinary download URL with fl_attachment for forced download
      const downloadUrl = getCloudinaryDownloadUrl(documentUrl);

      // Fetch the document as blob
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

      // Ensure correct MIME type for PDFs
      const blobWithType = isPdf
        ? new Blob([blob], { type: "application/pdf" })
        : blob;

      // Create object URL from blob
      const blobUrl = URL.createObjectURL(blobWithType);

      // Create download link
      const link = document.createElement("a");
      link.href = blobUrl;
      const extension = isPdf
        ? ".pdf"
        : documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || "";
      const rollNoPart = studentRollNo ? ` (${studentRollNo})` : "";
      link.download = `${feeType}-fee-document${rollNoPart}${extension}`;
      link.style.display = "none";
      link.setAttribute("download", link.download);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(blobUrl);
      }, 200);
    } catch (error) {
      console.error("Failed to download document:", error);
      // Fallback: use Cloudinary download URL directly
      const downloadUrl = getCloudinaryDownloadUrl(documentUrl);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const extension = isPdf
        ? ".pdf"
        : documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || "";
      const rollNoPart = studentRollNo ? ` (${studentRollNo})` : "";
      link.download = `${feeType}-fee-document${rollNoPart}${extension}`;
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
    <>
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-0">
          {isImage ? (
            <div className="relative group">
              <img
                src={documentUrl}
                alt={`${feeType} fee document`}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => setIsSheetOpen(true)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsSheetOpen(true)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          ) : isPdf ? (
            <div
              className="relative group h-48 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer"
              onClick={handleViewPdfInNewTab}
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
                  onClick={handleViewPdfInNewTab}
                  className="gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  type="button"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleDownload(e)}
                  className="gap-2 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  type="button"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
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
                  onClick={(e) => handleDownload(e)}
                  className="gap-2"
                  type="button"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full-screen viewer - only for images (PDFs open in new tab) */}
      {isImage && (
        <FullScreenDocumentViewer
          open={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          documentUrl={documentUrl}
          documentType={feeType}
          title={`${feeType === "hostel" ? "Hostel" : "Mess"} Fee Document`}
          isImage={isImage}
          isPdf={false}
          showDownload={true}
          studentRollNo={studentRollNo}
        />
      )}
    </>
  );
}
