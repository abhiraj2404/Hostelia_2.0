import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Users, Shield } from "lucide-react";
import { StudentsManagement } from "./StudentsManagement";
import { WardensManagement } from "./WardensManagement";
import type { Student, Warden, UserManagementFilters } from "@/types/users";
import { useAppSelector } from "@/hooks";

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
  onAppointWarden: (data: { userId: string }) => Promise<void>;
  onRemoveWarden: (userId: string) => Promise<void>;
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
  appointLoading?: boolean;
  removeLoading?: Record<string, boolean>;
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
  onAppointWarden,
  onRemoveWarden,
  studentsLoading = false,
  wardensLoading = false,
  studentsPagination,
  wardensPagination,
  onStudentsPageChange,
  onWardensPageChange,
  isWarden = false,
  updateLoading = {},
  deleteLoading = {},
  appointLoading = false,
  removeLoading = {},
}: UsersStatsViewProps) {
  const [activeTab, setActiveTab] = useState<UsersTab>(isWarden ? "students" : "students");
  const { user } = useAppSelector((state) => state.auth);
  
  // Filter students by hostel for wardens
  const filteredStudents = useMemo(() => {
    if (!isWarden || !user?.hostel) return students;
    return students.filter((s) => s.hostel === user.hostel);
  }, [students, isWarden, user?.hostel]);

  const tabs = [
    { id: "students" as UsersTab, label: "Students", icon: Users },
    ...(isWarden ? [] : [{ id: "wardens" as UsersTab, label: "Wardens", icon: Shield }]),
  ];

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

      {activeTab === "wardens" && !isWarden && (
        <WardensManagement
          wardens={wardens}
          students={students.map((s) => ({
            _id: s._id,
            name: s.name,
            email: s.email,
            hostel: s.hostel,
            rollNo: s.rollNo,
          }))}
          filters={wardensFilters}
          onFiltersChange={onWardensFiltersChange}
          onUpdate={onUpdateWarden}
          onDelete={onDeleteWarden}
          onAppoint={onAppointWarden}
          onRemove={onRemoveWarden}
          loading={wardensLoading}
          pagination={wardensPagination}
          onPageChange={onWardensPageChange}
          updateLoading={updateLoading}
          deleteLoading={deleteLoading}
          appointLoading={appointLoading}
          removeLoading={removeLoading}
        />
      )}
    </div>
  );
}

