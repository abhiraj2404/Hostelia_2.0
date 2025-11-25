import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Upload,
} from "lucide-react";
import type { AnnouncementFormData } from "@/types/announcement";

// Form validation schema
const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message is too long"),
  file: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        const allowedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/jpg",
          "image/png",
        ];
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

interface AnnouncementFormProps {
  onSubmit: (data: AnnouncementFormData) => Promise<void>;
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  createError: string | null;
  onClose: () => void;
}

export function AnnouncementForm({
  onSubmit,
  createStatus,
  createError,
  onClose,
}: AnnouncementFormProps) {
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

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <Card className="shadow-lg border-border/60 overflow-hidden">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Plus className="size-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Create Announcement</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="size-4" />
            </Button>
          </div>
          <CardDescription className="text-xs mt-2">
            Share important updates with everyone
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter announcement title"
                {...register("title")}
                className="h-9 text-sm"
              />
              {errors.title && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Write your announcement message..."
                {...register("message")}
                rows={5}
                className="resize-none text-sm"
              />
              {errors.message && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file" className="text-sm font-medium">
                Attach File{" "}
                <span className="text-muted-foreground text-xs">
                  (Optional)
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  {...register("file")}
                  className="cursor-pointer h-9 text-sm file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                PDF, JPG, JPEG, PNG (Max 5MB)
              </p>
              {errors.file && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {errors.file.message}
                </p>
              )}
              {fileList && fileList.length > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/60 text-xs">
                  <FileText className="size-4 text-primary shrink-0" />
                  <span className="flex-1 truncate font-medium">
                    {fileList[0].name}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {(fileList[0].size / 1024).toFixed(1)} KB
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      reset({
                        title: watch("title"),
                        message: watch("message"),
                        file: undefined,
                      })
                    }
                    className="h-6 w-6 p-0"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {createError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in">
                <AlertCircle className="size-4 shrink-0" />
                <span className="text-xs font-medium">{createError}</span>
              </div>
            )}

            {/* Success Message */}
            {createStatus === "succeeded" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 animate-in fade-in">
                <CheckCircle className="size-4 shrink-0" />
                <span className="text-xs font-medium">
                  Announcement created successfully!
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full shadow-md hover:shadow-lg transition-all h-9 text-sm"
              disabled={createStatus === "loading"}
            >
              {createStatus === "loading" ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-4" />
                  Create Announcement
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
