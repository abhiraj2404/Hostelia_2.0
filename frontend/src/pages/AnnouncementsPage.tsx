import { useEffect, useState, useMemo } from "react";
import { useAppSelector } from "@/hooks";
import apiClient from "@/lib/api-client";
import { Link } from "react-router-dom";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";
import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, User, ChevronLeft, ChevronRight } from "lucide-react";
import type { Announcement, AnnouncementFormData } from "@/types/announcement";

const ITEMS_PER_PAGE = 5;

function AnnouncementsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [items, setItems] = useState<Announcement[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "succeeded" | "failed">("idle");
  const [createStatus, setCreateStatus] = useState<"idle" | "loading" | "succeeded" | "failed">("idle");
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading" | "succeeded" | "failed">("idle");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Check if user is warden or admin
  const canCreateAnnouncement =
    isAuthenticated && (user?.role === "warden" || user?.role === "admin");

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setStatus("loading");
      const response = await apiClient.get("/announcement");
      setItems(response.data.data || []);
      setStatus("succeeded");
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      setStatus("failed");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnnouncements();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (createStatus === "succeeded") {
      setShowCreateForm(false);
      setCurrentPage(1); // Reset to first page

      // Refresh list
      fetchAnnouncements();

      // Clear status after 3 seconds
      const timer = setTimeout(() => {
        setCreateStatus("idle");
        setCreateError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [createStatus]);

  useEffect(() => {
    if (deleteStatus === "succeeded") {
      setDeletingId(null);

      // Refresh list
      fetchAnnouncements();

      const timer = setTimeout(() => {
        setDeleteStatus("idle");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deleteStatus]);

  // Pagination logic
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [items, currentPage]);

  

  const handleSubmit = async (data: AnnouncementFormData) => {
    try {
      setCreateStatus("loading");
      setCreateError(null);

      const formData = new FormData();
      formData.append("title", data.title.trim());
      formData.append("message", data.message.trim());

      if (data.file && data.file.length > 0) {
        formData.append("announcementFile", data.file[0]);
      }

      await apiClient.post("/announcement", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setCreateStatus("succeeded");
    } catch (error: any) {
      setCreateStatus("failed");
      setCreateError(
        error.response?.data?.message || "Failed to create announcement"
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        setDeletingId(id);
        setDeleteStatus("loading");
        await apiClient.delete(`/announcement/${id}`);
        setDeleteStatus("succeeded");
      } catch (error) {
        setDeleteStatus("failed");
        setDeletingId(null);
      }
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
                Please login to view announcements and stay updated with the
                latest news and notices
              </p>
            </div>
            <Link to="/login">
              <Button size="lg" className="shadow-lg">
                <User className="size-4 mr-2" />
                Login to View Announcements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium shadow-sm">
                <Megaphone className="size-3.5 text-primary" />
                <span className="text-foreground">Latest Updates</span>
              </div> */}
              <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Announcements
              </h1>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Stay informed with important updates, notices, and news from the administration
              </p>
            </div>
            {canCreateAnnouncement && !showCreateForm && (
              <Button
                onClick={() => setShowCreateForm(true)}
                size="lg"
                className="shadow-lg hover:shadow-xl transition-shadow self-start sm:self-center"
              >
                <Plus className="size-4 mr-2" />
                Create Announcement
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
          {/* Announcements List */}
          <div className="flex flex-col gap-6 min-h-[360px]">
            <div className="flex-1">
              <AnnouncementList
                items={paginatedItems}
                status={status}
                canDelete={canCreateAnnouncement}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            </div>

            {/* Pagination (Complaints-style) */}
            {status === "succeeded" && items.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-auto">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, items.length)} of {items.length} announcements
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="text-sm">Page {currentPage} of {totalPages}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Create Form Sidebar (for warden/admin) */}
          {canCreateAnnouncement && showCreateForm && (
            <AnnouncementForm
              onSubmit={handleSubmit}
              createStatus={createStatus}
              createError={createError}
              onClose={() => setShowCreateForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AnnouncementsPage;
