import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Star,
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

// Form validation schema
const feedbackSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  mealType: z.enum(["Breakfast", "Lunch", "Snacks", "Dinner"], {
    required_error: "Please select a meal type",
  }),
  rating: z.number().min(1, "Please select a rating").max(5),
  // If comment is provided, require at least one alphabetic character to avoid meaningless submissions
  comment: z
    .string()
    .max(500, "Comment is too long")
    .optional()
    .refine((val) => !val || /\p{L}/u.test(val), "Comment must contain alphabetic characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const mealTypes = [
  { value: "Breakfast", label: "Breakfast", icon: Coffee },
  { value: "Lunch", label: "Lunch", icon: UtensilsCrossed },
  { value: "Snacks", label: "Snacks", icon: Cookie },
  { value: "Dinner", label: "Dinner", icon: Moon },
] as const;

interface FeedbackFormProps {
  onSubmit: (data: FeedbackFormData) => Promise<void>;
  feedbackStatus: "idle" | "loading" | "succeeded" | "failed";
  feedbackError: string | null;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onClose?: () => void;
}

export function FeedbackForm({ 
  onSubmit, 
  feedbackStatus, 
  feedbackError,
  selectedDate,
  onDateChange,
  onClose,
}: FeedbackFormProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  // React Hook Form
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      date: selectedDate,
      mealType: "Breakfast",
      rating: 0,
      comment: "",
    },
  });

  const rating = watch("rating");

  // Sync form date with parent's selectedDate when it changes
  useEffect(() => {
    setValue("date", selectedDate);
  }, [selectedDate, setValue]);

  useEffect(() => {
    if (feedbackStatus === "succeeded") {
      // Reset form after successful submission
      reset({
        date: new Date(),
        mealType: "Breakfast",
        rating: 0,
        comment: "",
      });
    }
  }, [feedbackStatus, reset]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Disable future dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date > today;
  };

  return (
    <div className="flex w-full justify-end">
      <Card className="shadow border border-primary/10 rounded-lg max-w-md text-sm ml-auto">
      <CardHeader className="border-b bg-primary/5 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="size-3 text-primary" />
            <CardTitle className="text-base">Feedback</CardTitle>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
        <CardDescription className="text-xs mt-0.5">
          Share your thoughts about the meal quality
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 px-4 pb-4">
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-1">
            <Label htmlFor="date" className="text-xs">Date</Label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-9 px-2 py-1 text-xs"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <CalendarIcon className="mr-2 size-3" />
                    {formatDate(field.value)}
                  </Button>
                  {showCalendar && (
                    <div className="absolute z-10 mt-2 bg-background border rounded-lg shadow-lg">
                      <Calendar
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);
                            onDateChange(date); // Update parent state
                            setShowCalendar(false);
                          }
                        }}
                        disabled={isDateDisabled}
                      />
                    </div>
                  )}
                </div>
              )}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Select the date for which you're giving feedback
            </p>
          </div>

          {/* Meal Type Selection */}
          <div className="space-y-1">
            <Label htmlFor="mealType" className="text-xs">Meal Type</Label>
            <Controller
              control={control}
              name="mealType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map(({ value, label, icon: Icon }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-1.5">
                          <Icon className="size-3" />
                          <span className="text-xs">{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.mealType && (
              <p className="text-sm text-destructive">{errors.mealType.message}</p>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-1">
            <Label className="text-xs">Rating</Label>
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/50 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all hover:scale-105 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 rounded p-0.5"
                    >
                      <Star
                        className={cn(
                          "size-4 transition-all",
                          (hoveredRating >= star || field.value >= star)
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-md"
                            : "text-muted-foreground/40 hover:text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
            {rating > 0 && (
              <p className="text-xs text-center font-medium text-primary">
                You rated: {rating} star{rating !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <Label htmlFor="comment" className="text-xs">
              Comment <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Controller
              control={control}
              name="comment"
              render={({ field }) => {
                const charCount = field.value?.length || 0;
                const maxChars = 500;
                const percentage = (charCount / maxChars) * 100;
                const counterColor = percentage >= 90 ? 'text-destructive' 
                  : percentage >= 75 ? 'text-yellow-600 dark:text-yellow-500'
                  : 'text-muted-foreground';
                
                return (
                  <div className="relative">
                    <Textarea
                      id="comment"
                      placeholder="Share your thoughts about the meal..."
                      {...field}
                      rows={2}
                      className="resize-none text-xs min-h-10 pr-16"
                      maxLength={maxChars}
                    />
                    <div className={cn(
                      "absolute bottom-1.5 right-2 text-xs font-medium",
                      counterColor
                    )}>
                      {charCount}/{maxChars}
                    </div>
                  </div>
                );
              }}
            />
            {errors.comment && (
              <p className="text-xs text-destructive">{errors.comment.message}</p>
            )}
          </div>

          {/* Error Message */}
          {feedbackError && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2 text-xs">
              <AlertCircle className="size-3 shrink-0" />
              <span className="font-medium">{feedbackError}</span>
            </div>
          )}

          {/* Success Message */}
          {feedbackStatus === "succeeded" && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 animate-in fade-in slide-in-from-top-2 text-xs">
              <CheckCircle className="size-3 shrink-0" />
              <span className="font-medium">Feedback submitted successfully!</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full shadow-sm hover:shadow-md transition-all h-9 text-xs"
            disabled={feedbackStatus === "loading"}
          >
            {feedbackStatus === "loading" ? (
              <>
                <Loader2 className="mr-2 size-3 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </form>
      </CardContent>
      </Card>
    </div>
  );
}
