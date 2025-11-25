import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, Building2, UserCheck } from "lucide-react";
import type { Student } from "@/types/dashboard";

interface StudentsStatisticsProps {
  students: Student[];
}

export function StudentsStatistics({ students }: StudentsStatisticsProps) {
  // Calculate stats
  const total = students.length;
  
  // Year-wise distribution
  const yearCounts = students.reduce((acc, s) => {
    acc[s.year] = (acc[s.year] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Room occupancy (unique rooms)
  const uniqueRooms = new Set(students.filter(s => s.roomNo).map(s => s.roomNo));
  const occupiedRooms = uniqueRooms.size;

  // Most populated year
  const mostPopulatedYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      title: "Total Students",
      value: total,
      icon: Users,
      description: "In this hostel",
      color: "text-blue-500",
    },
    {
      title: "Occupied Rooms",
      value: occupiedRooms,
      icon: Building2,
      description: "Unique rooms in use",
      color: "text-green-500",
    },
    {
      title: "Most Populated Year",
      value: mostPopulatedYear ? mostPopulatedYear[0] : "N/A",
      icon: GraduationCap,
      description: mostPopulatedYear ? `${mostPopulatedYear[1]} students` : "",
      color: "text-purple-500",
    },
    {
      title: "Average per Room",
      value: occupiedRooms > 0 ? (total / occupiedRooms).toFixed(1) : "0",
      icon: UserCheck,
      description: "Students per room",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
