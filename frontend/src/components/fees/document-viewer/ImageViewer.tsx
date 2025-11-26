import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { useState } from "react";
import { FullScreenViewer } from "./FullScreenViewer";

interface ImageViewerProps {
  documentUrl: string;
  feeType: "hostel" | "mess";
  studentRollNo?: string;
}

export function ImageViewer({
  documentUrl,
  feeType,
  studentRollNo,
}: ImageViewerProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
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
        </CardContent>
      </Card>

      <FullScreenViewer
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        documentUrl={documentUrl}
        documentType={feeType}
        title={`${feeType === "hostel" ? "Hostel" : "Mess"} Fee Document`}
        isImage={true}
        isPdf={false}
        showDownload={true}
        studentRollNo={studentRollNo}
      />
    </>
  );
}
