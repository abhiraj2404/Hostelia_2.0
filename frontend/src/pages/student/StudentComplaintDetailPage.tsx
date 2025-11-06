import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ComplaintStatusBadge,
  ComplaintStudentStatusBadge,
} from "@/components/complaints/ComplaintStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addComplaintComment,
  fetchComplaintById,
  selectComplaintsState,
  verifyComplaintResolution,
} from "@/features/complaints/complaintsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";

type CommentFormValues = {
  message: string;
};

const formatDate = (value: string | null) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

function StudentComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected, detailStatus, commentStatus, error } = useAppSelector(
    selectComplaintsState
  );

  const form = useForm<CommentFormValues>({ defaultValues: { message: "" } });

  useEffect(() => {
    if (id) {
      dispatch(fetchComplaintById(id));
    }
  }, [dispatch, id]);

  const onSubmit = form.handleSubmit(async (values: CommentFormValues) => {
    if (!id) return;
    const trimmed = values.message.trim();
    if (!trimmed) {
      form.setError("message", { message: "Comment cannot be empty" });
      return;
    }
    const action = await dispatch(
      addComplaintComment({ complaintId: id, message: trimmed })
    );
    if (addComplaintComment.fulfilled.match(action)) {
      form.reset();
    }
  });

  const handleVerification = async (studentStatus: "Resolved" | "Rejected") => {
    if (!id) return;
    await dispatch(
      verifyComplaintResolution({ complaintId: id, studentStatus })
    );
  };

  if (!id) {
    navigate("/student/complaints");
    return null;
  }

  if (detailStatus === "loading" && !selected) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-12">
          <p className="text-sm text-muted-foreground">Loading complaint…</p>
        </div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-12">
          <Card className="border-destructive/40 bg-destructive/10">
            <CardContent className="py-6 text-sm text-destructive">
              Unable to find this complaint. It may have been removed or you may
              not have access.
            </CardContent>
          </Card>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/student/complaints">Back to complaints</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              to="/student/complaints"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to complaints
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-foreground">
              {selected.problemTitle}
            </h1>
            <p className="text-sm text-muted-foreground">
              Room {selected.roomNo} · {selected.hostel} · {selected.category}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ComplaintStatusBadge status={selected.status} />
            <ComplaintStudentStatusBadge
              studentStatus={selected.studentStatus}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                Reported on {formatDate(selected.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p className="leading-relaxed">{selected.problemDescription}</p>
              {selected.problemImage && (
                <div>
                  <Label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                    Evidence
                  </Label>
                  <img
                    src={selected.problemImage}
                    alt={selected.problemTitle}
                    className="w-full rounded-lg border border-border object-cover"
                  />
                </div>
              )}
              <div className="grid gap-2 text-xs uppercase tracking-widest text-muted-foreground/70 md:grid-cols-2">
                <span>Last updated: {formatDate(selected.updatedAt)}</span>
                <span>Resolved at: {formatDate(selected.resolvedAt)}</span>
                <span>
                  Student verified: {formatDate(selected.studentVerifiedAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">Verification</CardTitle>
              <CardDescription>
                Confirm or reopen once the fix has been validated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                When the maintenance team resolves the issue, acknowledge the
                fix or flag any concerns so the warden can follow up.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  disabled={selected.studentStatus === "Resolved"}
                  onClick={() => handleVerification("Resolved")}
                >
                  Mark as resolved
                </Button>
                <Button
                  variant="outline"
                  disabled={selected.studentStatus === "Rejected"}
                  onClick={() => handleVerification("Rejected")}
                >
                  Reopen / not resolved
                </Button>
              </div>
              {error && commentStatus === "failed" && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>
                All updates between you and the hostel staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selected.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No messages yet. Use the form below to add context or provide
                  updates.
                </p>
              ) : (
                <div className="space-y-4">
                  {selected.comments
                    .slice()
                    .reverse()
                    .map((comment, index) => (
                      <div
                        key={`${comment.createdAt}-${index}`}
                        className="rounded-lg border border-border/60 bg-background p-4"
                      >
                        <div className="flex flex-col gap-1 text-xs uppercase tracking-widest text-muted-foreground/70 md:flex-row md:items-center md:justify-between">
                          <span>{comment.role}</span>
                          <span>{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {comment.message}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">Add an update</Label>
                  <Textarea
                    id="message"
                    placeholder="Share additional details or follow-up information"
                    {...form.register("message")}
                  />
                  {form.formState.errors.message && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={commentStatus === "loading"}>
                  {commentStatus === "loading" ? "Sending…" : "Post message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default StudentComplaintDetailPage;
