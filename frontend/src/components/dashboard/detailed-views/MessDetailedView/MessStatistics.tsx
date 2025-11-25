import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, ThumbsDown, TrendingUp } from "lucide-react";
import type { MessFeedback } from "@/types/dashboard";

interface MessStatisticsProps {
  feedback: MessFeedback[];
}

export function MessStatistics({ feedback }: MessStatisticsProps) {
  const total = feedback.length;
  
  // Calculate overall average rating
  const avgRating = total > 0 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(1) 
    : '0.0';

  // Calculate positive (4-5 stars) and negative (1-2 stars) feedback
  const positiveFeedback = feedback.filter(f => f.rating >= 4).length;
  const negativeFeedback = feedback.filter(f => f.rating <= 2).length;

  // Get today's feedback
  const today = new Date().toISOString().split('T')[0];
  const todayFeedback = feedback.filter(f => {
    const feedbackDate = new Date(f.createdAt).toISOString().split('T')[0];
    return feedbackDate === today;
  });
  const todayAvgRating = todayFeedback.length > 0
    ? (todayFeedback.reduce((sum, f) => sum + f.rating, 0) / todayFeedback.length).toFixed(1)
    : 'N/A';

  const stats = [
    {
      title: "Average Rating",
      value: avgRating,
      icon: Star,
      description: `Based on ${total} reviews`,
      color: "text-yellow-500",
    },
    {
      title: "Today's Rating",
      value: todayAvgRating,
      icon: TrendingUp,
      description: `${todayFeedback.length} reviews today`,
      color: "text-blue-500",
    },
    {
      title: "Positive Feedback",
      value: positiveFeedback,
      icon: ThumbsUp,
      description: `${total > 0 ? ((positiveFeedback / total) * 100).toFixed(0) : 0}% of total`,
      color: "text-green-500",
    },
    {
      title: "Negative Feedback",
      value: negativeFeedback,
      icon: ThumbsDown,
      description: `${total > 0 ? ((negativeFeedback / total) * 100).toFixed(0) : 0}% of total`,
      color: "text-red-500",
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
