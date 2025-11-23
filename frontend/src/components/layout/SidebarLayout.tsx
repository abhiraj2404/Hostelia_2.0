import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppSelector } from "@/hooks";
import { cn } from "@/lib/utils";
import { Bell, LayoutDashboard, Mail, Menu, MessageCircle, SquarePen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Toaster } from "sonner";

type SidebarLayoutProps = {
  children: ReactNode;
};

const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, requireAuth: true },
  { label: "Complaints", to: "/complaints", icon: MessageCircle, requireAuth: true },
  { label: "Mess", to: "/mess", icon: SquarePen, requireAuth: true },
  { label: "Announcements", to: "/announcements", icon: Bell, requireAuth: true },
  { label: "Transit", to: "/transit", icon: LayoutDashboard, requireAuth: true },
  { label: "Contact", to: "/contact", icon: Mail, requireAuth: false }
];

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-background">
      <nav className="flex-1 space-y-1.5 px-5 pt-6">
        {navigation
          .filter((item) => !item.requireAuth || isAuthenticated)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] hover:shadow-sm",
                  isActive ? "bg-primary text-primary-foreground shadow-md scale-[1.01]" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
      </nav>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1">
        {isAuthenticated && (
          <>
            <aside className="hidden w-64 shrink-0 border-r border-border md:block">
              <SidebarContent />
            </aside>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden fixed top-20 left-4 z-40" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </>
        )}
        <main className="flex-1">
          <div className="px-4 py-6 md:px-8">{children}</div>
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
