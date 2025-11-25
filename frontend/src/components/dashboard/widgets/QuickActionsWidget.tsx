import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { QuickAction } from "@/types/dashboard";

interface QuickActionsWidgetProps {
  actions: QuickAction[];
}

export function QuickActionsWidget({ actions }: QuickActionsWidgetProps) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.primary ? "default" : "outline"}
            className="justify-start gap-3 hover:bg-black hover:text-white transition-colors"
            asChild
          >
            <Link to={action.path}>
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
