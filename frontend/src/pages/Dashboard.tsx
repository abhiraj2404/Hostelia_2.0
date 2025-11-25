import { AdminDashboardLayout } from "@/components/dashboard/layouts/AdminDashboardLayout";
import { StudentDashboardLayout } from "@/components/dashboard/layouts/StudentDashboardLayout";
import { WardenDashboardLayout } from "@/components/dashboard/layouts/WardenDashboardLayout";
import { useAppSelector } from "@/hooks";

function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role;

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {role === "student" ? (
          <StudentDashboardLayout />
        ) : role === "warden" ? (
          <WardenDashboardLayout />
        ) : (
          <AdminDashboardLayout />
        )}
      </div>
    </div>
  );
}


export default Dashboard;
