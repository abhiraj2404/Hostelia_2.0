import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  authFailure,
  authStart,
  signupSuccess,
} from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

// Step 1 Validation Schema
const step1Schema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .regex(/^[A-Za-z\s]+$/, "Name must only contain letters and spaces")
      .refine(
        (name) => name.trim() !== "",
        "Name cannot be blank or only spaces"
      ),
    rollNo: z
      .string()
      .regex(/^[0-9]{3}$/, "Roll number must be exactly 3 digits"),
    email: z
      .string()
      .email("Invalid email format")
      .refine(
        (email) => email.endsWith("@iiits.in"),
        "Email must be a valid @iiits.in address"
      ),
    hostel: z.enum(["BH-1", "BH-2", "BH-3", "BH-4"], {
      errorMap: () => ({ message: "Invalid hostel selection" }),
    }),
    roomNo: z.string().min(1, "Room number is required"),
    year: z.enum(["UG-1", "UG-2", "UG-3", "UG-4"], {
      errorMap: () => ({ message: "Invalid year selection" }),
    }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Step1FormData = z.infer<typeof step1Schema>;

// Step 2 Validation Schema
const step2Schema = z.object({
  otp: z.string().regex(/^[0-9]{6}$/, "OTP must be exactly 6 digits"),
});

type Step2FormData = z.infer<typeof step2Schema>;

type ApiErrorResponse = {
  message?: string;
};

const getApiErrorMessage = (error: unknown) => {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      "Network error. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Network error. Please try again.";
};

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading: reduxLoading } = useAppSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [step1Data, setStep1Data] = useState<Step1FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Step 1 Form
  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: "",
      rollNo: "",
      email: "",
      roomNo: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Step 2 Form
  const step2Form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
  });

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle Step 1 Submission
  const onStep1Submit = async (data: Step1FormData) => {
    setIsLoading(true);
    setApiError("");

    try {
      // Send OTP to email
      const response = await apiClient.post("/auth/generate-otp", {
        email: data.email,
        name: data.name,
      });

      if (response.data.success) {
        setStep1Data(data);
        setResendCountdown(60);
        setCurrentStep(2);
        setSuccessMessage("OTP sent to your email");
        toast.success("OTP sent to your email");
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error);
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Step 2 Submission
  const onStep2Submit = async (data: Step2FormData) => {
    if (!step1Data) return;

    dispatch(authStart());
    setIsLoading(true);
    setApiError("");

    try {
      const response = await apiClient.post("/auth/verify-otp", {
        email: step1Data.email,
        otp: data.otp,
        userData: {
          name: step1Data.name,
          rollNo: step1Data.rollNo,
          hostel: step1Data.hostel,
          roomNo: step1Data.roomNo,
          year: step1Data.year,
          password: step1Data.password,
        },
      });

      if (response.data.success && response.data.verified) {
        const userData = {
          id: response.data.user.userId,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          // token: localStorage.getItem("token") || "",
        };

        dispatch(signupSuccess(userData));
        setSuccessMessage("Account created successfully!");
        setCurrentStep(3);
        toast.success("Account created successfully!");
      } else {
        throw new Error(response.data.message || "OTP verification failed");
      }
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error);
      setApiError(errorMessage);
      dispatch(authFailure(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    if (!step1Data || resendCountdown > 0) return;

    setIsLoading(true);
    setApiError("");

    try {
      const response = await apiClient.post("/auth/generate-otp", {
        email: step1Data.email,
        name: step1Data.name,
      });

      if (response.data.success) {
        setResendCountdown(60);
        setSuccessMessage("OTP resent to your email");
        toast.success("OTP resent to your email");
      } else {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error);
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormLoading = isLoading || reduxLoading;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-md">
        <Card className="w-full">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <>
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <CardDescription>
                  Step 1 of 3 - Personal Information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={step1Form.handleSubmit(onStep1Submit)}
                  className="space-y-4"
                >
                  {apiError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                      {apiError}
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      disabled={isFormLoading}
                      {...step1Form.register("name")}
                    />
                    {step1Form.formState.errors.name && (
                      <p className="text-xs text-red-600">
                        {step1Form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Roll Number */}
                  <div className="space-y-2">
                    <Label htmlFor="rollNo" className="text-sm font-medium">
                      Roll Number
                    </Label>
                    <Input
                      id="rollNo"
                      type="text"
                      placeholder="e.g., 001"
                      disabled={isFormLoading}
                      maxLength={3}
                      {...step1Form.register("rollNo")}
                    />
                    {step1Form.formState.errors.rollNo && (
                      <p className="text-xs text-red-600">
                        {step1Form.formState.errors.rollNo.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@iiits.in"
                      disabled={isFormLoading}
                      {...step1Form.register("email")}
                    />
                    {step1Form.formState.errors.email && (
                      <p className="text-xs text-red-600">
                        {step1Form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Hostel and Room Number */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="hostel" className="text-sm font-medium">
                        Hostel
                      </Label>
                      <Controller
                        control={step1Form.control}
                        name="hostel"
                        render={({ field }) => (
                          <Select
                            disabled={isFormLoading}
                            value={field.value ?? undefined}
                            onValueChange={(value) => {
                              field.onChange(value as Step1FormData["hostel"]);
                              field.onBlur();
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select hostel" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BH-1">BH-1</SelectItem>
                              <SelectItem value="BH-2">BH-2</SelectItem>
                              <SelectItem value="BH-3">BH-3</SelectItem>
                              <SelectItem value="BH-4">BH-4</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {step1Form.formState.errors.hostel && (
                        <p className="text-xs text-red-600">
                          {step1Form.formState.errors.hostel.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="roomNo" className="text-sm font-medium">
                        Room Number
                      </Label>
                      <Input
                        id="roomNo"
                        type="text"
                        placeholder="e.g., 101"
                        disabled={isFormLoading}
                        {...step1Form.register("roomNo")}
                      />
                      {step1Form.formState.errors.roomNo && (
                        <p className="text-xs text-red-600">
                          {step1Form.formState.errors.roomNo.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Year */}
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium">
                      Year
                    </Label>
                    <Controller
                      control={step1Form.control}
                      name="year"
                      render={({ field }) => (
                        <Select
                          disabled={isFormLoading}
                          value={field.value ?? undefined}
                          onValueChange={(value) => {
                            field.onChange(value as Step1FormData["year"]);
                            field.onBlur();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UG-1">1st Year</SelectItem>
                            <SelectItem value="UG-2">2nd Year</SelectItem>
                            <SelectItem value="UG-3">3rd Year</SelectItem>
                            <SelectItem value="UG-4">4th Year</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {step1Form.formState.errors.year && (
                      <p className="text-xs text-red-600">
                        {step1Form.formState.errors.year.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        disabled={isFormLoading}
                        {...step1Form.register("password")}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isFormLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {step1Form.formState.errors.password && (
                      <p className="text-xs text-red-600">
                        {step1Form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        disabled={isFormLoading}
                        {...step1Form.register("confirmPassword")}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={isFormLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {step1Form.formState.errors.confirmPassword && (
                      <p className="text-xs text-red-600">
                        {step1Form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isFormLoading}
                    className="w-full"
                  >
                    {isFormLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Continuing...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center text-sm">
                  <p className="text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Log in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <>
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Verify Email</CardTitle>
                <CardDescription>
                  Step 2 of 3 - Enter the OTP sent to your email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={step2Form.handleSubmit(onStep2Submit)}
                  className="space-y-4"
                >
                  {apiError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                      {apiError}
                    </div>
                  )}
                  {successMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                      {successMessage}
                    </div>
                  )}

                  <p className="text-sm text-gray-600">
                    We&apos;ve sent a 6-digit OTP to{" "}
                    <span className="font-semibold">{step1Data?.email}</span>
                  </p>

                  {/* OTP Input */}
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium">
                      OTP Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      disabled={isFormLoading}
                      maxLength={6}
                      {...step2Form.register("otp")}
                      className="text-center text-2xl tracking-widest"
                    />
                    {step2Form.formState.errors.otp && (
                      <p className="text-xs text-red-600">
                        {step2Form.formState.errors.otp.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isFormLoading}
                    className="w-full"
                  >
                    {isFormLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Didn&apos;t receive the OTP?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={resendCountdown > 0 || isFormLoading}
                      onClick={handleResendOTP}
                      className="w-full"
                    >
                      {resendCountdown > 0
                        ? `Resend in ${resendCountdown}s`
                        : "Resend OTP"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {/* Step 3: Success */}
          {currentStep === 3 && (
            <>
              <CardHeader className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Account Created!</CardTitle>
                <CardDescription>Step 3 of 3 - Ready to go</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Your account has been successfully created. You can now log in
                  with your email and password.
                </p>

                {step1Data && (
                  <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {step1Data.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {step1Data.email}
                    </p>
                    <p>
                      <span className="font-medium">Roll No:</span>{" "}
                      {step1Data.rollNo}
                    </p>
                    <p>
                      <span className="font-medium">Hostel:</span>{" "}
                      {step1Data.hostel}, Room {step1Data.roomNo}
                    </p>
                  </div>
                )}

                <Button onClick={() => navigate("/")} className="w-full">
                  Go to Home
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
