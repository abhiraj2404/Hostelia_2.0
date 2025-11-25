import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileText, Users, DollarSign, Utensils } from "lucide-react";
import type { DetailedTab } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface DetailedViewPanelProps {
  activeTab: DetailedTab;
  onTabChange: (tab: DetailedTab) => void;
  onRefresh: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export function DetailedViewPanel({
  activeTab,
  onTabChange,
  onRefresh,
  loading = false,
  children,
}: DetailedViewPanelProps) {
  const tabs = [
    { id: 'students' as DetailedTab, label: 'Students', icon: Users },
    { id: 'complaints' as DetailedTab, label: 'Complaints', icon: FileText },
    { id: 'fees' as DetailedTab, label: 'Fees', icon: DollarSign },
    { id: 'mess' as DetailedTab, label: 'Mess Feedback', icon: Utensils },
  ];

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
