import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

type TransitMetric = {
  label: string;
  value: number;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

interface TransitEntry {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNo: string;
    hostel: string;
    roomNo: string;
  };
  purpose: string;
  transitStatus: "ENTRY" | "EXIT";
  date: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

interface TransitStatsProps {
  entries: TransitEntry[];
}

export function TransitStats({ entries }: TransitStatsProps) {
  const totalRecords = entries.length;
  const entryCount = entries.filter((e) => e.transitStatus === "ENTRY").length;
  const exitCount = entries.filter((e) => e.transitStatus === "EXIT").length;

  // Compute how many students are currently out: for each student take their latest record and
  // count those whose latest record is an EXIT.
  const lastRecordByStudent = entries.reduce((map, e) => {
    const sid = e.studentId._id;
    const prev = map.get(sid);
    if (!prev) {
      map.set(sid, e);
    } else {
      const prevTime = new Date(
        prev.createdAt || `${prev.date}T${prev.time}`
      ).getTime();
      const curTime = new Date(e.createdAt || `${e.date}T${e.time}`).getTime();
      if (curTime > prevTime) map.set(sid, e);
    }
    return map;
  }, new Map<string, TransitEntry>());

  const studentsCurrentlyOut = Array.from(lastRecordByStudent.values()).filter(
    (r) => r.transitStatus === "EXIT"
  ).length;

  // Get today's records

  const metrics: TransitMetric[] = [
    {
      label: "Total Records",
      value: totalRecords,
      helper: "All submissions",
      icon: TrendingUp,
      tone: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Entries",
      value: entryCount,
      helper: "Recorded entries",
      icon: ArrowLeft,
      tone: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Exits",
      value: exitCount,
      helper: "Recorded exits",
      icon: ArrowRight,
      tone: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "Students Out",
      value: studentsCurrentlyOut,
      helper: "Currently outside",
      icon: Users,
      tone: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.label} className="border-border/60">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {m.helper}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {m.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
            </div>
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                m.tone
              )}
            >
              <m.icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default TransitStats;
