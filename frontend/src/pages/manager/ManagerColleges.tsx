import { useEffect, useState } from "react";
import { Loader2, Users, Home, UtensilsCrossed } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface College {
  _id: string;
  name: string;
  emailDomain: string;
  adminEmail: string;
  status?: string;
  hostelsCount: number;
  messesCount: number;
  usersCount: number;
  createdAt: string;
}

export default function ManagerColleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await apiClient.get("/manager/colleges");
        if (res.data?.success) {
          // Filter to approved + legacy (no status)
          setColleges(
            res.data.colleges.filter(
              (c: College) => c.status === "approved" || !c.status
            )
          );
        }
      } catch {
        toast.error("Failed to load colleges");
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Colleges</h1>
        <p className="text-muted-foreground">
          All approved colleges on the platform
        </p>
      </div>

      {colleges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No colleges registered yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((college) => (
            <Card key={college._id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{college.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {college.status === "approved" ? "Active" : "Legacy"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {college.emailDomain}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Admin: {college.adminEmail}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{college.hostelsCount}</span>
                    <span className="text-muted-foreground">hostels</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UtensilsCrossed className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{college.messesCount}</span>
                    <span className="text-muted-foreground">messes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{college.usersCount}</span>
                    <span className="text-muted-foreground">users</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Registered {new Date(college.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
