import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  selectAnnouncementsState,
  clearCreateStatus,
  clearDeleteStatus,
} from "@/features/announcements/announcementsSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Megaphone,
  FileText,
  Download,
  Trash2,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  User,
} from "lucide-react";

// Form validation schema
const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  message: z.string().min(1, "Message is required").max(2000, "Message is too long"),
  file: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
        return allowedTypes.includes(file.type);
      },
      "Only PDF, JPG, JPEG, and PNG files are allowed"
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        return file.size <= 5 * 1024 * 1024; // 5MB
      },
      "File size must be less than 5MB"
    ),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

function AnnouncementsPage() {
  const dispatch = useAppDispatch();
  const { items, status, createStatus, createError, deleteStatus } =
    useAppSelector(selectAnnouncementsState);
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Check if user is warden or admin
  const canCreateAnnouncement =
    isAuthenticated && (user?.role === "warden" || user?.role === "admin");

  // React Hook Form
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  });

  const fileList = watch("file");

  useEffect(() => {
    if (status === "idle" && isAuthenticated) {
      dispatch(fetchAnnouncements());
    }
  }, [status, dispatch, isAuthenticated]);

  useEffect(() => {
    if (createStatus === "succeeded") {
      // Reset form after successful creation
      reset();
      setShowCreateForm(false);

      // Clear status after 3 seconds
      const timer = setTimeout(() => {
        dispatch(clearCreateStatus());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [createStatus, dispatch, reset]);

  useEffect(() => {
    if (deleteStatus === "succeeded") {
      setDeletingId(null);
      const timer = setTimeout(() => {
        dispatch(clearDeleteStatus());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deleteStatus, dispatch]);

  const onSubmit = (data: AnnouncementFormData) => {
    const file = data.file && data.file.length > 0 ? data.file[0] : undefined;
    
    dispatch(
      createAnnouncement({
        title: data.title.trim(),
        message: data.message.trim(),
        file,
      })
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setDeletingId(id);
      dispatch(deleteAnnouncement(id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-3 py-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border bg-card text-xs font-medium shadow-sm">
            <Megaphone className="size-3.5" />
            <span>Announcements</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Announcements
              </h1>
              <p className="text-muted-foreground">
                Stay updated with the latest news and notices
              </p>
            </div>
            {canCreateAnnouncement && !showCreateForm && (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="shadow-lg"
              >
                <Plus className="size-4 mr-2" />
                New Announcement
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Announcements List */}
          <div className="space-y-4">
            {!isAuthenticated ? (
              <Card className="border-2 border-primary/20">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <AlertCircle className="size-16 text-muted-foreground/50 mb-4" />
                  <div className="space-y-2 mb-6">
                    <p className="text-xl font-semibold text-foreground">
                      Authentication Required
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Please login to view announcements and stay updated with the latest news and notices
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
            ) : (
              <>
            {status === "loading" && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            )}

            {status === "failed" && (
              <Card className="border-destructive/80">
                <CardContent className="flex items-center gap-2 text-destructive py-6">
                  <AlertCircle className="size-5" />
                  <span>Failed to load announcements</span>
                </CardContent>
              </Card>
            )}

            {status === "succeeded" && items.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Megaphone className="size-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium mb-2">No announcements yet</p>
                  <p className="text-sm text-muted-foreground">
                    Check back later for updates
                  </p>
                </CardContent>
              </Card>
            )}

            {status === "succeeded" &&
              items.map((announcement) => (
                <Card
                  key={announcement._id}
                  className="shadow-lg border-border/90 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-primary/10">
                            <Megaphone className="size-4 text-primary" />
                          </div>
                          {announcement.title}
                        </CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <User className="size-3" />
                            {announcement.postedBy.name} ({announcement.postedBy.role})
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDate(announcement.createdAt)}
                          </span>
                        </CardDescription>
                      </div>
                      {canCreateAnnouncement && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(announcement._id)}
                          disabled={deletingId === announcement._id}
                          className="shrink-0"
                        >
                          {deletingId === announcement._id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4 text-destructive" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {announcement.message}
                    </p>

                    {announcement.fileUrl && (
                      <div className="mt-4 p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="size-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Attached File</p>
                            <p className="text-xs text-muted-foreground">
                              Click to view or download
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={announcement.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="size-4 mr-2" />
                              View
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              </>
            )}
          </div>

          {/* Create Form Sidebar (for warden/admin) */}
          {canCreateAnnouncement && showCreateForm && (
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card className="shadow-xl border-2 border-primary/20">
                <CardHeader className="border-b bg-primary/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="size-4 text-primary" />
                      Create Announcement
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setShowCreateForm(false);
                        reset();
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Share important updates with everyone
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter announcement title"
                        {...register("title")}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Enter announcement message..."
                        {...register("message")}
                        rows={6}
                        className="resize-none"
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive">{errors.message.message}</p>
                      )}
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="file">
                        Attach File{" "}
                        <span className="text-muted-foreground text-xs">
                          (Optional - PDF, JPG, PNG)
                        </span>
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        {...register("file")}
                        className="cursor-pointer"
                      />
                      {errors.file && (
                        <p className="text-sm text-destructive">{errors.file.message}</p>
                      )}
                      {fileList && fileList.length > 0 && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                          <FileText className="size-4 text-primary" />
                          <span className="flex-1 truncate">{fileList[0].name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => reset({ title: watch("title"), message: watch("message"), file: undefined })}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Error Message */}
                    {createError && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive animate-in fade-in">
                        <AlertCircle className="size-4 shrink-0" />
                        <span className="text-sm font-medium">{createError}</span>
                      </div>
                    )}

                    {/* Success Message */}
                    {createStatus === "succeeded" && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border-2 border-green-500/20 text-green-700 dark:text-green-400 animate-in fade-in">
                        <CheckCircle className="size-4 shrink-0" />
                        <span className="text-sm font-medium">
                          Announcement created successfully!
                        </span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full shadow-lg hover:shadow-xl transition-all"
                      disabled={createStatus === "loading"}
                    >
                      {createStatus === "loading" ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 size-4" />
                          Create Announcement
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnnouncementsPage;
