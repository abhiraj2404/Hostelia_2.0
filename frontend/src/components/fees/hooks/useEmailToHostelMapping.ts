import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type { Student } from "@/types/dashboard";

export function useEmailToHostelMapping() {
  const [emailToHostelId, setEmailToHostelId] = useState<Record<string, string>>(
    {}
  );
  const [emailToHostelName, setEmailToHostelName] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await apiClient.get("/user/students/all");
        const students: Student[] = res.data.students || [];

        const idMap: Record<string, string> = {};
        const nameMap: Record<string, string> = {};
        students.forEach((student) => {
          if (student.email) {
            if (student.hostelId) idMap[student.email] = student.hostelId;
            if (student.hostelName) nameMap[student.email] = student.hostelName;
          }
        });

        setEmailToHostelId(idMap);
        setEmailToHostelName(nameMap);
      } catch (error) {
        console.error("Failed to fetch students for hostel mapping:", error);
      }
    };

    fetchStudents();
  }, []);

  return { emailToHostelId, emailToHostelName };
}
