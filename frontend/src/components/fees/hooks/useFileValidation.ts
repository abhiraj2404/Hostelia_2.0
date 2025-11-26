import { useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

export interface FileValidationError {
  message: string;
}

export function useFileValidation() {
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File | null): boolean => {
    if (!file) {
      setError("Please select a file");
      return false;
    }

    // Validate file type
    if (!VALID_TYPES.includes(file.type)) {
      setError("Please select a PNG, JPG, or PDF file");
      return false;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 10MB");
      return false;
    }

    setError(null);
    return true;
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    validateFile,
    clearError,
    maxFileSize: MAX_FILE_SIZE,
    validTypes: VALID_TYPES,
  };
}

