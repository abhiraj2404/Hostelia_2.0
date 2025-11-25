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
  // LineChart,
  // Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp, Users, Calendar } from "lucide-react";
import type { MessFeedback, MessFilters } from "@/types/dashboard";

interface MessAnalyticsProps {
  feedback: MessFeedback[];
  filters: MessFilters;
}

export function MessAnalytics({ feedback }: MessAnalyticsProps) {
  // Overall statistics
  const stats = useMemo(() => {
    if (feedback.length === 0) return { avgRating: 0, todayRating: 0, totalFeedback: 0, positiveCount: 0 };

    const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;

    const today = new Date().toDateString();
    const todayFeedback = feedback.filter(f => new Date(f.createdAt).toDateString() === today);
    const todayRating = todayFeedback.length > 0
      ? todayFeedback.reduce((sum, f) => sum + f.rating, 0) / todayFeedback.length
      : 0;

    const positiveCount = feedback.filter(f => f.rating >= 4).length;

    return {
      avgRating: avgRating.toFixed(1),
      todayRating: todayRating.toFixed(1),
      totalFeedback: feedback.length,
      positiveCount,
    };
  }, [feedback]);

  // Meal Type Performance
  const mealTypeData = useMemo(() => {
    const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
    return mealTypes.map(meal => {
      const mealFeedback = feedback.filter(f => f.mealType === meal);
      const avgRating = mealFeedback.length > 0
        ? mealFeedback.reduce((sum, f) => sum + f.rating, 0) / mealFeedback.length
        : 0;
      return {
        meal,
        avgRating: parseFloat(avgRating.toFixed(2)),
        count: mealFeedback.length,
      };
    });
  }, [feedback]);

  // Removed unused variable - Day-wise Performance (Last 7 Days detailed by meal type)
  /* const dayWiseData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dateStr = date.toDateString();
      const dayFeedback = feedback.filter(f => new Date(f.createdAt).toDateString() === dateStr);
      
      const breakfast = dayFeedback.filter(f => f.mealType === 'Breakfast');
      const lunch = dayFeedback.filter(f => f.mealType === 'Lunch');
      const snacks = dayFeedback.filter(f => f.mealType === 'Snacks');
      const dinner = dayFeedback.filter(f => f.mealType === 'Dinner');

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        Breakfast: breakfast.length > 0 ? parseFloat((breakfast.reduce((sum, f) => sum + f.rating, 0) / breakfast.length).toFixed(2)) : 0,
        Lunch: lunch.length > 0 ? parseFloat((lunch.reduce((sum, f) => sum + f.rating, 0) / lunch.length).toFixed(2)) : 0,
        Snacks: snacks.length > 0 ? parseFloat((snacks.reduce((sum, f) => sum + f.rating, 0) / snacks.length).toFixed(2)) : 0,
        Dinner: dinner.length > 0 ? parseFloat((dinner.reduce((sum, f) => sum + f.rating, 0) / dinner.length).toFixed(2)) : 0,
      };
    });
  }, [feedback]); */

  // Removed unused variable - Rating Distribution
  /* const ratingDistribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedback.forEach(f => {
      dist[f.rating as keyof typeof dist]++;
    });
    return Object.entries(dist).map(([rating, count]) => ({
      rating: `${rating} Star${parseInt(rating) > 1 ? 's' : ''}`,
      count,
    }));
  }, [feedback]); */

  // Day of Week Analysis
  const dayOfWeekData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days.map(day => {
      const dayFeedback = feedback.filter(f => f.day === day);
      const avgRating = dayFeedback.length > 0
        ? dayFeedback.reduce((sum, f) => sum + f.rating, 0) / dayFeedback.length
        : 0;
      return {
        day: day.slice(0, 3),
        avgRating: parseFloat(avgRating.toFixed(2)),
        count: dayFeedback.length,
      };
    });
  }, [feedback]);

  const statCards = [
    {
      title: "Average Rating",
      value: stats.avgRating,
      icon: Star,
      description: "Overall mess rating",
      color: "text-yellow-500",
    },
    {
      title: "Today's Rating",
      value: stats.todayRating || "N/A",
      icon: TrendingUp,
      description: "Current day average",
      color: "text-green-500",
    },
    {
      title: "Total Feedback",
      value: stats.totalFeedback,
      icon: Users,
      description: "All time responses",
      color: "text-blue-500",
    },
    {
      title: "Positive Ratings",
      value: `${stats.positiveCount}`,
      icon: Calendar,
      description: "4+ star ratings",
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
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

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Meal Type Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Meal Type Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="meal" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgRating" fill="#8884d8" name="Avg Rating" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Day of Week Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Day of Week Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgRating" fill="#82ca9d" name="Avg Rating" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
