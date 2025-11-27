import { TransitForm } from "@/components/transit/TransitForm";
import { TransitHistory } from "@/components/transit/TransitHistory";
import { TransitList } from "@/components/transit/TransitList";
import { TransitStats } from "@/components/transit/TransitStats";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks";
import apiClient from "@/lib/api-client";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface TransitEntry {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNo: string;
    hostel: string;
    roomNo: string;
  };
  purpose: string;
  transitStatus: "ENTRY" | "EXIT";
  date: string;
  time: string;
  createdAt: string;
  updatedAt: string;
}

function TransitPage() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [entries, setEntries] = useState<TransitEntry[]>([]);
  const [listStatus, setListStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [listError, setListError] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [createError, setCreateError] = useState<string | null>(null);

  // Determine if user is student or warden/admin
  const isStudent = user?.role === "student";
  const isWardenOrAdmin = user?.role === "warden" || user?.role === "admin";

  // Fetch transit entries
  const fetchEntries = async () => {
    try {
      setListStatus("loading");
      setListError(null);
      const response = await apiClient.get("/transit");
      let allEntries = response.data.transitEntries || [];

      // Filter entries by warden's hostel if user is warden
      if (user?.role === "warden" && user?.hostel) {
        allEntries = allEntries.filter(
          (entry: TransitEntry) => entry.studentId.hostel === user.hostel
        );
      }

      setEntries(allEntries);
      setListStatus("succeeded");
    } catch (error: any) {
      setListStatus("failed");
      setListError(error.response?.data?.message || "Failed to load records");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (createStatus === "succeeded") {
      // Refresh entries after successful creation
      fetchEntries();

      // Clear status after 3 seconds
      const timer = setTimeout(() => {
        setCreateStatus("idle");
        setCreateError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [createStatus]);

  const handleSubmit = async (data: {
    transitStatus: string;
    date: Date;
    time: string;
    purpose: string;
  }) => {
    try {
      setCreateStatus("loading");
      setCreateError(null);

      await apiClient.post("/transit", {
        date: data.date.toISOString(),
        time: data.time,
        purpose: data.purpose.trim(),
        transitStatus: data.transitStatus,
      });

      setCreateStatus("succeeded");
    } catch (error: any) {
      setCreateStatus("failed");
      setCreateError(
        error.response?.data?.message || "Failed to create record"
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="size-16 mx-auto text-muted-foreground/50" />
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">
              Authentication Required
            </p>
            <p className="text-sm text-muted-foreground">
              Please login to access transit records and manage entry/exit
            </p>
          </div>
          <Link to="/login">
            <Button size="lg" className="shadow-lg">
              Login to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-muted/5 to-muted/10">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-2 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium shadow-sm">
            <ArrowLeftRight className="size-3.5 text-primary" />
            <span className="text-foreground">Transit Management</span>
          </div> */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isStudent ? "Entry & Exit Records" : "Transit Dashboard"}
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              {isStudent
                ? "Record your hostel entry and exit times to maintain accurate transit logs"
                : "Monitor and manage all student transit records across hostels"}
            </p>
          </div>
        </div>

        {/* Student View: Form + History */}
        {isStudent && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <TransitForm
              onSubmit={handleSubmit}
              createStatus={createStatus}
              createError={createError}
              entries={entries}
            />
            <TransitHistory
              entries={entries}
              listStatus={listStatus}
              listError={listError}
              onRefresh={fetchEntries}
            />
          </div>
        )}

        {/* Warden/Admin View: Stats + List */}
        {isWardenOrAdmin && (
          <div className="space-y-6">
            <TransitStats entries={entries} />
            <TransitList
              entries={entries}
              listStatus={listStatus}
              listError={listError}
              onRefresh={fetchEntries}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TransitPage;
