import { formatDate } from "@/components/dashboard/utils/dashboardConstants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Student, UserManagementFilters } from "@/types/users";
import { sortByNameCaseInsensitive } from "@/utils/sorting";
import { ChevronLeft, ChevronRight, Edit, Eye, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserDeleteDialog } from "../dialogs/UserDeleteDialog";
import { UserEditDialog } from "../dialogs/UserEditDialog";

interface StudentsManagementProps {
  students: Student[];
  filters: UserManagementFilters;
  onFiltersChange: (filters: UserManagementFilters) => void;
  onUpdate: (userId: string, data: Partial<Student>) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  isWarden?: boolean;
  updateLoading?: Record<string, boolean>;
  deleteLoading?: Record<string, boolean>;
}

export function StudentsManagement({
  students,
  filters,
  onFiltersChange,
  onUpdate,
  onDelete,
  loading = false,
  pagination,
  onPageChange,
  isWarden = false,
  updateLoading = {},
  deleteLoading = {},
}: StudentsManagementProps) {
  const navigate = useNavigate();
  const [editingUser, setEditingUser] = useState<Student | null>(null);
  const [deletingUser, setDeletingUser] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filter students based on filters
  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.rollNo?.toLowerCase().includes(query)
      );
    }

    if (filters.hostel && filters.hostel !== "all") {
      filtered = filtered.filter(
        (student) => student.hostel === filters.hostel
      );
    }

    if (filters.year && filters.year !== "all") {
      filtered = filtered.filter((student) => student.year === filters.year);
    }

    // Sort case-insensitively by name
    return sortByNameCaseInsensitive(filtered);
  }, [students, filters]);

  // Paginate filtered results
  const paginatedStudents = useMemo(() => {
    if (!pagination) return filteredStudents;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, pagination]);

  const totalPages = pagination
    ? Math.ceil(filteredStudents.length / pagination.limit)
    : 1;
  const currentPage = pagination?.page || 1;

  const handleEdit = (student: Student) => {
    setEditingUser(student);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (student: Student) => {
    setDeletingUser(student);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (userId: string, data: Partial<Student>) => {
    await onUpdate(userId, data);
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleConfirmDelete = async (userId: string) => {
    await onDelete(userId);
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  return (
    <div className="space-y-4 flex flex-col min-h-[550px]">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {!isWarden && (
          <Select
            value={filters.hostel || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                hostel:
                  value === "all"
                    ? undefined
                    : (value as UserManagementFilters["hostel"]),
              })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Hostel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hostels</SelectItem>
              <SelectItem value="BH-1">BH-1</SelectItem>
              <SelectItem value="BH-2">BH-2</SelectItem>
              <SelectItem value="BH-3">BH-3</SelectItem>
              <SelectItem value="BH-4">BH-4</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Input
          placeholder="Search by name, email, or roll number..."
          value={filters.query || ""}
          onChange={(e) =>
            onFiltersChange({ ...filters, query: e.target.value || undefined })
          }
          className="w-[300px]"
        />

        <Select
          value={filters.year || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              year:
                value === "all"
                  ? undefined
                  : (value as UserManagementFilters["year"]),
            })
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="UG-1">UG-1</SelectItem>
            <SelectItem value="UG-2">UG-2</SelectItem>
            <SelectItem value="UG-3">UG-3</SelectItem>
            <SelectItem value="UG-4">UG-4</SelectItem>
          </SelectContent>
        </Select>

        {(filters.hostel || filters.query || filters.year) && (
          <Button variant="ghost" onClick={() => onFiltersChange({})}>
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : filteredStudents.length === 0 ? (
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
                  {!isWarden && <TableHead>Hostel</TableHead>}
                  <TableHead>Room</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.rollNo || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {student.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.year}</Badge>
                    </TableCell>
                    {!isWarden && (
                      <TableCell>{student.hostel || "N/A"}</TableCell>
                    )}
                    <TableCell>{student.roomNo || "N/A"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(student.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/student/${student._id}`)}
                          title="View student details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                          disabled={updateLoading[student._id]}
                          title="Edit student"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!isWarden && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(student)}
                            disabled={deleteLoading[student._id]}
                            title="Delete student"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && filteredStudents.length > 0 && (
        <div className="flex items-center justify-between border-t px-4 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(currentPage * pagination.limit, filteredStudents.length)}{" "}
            of {filteredStudents.length} students
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <UserEditDialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSave}
        isLoading={editingUser ? updateLoading[editingUser._id] : false}
      />

      <UserDeleteDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingUser(null);
        }}
        user={deletingUser}
        onConfirm={handleConfirmDelete}
        isLoading={deletingUser ? deleteLoading[deletingUser._id] : false}
      />
    </div>
  );
}
