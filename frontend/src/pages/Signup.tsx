import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authFailure, authStart, signupSuccess } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Building2, Check, Eye, EyeOff, Loader2, Plus, Trash2, Upload, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

// ─── Shared Types ────────────────────────────────────────────────
interface College {
  _id: string;
  name: string;
  emailDomain: string;
}

interface HostelOption {
  _id: string;
  name: string;
}

type ApiErrorResponse = { message?: string };

const getApiErrorMessage = (error: unknown) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || error.message || "Network error. Please try again.";
  }
  return error instanceof Error ? error.message : "Network error. Please try again.";
};

// ─── User Signup Schema ──────────────────────────────────────────
const userSignupSchema = z
  .object({
    collegeId: z.string().min(1, "Please select your campus"),
    name: z
      .string()
      .min(1, "Name is required")
      .regex(/^[A-Za-z\s]+$/, "Name must only contain letters and spaces")
      .refine((name) => name.trim() !== "", "Name cannot be blank"),
    rollNo: z
      .string()
      .regex(/^[0-9]{3}$/, "Roll number must be exactly 3 digits")
      .refine((val) => parseInt(val) >= 1, "Enter a valid Roll Number"),
    email: z.string().email("Invalid email format"),
    hostelId: z.string().min(1, "Please select a hostel"),
    roomNo: z
      .string()
      .min(1, "Room number is required")
      .refine((val) => {
        const num = parseInt(val);
        return !isNaN(num) && num >= 100 && num < 1000;
      }, "Enter a valid room-number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type UserSignupData = z.infer<typeof userSignupSchema>;

// ─── OTP Schema ──────────────────────────────────────────────────
const otpSchema = z.object({
  otp: z
    .string()
    .regex(/^[0-9]+$/, "Only digits [0-9] are allowed")
    .length(6, "OTP must be exactly 6 digits")
});
type OtpFormData = z.infer<typeof otpSchema>;

// ─── Campus Registration Schema ─────────────────────────────────
const campusSchema = z
  .object({
    collegeName: z.string().min(1, "College name is required").trim(),
    emailDomain: z
      .string()
      .min(1, "Email domain is required")
      .trim()
      .regex(/^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Must be a valid domain (e.g. @college.edu)"),
    adminEmail: z.string().email("Invalid email format").trim(),
    address: z.string().optional(),
    hostels: z
      .array(z.object({ name: z.string().min(1, "Hostel name cannot be empty").trim() }))
      .min(1, "At least one hostel is required"),
    messes: z
      .array(z.object({ name: z.string().min(1, "Mess name cannot be empty").trim() }))
      .min(1, "At least one mess is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })
  .refine((data) => data.adminEmail.endsWith(data.emailDomain), {
    message: "Admin email must belong to the provided domain",
    path: ["adminEmail"]
  });

type CampusFormData = z.infer<typeof campusSchema>;

// ─── Tab Button ──────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  icon: Icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-md transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function Signup() {
  const [activeTab, setActiveTab] = useState<"user" | "campus">("user");

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-md">
        <Card className="w-full">
          <CardHeader className="space-y-4 pb-4">
            <div className="text-center">
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription className="mt-1">Join Hostelia or register your campus</CardDescription>
            </div>
            {/* Tab Switcher */}
            <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
              <TabButton active={activeTab === "user"} onClick={() => setActiveTab("user")} icon={UserPlus} label="User" />
              <TabButton active={activeTab === "campus"} onClick={() => setActiveTab("campus")} icon={Building2} label="Campus" />
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === "user" ? <UserSignupForm /> : <CampusRegistrationForm />}

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// USER SIGNUP FORM
// ═══════════════════════════════════════════════════════════════════
function UserSignupForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading: reduxLoading } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [phase, setPhase] = useState<"form" | "otp" | "success">("form");
  const [formSnapshot, setFormSnapshot] = useState<UserSignupData | null>(null);

  // Dynamic data
  const [colleges, setColleges] = useState<College[]>([]);
  const [hostels, setHostels] = useState<HostelOption[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingHostels, setLoadingHostels] = useState(false);

  const form = useForm<UserSignupData>({
    resolver: zodResolver(userSignupSchema),
    defaultValues: { collegeId: "", name: "", rollNo: "", email: "", hostelId: "", roomNo: "", password: "", confirmPassword: "" }
  });

  const otpForm = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });

  const selectedCollegeId = form.watch("collegeId");

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const res = await apiClient.get("/college/list");
        if (res.data.success) setColleges(res.data.colleges);
      } catch {
        toast.error("Failed to load campus list");
      } finally {
        setLoadingColleges(false);
      }
    };
    fetchColleges();
  }, []);

  // Fetch hostels when college changes
  useEffect(() => {
    if (!selectedCollegeId) { setHostels([]); return; }
    const fetchHostels = async () => {
      setLoadingHostels(true);
      form.setValue("hostelId", "");
      try {
        const res = await apiClient.get(`/college/${selectedCollegeId}/hostels`);
        if (res.data.success) setHostels(res.data.hostels);
      } catch {
        toast.error("Failed to load hostels");
        setHostels([]);
      } finally {
        setLoadingHostels(false);
      }
    };
    fetchHostels();
  }, [selectedCollegeId, form]);

  // Countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const t = setTimeout(() => setResendCountdown((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCountdown]);

  // Submit form → send OTP
  const onFormSubmit = async (data: UserSignupData) => {
    setIsLoading(true);
    setApiError("");
    try {
      const res = await apiClient.post("/auth/generate-otp", {
        email: data.email,
        collegeId: data.collegeId,
        name: data.name,
        rollNo: data.rollNo
      });
      if (res.data.success) {
        setFormSnapshot(data);
        setResendCountdown(60);
        otpForm.reset({ otp: "" });
        setPhase("otp");
        setSuccessMessage("OTP sent to your email");
        toast.success("OTP sent to your email");
      } else throw new Error(res.data.message || "Failed to send OTP");
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error);
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const onOtpSubmit = async (data: OtpFormData) => {
    if (!formSnapshot) return;
    dispatch(authStart());
    setIsLoading(true);
    setApiError("");
    try {
      const res = await apiClient.post("/auth/verify-otp", {
        email: formSnapshot.email,
        collegeId: formSnapshot.collegeId,
        otp: data.otp,
        userData: {
          name: formSnapshot.name,
          rollNo: formSnapshot.rollNo,
          hostelId: formSnapshot.hostelId,
          roomNo: formSnapshot.roomNo,
          password: formSnapshot.password
        }
      });
      if (res.data.success && res.data.verified) {
        dispatch(signupSuccess({
          id: res.data.user.userId,
          email: res.data.user.email,
          name: res.data.user.name,
          role: res.data.user.role
        }));
        setPhase("success");
        toast.success("Account created successfully!");
      } else throw new Error(res.data.message || "OTP verification failed");
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error);
      setApiError(msg);
      dispatch(authFailure(msg));
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!formSnapshot || resendCountdown > 0) return;
    setIsLoading(true);
    setApiError("");
    try {
      const res = await apiClient.post("/auth/generate-otp", {
        email: formSnapshot.email,
        collegeId: formSnapshot.collegeId,
        name: formSnapshot.name,
        rollNo: formSnapshot.rollNo
      });
      if (res.data.success) {
        setResendCountdown(60);
        setSuccessMessage("OTP resent to your email");
        toast.success("OTP resent");
      } else throw new Error(res.data.message);
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error);
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const collegeName = colleges.find((c) => c._id === formSnapshot?.collegeId)?.name;
  const hostelName = hostels.find((h) => h._id === formSnapshot?.hostelId)?.name;
  const isFormLoading = isLoading || reduxLoading;

  // ── Phase: Form ──
  if (phase === "form") {
    return (
      <>
        {loadingColleges ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading campuses...
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-muted-foreground text-sm">No campuses registered yet.</p>
            <p className="text-xs text-muted-foreground">Register your campus first using the Campus tab above.</p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            {apiError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{apiError}</div>}

            {/* Campus */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Campus</Label>
              <Controller
                control={form.control}
                name="collegeId"
                render={({ field }) => (
                  <Select disabled={isFormLoading} value={field.value ?? undefined} onValueChange={(v) => { field.onChange(v); field.onBlur(); }}>
                    <SelectTrigger><SelectValue placeholder="Select your campus" /></SelectTrigger>
                    <SelectContent>
                      {colleges.map((c) => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.collegeId && <p className="text-xs text-red-600">{form.formState.errors.collegeId.message}</p>}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Full Name</Label>
              <Input placeholder="John Doe" disabled={isFormLoading} {...form.register("name")} />
              {form.formState.errors.name && <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>}
            </div>

            {/* Roll Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Roll Number</Label>
              <Input placeholder="e.g., 001" disabled={isFormLoading} maxLength={3} {...form.register("rollNo")} />
              {form.formState.errors.rollNo && <p className="text-xs text-red-600">{form.formState.errors.rollNo.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email Address</Label>
              <Input type="email" placeholder="your.name@campus.edu" disabled={isFormLoading} {...form.register("email")} />
              {form.formState.errors.email && <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>}
            </div>

            {/* Hostel + Room */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Hostel</Label>
                {loadingHostels ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
                ) : (
                  <Controller
                    control={form.control}
                    name="hostelId"
                    render={({ field }) => (
                      <Select
                        disabled={isFormLoading || !selectedCollegeId || hostels.length === 0}
                        value={field.value ?? undefined}
                        onValueChange={(v) => { field.onChange(v); field.onBlur(); }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={!selectedCollegeId ? "Select campus first" : "Select hostel"} />
                        </SelectTrigger>
                        <SelectContent>
                          {hostels.map((h) => (
                            <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {form.formState.errors.hostelId && <p className="text-xs text-red-600">{form.formState.errors.hostelId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Room Number</Label>
                <Controller
                  control={form.control}
                  name="roomNo"
                  render={({ field }) => (
                    <Input
                      placeholder="e.g., 101"
                      disabled={isFormLoading}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ""))}
                      onBlur={field.onBlur}
                      maxLength={3}
                    />
                  )}
                />
                {form.formState.errors.roomNo && <p className="text-xs text-red-600">{form.formState.errors.roomNo.message}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  disabled={isFormLoading}
                  {...form.register("password")}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.password && <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  disabled={isFormLoading}
                  {...form.register("confirmPassword")}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && <p className="text-xs text-red-600">{form.formState.errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" disabled={isFormLoading} className="w-full">
              {isFormLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending OTP...</> : "Sign Up"}
            </Button>
          </form>
        )}
      </>
    );
  }

  // ── Phase: OTP ──
  if (phase === "otp") {
    return (
      <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
        {apiError && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{apiError}</div>}
        {successMessage && <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">{successMessage}</div>}

        <p className="text-sm text-gray-600">
          We&apos;ve sent a 6-digit OTP to <span className="font-semibold">{formSnapshot?.email}</span>
        </p>

        <div className="space-y-2">
          <Label className="text-sm font-medium">OTP Code</Label>
          <Input
            type="text"
            placeholder="000000"
            disabled={isFormLoading}
            maxLength={6}
            autoComplete="one-time-code"
            inputMode="numeric"
            {...otpForm.register("otp")}
            onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ""); }}
            className="text-center text-2xl tracking-widest"
          />
          {otpForm.formState.errors.otp && <p className="text-xs text-red-600">{otpForm.formState.errors.otp.message}</p>}
        </div>

        <Button type="submit" disabled={isFormLoading} className="w-full">
          {isFormLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify OTP"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Didn&apos;t receive the OTP?</p>
          <Button type="button" variant="outline" disabled={resendCountdown > 0 || isFormLoading} onClick={handleResendOTP} className="w-full">
            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
          </Button>
        </div>
      </form>
    );
  }

  // ── Phase: Success ──
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center mb-2">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-6 h-6 text-green-600" />
        </div>
      </div>
      <h3 className="text-lg font-semibold">Account Created!</h3>
      {formSnapshot && (
        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm">
          <p><span className="font-medium">Campus:</span> {collegeName}</p>
          <p><span className="font-medium">Name:</span> {formSnapshot.name}</p>
          <p><span className="font-medium">Email:</span> {formSnapshot.email}</p>
          <p><span className="font-medium">Roll No:</span> {formSnapshot.rollNo}</p>
          <p><span className="font-medium">Hostel:</span> {hostelName}, Room {formSnapshot.roomNo}</p>
        </div>
      )}
      <Button onClick={() => navigate("/")} className="w-full">Go to Home</Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CAMPUS REGISTRATION FORM
// ═══════════════════════════════════════════════════════════════════
const CAMPUS_STEPS = ["College Info", "Infrastructure", "Admin Account", "Review"];

function CampusRegistrationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<CampusFormData>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      collegeName: "",
      emailDomain: "",
      adminEmail: "",
      address: "",
      hostels: [{ name: "" }],
      messes: [{ name: "" }],
      password: "",
      confirmPassword: ""
    },
    mode: "onTouched"
  });

  const hostelFields = useFieldArray({ control: form.control, name: "hostels" });
  const messFields = useFieldArray({ control: form.control, name: "messes" });

  const validateStep = async () => {
    let fields: (keyof CampusFormData)[] = [];
    switch (step) {
      case 0: fields = ["collegeName", "emailDomain", "adminEmail", "address"]; break;
      case 1: fields = ["hostels", "messes"]; break;
      case 2: fields = ["password", "confirmPassword"]; break;
    }
    return form.trigger(fields);
  };

  const handleNext = async () => {
    if (await validateStep()) { setApiError(""); setStep((p) => p + 1); }
  };

  const handleBack = () => { setApiError(""); setStep((p) => p - 1); };

  const handleSubmit = async () => {
    if (!(await form.trigger())) return;
    setIsLoading(true);
    setApiError("");
    const data = form.getValues();
    try {
      const formData = new FormData();
      formData.append("collegeName", data.collegeName);
      formData.append("emailDomain", data.emailDomain.toLowerCase());
      formData.append("adminEmail", data.adminEmail.toLowerCase());
      if (data.address) formData.append("address", data.address);
      data.hostels.forEach((h) => formData.append("hostels[]", h.name.trim()));
      data.messes.forEach((m) => formData.append("messes[]", m.name.trim()));
      formData.append("password", data.password);
      if (logoFile) formData.append("logo", logoFile);

      const res = await apiClient.post("/college/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setSuccess(true);
        toast.success("Campus registered successfully!");
      } else throw new Error(res.data.message || "Registration failed");
    } catch (error: unknown) {
      const msg = getApiErrorMessage(error);
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const values = form.getValues();

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold">Campus Registered!</h3>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">{values.collegeName}</span> has been registered. Login credentials were sent to{" "}
          <span className="font-mono text-xs">{values.adminEmail}</span>.
        </p>
        <Button onClick={() => navigate("/login")} className="w-full">Go to Login</Button>
      </div>
    );
  }

  return (
    <>
      {/* Step Indicator */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">
          Step {step + 1} of {CAMPUS_STEPS.length} — {CAMPUS_STEPS[step]}
        </p>
        <div className="flex gap-1">
          {CAMPUS_STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      {apiError && <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{apiError}</div>}

      {/* Step 0: College Info */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">College Name</Label>
            <Input placeholder="e.g., IIIT Sri City" disabled={isLoading} {...form.register("collegeName")} />
            {form.formState.errors.collegeName && <p className="text-xs text-red-600">{form.formState.errors.collegeName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email Domain</Label>
            <Input placeholder="e.g., @iiits.in" disabled={isLoading} {...form.register("emailDomain")} />
            <p className="text-xs text-muted-foreground">All users must use emails with this domain</p>
            {form.formState.errors.emailDomain && <p className="text-xs text-red-600">{form.formState.errors.emailDomain.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Admin Email</Label>
            <Input placeholder="admin@iiits.in" disabled={isLoading} {...form.register("adminEmail")} />
            <p className="text-xs text-muted-foreground">Must belong to the domain above</p>
            {form.formState.errors.adminEmail && <p className="text-xs text-red-600">{form.formState.errors.adminEmail.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Address <span className="text-muted-foreground">(optional)</span></Label>
            <Input placeholder="Campus address" disabled={isLoading} {...form.register("address")} />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">College Logo <span className="text-muted-foreground">(optional)</span></Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-lg object-cover border" />
                  <button
                    type="button"
                    onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-sm text-muted-foreground">
                  <Upload className="w-4 h-4" />
                  Upload logo
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error("Logo must be under 10MB");
                          return;
                        }
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG or JPEG, max 10MB</p>
          </div>
        </div>
      )}

      {/* Step 1: Infrastructure */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Hostels</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => hostelFields.append({ name: "" })} disabled={isLoading}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
            {hostelFields.fields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <Input placeholder={`Hostel ${i + 1} (e.g., BH-1)`} disabled={isLoading} {...form.register(`hostels.${i}.name`)} />
                {hostelFields.fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => hostelFields.remove(i)} className="shrink-0 text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {form.formState.errors.hostels && (
              <p className="text-xs text-red-600">
                {form.formState.errors.hostels.message || form.formState.errors.hostels.root?.message || "Please fill in all hostel names"}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Messes</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => messFields.append({ name: "" })} disabled={isLoading}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </div>
            {messFields.fields.map((field, i) => (
              <div key={field.id} className="flex gap-2">
                <Input placeholder={`Mess ${i + 1} (e.g., Main Mess)`} disabled={isLoading} {...form.register(`messes.${i}.name`)} />
                {messFields.fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => messFields.remove(i)} className="shrink-0 text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {form.formState.errors.messes && (
              <p className="text-xs text-red-600">
                {form.formState.errors.messes.message || form.formState.errors.messes.root?.message || "Please fill in all mess names"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Admin Account */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set the password for the admin account (<span className="font-medium">{values.adminEmail}</span>).
          </p>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="Minimum 6 characters" disabled={isLoading} {...form.register("password")} className="pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.password && <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" disabled={isLoading} {...form.register("confirmPassword")} className="pr-10" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && <p className="text-xs text-red-600">{form.formState.errors.confirmPassword.message}</p>}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
          <div>
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-1">College</p>
            <p className="font-semibold">{values.collegeName}</p>
            {values.address && <p className="text-muted-foreground">{values.address}</p>}
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-1">Domain & Admin</p>
            <p>Domain: <span className="font-mono">{values.emailDomain}</span></p>
            <p>Admin: <span className="font-mono">{values.adminEmail}</span></p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-1">Hostels ({values.hostels.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {values.hostels.map((h, i) => <span key={i} className="bg-background border rounded px-2 py-0.5 text-xs">{h.name}</span>)}
            </div>
          </div>
          <div>
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-1">Messes ({values.messes.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {values.messes.map((m, i) => <span key={i} className="bg-background border rounded px-2 py-0.5 text-xs">{m.name}</span>)}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading} className="flex-1">Back</Button>
        )}
        {step < 3 ? (
          <Button type="button" onClick={handleNext} disabled={isLoading} className="flex-1">Next</Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isLoading} className="flex-1">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registering...</> : "Register Campus"}
          </Button>
        )}
      </div>
    </>
  );
}
