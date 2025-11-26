import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { FileText } from "lucide-react";

interface FullScreenDocumentViewerProps {
  open: boolean;
  onClose: () => void;
  documentUrl: string;
  documentType: "hostel" | "mess";
  title?: string;
  isImage: boolean;
  isPdf: boolean;
  showDownload?: boolean; // Hide download for preview before submission
  studentRollNo?: string; // For filename
}

export function FullScreenDocumentViewer({
  open,
  onClose,
  documentUrl,
  documentType,
  title,
  isImage,
  isPdf,
  showDownload = true,
  studentRollNo,
}: FullScreenDocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom and position when modal opens/closes
  useEffect(() => {
    if (open) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [open]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((prev) => Math.min(prev + 0.25, isPdf ? 3 : 5));
      } else if (e.key === "-") {
        e.preventDefault();
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
      } else if (e.key === "0") {
        e.preventDefault();
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isPdf, onClose]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1 && isImage) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1 && isImage) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      // Fetch the file as blob to ensure proper download
      const response = await fetch(documentUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      const blob = await response.blob();
      
      // Create object URL from blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = blobUrl;
      const extension = isPdf ? ".pdf" : documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || "";
      const rollNoPart = studentRollNo ? ` (${studentRollNo})` : "";
      link.download = `${documentType}-fee-document${rollNoPart}${extension}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Failed to download document:", error);
      // Fallback to direct link if blob download fails
      const link = document.createElement("a");
      link.href = documentUrl;
      const extension = isPdf ? ".pdf" : documentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[0] || "";
      const rollNoPart = studentRollNo ? ` (${studentRollNo})` : "";
      link.download = `${documentType}-fee-document${rollNoPart}${extension}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Controls toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 bg-black/50 rounded-lg px-4 py-2">
        {isImage && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="text-white hover:bg-white/20"
              type="button"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-white text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 5}
              className="text-white hover:bg-white/20"
              type="button"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              className="text-white hover:bg-white/20"
              type="button"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </>
        )}
        {isPdf && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="text-white hover:bg-white/20"
              type="button"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-white text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="text-white hover:bg-white/20"
              type="button"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              className="text-white hover:bg-white/20"
              type="button"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </>
        )}
        {showDownload && (
          <>
            <div className="w-px h-6 bg-white/30 mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleDownload(e)}
              className="text-white hover:bg-white/20"
              type="button"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </>
        )}
      </div>

      {/* Document content */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isImage && (
          <img
            ref={imageRef}
            src={documentUrl}
            alt={title || `${documentType} fee document`}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
            draggable={false}
            onClick={(e) => {
              if (zoom === 1) {
                e.stopPropagation();
              }
            }}
          />
        )}

        {isPdf && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div
              className="border rounded-lg overflow-hidden bg-white"
              style={{
                width: `${Math.min(90 * zoom, 100)}%`,
                height: `${Math.min(80 * zoom, 90)}%`,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              <iframe
                src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title="Fee Document PDF"
                className="w-full h-full"
                style={{ border: "none" }}
                allow="fullscreen"
              >
                <div className="p-8 text-center">
                  <p className="text-gray-600 mb-4">Unable to display PDF in browser.</p>
                  <p className="text-sm text-gray-500">Please download the document to view it.</p>
                </div>
              </iframe>
            </div>
          </div>
        )}

        {!isImage && !isPdf && (
          <div className="text-center space-y-4">
            <FileText className="h-16 w-16 text-white mx-auto" />
            <p className="text-white">Unsupported document type. Please download to view.</p>
            <Button
              onClick={(e) => handleDownload(e)}
              className="gap-2"
              type="button"
            >
              <Download className="h-4 w-4" />
              Download Document
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

