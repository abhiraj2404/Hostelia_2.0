import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  fetchTransitEntries,
  createTransitEntry,
  selectTransitState,
  clearCreateStatus,
} from "@/features/transit/transitSlice";
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
  LogIn,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

// Helper functions for time selection
const generateHours = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return { value: hour, label: hour };
  });
};

const generateMinutes = () => {
  return Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, "0");
    return { value: minute, label: minute };
  });
};

// Form validation schema with date-time validation
const entryExitSchema = z
  .object({
    transitStatus: z.enum(["ENTRY", "EXIT"], {
      required_error: "Please select entry or exit",
    }),
    date: z.date({
      required_error: "Date is required",
    }),
    hour: z.string().min(1, "Hour is required"),
    minute: z.string().min(1, "Minute is required"),
    purpose: z
      .string()
      .min(3, "Purpose must be at least 3 characters")
      .max(500, "Purpose cannot exceed 500 characters"),
  })
  .refine(
    (data) => {
      // Validate that selected date-time is not in the past
      const now = new Date();
      const selectedDateTime = new Date(data.date);
      const hours = parseInt(data.hour, 10);
      const minutes = parseInt(data.minute, 10);
      selectedDateTime.setHours(hours, minutes, 0, 0);

      // Entry must be at current time or later (not in the past)
      return selectedDateTime >= now;
    },
    {
      message: "Cannot create entry for past date and time. Please select current or future time.",
      path: ["minute"],
    }
  );

type EntryExitFormData = z.infer<typeof entryExitSchema>;

const transitTypes = [
  { value: "EXIT", label: "Exit", icon: LogOut, color: "text-orange-600" },
  { value: "ENTRY", label: "Entry", icon: LogIn, color: "text-green-600" },
] as const;

function EntryExitPage() {
  const dispatch = useAppDispatch();
  const { entries, listStatus, createStatus, createError, listError } =
    useAppSelector(selectTransitState);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [showCalendar, setShowCalendar] = useState(false);

  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, "0");
  const currentMinute = now.getMinutes().toString().padStart(2, "0");

  // React Hook Form
  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EntryExitFormData>({
    resolver: zodResolver(entryExitSchema),
    defaultValues: {
      transitStatus: "EXIT",
      date: new Date(),
      hour: currentHour,
      minute: currentMinute,
      purpose: "",
    },
  });

  const transitStatus = watch("transitStatus");
  const selectedDate = watch("date");
  const selectedHour = watch("hour");
  const selectedMinute = watch("minute");

  // Watch for date changes and update time if needed
  useEffect(() => {
    if (selectedDate) {
      const selected = new Date(selectedDate);
      const today = new Date();
      
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      // If today is selected, ensure time is not in the past
      if (selected.getTime() === today.getTime()) {
        const now = new Date();
        const currentH = now.getHours();
        const currentM = now.getMinutes();
        const selectedH = parseInt(selectedHour || "0", 10);
        const selectedM = parseInt(selectedMinute || "0", 10);
        
        // If selected time is in the past, update to current time
        if (selectedH < currentH || (selectedH === currentH && selectedM < currentM)) {
          setValue("hour", currentH.toString().padStart(2, "0"));
          setValue("minute", currentM.toString().padStart(2, "0"));
        }
      }
    }
  }, [selectedDate, selectedHour, selectedMinute, setValue]);

  // Helper to get minimum time for time input based on selected date
  const getMinHour = () => {
    const selected = new Date(selectedDate);
    const today = new Date();
    
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // If selected date is today, min hour is current hour
    if (selected.getTime() === today.getTime()) {
      return new Date().getHours();
    }
    
    // For future dates, no minimum
    return 0;
  };

  const getMinMinute = () => {
    const selected = new Date(selectedDate);
    const today = new Date();
    
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const now = new Date();
    const currentH = now.getHours();
    const selectedH = parseInt(selectedHour || "0", 10);
    
    // If today and same hour as current, min minute is current minute
    if (selected.getTime() === today.getTime() && selectedH === currentH) {
      return now.getMinutes();
    }
    
    return 0;
  };

  const isHourDisabled = (hour: number) => {
    const minHour = getMinHour();
    return hour < minHour;
  };

  const isMinuteDisabled = (minute: number) => {
    const minMinute = getMinMinute();
    return minute < minMinute;
  };

  useEffect(() => {
    if (listStatus === "idle" && isAuthenticated) {
      dispatch(fetchTransitEntries());
    }
  }, [listStatus, dispatch, isAuthenticated]);

  useEffect(() => {
    if (createStatus === "succeeded") {
      // Reset form after successful submission
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, "0");
      const currentM = now.getMinutes().toString().padStart(2, "0");
      reset({
        transitStatus: "EXIT",
        date: now,
        hour: currentH,
        minute: currentM,
        purpose: "",
      });

      // Refresh the list
      dispatch(fetchTransitEntries());

      // Clear status after 3 seconds
      const timer = setTimeout(() => {
        dispatch(clearCreateStatus());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [createStatus, dispatch, reset]);

  const onSubmit = (data: EntryExitFormData) => {
    // Combine hour and minute into time format HH:MM:SS for backend
    const timeWithSeconds = `${data.hour}:${data.minute}:00`;
    
    dispatch(
      createTransitEntry({
        transitStatus: data.transitStatus,
        date: data.date,
        time: timeWithSeconds,
        purpose: data.purpose.trim(),
      })
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date) + ` (${timeStr.slice(0, 5)})`;
  };

  // Disable past dates - only allow today and future dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Get user's own entries - backend returns userId field
  const userEntries = entries.filter((entry) => {
    const entryUserId = entry.studentId?._id;
    const currentUserId = currentUser?.userId || currentUser?._id || currentUser?.id;
    return entryUserId && currentUserId && entryUserId.toString() === currentUserId.toString();
  });

  // Debug log for troubleshooting (can be removed in production)
  useEffect(() => {
    if (isAuthenticated && entries.length > 0) {
      console.log("Total entries:", entries.length);
      console.log("User entries:", userEntries.length);
      console.log("Current user ID:", currentUser?.userId || currentUser?._id || currentUser?.id);
      console.log("Sample entry user ID:", entries[0]?.studentId?._id);
    }
  }, [entries, userEntries.length, currentUser, isAuthenticated]);

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-5 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border bg-card text-xs font-medium shadow-sm">
            <Clock className="size-3.5" />
            <span>Entry/Exit Register</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Entry & Exit Register
          </h1>
          <p className="text-muted-foreground">
            Record your hostel entry and exit timings for security purposes
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
              <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Clock className="size-4 text-gray-700 dark:text-gray-300" />
                  </div>
                  New Entry/Exit Record
                </CardTitle>
                <CardDescription>
                  Fill in the details of your entry or exit
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!isAuthenticated ? (
                  <div className="text-center py-8 space-y-4">
                    <AlertCircle className="size-12 mx-auto text-gray-400 dark:text-gray-600" />
                    <div className="space-y-2">
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        Authentication Required
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please log in to create entry/exit records
                      </p>
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleFormSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Transit Type Selection */}
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Controller
                        name="transitStatus"
                        control={control}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger
                              className={cn(
                                "w-full",
                                errors.transitStatus && "border-destructive"
                              )}
                            >
                              <SelectValue placeholder="Select entry or exit" />
                            </SelectTrigger>
                            <SelectContent>
                              {transitTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Icon
                                        className={cn("size-4", type.color)}
                                      />
                                      <span>{type.label}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.transitStatus && (
                        <p className="text-sm text-destructive">
                          {errors.transitStatus.message}
                        </p>
                      )}
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Controller
                        name="date"
                        control={control}
                        render={({ field }) => (
                          <div className="relative">
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                                errors.date && "border-destructive"
                              )}
                              onClick={() => setShowCalendar(!showCalendar)}
                            >
                              <CalendarIcon className="mr-2 size-4" />
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                            {showCalendar && (
                              <div className="absolute z-50 mt-2 bg-popover border rounded-lg shadow-lg">
                                <Calendar
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setShowCalendar(false);
                                  }}
                                  disabled={isDateDisabled}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      />
                      {errors.date && (
                        <p className="text-sm text-destructive">
                          {errors.date.message}
                        </p>
                      )}
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Hour Selection */}
                        <div className="space-y-1.5">
                          <Label htmlFor="hour" className="text-xs text-muted-foreground">
                            Hour
                          </Label>
                          <Controller
                            name="hour"
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger
                                  id="hour"
                                  className={cn(
                                    "w-full",
                                    errors.hour && "border-destructive"
                                  )}
                                >
                                  <Clock className="mr-2 size-4" />
                                  <SelectValue placeholder="HH" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                  {generateHours().map((h) => {
                                    const hourNum = parseInt(h.value, 10);
                                    const disabled = isHourDisabled(hourNum);
                                    return (
                                      <SelectItem
                                        key={h.value}
                                        value={h.value}
                                        disabled={disabled}
                                      >
                                        {h.label}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        {/* Minute Selection */}
                        <div className="space-y-1.5">
                          <Label htmlFor="minute" className="text-xs text-muted-foreground">
                            Minute
                          </Label>
                          <Controller
                            name="minute"
                            control={control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger
                                  id="minute"
                                  className={cn(
                                    "w-full",
                                    errors.minute && "border-destructive"
                                  )}
                                >
                                  <Clock className="mr-2 size-4" />
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                  {generateMinutes().map((m) => {
                                    const minuteNum = parseInt(m.value, 10);
                                    const disabled = isMinuteDisabled(minuteNum);
                                    return (
                                      <SelectItem
                                        key={m.value}
                                        value={m.value}
                                        disabled={disabled}
                                      >
                                        {m.label}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                      {(errors.hour || errors.minute) && (
                        <p className="text-sm text-destructive">
                          {errors.hour?.message || errors.minute?.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Note: You cannot select a past date or time. Only current or future time allowed.
                      </p>
                    </div>

                    {/* Purpose */}
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose</Label>
                      <Controller
                        name="purpose"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            id="purpose"
                            placeholder="Briefly describe the reason for entry/exit (e.g., Going home for weekend, Returning from library, etc.)"
                            rows={4}
                            className={cn(
                              errors.purpose && "border-destructive"
                            )}
                            {...field}
                          />
                        )}
                      />
                      {errors.purpose && (
                        <p className="text-sm text-destructive">
                          {errors.purpose.message}
                        </p>
                      )}
                    </div>

                    {/* Error Display */}
                    {createError && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="size-4 text-destructive shrink-0" />
                        <p className="text-sm text-destructive">
                          {createError}
                        </p>
                      </div>
                    )}

                    {/* Success Display */}
                    {createStatus === "succeeded" && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <CheckCircle className="size-4 text-green-600 shrink-0" />
                        <p className="text-sm text-green-600">
                          Record created successfully!
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createStatus === "loading"}
                    >
                      {createStatus === "loading" ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Creating Record...
                        </>
                      ) : (
                        <>
                          {transitStatus === "EXIT" ? (
                            <LogOut className="mr-2 size-4" />
                          ) : (
                            <LogIn className="mr-2 size-4" />
                          )}
                          Submit Record
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* History Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
              <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Clock className="size-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      Your Recent Records
                    </CardTitle>
                    <CardDescription>
                      View your entry and exit history
                    </CardDescription>
                  </div>
                  {isAuthenticated && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => dispatch(fetchTransitEntries())}
                      disabled={listStatus === "loading"}
                    >
                      {listStatus === "loading" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {!isAuthenticated ? (
                  <div className="text-center py-8 space-y-4">
                    <AlertCircle className="size-12 mx-auto text-gray-400 dark:text-gray-600" />
                    <div className="space-y-2">
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        Authentication Required
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please log in to view your records
                      </p>
                    </div>
                  </div>
                ) : listStatus === "loading" ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="size-8 animate-spin text-gray-500 dark:text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Loading records...
                    </p>
                  </div>
                ) : listError ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="size-4 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{listError}</p>
                  </div>
                ) : userEntries.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <Clock className="size-12 mx-auto text-gray-400 dark:text-gray-600" />
                    <div className="space-y-2">
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                        No records yet
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Create your first entry/exit record to get started
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {userEntries.map((entry) => {
                      const isEntry = entry.transitStatus === "ENTRY";
                      const Icon = isEntry ? ArrowLeft : ArrowRight;
                      return (
                        <div
                          key={entry._id}
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className={cn(
                                  "p-2 rounded-lg",
                                  isEntry
                                    ? "bg-green-100 dark:bg-green-950"
                                    : "bg-orange-100 dark:bg-orange-950"
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "size-4",
                                    isEntry
                                      ? "text-green-600"
                                      : "text-orange-600"
                                  )}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={cn(
                                      "text-sm font-semibold",
                                      isEntry
                                        ? "text-green-700 dark:text-green-400"
                                        : "text-orange-700 dark:text-orange-400"
                                    )}
                                  >
                                    {entry.transitStatus}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                                  {entry.purpose}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {formatDateTime(entry.date, entry.time)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="size-5 text-gray-700 dark:text-gray-300 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Important Information
                    </p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li>You cannot create records for past dates or times</li>
                      <li>Only current or future time entries are allowed</li>
                      <li>All entries are recorded for security purposes</li>
                      <li>Please ensure accurate information</li>
                      <li>Records are visible to hostel wardens</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EntryExitPage;
