import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { CommentCard } from "./CommentCard";
import { CommentForm } from "./CommentForm";
import type { Comment, CommentFormData } from "@/types/announcement";
import { MessageSquare } from "lucide-react";
import apiClient from "@/lib/api-client";

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (data: CommentFormData) => Promise<void>;
  isSubmitting: boolean;
  isAuthenticated: boolean;
}

export function CommentSection({
  comments,
  onAddComment,
  isSubmitting,
  isAuthenticated,
}: CommentSectionProps) {
  const [userMap, setUserMap] = useState<Record<string, string>>({});

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
              const res = await apiClient.get(`/user/${id}`);
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
          Comments ({comments.length})
        </CardTitle>
        <CardDescription>
          Join the conversation and share your thoughts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated && (
          <>
            <CommentForm onSubmit={onAddComment} isSubmitting={isSubmitting} />
            {comments.length > 0 && (
              <div className="border-t border-border my-4" />
            )}
          </>
        )}

        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <MessageSquare className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No comments yet
            </p>
            <p className="text-xs text-muted-foreground">
              Be the first to share your thoughts
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment, index) => {
              // Determine a display name: prefer fetched name, otherwise if comment.user is not an ObjectId use it directly
              let commenterName: string | undefined;
              if (typeof comment.user === "string") {
                if (userMap[comment.user]) commenterName = userMap[comment.user];
                else if (!/^[0-9a-fA-F]{24}$/.test(comment.user)) commenterName = comment.user;
              }

              return (
                <CommentCard
                  key={`${comment.user}-${index}`}
                  comment={comment}
                  commenterName={commenterName}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
