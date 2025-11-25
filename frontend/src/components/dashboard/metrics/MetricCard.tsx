import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricCardData } from "@/types/dashboard";

interface MetricCardProps extends MetricCardData {
  className?: string;
}

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
  onClick,
  isActive,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "border-border/60",
        onClick && "cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg",
        isActive && "ring-2 ring-primary",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-between py-6">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-foreground">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            tone
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
