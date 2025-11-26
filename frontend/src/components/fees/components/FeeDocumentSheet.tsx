import { FullScreenDocumentViewer } from "./FullScreenDocumentViewer";

interface FeeDocumentSheetProps {
  open: boolean;
  onClose: () => void;
  documentUrl: string | null;
  documentType: "hostel" | "mess" | null;
  studentName: string | null;
}

export function FeeDocumentSheet({
  open,
  onClose,
  documentUrl,
  documentType,
  studentName,
}: FeeDocumentSheetProps) {
  if (!documentUrl || !documentType || !studentName) return null;

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(documentUrl) || 
                  documentUrl.includes("image") || 
                  documentUrl.match(/\.(jpg|jpeg|png|gif|webp)/i);
  const isPdf = /\.pdf$/i.test(documentUrl) || 
                documentUrl.includes("pdf") ||
                documentUrl.includes("application/pdf");

  return (
    <FullScreenDocumentViewer
      open={open}
      onClose={onClose}
      documentUrl={documentUrl}
      documentType={documentType}
      title={`${studentName}'s ${documentType === "hostel" ? "Hostel" : "Mess"} Fee Document`}
      isImage={isImage}
      isPdf={isPdf}
    />
  );
}


