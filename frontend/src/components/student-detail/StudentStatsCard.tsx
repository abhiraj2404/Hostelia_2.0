import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, ArrowLeftRight, Wallet } from 'lucide-react';

interface StudentStatsCardProps {
  problemsCount: number;
  feedbackCount: number;
  transitCount: number;
  feeStatus: any;
}

export function StudentStatsCard({
  problemsCount,
  feedbackCount,
  transitCount,
  feeStatus
}: StudentStatsCardProps) {
  // Calculate fees paid status
  const hostelFeePaid = feeStatus?.hostelFee?.status === 'approved';
  const messFeePaid = feeStatus?.messFee?.status === 'approved';
  const feesPaid = (hostelFeePaid && messFeePaid) ? 'Both Paid' : 
                   (hostelFeePaid || messFeePaid) ? 'Partially Paid' : 'Pending';
  
  const stats = [
    {
      title: 'Total Complaints',
      value: problemsCount,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Mess Feedback',
      value: feedbackCount,
      icon: MessageSquare,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Transit Entries',
      value: transitCount,
      icon: ArrowLeftRight,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Fee Status',
      value: feesPaid,
      icon: Wallet,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
