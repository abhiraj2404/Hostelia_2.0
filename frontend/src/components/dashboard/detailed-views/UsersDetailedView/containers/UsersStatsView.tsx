import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks";
import type {
  Student,
  UserManagementFilters,
  Warden,
  WardenCreateData,
} from "@/types/users";
import { sortByNameCaseInsensitive } from "@/utils/sorting";
import { Shield, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { StudentsManagement } from "../components/tables/StudentsManagement";
import { WardensManagement } from "../components/tables/WardensManagement";

type UsersTab = "students" | "wardens";

interface UsersStatsViewProps {
  students: Student[];
  wardens: Warden[];
  studentsFilters: UserManagementFilters;
  wardensFilters: UserManagementFilters;
  onStudentsFiltersChange: (filters: UserManagementFilters) => void;
  onWardensFiltersChange: (filters: UserManagementFilters) => void;
  onUpdateStudent: (userId: string, data: Partial<Student>) => Promise<void>;
  onUpdateWarden: (userId: string, data: Partial<Warden>) => Promise<void>;
  onDeleteStudent: (userId: string) => Promise<void>;
  onDeleteWarden: (userId: string) => Promise<void>;
  onCreateWarden: (data: WardenCreateData) => Promise<void>;
  studentsLoading?: boolean;
  wardensLoading?: boolean;
  studentsPagination?: {
    page: number;
    limit: number;
    total: number;
  };
  wardensPagination?: {
    page: number;
    limit: number;
    total: number;
  };
  onStudentsPageChange?: (page: number) => void;
  onWardensPageChange?: (page: number) => void;
  isWarden?: boolean;
  updateLoading?: Record<string, boolean>;
  deleteLoading?: Record<string, boolean>;
  createWardenLoading?: boolean;
}

export function UsersStatsView({
  students,
  wardens,
  studentsFilters,
  wardensFilters,
  onStudentsFiltersChange,
  onWardensFiltersChange,
  onUpdateStudent,
  onUpdateWarden,
  onDeleteStudent,
  onDeleteWarden,
  onCreateWarden,
  studentsLoading = false,
  wardensLoading = false,
  studentsPagination,
  wardensPagination,
  onStudentsPageChange,
  onWardensPageChange,
  isWarden = false,
  updateLoading = {},
  deleteLoading = {},
  createWardenLoading = false,
}: UsersStatsViewProps) {
  const [activeTab, setActiveTab] = useState<UsersTab>(
    isWarden ? "students" : "students"
  );
  const { user } = useAppSelector((state) => state.auth);

  // Filter and sort students by hostel for wardens
  const filteredStudents = useMemo(() => {
    let filtered = students;
    if (isWarden && user?.hostel) {
      filtered = filtered.filter((s) => s.hostel === user.hostel);
    }
    // Sort case-insensitively
    return sortByNameCaseInsensitive(filtered);
  }, [students, isWarden, user?.hostel]);

  const tabs = [
    { id: "students" as UsersTab, label: "Students", icon: Users },
    ...(isWarden
      ? []
      : [{ id: "wardens" as UsersTab, label: "Wardens", icon: Shield }]),
  ];

  // For wardens, show students directly without tabs
  if (isWarden) {
    return (
      <div className="space-y-4">
        <StudentsManagement
          students={filteredStudents}
          filters={studentsFilters}
          onFiltersChange={onStudentsFiltersChange}
          onUpdate={onUpdateStudent}
          onDelete={onDeleteStudent}
          loading={studentsLoading}
          pagination={studentsPagination}
          onPageChange={onStudentsPageChange}
          isWarden={isWarden}
          updateLoading={updateLoading}
          deleteLoading={deleteLoading}
        />
      </div>
    );
  }

  // For admins, show tabs to switch between Students and Wardens
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "students" && (
        <StudentsManagement
          students={filteredStudents}
          filters={studentsFilters}
          onFiltersChange={onStudentsFiltersChange}
          onUpdate={onUpdateStudent}
          onDelete={onDeleteStudent}
          loading={studentsLoading}
          pagination={studentsPagination}
          onPageChange={onStudentsPageChange}
          isWarden={isWarden}
          updateLoading={updateLoading}
          deleteLoading={deleteLoading}
        />
      )}

      {activeTab === "wardens" && (
        <WardensManagement
          wardens={wardens}
          filters={wardensFilters}
          onFiltersChange={onWardensFiltersChange}
          onUpdate={onUpdateWarden}
          onDelete={onDeleteWarden}
          onCreate={onCreateWarden}
          loading={wardensLoading}
          pagination={wardensPagination}
          onPageChange={onWardensPageChange}
          updateLoading={updateLoading}
          deleteLoading={deleteLoading}
          createLoading={createWardenLoading}
        />
      )}
    </div>
  );
}
