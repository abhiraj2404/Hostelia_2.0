import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks";
import apiClient from "@/lib/api-client";
import { AnnouncementDetail } from "@/components/announcements/AnnouncementDetail";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import type { Announcement } from "@/types/announcement";

function AnnouncementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "succeeded" | "failed">("idle");
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete =
    isAuthenticated && (user?.role === "warden" || user?.role === "admin");

  useEffect(() => {
    if (!id || !isAuthenticated) {
      setStatus("failed");
      return;
    }

    const fetchAnnouncement = async () => {
      try {
        setStatus("loading");
        const response = await apiClient.get("/announcement");
        const announcements = response.data.data || [];
        const found = announcements.find((a: Announcement) => a._id === id);
        
        if (found) {
          setAnnouncement(found);
          setStatus("succeeded");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Failed to fetch announcement:", error);
        setStatus("failed");
      }
    };

    fetchAnnouncement();
  }, [id, isAuthenticated]);

  const handleDelete = async (announcementId: string) => {
    try {
      setIsDeleting(true);
      await apiClient.delete(`/announcement/${announcementId}`);
      navigate("/announcements");
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20 flex items-center justify-center px-4">
        <Card className="border-2 border-primary/20 max-w-lg w-full">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="size-16 text-muted-foreground/50 mb-4" />
            <div className="space-y-2 mb-6">
              <p className="text-xl font-semibold text-foreground">
                Authentication Required
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                Please login to view this announcement
              </p>
            </div>
            <Button onClick={() => navigate("/login")} size="lg">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20 flex items-center justify-center">
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-16 px-12">
            <Loader2 className="size-12 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              Loading announcement...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "failed" || !announcement) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20 flex items-center justify-center px-4">
        <Card className="border-destructive/50 bg-destructive/5 max-w-lg w-full">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="size-16 text-destructive/50 mb-4" />
            <div className="space-y-2 mb-6">
              <p className="text-xl font-semibold text-destructive">
                Announcement Not Found
              </p>
              <p className="text-sm text-muted-foreground max-w-md">
                The announcement you're looking for doesn't exist or has been
                removed
              </p>
            </div>
            <Button
              onClick={() => navigate("/announcements")}
              variant="outline"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Announcements
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <AnnouncementDetail
          announcement={announcement}
          onDelete={handleDelete}
          canDelete={canDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}

export default AnnouncementDetailPage;
