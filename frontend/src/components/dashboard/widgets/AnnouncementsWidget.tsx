import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, User, Bell } from "lucide-react";
import { formatDate } from "@/components/dashboard/utils/dashboardConstants";
import type { Announcement } from "@/features/dashboard/dashboardSlice";

interface AnnouncementsWidgetProps {
  announcements: Announcement[];
}

export function AnnouncementsWidget({ announcements }: AnnouncementsWidgetProps) {
  if (announcements.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No announcements yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Recent Announcements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.map((announcement, index) => (
          <div
            key={announcement._id}
            className={`pb-2 ${index < announcements.length - 1 ? "border-b" : ""}`}
          >
            <h4 className="font-semibold line-clamp-1">{announcement.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {announcement.message}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(announcement.createdAt)}</span>
              <User className="h-3 w-3 ml-2" />
              <span>{announcement.postedBy.name}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-3 w-full"
              asChild
            >
              <Link to={`/announcements/${announcement._id}`}>
                View Details
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
      <CardFooter className="border-t bg-muted/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-between px-0 text-primary hover:bg-transparent"
          asChild
        >
          <Link to="/announcements">
            View all announcements
            <span className="ml-2">→</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
