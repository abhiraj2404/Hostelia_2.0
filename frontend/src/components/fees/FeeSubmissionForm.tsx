import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submitHostelFee, submitMessFee } from "@/features/fees/feesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { DocumentPreview } from "./components/DocumentPreview";
import { FileUploadInput } from "./components/FileUploadInput";
import { SubmissionStatusMessage } from "./components/SubmissionStatusMessage";
import { useFileValidation } from "./hooks/useFileValidation";

interface FeeSubmissionFormProps {
  feeType: "hostel" | "mess";
  currentStatus: "documentNotSubmitted" | "pending" | "approved" | "rejected";
  onSuccess?: () => void;
  isReplacement?: boolean; // Allow replacement regardless of status
}

export function FeeSubmissionForm({
  feeType,
  currentStatus,
  onSuccess,
  isReplacement = false,
}: FeeSubmissionFormProps) {
  const dispatch = useAppDispatch();
  const { submitLoading } = useAppSelector((state) => state.fees);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error, validateFile, clearError } = useFileValidation();

  const isLoading =
    feeType === "hostel" ? submitLoading.hostel : submitLoading.mess;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    clearError(); // Clear previous errors
    if (file) {
      // Validate but don't block - show error if invalid
      if (validateFile(file)) {
        setSelectedFile(file);
      } else {
        // Error is set by validateFile, just don't set the file
        setSelectedFile(null);
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateFile(selectedFile)) {
      return;
    }

    try {
      const action = feeType === "hostel" ? submitHostelFee : submitMessFee;
      const result = await dispatch(action(selectedFile!));

      if (
        submitHostelFee.fulfilled.match(result) ||
        submitMessFee.fulfilled.match(result)
      ) {
        toast.success(
          `${
            feeType === "hostel" ? "Hostel" : "Mess"
          } fee document submitted successfully`
        );
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        clearError();
        onSuccess?.();
      } else {
        const errorMessage = result.payload as string;
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit document";
      toast.error(errorMessage);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Allow submission if status allows it OR if this is a replacement
  const canSubmit =
    isReplacement ||
    currentStatus === "documentNotSubmitted" ||
    currentStatus === "rejected";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isReplacement ? "Replace" : "Submit"}{" "}
          {feeType === "hostel" ? "Hostel" : "Mess"} Fee Document
        </CardTitle>
        <CardDescription>
          {isReplacement
            ? "Upload a new document to replace the existing one. Maximum file size: 10MB"
            : "Upload proof of payment (PNG, JPG, or PDF). Maximum file size: 10MB"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canSubmit && <SubmissionStatusMessage status={currentStatus} />}

        {canSubmit && (
          <>
            <FileUploadInput
              id={`file-${feeType}`}
              accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,image/jpg,application/pdf"
              onChange={handleFileSelect}
              disabled={isLoading}
              ref={fileInputRef}
            />

            <DocumentPreview file={selectedFile} onRemove={handleRemoveFile} />

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Document
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
