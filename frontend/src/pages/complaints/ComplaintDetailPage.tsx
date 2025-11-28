import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  ComplaintConversationCard,
  ComplaintDetailHeader,
  ComplaintImageViewer,
  ComplaintSummaryCard,
  ComplaintVerificationCard,
  ComplaintWardenToolsCard,
} from "@/components/complaints/ComplaintDetailComponents";
import { ComplaintProgressTimeline } from "@/components/complaints/ComplaintProgressTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Complaint } from "@/features/complaints/complaintsSlice";
import {
  addComplaintComment,
  fetchComplaintById,
  selectComplaintsState,
  updateComplaintStatus,
  verifyComplaintResolution,
} from "@/features/complaints/complaintsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";

type CommentFormValues = {
  message: string;
};

function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { selected, commentStatus, listStatus, error } = useAppSelector(
    selectComplaintsState
  );
  const authUser = useAppSelector((state) => state.auth.user);
  const role = authUser?.role;
  const isStudent = role === "student";
  const isWarden = role === "warden";
  const isAdmin = role === "admin";

  const [viewerOpen, setViewerOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const form = useForm<CommentFormValues>({
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchComplaintById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!id) return;
    const trimmed = values.message.trim();
    if (!trimmed) {
      form.setError("message", {
        message: "Please enter a message before submitting.",
      });
      return;
    }

    const action = await dispatch(
      addComplaintComment({ complaintId: id, message: trimmed })
    );
    if (addComplaintComment.fulfilled.match(action)) {
      form.reset();
      toast.success("Comment added");
    } else if (addComplaintComment.rejected.match(action)) {
      const message =
        action.payload ?? "Failed to add comment. Please try again.";
      toast.error(message);
    }
  });

  const handleVerification = async (studentStatus: "Resolved" | "Rejected") => {
    if (!id || !selected || !isStudent) return;

    // Check if complaint is in ToBeConfirmed status (awaiting student verification)
    if (selected.status !== "ToBeConfirmed") {
      toast.error("This complaint is not awaiting your confirmation");
      return;
    }

    const action = await dispatch(
      verifyComplaintResolution({ complaintId: id, studentStatus })
    );
    if (verifyComplaintResolution.fulfilled.match(action)) {
      toast.success(
        studentStatus === "Resolved"
          ? "Complaint marked as resolved"
          : "Complaint reopened"
      );
    } else if (verifyComplaintResolution.rejected.match(action)) {
      const message =
        action.payload ??
        "Unable to update complaint status. Please try again.";
      toast.error(message);
    }
  };

  const handleStatusUpdate = async (status: Complaint["status"]) => {
    if (!id || statusLoading) return;
    setStatusLoading(true);
    const action = await dispatch(
      updateComplaintStatus({ complaintId: id, status })
    );
    if (updateComplaintStatus.fulfilled.match(action)) {
      toast.success("Complaint status updated");
    } else if (updateComplaintStatus.rejected.match(action)) {
      const message =
        action.payload ??
        "Unable to update complaint status. Please try again.";
      toast.error(message);
    }
    setStatusLoading(false);
  };

  const backPath = "/complaints";

  if (listStatus === "loading" && !selected) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading complaint…</div>
      </div>
    );
  }

  if (!selected || !id) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Complaint not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The complaint you are looking for might have been removed or you
              do not have permission to view it.
            </p>
            <Button variant="secondary" asChild>
              <Link to={backPath}>Return to complaints</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if student can verify (complaint is awaiting confirmation)
  const canVerify = isStudent && selected.status === "ToBeConfirmed";

  return (
    <>
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="mx-auto max-w-7xl overflow-hidden">
          <ComplaintDetailHeader complaint={selected} backPath={backPath} />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Main Content */}
            <div className="min-w-0 space-y-6 overflow-hidden">
              <ComplaintSummaryCard
                complaint={selected}
                onOpenImage={() => setViewerOpen(true)}
                showSubmittedBy={isAdmin || isWarden}
              />

              <ComplaintConversationCard
                complaint={selected}
                form={form}
                onSubmit={onSubmit}
                commentStatus={commentStatus}
                error={commentStatus === "failed" ? error : null}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ComplaintProgressTimeline complaint={selected} />

              {selected.status === "Resolved" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Complaint Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/20">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        ✓ This complaint has been resolved
                      </p>
                      <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                        The student has confirmed the resolution
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {isStudent && (
                    <ComplaintVerificationCard
                      complaint={selected}
                      canVerify={canVerify}
                      onVerify={handleVerification}
                    />
                  )}

                  {(isWarden || isAdmin) && (
                    <>
                      {selected.status === "Rejected" ? (
                        <Card>
                          <CardHeader>
                            <CardTitle>Complaint Status</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/20">
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                ✗ This complaint has been rejected
                              </p>
                              <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                                No further action can be taken on this complaint
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <ComplaintWardenToolsCard
                          complaint={selected}
                          statusLoading={statusLoading}
                          onUpdate={handleStatusUpdate}
                          error={commentStatus !== "failed" ? error : null}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ComplaintImageViewer
        open={viewerOpen}
        image={selected.problemImage}
        title={selected.problemTitle}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}

export default ComplaintDetailPage;
