import { isImageUrl, isPdfUrl } from "@/lib/cloudinary-utils";
import { useEffect, useState } from "react";
import { FullScreenViewer } from "./FullScreenViewer";
import { fetchPdfBlob, createPdfHtmlPage, createPdfTitle } from "./utils/pdfUtils";
import { BlobUrlManager, openBlobUrlInNewTab } from "./utils/blobUtils";

interface FeeDocumentSheetProps {
  open: boolean;
  onClose: () => void;
  documentUrl: string | null;
  documentType: "hostel" | "mess" | null;
  studentName: string | null;
  studentRollNo?: string;
}

export function FeeDocumentSheet({
  open,
  onClose,
  documentUrl,
  documentType,
  studentName,
  studentRollNo,
}: FeeDocumentSheetProps) {
  const isImage = documentUrl ? isImageUrl(documentUrl) : false;
  const isPdf = documentUrl ? isPdfUrl(documentUrl) : false;
  const [blobManager] = useState(() => new BlobUrlManager());

  // Handle PDF opening in new tab when sheet opens
  useEffect(() => {
    if (open && isPdf && documentUrl && documentType) {
      const handleViewPdfInNewTab = async () => {
        try {
          const pdfBlob = await fetchPdfBlob(documentUrl);
          const pdfBlobUrl = blobManager.createBlobUrl(pdfBlob);

          const title = createPdfTitle(documentType, studentName || undefined, studentRollNo);
          const htmlContent = createPdfHtmlPage(pdfBlobUrl, title);

          const htmlBlob = new Blob([htmlContent], { type: "text/html" });
          const htmlBlobUrl = blobManager.createBlobUrl(htmlBlob);

          openBlobUrlInNewTab(htmlBlobUrl, pdfBlobUrl, blobManager);

          // Close the sheet immediately
          onClose();
        } catch (error) {
          console.error("Failed to open PDF in new tab:", error);
          // Fallback: open original URL directly
          const viewUrl = documentUrl.includes("res.cloudinary.com")
            ? documentUrl.split("?")[0].split("&")[0]
            : documentUrl;
          window.open(viewUrl, "_blank");
          onClose();
        }
      };

      handleViewPdfInNewTab();
    }
  }, [open, isPdf, documentUrl, onClose, studentName, documentType, studentRollNo, blobManager]);

  if (!documentUrl || !documentType || !studentName) return null;

  // Only show full-screen viewer for images (PDFs are handled by useEffect above)
  if (!isImage) return null;

  return (
    <FullScreenViewer
      open={open}
      onClose={onClose}
      documentUrl={documentUrl}
      documentType={documentType}
      title={`${studentName}'s ${
        documentType === "hostel" ? "Hostel" : "Mess"
      } Fee Document`}
      isImage={isImage}
      isPdf={false}
      showDownload={true}
      studentRollNo={studentRollNo}
    />
  );
}

