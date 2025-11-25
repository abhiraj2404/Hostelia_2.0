import {
  ComplaintStatusBadge,
  ComplaintStudentStatusBadge,
} from "@/components/complaints/ComplaintStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Complaint } from "@/features/complaints/complaintsSlice";
import { fetchUsersByIds, type UserData } from "@/lib/user-api";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatComplaintDate,
  getComplaintCategoryIcon,
} from "./complaintConstants";

type ComplaintCardProps = {
  complaint: Complaint;
  detailPath: (id: string) => string;
};

export function ComplaintCard({ complaint, detailPath }: ComplaintCardProps) {
  const [studentData, setStudentData] = useState<UserData | null>(null);

  useEffect(() => {
    const loadStudent = async () => {
      const users = await fetchUsersByIds([complaint.studentId]);
      const student = users.get(complaint.studentId);
      if (student) {
        setStudentData(student);
      }
    };

    loadStudent();
  }, [complaint.studentId]);
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/60 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-40 overflow-hidden rounded-b-3xl bg-muted/20">
        {complaint.problemImage ? (
          <img
            src={complaint.problemImage}
            alt={complaint.problemTitle}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 via-primary/5 to-primary/25">
            <div className="rounded-full bg-background p-3 shadow-sm">
              {getComplaintCategoryIcon(complaint.category)}
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <ComplaintStatusBadge status={complaint.status} />
          <ComplaintStudentStatusBadge
            studentStatus={complaint.studentStatus}
            complaintStatus={complaint.status}
          />
        </div>
        <Badge
          variant="outline"
          className="absolute bottom-3 left-3 bg-background/95 backdrop-blur-sm text-xs shadow-sm"
        >
          {complaint.category}
        </Badge>
      </div>

      <CardHeader className="space-y-2">
        <CardTitle className="line-clamp-1 text-lg">
          {complaint.problemTitle}
        </CardTitle>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {complaint.problemDescription}
        </p>
      </CardHeader>

      <CardContent className="mt-auto space-y-3 text-sm text-muted-foreground">
        {studentData && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium text-foreground">
              {studentData.name}
              {studentData.rollNo && ` (${studentData.rollNo})`}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>
            {complaint.hostel} • Room {complaint.roomNo}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Created {formatComplaintDate(complaint.createdAt)}</span>
        </div>
        {complaint.updatedAt !== complaint.createdAt && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Updated {formatComplaintDate(complaint.updatedAt)}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t bg-muted/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-between px-0 text-primary hover:bg-transparent"
          asChild
        >
          <Link to={detailPath(complaint._id)}>
            View details
            <span className="ml-2">→</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
