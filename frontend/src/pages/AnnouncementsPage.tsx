import { useEffect, useState, useMemo } from "react";
import { useAppSelector } from "@/hooks";
import apiClient from "@/lib/api-client";
import { Link } from "react-router-dom";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";
import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus, AlertCircle, User } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Announcement, AnnouncementFormData } from "@/types/announcement";

const ITEMS_PER_PAGE = 9;

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

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium shadow-sm">
                <Megaphone className="size-3.5 text-primary" />
                <span className="text-foreground">Latest Updates</span>
              </div>
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
          <div className="space-y-6">
            <AnnouncementList
              items={paginatedItems}
              status={status}
              canDelete={canCreateAnnouncement}
              onDelete={handleDelete}
              deletingId={deletingId}
            />

            {/* Pagination */}
            {status === "succeeded" && items.length > 0 && totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {getPageNumbers().map((pageNum, idx) => (
                    <PaginationItem key={idx}>
                      {pageNum === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
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
