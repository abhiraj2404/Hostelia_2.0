import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { ComplaintCard } from "@/components/complaints/ComplaintCard";
import type { Complaint } from "@/features/complaints/complaintsSlice";

interface ComplaintsWidgetProps {
  complaints: Complaint[];
}

export function ComplaintsWidget({ complaints }: ComplaintsWidgetProps) {
  if (complaints.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">My Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-muted/20 p-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No complaints yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                You haven't created any complaints. Report any issues to get them resolved quickly.
              </p>
            </div>
            <Button asChild>
              <Link to="/complaints/new">Create Complaint</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">My Recent Complaints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-2">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              detailPath={(id) => `/complaints/${id}`}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-between px-0 text-primary hover:bg-transparent"
          asChild
        >
          <Link to="/complaints">
            View all complaints
            <span className="ml-2">→</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
