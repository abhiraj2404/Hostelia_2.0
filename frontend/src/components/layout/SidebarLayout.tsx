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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  Bell,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  SquarePen,
  UserCircle2,
} from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

type SidebarLayoutProps = {
  children: ReactNode;
};

const navigation = [
  { label: "Overview", to: "/", icon: Home },
  { label: "Complaints", to: "/complaints", icon: MessageCircle },
  { label: "Mess", to: "/mess", icon: SquarePen },
  { label: "Announcements", to: "/announcements", icon: Bell },
  { label: "Transit", to: "/transit", icon: LayoutDashboard },
];

export function SidebarLayout({ children }: SidebarLayoutProps) {
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

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-6 border-r border-border bg-background px-5 py-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-lg font-bold tracking-tight">Hostelia</p>
          <p className="text-xs text-muted-foreground">
            Campus living made better
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] hover:shadow-sm",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md scale-[1.01]"
                  : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-4 border-t border-border pt-4">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user.name ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
                {user.hostel && (
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {user.role?.toUpperCase()} · {user.hostel}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            asChild
          >
            <NavLink to="/login">
              <UserCircle2 className="mr-2 h-4 w-4" />
              Log in
            </NavLink>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 md:flex">
        <SidebarContent />
      </aside>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="absolute left-4 top-4 md:hidden"
            size="icon"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
      <main className="flex-1 md:pl-0">
        <header className="flex h-14 items-center justify-end border-b border-border bg-background px-4 md:px-6">
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
        </header>
        <div className="px-4 py-6 md:px-8">{children}</div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
