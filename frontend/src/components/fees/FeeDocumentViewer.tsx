import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(documentUrl) || 
                  documentUrl.includes("image") || 
                  documentUrl.match(/\.(jpg|jpeg|png|gif|webp)/i);
  const isPdf = /\.pdf$/i.test(documentUrl) || 
                documentUrl.includes("pdf") ||
                documentUrl.includes("application/pdf");

  const handleDownload = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = `${feeType}-fee-document${isPdf ? ".pdf" : ""}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div className="p-4 flex flex-col items-center justify-center gap-3 min-h-[192px]">
              <div className="rounded-lg bg-muted p-6">
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">PDF Document</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSheetOpen(true)}
                  className="gap-2"
                  type="button"
                >
                  <Eye className="h-4 w-4" />
                  View
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
          ) : (
            <div className="p-4 flex flex-col items-center justify-center gap-3 min-h-[192px]">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Document</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(documentUrl, "_blank")}
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

      {/* Full-screen viewer with zoom */}
      <FullScreenDocumentViewer
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        documentUrl={documentUrl}
        documentType={feeType}
        title={`${feeType === "hostel" ? "Hostel" : "Mess"} Fee Document`}
        isImage={isImage}
        isPdf={isPdf}
      />
    </>
  );
}
