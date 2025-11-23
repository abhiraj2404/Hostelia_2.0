import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  LogOut,
  Mail,
  MessageCircle,
  SquarePen,
  UserCircle2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Navbar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const initials = (() => {
    if (user?.name) {
      const parts = user.name.split(" ").filter(Boolean);
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0][0]?.toUpperCase() ?? "U";
    }
    if (user?.email) return user.email[0]?.toUpperCase() ?? "U";
    return "U";
  })();

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      dispatch(logout());
      navigate("/");
      toast.success("Logged out successfully");
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex w-64 shrink-0 items-center px-6">
        <NavLink
          to="/"
          className="text-2xl font-bold tracking-tight transition-colors hover:text-primary"
        >
          Hostelia
        </NavLink>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2 px-4 md:px-6">
        {/* Show Contact link only when not logged in */}
        {!isAuthenticated && (
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`
            }
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </NavLink>
        )}
        
        {isAuthenticated && user && <NotificationBell />}
        
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors">
                <Avatar className="h-7 w-7 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {user.name ?? "User"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="space-y-1">
                  <p className="text-sm font-semibold leading-none">
                    {user.name ?? "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <NavLink
                  to="/complaints"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  My complaints
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/complaints/new"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <SquarePen className="h-4 w-4" />
                  New complaint
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            asChild
          >
            <NavLink to="/login">
              <UserCircle2 className="mr-2 h-4 w-4" />
              Log in
            </NavLink>
          </Button>
        )}
      </div>
    </header>
  );
}

