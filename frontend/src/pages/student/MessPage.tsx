import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  fetchMenu,
  submitFeedback,
  selectMessState,
  clearFeedbackStatus,
} from "@/features/mess/messSlice";
import { Link } from "react-router-dom";
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
  UtensilsCrossed,
  Coffee,
  Cookie,
  Moon,
  CheckCircle,
  AlertCircle,
  Loader2,
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
  comment: z.string().max(500, "Comment is too long").optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const mealTypes = [
  { value: "Breakfast", label: "Breakfast", icon: Coffee },
  { value: "Lunch", label: "Lunch", icon: UtensilsCrossed },
  { value: "Snacks", label: "Snacks", icon: Cookie },
  { value: "Dinner", label: "Dinner", icon: Moon },
] as const;

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function MessPage() {
  const dispatch = useAppDispatch();
  const { menu, menuStatus, feedbackStatus, feedbackError } =
    useAppSelector(selectMessState);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [showCalendar, setShowCalendar] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  // React Hook Form
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      date: new Date(),
      mealType: "Breakfast",
      rating: 0,
      comment: "",
    },
  });

  const selectedDate = watch("date");
  const rating = watch("rating");

  useEffect(() => {
    if (menuStatus === "idle" && isAuthenticated) {
      dispatch(fetchMenu());
    }
  }, [menuStatus, dispatch, isAuthenticated]);

  useEffect(() => {
    if (feedbackStatus === "succeeded") {
      // Reset form after successful submission
      reset({
        date: new Date(),
        mealType: "Breakfast",
        rating: 0,
        comment: "",
      });
      
      // Clear status after 3 seconds
      const timer = setTimeout(() => {
        dispatch(clearFeedbackStatus());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [feedbackStatus, dispatch, reset]);

  const onSubmit = (data: FeedbackFormData) => {
    dispatch(
      submitFeedback({
        date: data.date.toISOString(),
        mealType: data.mealType,
        rating: data.rating,
        comment: data.comment?.trim() || "",
      })
    );
  };

  // Get selected date's menu for display and feedback
  const selectedDay = dayNames[selectedDate.getDay()];
  const selectedDateMenu = menu?.[selectedDay];

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
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-5 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border bg-card text-xs font-medium shadow-sm">
            <UtensilsCrossed className="size-3.5" />
            <span>Mess Services</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Mess Menu & Feedback
          </h1>
          <p className="text-muted-foreground">
            View the weekly menu and share your dining experience with us
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
        {/* Menu Section */}
        <div className="space-y-6">
          <Card className="shadow-lg border-border/50 overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <UtensilsCrossed className="size-4 text-primary" />
                </div>
                {selectedDate.toDateString() === new Date().toDateString()
                  ? "Today's Menu"
                  : "Menu for Selected Date"}
              </CardTitle>
              <CardDescription>{formatDate(selectedDate)}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!isAuthenticated ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="size-12 mx-auto text-muted-foreground/50" />
                  <div className="space-y-2">
                    <p className="text-base font-medium text-foreground">
                      Authentication Required
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please login to view the mess menu
                    </p>
                  </div>
                  <Link to="/login">
                    <Button className="mt-2">
                      Login to View Menu
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
              {menuStatus === "loading" && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {menuStatus === "failed" && (
                <div className="flex items-center gap-2 text-destructive py-4">
                  <AlertCircle className="size-5" />
                  <span>Failed to load menu</span>
                </div>
              )}

              {menuStatus === "succeeded" && selectedDateMenu && (
                <div className="space-y-3">
                  {mealTypes.map(({ value, label, icon: Icon }) => (
                    <div
                      key={value}
                      className="group p-4 rounded-xl border-2 border-border/50 bg-linear-to-br from-card to-muted/30 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                          <Icon className="size-4 text-primary" />
                        </div>
                        <h3 className="font-semibold">{label}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedDateMenu[value]?.map((item: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 text-sm font-medium bg-background border border-border/60 rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-colors"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </>
              )}
            </CardContent>
          </Card>

          {/* Weekly Menu Overview */}
          <Card className="shadow-lg border-border/50">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle>Weekly Menu</CardTitle>
              <CardDescription>Full week meal schedule</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {!isAuthenticated ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="size-12 mx-auto text-muted-foreground/50" />
                  <div className="space-y-2">
                    <p className="text-base font-medium text-foreground">
                      Authentication Required
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please login to view the weekly menu
                    </p>
                  </div>
                  <Link to="/login">
                    <Button className="mt-2">
                      Login to View Weekly Menu
                    </Button>
                  </Link>
                </div>
              ) : (
              <>
              {menuStatus === "succeeded" && menu && (
                <div className="space-y-2.5">
                  {dayNames.map((day) => (
                    <details
                      key={day}
                      className="group rounded-xl border-2 border-border/50 bg-card overflow-hidden hover:border-primary/20 transition-colors"
                    >
                      <summary className="cursor-pointer px-4 py-3 font-semibold hover:bg-muted/50 transition-colors list-none flex items-center justify-between">
                        <span>{day}</span>
                        <ChevronRight className="size-4 transition-transform group-open:rotate-90 text-muted-foreground" />
                      </summary>
                      <div className="px-4 pb-3 pt-2 space-y-2 border-t bg-muted/20">
                        {mealTypes.map(({ value, label }) => (
                          <div key={value} className="text-sm flex flex-col gap-0.5">
                            <span className="font-medium text-foreground">
                              {label}
                            </span>
                            <span className="text-muted-foreground pl-2">{menu[day]?.[value]?.join(", ")}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              )}
              </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feedback Section */}
        <div className="sticky top-17 self-start">
          <Card className="shadow-xl border-2 border-primary/10">
            <CardHeader className="border-b bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Star className="size-4 text-primary" />
                Submit Feedback
              </CardTitle>
              <CardDescription>
                Share your thoughts about the meal quality
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              {!isAuthenticated ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="size-12 mx-auto text-muted-foreground/50" />
                  <div className="space-y-2">
                    <p className="text-base font-medium text-foreground">
                      Authentication Required
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please register or login to submit feedback about the meals
                    </p>
                  </div>
                  <Link to="/login">
                    <Button className="mt-2">
                      Login to Submit Feedback
                    </Button>
                  </Link>
                </div>
              ) : (
              <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <div className="relative">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          onClick={() => setShowCalendar(!showCalendar)}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {formatDate(field.value)}
                        </Button>
                        {showCalendar && (
                          <div className="absolute z-10 mt-2 bg-background border rounded-lg shadow-lg">
                            <Calendar
                              selected={field.value}
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(date);
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
                  <p className="text-sm text-muted-foreground">
                    Select the date for which you're giving feedback
                  </p>
                </div>

                {/* Meal Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="mealType">Meal Type</Label>
                  <Controller
                    control={control}
                    name="mealType"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map(({ value, label, icon: Icon }) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <Icon className="size-4" />
                                <span>{label}</span>
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
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Controller
                    control={control}
                    name="rating"
                    render={({ field }) => (
                      <div className="flex gap-2 p-2 rounded-xl bg-muted/30 border border-border/50 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => field.onChange(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-0.5"
                          >
                            <Star
                              className={cn(
                                "size-6 transition-all",
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
                    <p className="text-sm text-center font-medium text-primary">
                      You rated: {rating} star{rating !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Label htmlFor="comment">
                    Comment <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Controller
                    control={control}
                    name="comment"
                    render={({ field }) => (
                      <Textarea
                        id="comment"
                        placeholder="Share your thoughts about the meal..."
                        {...field}
                        rows={4}
                        className="resize-none"
                      />
                    )}
                  />
                  {errors.comment && (
                    <p className="text-sm text-destructive">{errors.comment.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {feedbackError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border-2 border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span className="text-sm font-medium">{feedbackError}</span>
                  </div>
                )}

                {/* Success Message */}
                {feedbackStatus === "succeeded" && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border-2 border-green-500/20 text-green-700 dark:text-green-400 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle className="size-4 shrink-0" />
                    <span className="text-sm font-medium">Feedback submitted successfully!</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full shadow-lg hover:shadow-xl transition-all"
                  disabled={feedbackStatus === "loading"}
                >
                  {feedbackStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}

// ChevronRight component for the details dropdown
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default MessPage;
