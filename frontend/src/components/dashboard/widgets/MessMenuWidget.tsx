import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Utensils, Coffee, Sun, Moon } from "lucide-react";
import { getCurrentDay } from "@/components/dashboard/utils/dashboardConstants";
import type { MessMenu } from "@/types/dashboard";

interface MessMenuWidgetProps {
  menu: MessMenu | null;
}

const mealIcons = {
  Breakfast: Coffee,
  Lunch: Sun,
  Snacks: Utensils,
  Dinner: Moon,
};

export function MessMenuWidget({ menu }: MessMenuWidgetProps) {
  const currentDay = getCurrentDay();
  const todayMenu = menu?.[currentDay];

  if (!todayMenu) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Today's Mess Menu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
            <Utensils className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Menu not available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Today's Mess Menu</CardTitle>
          <Badge variant="outline">{currentDay}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(todayMenu).map(([mealType, items]) => {
          const Icon = mealIcons[mealType as keyof typeof mealIcons];
          return (
            <div key={mealType} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">{mealType}</h4>
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-6">
                {(items as string[]).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="border-t bg-muted/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-between px-0 text-primary hover:bg-transparent"
          asChild
        >
          <Link to="/mess">
            Give feedback
            <span className="ml-2">→</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
