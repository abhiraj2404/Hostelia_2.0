import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Student } from "@/types/dashboard";
import { formatDate } from "@/components/dashboard/utils/dashboardConstants";

interface StudentsListProps {
  students: Student[];
  loading?: boolean;
}

export function StudentsList({
  students,
  loading = false,
}: StudentsListProps) {
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No students found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.rollNo || 'N/A'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{student.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.year}</Badge>
                  </TableCell>
                  <TableCell>{student.hostel || 'N/A'}</TableCell>
                  <TableCell>{student.roomNo || 'N/A'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(student.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
