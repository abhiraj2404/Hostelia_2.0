import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/types/dashboard";

interface StudentsAnalyticsProps {
  students: Student[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function StudentsAnalytics({ students }: StudentsAnalyticsProps) {
  // Year Distribution Data
  const yearData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => {
      counts[s.year] = (counts[s.year] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  // Floor-wise Occupancy Data
  const floorData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => {
      if (s.roomNo) {
        const floor = s.roomNo.charAt(0); // First digit = floor
        const floorLabel = `Floor ${floor}`;
        counts[floorLabel] = (counts[floorLabel] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  // Registration Trend (Cumulative by month)
  const registrationData = useMemo(() => {
    const sortedStudents = [...students].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const monthCounts: Record<string, number> = {};
    let cumulative = 0;
    
    sortedStudents.forEach(s => {
      const date = new Date(s.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      cumulative++;
      monthCounts[monthKey] = cumulative;
    });

    return Object.entries(monthCounts).map(([month, count]) => ({
      month,
      students: count
    })).slice(-12); // Last 12 months
  }, [students]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Year Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Year Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={yearData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {yearData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Floor-wise Occupancy Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Floor-wise Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={floorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Registration Trend Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Registration Trend (Cumulative)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Total Students"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
