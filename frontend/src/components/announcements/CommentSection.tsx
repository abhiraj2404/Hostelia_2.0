import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CommentForm } from "./CommentForm";
import type { Comment, CommentFormData } from "@/types/announcement";
import { MessageSquare } from "lucide-react";
import apiClient from "@/lib/api-client";
import { formatTime } from "@/lib/utils";

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (data: CommentFormData) => Promise<void>;
  isSubmitting: boolean;
  isAuthenticated: boolean;
}

const INITIAL_COMMENTS_SHOWN = 5;

export function CommentSection({
  comments,
  onAddComment,
  isSubmitting,
  isAuthenticated,
}: CommentSectionProps) {
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    // Find unique user ids that look like ObjectIds and are not yet fetched
    const idsToFetch = Array.from(
      new Set(
        comments
          .map((c) => (typeof c.user === "string" ? c.user : undefined))
          .filter(Boolean)
          .filter((id) => /^[0-9a-fA-F]{24}$/.test(id!))
          .filter((id) => !(id! in userMap))
      )
    );

    if (idsToFetch.length === 0) return;

    let mounted = true;
    (async () => {
      try {
        // build a simple role map for fallbacks when fetch is forbidden
        const roleById: Record<string, string> = {};
        for (const c of comments) {
          if (typeof c.user === "string" && /^[0-9a-fA-F]{24}$/.test(c.user)) {
            roleById[c.user] = c.role;
          }
        }

        const results = await Promise.all(
          idsToFetch.map(async (id) => {
            try {
              // backend user routes are mounted under /api/user/:userId
              // Use the lightweight endpoint that returns only name and role
              const res = await apiClient.get(`/user/getName/${id}`);
              return { id, name: res.data?.user?.name };
            } catch (err: any) {
              // If request is forbidden (student trying to fetch other users), fall back to role label
              const role = roleById[id as string];
              if (role === "admin") return { id, name: "Admin" };
              if (role === "warden") return { id, name: "Warden" };
              // else undefined name
              return { id, name: undefined };
            }
          })
        );
        if (!mounted) return;
        setUserMap((prev) => {
          const copy = { ...prev };
          for (const r of results) {
            if (r && r.id && r.name) copy[r.id] = r.name;
          }
          return copy;
        });
      } catch (e) {
        // ignore failures; we'll fallback to role-based initials
      }
    })();

    return () => {
      mounted = false;
    };
  }, [comments]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="size-5" />
          Conversation ({comments.length})
        </CardTitle>
        <CardDescription>All updates and discussion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comments first (newest at top) */}
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No messages yet. Use the form below to add context or provide
            updates.
          </p>
        ) : (
          <div className="space-y-4">
            {comments
              .slice()
              .reverse()
              .slice(0, showAllComments ? undefined : INITIAL_COMMENTS_SHOWN)
              .map((comment, index) => {
                // Determine a display name: prefer fetched name, otherwise if comment.user is not an ObjectId use it directly
                let displayName: string;
                if (comment.role === "warden") {
                  displayName = "Warden";
                } else if (comment.role === "admin") {
                  displayName = "Admin";
                } else {
                  let commenterName: string | undefined;
                  if (typeof comment.user === "string") {
                    if (userMap[comment.user]) commenterName = userMap[comment.user];
                    else if (!/^[0-9a-fA-F]{24}$/.test(comment.user)) commenterName = comment.user;
                  }
                  displayName = commenterName ?? "Student";
                }

                return (
                  <div
                    key={`${comment.createdAt ?? comment.user}-${index}`}
                    className="rounded-lg border border-border/60 bg-background p-4"
                  >
                    <div className="flex flex-col gap-1 text-xs md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-foreground">
                          {displayName}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {comment.createdAt ? formatTime(comment.createdAt) : "Unknown time"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground leading-relaxed">
                      {comment.message}
                    </p>
                  </div>
                );
              })}

            {comments.length > INITIAL_COMMENTS_SHOWN && (
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
                      Show {comments.length - INITIAL_COMMENTS_SHOWN}{" "}
                      More Comments
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Form at bottom to match complaint conversation UX */}
        {isAuthenticated && (
          <div className="space-y-4">
            {comments.length > 0 && <div className="border-t border-border" />}
            <CommentForm onSubmit={onAddComment} isSubmitting={isSubmitting} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
