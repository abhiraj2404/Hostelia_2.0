import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/hooks";
import apiClient from "@/lib/api-client";
import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";

interface CollegeInfo {
  _id: string;
  name: string;
  logo?: string;
}

export function CollegeBanner() {
  const { user } = useAppSelector((state) => state.auth);
  const [college, setCollege] = useState<CollegeInfo | null>(null);

  useEffect(() => {
    if (!user?.collegeId) return;

    const fetchCollege = async () => {
      try {
        const res = await apiClient.get("/college/list");
        const colleges: CollegeInfo[] = res.data.colleges || [];
        const match = colleges.find((c) => c._id.toString() === user.collegeId?.toString());
        if (match) setCollege(match);
      } catch {
        // silent fail
      }
    };
    fetchCollege();
  }, [user?.collegeId]);

  if (!college) return null;

  return (
    <Card className="border-border/60 bg-linear-to-r from-primary/5 via-primary/3 to-transparent">
      <CardContent className="py-4 px-6">
        <div className="flex items-center gap-4">
          {college.logo ? (
            <img
              src={college.logo}
              alt={`${college.name} logo`}
              className="w-12 h-12 rounded-lg object-cover border border-border/40 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-border/40">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">{college.name}</p>
            <p className="text-xs text-muted-foreground">Campus Dashboard</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
