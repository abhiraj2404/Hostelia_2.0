import { Button } from "@/components/ui/button";
import { File, Upload, X } from "lucide-react";

interface FilePreviewProps {
  file: File | null;
  onRemove: () => void;
  disabled?: boolean;
}

export function FilePreview({ file, onRemove, disabled }: FilePreviewProps) {
  if (!file) return null;

  const getFileIcon = () => {
    if (file.type === "application/pdf") {
      return <File className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-center justify-between">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getFileIcon()}
        <span className="text-sm truncate">{file.name}</span>
        <span className="text-xs text-muted-foreground">
          ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={disabled}
        className="shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

