import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, File, X } from "lucide-react";
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

  const handlePreview = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isImage || isPdf) {
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

      {previewUrl && (
        <FullScreenDocumentViewer
          open={previewOpen}
          onClose={handleClosePreview}
          documentUrl={previewUrl}
          documentType="hostel"
          title="Document Preview"
          isImage={isImage}
          isPdf={isPdf}
        />
      )}
    </>
  );
}

