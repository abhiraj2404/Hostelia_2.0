import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import type { CommentFormData } from "@/types/announcement";

const commentSchema = z.object({
  message: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment is too long")
    .refine((val) => val.trim().length > 0, "Comment cannot be blank")
    .refine((val) => /\p{L}/u.test(val), "Comment must contain alphabetic characters"),
});

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function CommentForm({ onSubmit, isSubmitting }: CommentFormProps) {
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      message: "",
    },
  });

  const handleSubmit = async (data: CommentFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleFormSubmit(handleSubmit)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="comment" className="text-sm font-medium">
          Add a comment
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your thoughts..."
          {...register("message")}
          rows={3}
          disabled={isSubmitting}
          className="resize-none text-sm"
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Posting...
          </>
        ) : (
          <>
            <Send className="mr-2 size-4" />
            Post Comment
          </>
        )}
      </Button>
    </form>
  );
}
