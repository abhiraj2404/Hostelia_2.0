import { Link, NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Complaints", to: "/student/complaints" },
  { label: "Mess", to: "/student/mess" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-12">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          Hostelia
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition-colors hover:text-foreground ${
                  isActive ? "text-foreground" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hidden md:inline-flex"
          >
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="md:hidden">
            <Link to="/student/complaints">Complaints</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
