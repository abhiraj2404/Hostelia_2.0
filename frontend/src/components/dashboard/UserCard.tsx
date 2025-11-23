import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/hooks";

export function UserCard() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return null;
  }

  const initials = (() => {
    if (user.name) {
      const parts = user.name.split(" ").filter(Boolean);
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0][0]?.toUpperCase() ?? "U";
    }
    if (user.email) return user.email[0]?.toUpperCase() ?? "U";
    return "U";
  })();

  const role = user.role?.toLowerCase() || "";
  const isWarden = role === "warden";
  const isStudent = role === "student";

  // Format role for display
  const formatRole = (role: string | undefined) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <Avatar className="h-24 w-24 border-2 border-border shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">{initials}</AvatarFallback>
          </Avatar>

          {/* User Info Grid */}
          <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-4">
            {/* Top Row - Name and Role */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</p>
              <p className="text-lg font-semibold text-foreground">{user.name || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
              <p className="text-lg font-semibold text-foreground">{user.email || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</p>
              <p className="text-lg font-semibold text-foreground">{formatRole(user.role)}</p>
            </div>

            {/* Show Hostel for Warden and Student */}
            {(isWarden || isStudent) && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hostel</p>
                <p className="text-lg font-semibold text-foreground">{user.hostel || "N/A"}</p>
              </div>
            )}

            {/* Additional student fields - Roll No, Room No, Year */}
            {isStudent && (
              <>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Roll No</p>
                  <p className="text-lg font-semibold text-foreground">{user.rollNo || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Room No</p>
                  <p className="text-lg font-semibold text-foreground">{user.roomNo || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Year</p>
                  <p className="text-lg font-semibold text-foreground">{user.year || "N/A"}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
