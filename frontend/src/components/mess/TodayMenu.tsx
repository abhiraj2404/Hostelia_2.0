import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2, UtensilsCrossed, Coffee, Cookie, Moon } from "lucide-react";

interface MenuData {
  [day: string]: {
    [mealType: string]: string[];
  };
}

interface TodayMenuProps {
  selectedDate: Date;
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

export function TodayMenu({ selectedDate, menu, menuStatus }: TodayMenuProps) {
  const selectedDay = dayNames[selectedDate.getDay()];
  const selectedDateMenu = menu?.[selectedDay];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
  <Card className="shadow-lg border-border/50 overflow-hidden w-0.5xl">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <UtensilsCrossed className="size-4 text-primary" />
          </div>
          {selectedDate.toDateString() === new Date().toDateString()
            ? "Today's Menu"
            : "Menu for Selected Date"}
        </CardTitle>
        <CardDescription>{formatDate(selectedDate)}</CardDescription>
      </CardHeader>
  <CardContent className="pt-6 w-0.5xl">
        {menuStatus === "loading" && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {menuStatus === "failed" && (
          <div className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="size-5" />
            <span>Failed to load menu</span>
          </div>
        )}

        {menuStatus === "succeeded" && selectedDateMenu && (
          <div className="space-y-3">
            {mealTypes.map(({ value, label, icon: Icon }) => (
              <div
                key={value}
                className="group p-2 rounded-lg border border-border/50 bg-linear-to-br from-card to-muted/30 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-1 mb-1">
                  <div className="p-1 rounded bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <Icon className="size-3 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{label}</h3>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedDateMenu[value]?.map((item: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs font-medium bg-background border border-border/60 rounded hover:border-primary/50 hover:bg-accent/50 transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
