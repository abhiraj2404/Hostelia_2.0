import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, XCircle } from "lucide-react";
import type { FeeSubmission } from "@/types/dashboard";

interface FeesStatisticsProps {
  fees: FeeSubmission[];
}

export function FeesStatistics({ fees }: FeesStatisticsProps) {
  // Calculate stats for both Hostel and Mess fees
  const hostelStats = {
    approved: fees.filter(f => f.hostelFee.status === 'approved').length,
    pending: fees.filter(f => f.hostelFee.status === 'pending').length,
    rejected: fees.filter(f => f.hostelFee.status === 'rejected').length,
    notSubmitted: fees.filter(f => f.hostelFee.status === 'documentNotSubmitted').length,
  };

  const messStats = {
    approved: fees.filter(f => f.messFee.status === 'approved').length,
    pending: fees.filter(f => f.messFee.status === 'pending').length,
    rejected: fees.filter(f => f.messFee.status === 'rejected').length,
    notSubmitted: fees.filter(f => f.messFee.status === 'documentNotSubmitted').length,
  };

  const total = fees.length;
  const hostelCollectionRate = total > 0 ? ((hostelStats.approved / total) * 100).toFixed(1) : '0';
  const messCollectionRate = total > 0 ? ((messStats.approved / total) * 100).toFixed(1) : '0';

  const stats = [
    {
      title: "Hostel Fee Collection",
      value: `${hostelCollectionRate}%`,
      icon: DollarSign,
      description: `${hostelStats.approved}/${total} approved`,
      color: "text-blue-500",
    },
    {
      title: "Mess Fee Collection",
      value: `${messCollectionRate}%`,
      icon: DollarSign,
      description: `${messStats.approved}/${total} approved`,
      color: "text-green-500",
    },
    {
      title: "Pending Verifications",
      value: hostelStats.pending + messStats.pending,
      icon: Clock,
      description: "Awaiting review",
      color: "text-yellow-500",
    },
    {
      title: "Defaulters",
      value: hostelStats.notSubmitted + messStats.notSubmitted,
      icon: XCircle,
      description: "Not submitted",
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
