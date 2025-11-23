import type { Complaint } from "@/features/complaints/complaintsSlice";
import { ComplaintCard } from "./ComplaintCard";

type ComplaintGridProps = {
  complaints: Complaint[];
  detailPath: (id: string) => string;
};

export function ComplaintGrid({ complaints, detailPath }: ComplaintGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {complaints.map((complaint) => (
        <ComplaintCard
          key={complaint._id}
          complaint={complaint}
          detailPath={detailPath}
        />
      ))}
    </div>
  );
}

