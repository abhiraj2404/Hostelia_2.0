import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppSelector } from "@/hooks";
import { User, Mail, Home, Store } from "lucide-react";
// Bug 5: Mess section only shown for students

export function UserProfileCard() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Profile</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-2xl font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground capitalize mt-1">{user.role}</p>
            </div>

            {/* Horizontal layout for user details */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>

              {user.hostelId && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home className="h-4 w-4" />
                  <span className="text-sm">
                    {user.hostelName || user.hostelId}{user.roomNo ? ` • Room ${user.roomNo}` : ''}
                  </span>
                </div>
              )}

              {user.role === "student" && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Store className="h-4 w-4" />
                  <span className="text-sm">
                    Mess: {user.messName || <span className="italic text-muted-foreground/70">Unassigned</span>}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
