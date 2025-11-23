import { UserCard } from "@/components/dashboard/UserCard";

function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome to your dashboard</p>
        </div>
        <UserCard />
      </div>
    </div>
  );
}

export default Dashboard;
