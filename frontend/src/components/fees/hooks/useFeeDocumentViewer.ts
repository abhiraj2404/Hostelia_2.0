import { fetchUsersByIds } from "@/lib/user-api";
import { useState } from "react";

interface ViewingDocument {
  url: string;
  type: "hostel" | "mess";
  studentName: string;
  studentId: string;
  studentRollNo?: string;
}

export function useFeeDocumentViewer() {
  const [viewingDocument, setViewingDocument] = useState<ViewingDocument | null>(null);

  const handleViewDocument = async (
    url: string,
    type: "hostel" | "mess",
    studentName: string,
    studentId: string
  ) => {
    // Fetch student roll number for admin/warden
    let studentRollNo: string | undefined;
    try {
      const users = await fetchUsersByIds([studentId]);
      const student = users.get(studentId);
      studentRollNo = student?.rollNo;
    } catch (error) {
      console.error("Failed to fetch student roll number:", error);
    }

    setViewingDocument({ url, type, studentName, studentId, studentRollNo });
  };

  const closeDocument = () => {
    setViewingDocument(null);
  };

  return {
    viewingDocument,
    handleViewDocument,
    closeDocument,
  };
}

