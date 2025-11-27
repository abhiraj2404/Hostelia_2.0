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
import type {
  UserManagementFilters,
  Warden,
  WardenCreateData,
} from "@/types/users";
import { sortByNameCaseInsensitive } from "@/utils/sorting";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { UserDeleteDialog } from "../dialogs/UserDeleteDialog";
import { UserEditDialog } from "../dialogs/UserEditDialog";
import { WardenCreateDialog } from "../dialogs/WardenCreateDialog";

interface WardensManagementProps {
  wardens: Warden[];
  filters: UserManagementFilters;
  onFiltersChange: (filters: UserManagementFilters) => void;
  onUpdate: (userId: string, data: Partial<Warden>) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onCreate: (data: WardenCreateData) => Promise<void>;
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  updateLoading?: Record<string, boolean>;
  deleteLoading?: Record<string, boolean>;
  createLoading?: boolean;
}

export function WardensManagement({
  wardens,
  filters,
  onFiltersChange,
  onUpdate,
  onDelete,
  onCreate,
  loading = false,
  pagination,
  onPageChange,
  updateLoading = {},
  deleteLoading = {},
  createLoading = false,
}: WardensManagementProps) {
  const [editingUser, setEditingUser] = useState<Warden | null>(null);
  const [deletingUser, setDeletingUser] = useState<Warden | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Calculate warden counts per hostel
  const wardenCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    wardens.forEach((warden) => {
      if (warden.hostel) {
        counts[warden.hostel] = (counts[warden.hostel] || 0) + 1;
      }
    });
    return counts;
  }, [wardens]);

  // Filter and sort wardens based on filters
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

    // Sort case-insensitively by name
    return sortByNameCaseInsensitive(filtered);
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
    try {
      await onUpdate(userId, data);
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch {
      // Error is already handled in onUpdate (toast shown), just don't close dialog
      // The dialog will stay open so user can retry
    }
  };

  const handleConfirmDelete = async (userId: string) => {
    const warden = wardens.find((w) => w._id === userId);
    if (warden?.hostel && wardenCounts[warden.hostel] === 1) {
      // This should be prevented by UI, but double-check
      return;
    }
    await onDelete(userId);
    setIsDeleteDialogOpen(false);
    setDeletingUser(null);
  };

  const handleCreate = async (data: WardenCreateData) => {
    await onCreate(data);
    setIsCreateDialogOpen(false);
  };

  const canDeleteWarden = (warden: Warden) => {
    if (!warden.hostel) return true;
    return wardenCounts[warden.hostel] > 1;
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

          <Input
            placeholder="Search by name or email..."
            value={filters.query || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                query: e.target.value || undefined,
              })
            }
            className="w-[300px]"
          />

          {(filters.hostel || filters.query) && (
            <Button variant="ghost" onClick={() => onFiltersChange({})}>
              Clear
            </Button>
          )}
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={createLoading}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Create Warden
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
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{warden.hostel}</Badge>
                        {warden.hostel && wardenCounts[warden.hostel] === 1 && (
                          <Badge
                            variant="outline"
                            className="text-xs text-yellow-700 border-yellow-500"
                          >
                            Sole Warden
                          </Badge>
                        )}
                      </div>
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
                          onClick={() => handleDelete(warden)}
                          disabled={
                            deleteLoading[warden._id] ||
                            !canDeleteWarden(warden)
                          }
                          title={
                            canDeleteWarden(warden)
                              ? "Delete warden"
                              : "Cannot delete. This is the only warden for this hostel."
                          }
                          className="text-destructive hover:text-destructive disabled:opacity-50"
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
            Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(currentPage * pagination.limit, filteredWardens.length)}{" "}
            of {filteredWardens.length} wardens
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

      <UserDeleteDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingUser(null);
        }}
        user={deletingUser}
        onConfirm={handleConfirmDelete}
        isLoading={deletingUser ? deleteLoading[deletingUser._id] : false}
        warningMessage={
          deletingUser?.hostel && wardenCounts[deletingUser.hostel] === 1
            ? "Cannot delete warden. This is the only warden for this hostel. Hostel must have at least one warden."
            : undefined
        }
      />

      <WardenCreateDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreate}
        isLoading={createLoading}
      />

      <UserEditDialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSave}
        isLoading={editingUser ? updateLoading[editingUser._id] : false}
        wardenCounts={wardenCounts}
      />
    </div>
  );
}
