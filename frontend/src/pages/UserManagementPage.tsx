import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  fetchStudents,
  fetchWardens,
  updateUser,
  deleteUser,
  createWarden,
  setStudentsFilters,
  setWardensFilters,
  setStudentsPage,
  setWardensPage,
  selectUsersState,
} from "@/features/users";
import type { Student, Warden, WardenCreateData } from "@/types/users";
import { UsersStatsView } from "@/components/dashboard/detailed-views/UsersDetailedView";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

export default function UserManagementPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const usersState = useAppSelector(selectUsersState);

  const isWarden = user?.role === "warden";
  const isAdmin = user?.role === "admin";

  // Redirect if not admin or warden
  useEffect(() => {
    if (!isAdmin && !isWarden) {
      navigate("/dashboard");
      toast.error("You don't have permission to access this page.");
    }
  }, [isAdmin, isWarden, navigate]);

  // Fetch initial data
  useEffect(() => {
    if (isAdmin || isWarden) {
      dispatch(fetchStudents());
      if (isAdmin) {
        dispatch(fetchWardens());
      }
    }
  }, [dispatch, isAdmin, isWarden]);

  // User management handlers
  const handleUpdateStudent = async (userId: string, data: Partial<Student>) => {
    try {
      const action = await dispatch(updateUser({ userId, data }));
      if (updateUser.fulfilled.match(action)) {
        toast.success("Student updated successfully");
        dispatch(fetchStudents());
      } else {
        const errorMessage = action.payload || "Failed to update student";
        if (
          errorMessage.includes("403") ||
          errorMessage.includes("Forbidden")
        ) {
          toast.error(
            isWarden
              ? "You can only update students from your hostel. Please ensure the student belongs to your hostel."
              : "You don't have permission to update this student. Only admins can update students from all hostels."
          );
        } else {
          toast.error(errorMessage);
        }
      }
    } catch {
      toast.error("An unexpected error occurred while updating the student.");
    }
  };

  const handleUpdateWarden = async (userId: string, data: Partial<Warden>) => {
    if (isWarden) {
      toast.error("Wardens cannot update other wardens.");
      return Promise.reject("Unauthorized");
    }
    try {
      const action = await dispatch(updateUser({ userId, data }));
      if (updateUser.fulfilled.match(action)) {
        toast.success("Warden updated successfully");
        dispatch(fetchWardens());
      } else {
        const errorMessage = action.payload || "Failed to update warden";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while updating the warden.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteStudent = async (userId: string) => {
    if (isWarden) {
      toast.error("Wardens cannot delete students.");
      return Promise.reject("Unauthorized");
    }
    const action = await dispatch(deleteUser(userId));
    if (deleteUser.fulfilled.match(action)) {
      toast.success("Student deleted successfully");
      dispatch(fetchStudents());
    } else {
      toast.error(action.payload || "Failed to delete student");
    }
  };

  const handleDeleteWarden = async (userId: string) => {
    if (isWarden) {
      toast.error("Wardens cannot delete wardens.");
      return Promise.reject("Unauthorized");
    }
    const action = await dispatch(deleteUser(userId));
    if (deleteUser.fulfilled.match(action)) {
      toast.success("Warden deleted successfully");
      dispatch(fetchWardens());
    } else {
      toast.error(action.payload || "Failed to delete warden");
    }
  };

  const handleCreateWarden = async (data: WardenCreateData) => {
    if (isWarden) {
      toast.error("Wardens cannot create wardens. Only admins can create wardens.");
      return Promise.reject("Unauthorized");
    }
    const action = await dispatch(createWarden(data));
    if (createWarden.fulfilled.match(action)) {
      toast.success("Warden created successfully");
      dispatch(fetchWardens());
    } else {
      toast.error(action.payload || "Failed to create warden");
    }
  };

  if (!isAdmin && !isWarden) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Manage all students and wardens"
              : "Manage students from your hostel"}
          </p>
        </div>
      </div>

      {/* User Management Content */}
      <UsersStatsView
        students={usersState.students}
        wardens={isAdmin ? usersState.wardens : []}
        studentsFilters={usersState.studentsFilters}
        wardensFilters={usersState.wardensFilters}
        onStudentsFiltersChange={(filters) => {
          dispatch(setStudentsFilters(filters));
        }}
        onWardensFiltersChange={(filters) => {
          dispatch(setWardensFilters(filters));
        }}
        onUpdateStudent={handleUpdateStudent}
        onUpdateWarden={handleUpdateWarden}
        onDeleteStudent={handleDeleteStudent}
        onDeleteWarden={handleDeleteWarden}
        onCreateWarden={handleCreateWarden}
        studentsLoading={usersState.studentsLoading}
        wardensLoading={usersState.wardensLoading}
        studentsPagination={usersState.studentsPagination}
        wardensPagination={usersState.wardensPagination}
        onStudentsPageChange={(page) => {
          dispatch(setStudentsPage(page));
        }}
        onWardensPageChange={(page) => {
          dispatch(setWardensPage(page));
        }}
        isWarden={isWarden}
        updateLoading={usersState.updateLoading}
        deleteLoading={usersState.deleteLoading}
        createWardenLoading={usersState.createWardenLoading}
      />
    </div>
  );
}

