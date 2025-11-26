import { FullScreenViewer } from "@/components/fees/document-viewer/FullScreenViewer";
import { getImageExtension } from "@/components/fees/document-viewer/utils/imageUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { useState } from "react";

interface AnnouncementImageViewerProps {
  documentUrl: string;
  announcementTitle: string;
}

export function AnnouncementImageViewer({
  documentUrl,
  announcementTitle,
}: AnnouncementImageViewerProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const extension = getImageExtension(documentUrl) || ".jpg";
  const sanitizedTitle = announcementTitle
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  const downloadFileName = `announcement-${sanitizedTitle}${extension}`;

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative group">
            <img
              src={documentUrl}
              alt={`Announcement attachment: ${announcementTitle}`}
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
        </CardContent>
      </Card>

      <FullScreenViewer
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        documentUrl={documentUrl}
        documentType="hostel"
        title={`Announcement Attachment: ${announcementTitle}`}
        isImage={true}
        isPdf={false}
        showDownload={true}
        downloadFileName={downloadFileName}
      />
    </>
  );
}
