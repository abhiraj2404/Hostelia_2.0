import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { type ChangeEvent } from "react";
import type {
  ComplaintCategoryOption,
  ComplaintStatusOption,
} from "./complaintConstants";

type ComplaintFilterBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  status: string | undefined;
  category: string | undefined;
  hostel?: string | undefined;
  sort: "newest" | "oldest";
  onStatusChange: (value: string | undefined) => void;
  onCategoryChange: (value: string | undefined) => void;
  onHostelChange?: (value: string | undefined) => void;
  onSortChange: (value: "newest" | "oldest") => void;
  onClear: () => void;
  listStatus: "idle" | "loading" | "succeeded" | "failed";
  statusOptions: ComplaintStatusOption[];
  categoryOptions: ComplaintCategoryOption[];
  showHostelFilter?: boolean;
};

export function ComplaintFilterBar({
  query,
  onQueryChange,
  status,
  category,
  hostel,
  sort,
  onStatusChange,
  onCategoryChange,
  onHostelChange,
  onSortChange,
  onClear,
  listStatus,
  statusOptions,
  categoryOptions,
  showHostelFilter = false,
}: ComplaintFilterBarProps) {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, room, roll number, or student name"
            value={query}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        {listStatus === "loading" && (
          <Badge variant="outline" className="w-fit">
            Refreshing…
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={status ?? "all"}
          onValueChange={(value) =>
            onStatusChange(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[170px] border-border/70">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={category ?? "all"}
          onValueChange={(value) =>
            onCategoryChange(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[170px] border-border/70">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showHostelFilter && onHostelChange && (
          <Select
            value={hostel ?? "all"}
            onValueChange={(value) =>
              onHostelChange(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[170px] border-border/70">
              <SelectValue placeholder="Hostel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hostels</SelectItem>
              <SelectItem value="BH-1">BH-1</SelectItem>
              <SelectItem value="BH-2">BH-2</SelectItem>
              <SelectItem value="BH-3">BH-3</SelectItem>
              <SelectItem value="BH-4">BH-4</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as "newest" | "oldest")}
        >
          <SelectTrigger className="w-[170px] border-border/70">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          onClick={onClear}
          className="ml-auto gap-2 text-muted-foreground hover:text-foreground"
        >
          <Filter className="h-4 w-4" />
          Clear filters
        </Button>
      </div>
    </div>
  );
}
