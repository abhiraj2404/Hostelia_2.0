import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComplaintMetric } from "./complaintConstants";

type ComplaintMetricsProps = {
  metrics: ComplaintMetric[];
};

export function ComplaintMetrics({ metrics }: ComplaintMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-border/60">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {metric.helper}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {metric.label}
              </p>
            </div>
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                metric.tone
              )}
            >
              <metric.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
