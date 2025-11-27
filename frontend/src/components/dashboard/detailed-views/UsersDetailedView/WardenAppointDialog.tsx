import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Student, WardenAppointData } from "@/types/users";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface WardenAppointDialogProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
  onAppoint: (data: WardenAppointData) => Promise<void>;
  isLoading?: boolean;
}

export function WardenAppointDialog({
  open,
  onClose,
  students,
  onAppoint,
  isLoading = false,
}: WardenAppointDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (selectedUserId) {
      const student = students.find((s) => s._id === selectedUserId);
      setSelectedStudent(student || null);
    } else {
      setSelectedStudent(null);
    }
  }, [selectedUserId, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    await onAppoint({ userId: selectedUserId });
    setSelectedUserId("");
    setSelectedStudent(null);
  };

  // Group students by hostel for better organization
  const studentsByHostel = students.reduce((acc, student) => {
    const hostel = student.hostel || "Unknown";
    if (!acc[hostel]) acc[hostel] = [];
    acc[hostel].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  // Check warden count per hostel
  const getWardenCountForHostel = (hostel: string) => {
    // This would ideally come from props or be fetched, but for now we'll show a warning
    return 0; // Placeholder - actual count should be passed as prop or fetched
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Appoint Warden</SheetTitle>
          <SheetDescription>
            Select a student to appoint as warden. The student must have a
            hostel assigned. Maximum 2 wardens per hostel.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student">Select Student</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              required
            >
              <SelectTrigger id="student">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(studentsByHostel).map(
                  ([hostel, hostelStudents]) => (
                    <div key={hostel}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {hostel}
                      </div>
                      {hostelStudents.map((student) => (
                        <SelectItem key={student._id} value={student._id}>
                          {student.name} ({student.email})
                          {student.rollNo && ` - ${student.rollNo}`}
                        </SelectItem>
                      ))}
                    </div>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-sm font-medium">Selected Student Details:</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>Name:</strong> {selectedStudent.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedStudent.email}
                </p>
                {selectedStudent.rollNo && (
                  <p>
                    <strong>Roll No:</strong> {selectedStudent.rollNo}
                  </p>
                )}
                <p>
                  <strong>Hostel:</strong> {selectedStudent.hostel}
                </p>
                {selectedStudent.roomNo && (
                  <p>
                    <strong>Room:</strong> {selectedStudent.roomNo}
                  </p>
                )}
              </div>
              {selectedStudent.hostel && (
                <div className="mt-2 rounded border border-yellow-500/20 bg-yellow-500/5 p-2">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> This student will be appointed as
                    warden for {selectedStudent.hostel}. Their roll number,
                    year, and room number will be cleared.
                  </p>
                </div>
              )}
            </div>
          )}

          {students.length === 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">
                No students available to appoint as warden.
              </p>
            </div>
          )}

          <SheetFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedUserId}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Appointing...
                </>
              ) : (
                "Appoint Warden"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
