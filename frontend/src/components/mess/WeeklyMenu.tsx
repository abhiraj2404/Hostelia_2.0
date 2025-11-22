import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UtensilsCrossed, Coffee, Cookie, Moon } from "lucide-react";

interface MenuData {
  [day: string]: {
    [mealType: string]: string[];
  };
}

interface WeeklyMenuProps {
  menu: MenuData | null;
  menuStatus: "idle" | "loading" | "succeeded" | "failed";
}

const mealTypes = [
  { value: "Breakfast", label: "Breakfast", icon: Coffee },
  { value: "Lunch", label: "Lunch", icon: UtensilsCrossed },
  { value: "Snacks", label: "Snacks", icon: Cookie },
  { value: "Dinner", label: "Dinner", icon: Moon },
] as const;

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// ChevronRight component for the details dropdown
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function WeeklyMenu({ menu, menuStatus }: WeeklyMenuProps) {
  return (
    <Card className="shadow-lg border-border/50 w-full">
      <CardHeader className="border-b bg-muted/30 px-4 py-3">
        <CardTitle className="text-lg">Weekly Menu</CardTitle>
        <CardDescription className="text-sm">Full week meal schedule</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 px-4 pb-4 w-full">
        {menuStatus === "succeeded" && menu && (
          <div className="space-y-2.5">
            {dayNames.map((day) => (
              <details
                key={day}
                className="group rounded-xl border-2 border-border/50 bg-card overflow-hidden hover:border-primary/20 transition-colors"
              >
                <summary className="cursor-pointer px-4 py-3 font-semibold hover:bg-muted/50 transition-colors list-none flex items-center justify-between">
                  <span>{day}</span>
                  <ChevronRight className="size-4 transition-transform group-open:rotate-90 text-muted-foreground" />
                </summary>
                <div className="px-2 pb-2 pt-1 space-y-1 border-t bg-muted/20">
                  {mealTypes.map(({ value, label }) => (
                    <div key={value} className="text-xs flex flex-col gap-0.5">
                      <span className="font-medium text-foreground text-xs">
                        {label}
                      </span>
                      <span className="text-muted-foreground pl-1 text-xs">
                        {menu[day]?.[value]?.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
