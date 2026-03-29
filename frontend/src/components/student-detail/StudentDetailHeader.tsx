import { Card, CardContent } from '@/components/ui/card';
import { Mail, User2, Hash, Home, DoorClosed, Store } from 'lucide-react';

interface StudentDetailHeaderProps {
  student: any;
}

export function StudentDetailHeader({ student }: StudentDetailHeaderProps) {
  if (!student) return null;

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-10 pb-10 px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Name */}
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <User2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Name</p>
              <p className="text-xl font-bold mt-1">{student.name}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Email</p>
              <p className="text-base font-semibold truncate mt-1">{student.email}</p>
            </div>
          </div>

          {/* Roll Number */}
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Hash className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Roll Number</p>
              <p className="text-xl font-bold mt-1">{student.rollNo || 'N/A'}</p>
            </div>
          </div>

          {/* Hostel */}
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Home className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Hostel</p>
              <p className="text-xl font-bold mt-1">{(student.hostelName ?? student.hostelId) || 'N/A'}</p>
            </div>
          </div>

          {/* Room Number */}
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <DoorClosed className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Room Number</p>
              <p className="text-xl font-bold mt-1">{student.roomNo || 'N/A'}</p>
            </div>
          </div>

          {/* Mess */}
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Store className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Mess</p>
              <p className="text-xl font-bold mt-1">
                {student.messName || <span className="text-muted-foreground italic font-normal text-base">Unassigned</span>}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
