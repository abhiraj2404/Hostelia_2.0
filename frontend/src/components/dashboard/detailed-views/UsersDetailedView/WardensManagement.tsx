import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Edit, Trash2, UserPlus, ChevronLeft, ChevronRight, UserMinus } from "lucide-react";
import { formatDate } from "@/components/dashboard/utils/dashboardConstants";
import type { Warden, UserManagementFilters } from "@/types/users";
import { UserEditDialog } from "./UserEditDialog";
import { UserDeleteDialog } from "./UserDeleteDialog";
import { WardenAppointDialog } from "./WardenAppointDialog";

interface WardensManagementProps {
  wardens: Warden[];
  students: Array<{ _id: string; name: string; email: string; hostel?: string; rollNo?: string }>;
  filters: UserManagementFilters;
  onFiltersChange: (filters: UserManagementFilters) => void;
  onUpdate: (userId: string, data: Partial<Warden>) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onAppoint: (data: { userId: string }) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  updateLoading?: Record<string, boolean>;
  deleteLoading?: Record<string, boolean>;
  appointLoading?: boolean;
  removeLoading?: Record<string, boolean>;
}

export function WardensManagement({
  wardens,
  students,
  filters,
  onFiltersChange,
  onUpdate,
  onDelete,
  onAppoint,
  onRemove,
  loading = false,
  pagination,
  onPageChange,
  updateLoading = {},
  deleteLoading = {},
  appointLoading = false,
  removeLoading = {},
}: WardensManagementProps) {
  const [editingUser, setEditingUser] = useState<Warden | null>(null);
  const [deletingUser, setDeletingUser] = useState<Warden | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAppointDialogOpen, setIsAppointDialogOpen] = useState(false);

  // Filter wardens based on filters
  const filteredWardens = useMemo(() => {
    let filtered = [...wardens];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (warden) =>
          warden.name.toLowerCase().includes(query) ||
          warden.email.toLowerCase().includes(query)
      );
    }

    if (filters.hostel && filters.hostel !== "all") {
      filtered = filtered.filter((warden) => warden.hostel === filters.hostel);
    }

    return filtered;
  }, [wardens, filters]);

  // Paginate filtered results
  const paginatedWardens = useMemo(() => {
    if (!pagination) return filteredWardens;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredWardens.slice(startIndex, endIndex);
  }, [filteredWardens, pagination]);

  const totalPages = pagination
    ? Math.ceil(filteredWardens.length / pagination.limit)
    : 1;
  const currentPage = pagination?.page || 1;

  const handleEdit = (warden: Warden) => {
    setEditingUser(warden);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (warden: Warden) => {
    setDeletingUser(warden);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (userId: string, data: Partial<Warden>) => {
    await onUpdate(userId, data);
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleConfirmDelete = async (userId: string) => {
    await onDelete(userId);
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const handleAppoint = async (data: { userId: string }) => {
    await onAppoint(data);
    setIsAppointDialogOpen(false);
  };

  return (
    <div className="space-y-4 flex flex-col min-h-[550px]">
      {/* Header with Appoint Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <Select
            value={filters.hostel || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                hostel: value === "all" ? undefined : (value as UserManagementFilters["hostel"]),
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

          <Input
            placeholder="Search by name or email..."
            value={filters.query || ""}
            onChange={(e) =>
              onFiltersChange({ ...filters, query: e.target.value || undefined })
            }
            className="w-[300px]"
          />

          {(filters.hostel || filters.query) && (
            <Button variant="ghost" onClick={() => onFiltersChange({})}>
              Clear
            </Button>
          )}
        </div>
        <Button onClick={() => setIsAppointDialogOpen(true)} disabled={appointLoading}>
          <UserPlus className="h-4 w-4 mr-2" />
          Appoint Warden
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : filteredWardens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No wardens found</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedWardens.map((warden) => (
                  <TableRow key={warden._id}>
                    <TableCell className="font-medium">{warden.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {warden.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{warden.hostel}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(warden.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(warden)}
                          disabled={updateLoading[warden._id]}
                          title="Edit warden"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(warden._id)}
                          disabled={removeLoading[warden._id]}
                          title="Remove warden (downgrade to student)"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(warden)}
                          disabled={deleteLoading[warden._id]}
                          title="Delete warden"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
      {pagination && filteredWardens.length > 0 && (
        <div className="flex items-center justify-between px-2 pt-4 mt-auto">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pagination.limit) + 1} to{" "}
            {Math.min(currentPage * pagination.limit, filteredWardens.length)} of{" "}
            {filteredWardens.length} wardens
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

      <WardenAppointDialog
        open={isAppointDialogOpen}
        onClose={() => setIsAppointDialogOpen(false)}
        students={students as any}
        onAppoint={handleAppoint}
        isLoading={appointLoading}
      />
    </div>
  );
}

