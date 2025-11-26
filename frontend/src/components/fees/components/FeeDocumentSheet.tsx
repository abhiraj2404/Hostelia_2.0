import { isImageUrl, isPdfUrl } from "@/lib/cloudinary-utils";
import { useEffect } from "react";
import { FullScreenDocumentViewer } from "./FullScreenDocumentViewer";

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

  // Handle PDF opening in new tab when sheet opens
  useEffect(() => {
    if (open && isPdf && documentUrl) {
      const handleViewPdfInNewTab = async () => {
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
          const studentNamePart = studentName || "Student";
          const title = `${studentNamePart}'s ${
            documentType === "hostel" ? "Hostel" : "Mess"
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

          // Close the sheet immediately
          onClose();

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
          onClose();
        }
      };

      handleViewPdfInNewTab();
    }
  }, [
    open,
    isPdf,
    documentUrl,
    onClose,
    studentName,
    documentType,
    studentRollNo,
  ]);

  if (!documentUrl || !documentType || !studentName) return null;

  // Only show full-screen viewer for images (PDFs are handled by useEffect above)
  if (!isImage) return null;

  return (
    <FullScreenDocumentViewer
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
