import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forwardRef } from "react";

interface FileUploadInputProps {
  id: string;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const FileUploadInput = forwardRef<HTMLInputElement, FileUploadInputProps>(
  ({ id, accept, onChange, disabled }, ref) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>Select Document</Label>
        <div className="flex items-center gap-2">
          <Input
            id={id}
            type="file"
            accept={accept}
            onChange={onChange}
            ref={ref}
            disabled={disabled}
            className="cursor-pointer"
          />
        </div>
      </div>
    );
  }
);

FileUploadInput.displayName = "FileUploadInput";

