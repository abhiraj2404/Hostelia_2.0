import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, File, X } from "lucide-react";
import { useState } from "react";
import { FullScreenDocumentViewer } from "./FullScreenDocumentViewer";

interface DocumentPreviewProps {
  file: File | null;
  onRemove: () => void;
}

export function DocumentPreview({ file, onRemove }: DocumentPreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  const handlePreview = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isPdf) {
      // For PDFs: Open in new tab with meaningful title
      try {
        const blobUrl = URL.createObjectURL(file);

        // Create a meaningful title from the file name
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const title = fileName || "Document Preview";

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
        // Fallback: open blob URL directly
        const blobUrl = URL.createObjectURL(file);
        window.open(blobUrl, "_blank");
      }
    } else if (isImage) {
      // For images: Use the modal preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPreviewOpen(true);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <>
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {isImage ? (
                  <div className="w-12 h-12 rounded border overflow-hidden bg-muted">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center">
                    <File className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {(isImage || isPdf) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handlePreview(e)}
                  className="gap-2"
                  type="button"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full-screen viewer - only for images (PDFs open in new tab) */}
      {previewUrl && isImage && (
        <FullScreenDocumentViewer
          open={previewOpen}
          onClose={handleClosePreview}
          documentUrl={previewUrl}
          documentType="hostel"
          title={file.name || "Document Preview"}
          isImage={isImage}
          isPdf={false}
          showDownload={false}
        />
      )}
    </>
  );
}
