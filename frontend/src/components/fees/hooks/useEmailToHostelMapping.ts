import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type { Student } from "@/types/dashboard";

export function useEmailToHostelMapping() {
  const [emailToHostel, setEmailToHostel] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await apiClient.get("/user/students/all");
        const students: Student[] = res.data.students || [];

        const mapping: Record<string, string> = {};
        students.forEach((student) => {
          if (student.email && student.hostel) {
            mapping[student.email] = student.hostel;
          }
        });

        setEmailToHostel(mapping);
      } catch (error) {
        console.error("Failed to fetch students for hostel mapping:", error);
      }
    };

    fetchStudents();
  }, []);

  return emailToHostel;
}

