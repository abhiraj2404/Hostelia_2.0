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
import type { FormEvent } from "react";
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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <Link
          to={backPath}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to complaints
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">
          {complaint.problemTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          Room {complaint.roomNo} · {complaint.hostel} · {complaint.category}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <ComplaintStatusBadge status={complaint.status} />
        <ComplaintStudentStatusBadge studentStatus={complaint.studentStatus} />
      </div>
    </div>
  );
}

type ComplaintSummaryCardProps = {
  complaint: Complaint;
  onOpenImage: () => void;
};

export function ComplaintSummaryCard({
  complaint,
  onOpenImage,
}: ComplaintSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Complaint summary</CardTitle>
        <CardDescription>
          Detailed view of the problem and supporting information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p className="leading-relaxed">{complaint.problemDescription}</p>
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
              The warden has marked this complaint as resolved. Please verify
              the fix and confirm or reopen if the problem still exists.
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
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm">
              {complaint.status === "Pending" &&
                "Waiting for warden to review and resolve this complaint."}
              {complaint.status === "Resolved" &&
                "This complaint has been confirmed as resolved."}
              {complaint.status === "Rejected" &&
                "This complaint was rejected by the warden."}
            </p>
          </div>
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
        <p>
          Update the status of this complaint. When you mark it as resolved, it
          will be sent to the student for confirmation.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            disabled={statusLoading || complaint.status === "Pending"}
            onClick={() => onUpdate("Pending")}
          >
            Mark as Under Review
          </Button>
          <Button
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            disabled={statusLoading || complaint.status === "ToBeConfirmed"}
            onClick={() => onUpdate("Resolved")}
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
            will be sent to the student for verification. The student can then
            confirm or reopen it.
          </p>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation</CardTitle>
        <CardDescription>
          All updates between you and the hostel staff.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              .map((comment, index) => (
                <div
                  key={`${comment.createdAt}-${index}`}
                  className="rounded-lg border border-border/60 bg-background p-4"
                >
                  <div className="flex flex-col gap-1 text-xs uppercase tracking-widest text-muted-foreground/70 md:flex-row md:items-center md:justify-between">
                    <span>{comment.role}</span>
                    <span>{formatComplaintDate(comment.createdAt)}</span>
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
