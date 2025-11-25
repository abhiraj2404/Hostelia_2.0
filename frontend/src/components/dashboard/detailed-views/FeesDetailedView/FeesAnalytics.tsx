import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, XCircle } from "lucide-react";
import type { FeeSubmission, FeesFilters } from "@/types/dashboard";

interface FeesAnalyticsProps {
  fees: FeeSubmission[];
  filters: FeesFilters;
}

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#94a3b8'];
const STATUS_LABELS: Record<string, string> = {
  'approved': 'Approved',
  'pending': 'Pending',
  'rejected': 'Rejected',
  'documentNotSubmitted': 'Not Submitted',
};

export function FeesAnalytics({ fees, filters }: FeesAnalyticsProps) {
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

  // Determine what to show based on filters
  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      'approved': 'text-green-500',
      'pending': 'text-yellow-500',
      'rejected': 'text-red-500',
      'documentNotSubmitted': 'text-gray-500',
    };
    return status ? colors[status] || 'text-blue-500' : 'text-blue-500';
  };

  const getStatusIcon = (status?: string) => {
    return filters.status && filters.status !== 'all' ? DollarSign : DollarSign;
  };

  // Build dynamic stat cards
  const buildStatCards = () => {
    const selectedStatus = filters.status && filters.status !== 'all' ? filters.status : null;
    const selectedFeeType = filters.feeType && filters.feeType !== 'all' ? filters.feeType : null;

    // If both filters are selected
    if (selectedStatus && selectedFeeType) {
      const statusLabel = STATUS_LABELS[selectedStatus] || selectedStatus;
      const feeTypeLabel = selectedFeeType === 'hostel' ? 'Hostel' : 'Mess';
      const count = selectedFeeType === 'hostel' ? hostelStats[selectedStatus as keyof typeof hostelStats] : messStats[selectedStatus as keyof typeof messStats];
      
      return [
        {
          title: `${statusLabel} ${feeTypeLabel} Fee`,
          value: count,
          icon: DollarSign,
          description: `${count} submissions`,
          color: getStatusColor(selectedStatus),
        },
        {
          title: `Total ${feeTypeLabel} Submissions`,
          value: total,
          icon: DollarSign,
          description: 'All submissions',
          color: 'text-blue-500',
        },
        {
          title: `${feeTypeLabel} Fee Rate`,
          value: total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%',
          icon: DollarSign,
          description: `${statusLabel} percentage`,
          color: 'text-purple-500',
        },
      ];
    }

    // If only status is selected
    if (selectedStatus) {
      const statusLabel = STATUS_LABELS[selectedStatus] || selectedStatus;
      return [
        {
          title: `${statusLabel} Hostel Fee`,
          value: hostelStats[selectedStatus as keyof typeof hostelStats],
          icon: DollarSign,
          description: `${hostelStats[selectedStatus as keyof typeof hostelStats]} submissions`,
          color: getStatusColor(selectedStatus),
        },
        {
          title: `${statusLabel} Mess Fee`,
          value: messStats[selectedStatus as keyof typeof messStats],
          icon: DollarSign,
          description: `${messStats[selectedStatus as keyof typeof messStats]} submissions`,
          color: getStatusColor(selectedStatus),
        },
      ];
    }

    // If only fee type is selected
    if (selectedFeeType) {
      const feeTypeLabel = selectedFeeType === 'hostel' ? 'Hostel' : 'Mess';
      const stats = selectedFeeType === 'hostel' ? hostelStats : messStats;
      
      return [
        {
          title: `Approved ${feeTypeLabel} Fee`,
          value: stats.approved,
          icon: DollarSign,
          description: `${stats.approved} submissions`,
          color: 'text-green-500',
        },
        {
          title: `Pending ${feeTypeLabel} Fee`,
          value: stats.pending,
          icon: Clock,
          description: `${stats.pending} awaiting review`,
          color: 'text-yellow-500',
        },
        {
          title: `Rejected ${feeTypeLabel} Fee`,
          value: stats.rejected,
          icon: XCircle,
          description: `${stats.rejected} rejected`,
          color: 'text-red-500',
        },
        {
          title: `${feeTypeLabel} Defaulters`,
          value: stats.notSubmitted,
          icon: XCircle,
          description: `${stats.notSubmitted} not submitted`,
          color: 'text-gray-500',
        },
      ];
    }

    // Default: no filters
    return [
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
  };

  const statCards = buildStatCards();

  // Hostel Fee Status Breakdown
  const hostelFeeData = useMemo(() => {
    const counts: Record<string, number> = {};
    fees.forEach(f => {
      const status = f.hostelFee.status;
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: STATUS_LABELS[name] || name, 
      value 
    }));
  }, [fees]);

  // Mess Fee Status Breakdown
  const messFeeData = useMemo(() => {
    const counts: Record<string, number> = {};
    fees.forEach(f => {
      const status = f.messFee.status;
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name: STATUS_LABELS[name] || name, 
      value 
    }));
  }, [fees]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`grid gap-4 ${statCards.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
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

      {/* Pie Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Hostel Fee Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Hostel Fee Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hostelFeeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {hostelFeeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mess Fee Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Mess Fee Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={messFeeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {messFeeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
