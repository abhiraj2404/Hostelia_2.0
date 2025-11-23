import { Link } from "react-router-dom";
import { Inbox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ComplaintEmptyStateProps = {
  hasActiveFilters: boolean;
  isStudent: boolean;
  createPath: string;
};

export function ComplaintEmptyState({
  hasActiveFilters,
  isStudent,
  createPath,
}: ComplaintEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Inbox className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            No complaints found
          </h3>
          <p className="text-muted-foreground max-w-md">
            {hasActiveFilters
              ? "No records match the current filters. Adjust them to see more results."
              : isStudent
              ? "You haven’t submitted any complaints yet. Start by creating a new complaint."
              : "No complaints available for your scope right now."}
          </p>
        </div>
        {isStudent && !hasActiveFilters && (
          <Button asChild className="mt-4">
            <Link to={createPath}>
              <Sparkles className="mr-2 h-4 w-4" />
              Submit your first complaint
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

