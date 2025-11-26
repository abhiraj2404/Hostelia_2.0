import { getCloudinaryDownloadUrl, getCloudinaryViewUrl, isImageUrl, isPdfUrl } from "@/lib/cloudinary-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eye, FileText } from "lucide-react";
import { useAppSelector } from "@/hooks";
import { ImageViewer } from "./ImageViewer";
import { PDFViewer } from "./PDFViewer";

interface DocumentViewerProps {
  documentUrl: string;
  feeType: "hostel" | "mess";
  className?: string;
}

export function DocumentViewer({
  documentUrl,
  feeType,
  className,
}: DocumentViewerProps) {
  const { user } = useAppSelector((state) => state.auth);
  const studentRollNo = user?.rollNo;

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
        : documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || "";
      const blobWithType = isPdf
        ? new Blob([blob], { type: "application/pdf" })
        : blob;

      const blobUrl = URL.createObjectURL(blobWithType);
      const link = document.createElement("a");
      link.href = blobUrl;
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
        URL.revokeObjectURL(blobUrl);
      }, 200);
    } catch (error) {
      console.error("Failed to download document:", error);
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

  if (isImage) {
    return (
      <div className={cn(className)}>
        <ImageViewer
          documentUrl={documentUrl}
          feeType={feeType}
          studentRollNo={studentRollNo}
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className={cn(className)}>
        <PDFViewer
          documentUrl={documentUrl}
          feeType={feeType}
          studentRollNo={studentRollNo}
        />
      </div>
    );
  }

  // Fallback for unsupported document types
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

