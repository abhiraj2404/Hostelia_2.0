import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, TrendingUp, Users } from "lucide-react";

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
      // prefer the latest by createdAt (fallback to date+time)
      const prevTime = new Date(prev.createdAt || `${prev.date}T${prev.time}`).getTime();
      const curTime = new Date(e.createdAt || `${e.date}T${e.time}`).getTime();
      if (curTime > prevTime) map.set(sid, e);
    }
    return map;
  }, new Map<string, TransitEntry>());

  const studentsCurrentlyOut = Array.from(lastRecordByStudent.values()).filter((r) => r.transitStatus === "EXIT").length;

  // Get today's records
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = entries.filter((e) => e.date.split("T")[0] === today).length;

  const stats = [
    {
      title: "Total Records",
      value: totalRecords,
      icon: TrendingUp,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500",
      lightBg: "bg-blue-50/50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-900",
    },
    {
      title: "Entries",
      value: entryCount,
      icon: ArrowLeft,
      gradient: "from-green-500 to-green-600",
      iconBg: "bg-green-500",
      lightBg: "bg-green-50/50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-900",
    },
    {
      title: "Exits",
      value: exitCount,
      icon: ArrowRight,
      gradient: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-500",
      lightBg: "bg-orange-50/50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-900",
    },
    {
      title: "Students Out",
      value: studentsCurrentlyOut,
      icon: Users,
      gradient: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-500",
      lightBg: "bg-purple-50/50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={`border ${stat.borderColor} overflow-hidden bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.01] group relative`}
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <CardHeader className="pb-2 px-3 pt-3 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 rounded ${stat.iconBg} shadow group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="size-3 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative px-3 pb-3">
              <div className="space-y-1">
                <div className={`text-2xl font-bold bg-linear-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                {stat.title === "Total Records" && todayRecords > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs font-medium text-muted-foreground">
                      {todayRecords} today
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
