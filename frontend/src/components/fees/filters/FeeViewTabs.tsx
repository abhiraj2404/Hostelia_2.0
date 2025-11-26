import { Button } from "@/components/ui/button";
import { BarChart3, LayoutList } from "lucide-react";

type TabType = "list" | "analytics";

interface FeeViewTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function FeeViewTabs({ activeTab, onTabChange }: FeeViewTabsProps) {
  return (
    <div className="flex items-center rounded-lg border bg-muted p-1">
      <Button
        variant={activeTab === "list" ? "default" : "ghost"}
        size="sm"
        className={`gap-2 ${
          activeTab === "list" ? "bg-black hover:bg-black text-white" : ""
        }`}
        onClick={() => onTabChange("list")}
      >
        <LayoutList className="h-4 w-4" />
        List
      </Button>
      <Button
        variant={activeTab === "analytics" ? "default" : "ghost"}
        size="sm"
        className={`gap-2 ${
          activeTab === "analytics"
            ? "bg-black hover:bg-black text-white"
            : ""
        }`}
        onClick={() => onTabChange("analytics")}
      >
        <BarChart3 className="h-4 w-4" />
        Analytics
      </Button>
    </div>
  );
}

