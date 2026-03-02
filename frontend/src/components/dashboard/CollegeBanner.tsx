import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/hooks";
import { Building2 } from "lucide-react";

export function CollegeBanner() {
  const { user } = useAppSelector((state) => state.auth);

  // Use collegeName from auth state (cached in localStorage)
  const collegeName = user?.collegeName;

  if (!collegeName) return null;

  return (
    <Card className="border-border/60 bg-linear-to-r from-primary/5 via-primary/3 to-transparent">
      <CardContent className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-border/40">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{collegeName}</p>
            <p className="text-xs text-muted-foreground">Campus Dashboard</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
