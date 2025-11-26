import { FeeStatusDisplay } from "@/components/fees/FeeStatusDisplay";
import { FeeStatusManager } from "@/components/fees/FeeStatusManager";
import { Card, CardContent } from "@/components/ui/card";
import { fetchFees } from "@/features/fees/feesSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

function FeesPage() {
  const dispatch = useAppDispatch();
  const { items: fees, loading, error } = useAppSelector((state) => state.fees);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchFees());
  }, [dispatch]);

  // Don't block page on error - show inline error instead

  const userRole = user?.role;
  const isStudent = userRole === "student";
  const isWarden = userRole === "warden";
  const isAdmin = userRole === "admin";

  // For students, find their own fee submission
  const studentFeeSubmission = isStudent
    ? fees.find(
        (fee) =>
          fee.studentId === user?.id ||
          (user &&
            typeof user === "object" &&
            "_id" in user &&
            fee.studentId === String(user._id))
      )
    : null;

  const handleRefresh = () => {
    dispatch(fetchFees());
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fee Management</h1>
        <p className="text-muted-foreground mt-2">
          {isStudent
            ? "View and submit your fee payment documents"
            : isWarden
            ? "Manage fee submissions for your hostel"
            : "Manage fee submissions for all students"}
        </p>
      </div>

      {error && !loading && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm text-destructive">
            {error}. Please refresh the page or try again later.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading fees...</p>
          </div>
        </div>
      ) : isStudent ? (
        <FeeStatusDisplay
          feeSubmission={studentFeeSubmission || null}
          onRefresh={handleRefresh}
        />
      ) : isWarden || isAdmin ? (
        <FeeStatusManager
          fees={fees}
          userRole={isAdmin ? "admin" : "warden"}
          userHostel={user?.hostel}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              You don't have permission to view this page.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FeesPage;
