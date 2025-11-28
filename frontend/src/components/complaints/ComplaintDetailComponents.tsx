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
import type { Complaint } from "@/features/complaints/complaintsSlice";
import { fetchUsersByIds, type UserData } from "@/lib/user-api";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Link } from "react-router-dom";
import { formatComplaintDate } from "./complaintConstants";

type ComplaintDetailHeaderProps = {
  complaint: Complaint;
  backPath: string;
};

export function ComplaintDetailHeader({
  complaint,
  backPath,
}: ComplaintDetailHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-4 overflow-hidden md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1 overflow-hidden">
        <Link
          to={backPath}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to complaints
        </Link>
        <div className="mt-3 w-full max-w-full overflow-hidden">
          <h1
            className="wrap-break-word text-3xl font-semibold text-foreground"
            style={{
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              hyphens: "auto",
              maxWidth: "100%",
            }}
          >
          {complaint.problemTitle}
        </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Room {complaint.roomNo} · {complaint.hostel} · {complaint.category}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <ComplaintStatusBadge status={complaint.status} />
        <ComplaintStudentStatusBadge
          studentStatus={complaint.studentStatus}
          complaintStatus={complaint.status}
        />
      </div>
    </div>
  );
}

type ComplaintSummaryCardProps = {
  complaint: Complaint;
  onOpenImage: () => void;
  showSubmittedBy?: boolean;
};

export function ComplaintSummaryCard({
  complaint,
  onOpenImage,
  showSubmittedBy = false,
}: ComplaintSummaryCardProps) {
  const [studentData, setStudentData] = useState<UserData | null>(null);

  useEffect(() => {
    const loadStudent = async () => {
      const users = await fetchUsersByIds([complaint.studentId]);
      const student = users.get(complaint.studentId);
      if (student) {
        setStudentData(student);
      }
    };

    loadStudent();
  }, [complaint.studentId]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="overflow-hidden">
        <CardTitle className="wrap-break-word">Complaint summary</CardTitle>
        <CardDescription className="wrap-break-word">
          Detailed view of the problem and supporting information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden text-sm text-muted-foreground">
        {showSubmittedBy && studentData && (
          <div className="overflow-hidden rounded-lg bg-muted/30 p-3 text-xs">
            <span className="font-medium text-foreground">Submitted by:</span>{" "}
            <span className="wrap-break-word text-foreground">
              {studentData.name}
              {studentData.rollNo && ` (Roll No: ${studentData.rollNo})`}
            </span>
          </div>
        )}
        <div className="max-w-full overflow-hidden">
          <p className="wrap-break-word leading-relaxed whitespace-pre-wrap">
            {complaint.problemDescription}
          </p>
        </div>
        {complaint.problemImage && (
          <div>
            <Label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
              Evidence
            </Label>
            <button
              type="button"
              onClick={onOpenImage}
              className="group relative block w-full overflow-hidden rounded-lg border border-border"
            >
                <img
                  src={complaint.problemImage}
                  alt={complaint.problemTitle ?? "Complaint evidence"}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                Click to enlarge
              </span>
            </button>
          </div>
        )}
        <div className="grid gap-2 text-xs uppercase tracking-widest text-muted-foreground/70 md:grid-cols-2">
          <span>Last updated: {formatComplaintDate(complaint.updatedAt)}</span>
          <span>Resolved at: {formatComplaintDate(complaint.resolvedAt)}</span>
          <span>
            Student verified: {formatComplaintDate(complaint.studentVerifiedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

type ComplaintVerificationCardProps = {
  complaint: Complaint;
  canVerify: boolean;
  onVerify: (status: "Resolved" | "Rejected") => void;
};

export function ComplaintVerificationCard({
  complaint,
  canVerify,
  onVerify,
}: ComplaintVerificationCardProps) {
  return (
    <Card className="border-border/70 bg-muted/20">
      <CardHeader>
        <CardTitle className="text-lg">Student Verification</CardTitle>
        <CardDescription>
          Confirm resolution or reopen if the issue persists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {canVerify ? (
          <>
            <p>
              This complaint has been marked as resolved. Please verify the fix
              and confirm or reopen if the problem still exists.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onVerify("Resolved")}
              >
                Confirm Resolution
              </Button>
              <Button
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50"
                onClick={() => onVerify("Rejected")}
              >
                Reopen Complaint
              </Button>
            </div>
          </>
        ) : (
          <>
            {complaint.status === "Pending" && (
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm font-medium">
                  ⏳ Waiting for staff to review and resolve this complaint.
                </p>
              </div>
            )}
            {complaint.status === "Resolved" && (
              <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-950/20">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✓ This complaint has been confirmed as resolved.
                </p>
              </div>
            )}
            {complaint.status === "Rejected" && (
              <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  ✗ This complaint has been rejected.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

type ComplaintWardenToolsCardProps = {
  complaint: Complaint;
  statusLoading: boolean;
  onUpdate: (status: Complaint["status"]) => void;
  error?: string | null;
};

export function ComplaintWardenToolsCard({
  complaint,
  statusLoading,
  onUpdate,
  error,
}: ComplaintWardenToolsCardProps) {
  return (
    <Card className="border-border/70 bg-muted/20">
      <CardHeader>
        <CardTitle className="text-lg">Warden tools</CardTitle>
        <CardDescription>
          Update complaint progress for your hostel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {complaint.status === "ToBeConfirmed" ? (
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm font-medium">
              ⏳ Waiting for student to confirm the resolution.
            </p>
          </div>
        ) : (
          <>
            <p>
              Update the status of this complaint. When you mark it as resolved,
              it will be sent to the student for confirmation.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                disabled={statusLoading}
                onClick={() => onUpdate("ToBeConfirmed")}
              >
                Mark as Resolved
              </Button>
              <Button
                variant="destructive"
                disabled={statusLoading || complaint.status === "Rejected"}
                onClick={() => onUpdate("Rejected")}
              >
                Reject Complaint
              </Button>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs">
                <strong>Note:</strong> When you mark a complaint as resolved, it
                will be sent to the student for verification. The student can
                then confirm or reopen it.
              </p>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

type ComplaintConversationCardProps = {
  complaint: Complaint;
  form: UseFormReturn<{ message: string }>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  commentStatus: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
};

export function ComplaintConversationCard({
  complaint,
  form,
  onSubmit,
  commentStatus,
  error,
}: ComplaintConversationCardProps) {
  const [userMap, setUserMap] = useState<Map<string, UserData>>(new Map());
  const [showAllComments, setShowAllComments] = useState(false);
  const INITIAL_COMMENTS_SHOWN = 5;

  useEffect(() => {
    const loadUsers = async () => {
      if (complaint.comments.length === 0) return;

      // Only fetch user data for students (wardens and admins don't have names)
      const userIds = complaint.comments
        .filter((c) => c.role === "student")
        .map((c) => c.user);
      const users = await fetchUsersByIds(userIds);
      setUserMap(users);
    };

    loadUsers();
  }, [complaint.comments]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="overflow-hidden">
        <CardTitle className="wrap-break-word">Conversation</CardTitle>
        <CardDescription className="wrap-break-word">
          All updates between you and the hostel staff.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 overflow-hidden">
        {complaint.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No messages yet. Use the form below to add context or provide
            updates.
          </p>
        ) : (
          <div className="space-y-4">
            {complaint.comments
              .slice()
              .reverse()
              .slice(0, showAllComments ? undefined : INITIAL_COMMENTS_SHOWN)
              .map((comment, index) => {
                // For warden/admin, display role name only; for students, fetch user data with roll number
                let displayName: string;
                if (comment.role === "warden") {
                  displayName = "Warden";
                } else if (comment.role === "admin") {
                  displayName = "Admin";
                } else {
                  const userData = userMap.get(comment.user);
                  if (userData) {
                    displayName = userData.rollNo
                      ? `${userData.name} (${userData.rollNo})`
                      : userData.name;
                  } else {
                    displayName = "Student";
                  }
                }

                return (
                  <div
                    key={`${comment.createdAt}-${index}`}
                    className="overflow-hidden rounded-lg border border-border/60 bg-background p-4"
                  >
                    <div className="flex flex-col gap-1 text-xs md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex items-center gap-2 overflow-hidden">
                        <span className="max-w-full truncate text-base font-semibold text-foreground">
                          {displayName}
                        </span>
                      </div>
                      <span className="shrink-0 text-muted-foreground">
                        {formatComplaintDate(comment.createdAt)}
                      </span>
                    </div>
                    <div className="mt-2 max-w-full overflow-hidden">
                      <p className="wrap-break-word text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {comment.message}
                    </p>
                    </div>
                  </div>
                );
              })}

            {complaint.comments.length > INITIAL_COMMENTS_SHOWN && (
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="text-primary hover:text-primary/80"
                >
                  {showAllComments ? (
                    <>Show Less</>
                  ) : (
                    <>
                      Show {complaint.comments.length - INITIAL_COMMENTS_SHOWN}{" "}
                      More Comments
                    </>
                  )}
                </Button>
              </div>
            )}
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
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

type ComplaintImageViewerProps = {
  open: boolean;
  image?: string | null;
  title?: string | null;
  onClose: () => void;
};

export function ComplaintImageViewer({
  open,
  image,
  title,
  onClose,
}: ComplaintImageViewerProps) {
  if (!open || !image) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-zoom-out"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-full max-w-5xl space-y-4">
          <img
            src={image}
            alt={title ?? "Complaint evidence enlarged view"}
          className="max-h-[70vh] w-full rounded-lg object-contain"
          />
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
