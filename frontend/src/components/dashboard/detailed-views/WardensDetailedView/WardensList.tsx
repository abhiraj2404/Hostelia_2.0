import { formatDate } from "@/components/dashboard/utils/dashboardConstants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Warden } from "@/types/dashboard";
import { sortByNameCaseInsensitive } from "@/utils/sorting";
import { useMemo } from "react";

interface WardensListProps {
  wardens: Warden[];
  loading?: boolean;
}

export function WardensList({
  wardens,
  loading = false,
}: WardensListProps) {
  // Sort wardens case-insensitively by name
  const sortedWardens = useMemo(() => {
    return sortByNameCaseInsensitive(wardens);
  }, [wardens]);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      ) : sortedWardens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No wardens found</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Appointed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWardens.map((warden) => (
                <TableRow key={warden._id}>
                  <TableCell className="font-medium">{warden.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {warden.email}
                  </TableCell>
                  <TableCell>{warden.hostel}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(warden.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
