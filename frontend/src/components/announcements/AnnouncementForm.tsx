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
} from "lucide-react";

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

type AnnouncementFormData = z.infer<typeof announcementSchema>;

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
      <Card className="shadow-lg border border-primary/20">
        <CardHeader className="border-b bg-primary/5 pb-2.5 pt-3 px-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Plus className="size-3.5 text-primary" />
              Create Announcement
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} className="h-7 w-7 p-0">
              <X className="size-3.5" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Share important updates with everyone
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3 px-3 pb-3">
          <form
            onSubmit={handleFormSubmit(onSubmit)}
            className="space-y-3"
          >
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter announcement title"
                {...register("title")}
                className="h-8 text-xs"
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Enter announcement message..."
                {...register("message")}
                rows={4}
                className="resize-none text-xs"
              />
              {errors.message && (
                <p className="text-xs text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <Label htmlFor="file" className="text-xs">
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
                className="cursor-pointer h-8 text-xs"
              />
              {errors.file && (
                <p className="text-xs text-destructive">{errors.file.message}</p>
              )}
              {fileList && fileList.length > 0 && (
                <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/50 text-xs">
                  <FileText className="size-3.5 text-primary" />
                  <span className="flex-1 truncate">{fileList[0].name}</span>
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
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in">
                <AlertCircle className="size-3.5 shrink-0" />
                <span className="text-xs font-medium">{createError}</span>
              </div>
            )}

            {/* Success Message */}
            {createStatus === "succeeded" && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 animate-in fade-in">
                <CheckCircle className="size-3.5 shrink-0" />
                <span className="text-xs font-medium">
                  Announcement created successfully!
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full shadow-md hover:shadow-lg transition-all h-8 text-xs"
              disabled={createStatus === "loading"}
            >
              {createStatus === "loading" ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 size-3.5" />
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
