import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Building2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface College {
  _id: string;
  name: string;
  emailDomain: string;
  adminEmail: string;
  address?: string;
  createdAt: string;
}

export default function ManagerPending() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    college: College | null;
  }>({ open: false, type: "approve", college: null });

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/manager/colleges/pending");
      if (res.data?.success) {
        setColleges(res.data.colleges);
      }
    } catch {
      toast.error("Failed to load pending colleges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (collegeId: string, action: "approve" | "reject") => {
    setActionLoading(collegeId);
    try {
      const res = await apiClient.post(`/manager/colleges/${collegeId}/${action}`);
      if (res.data?.success) {
        toast.success(
          action === "approve"
            ? "College approved! Credentials sent to admin."
            : "College registration rejected."
        );
        setColleges((prev) => prev.filter((c) => c._id !== collegeId));
      }
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : `Failed to ${action} college`;
      toast.error(msg || `Failed to ${action} college`);
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, type: "approve", college: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve new college registrations
        </p>
      </div>

      {colleges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500/50" />
            No pending registrations. All caught up!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((college) => (
            <Card key={college._id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {college.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-yellow-700 border-yellow-500">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Domain:</span>{" "}
                    <span className="font-medium">{college.emailDomain}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Admin:</span>{" "}
                    <span className="font-medium">{college.adminEmail}</span>
                  </p>
                  {college.address && (
                    <p>
                      <span className="text-muted-foreground">Address:</span>{" "}
                      {college.address}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground pt-1">
                    Submitted {new Date(college.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5"
                    disabled={actionLoading === college._id}
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        type: "approve",
                        college,
                      })
                    }
                  >
                    {actionLoading === college._id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-1.5"
                    disabled={actionLoading === college._id}
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        type: "reject",
                        college,
                      })
                    }
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.type === "approve"
                ? "Approve College?"
                : "Reject College?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.type === "approve" ? (
                <>
                  This will approve <strong>{confirmDialog.college?.name}</strong>,
                  create the admin account, and send login credentials to{" "}
                  <strong>{confirmDialog.college?.adminEmail}</strong>.
                </>
              ) : (
                <>
                  This will reject the registration for{" "}
                  <strong>{confirmDialog.college?.name}</strong>. A notification
                  will be sent to {confirmDialog.college?.adminEmail}.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.college) {
                  handleAction(confirmDialog.college._id, confirmDialog.type);
                }
              }}
              disabled={!!actionLoading}
              className={
                confirmDialog.type === "reject"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {confirmDialog.type === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
