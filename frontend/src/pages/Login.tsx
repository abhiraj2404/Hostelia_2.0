import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn, getApiErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  authStart,
  loginSuccess,
  authFailure,
} from "@/features/auth/authSlice";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

// Validation schema for login
const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .refine(
      (email) => email.endsWith("@iiits.in"),
      "Email must be a valid @iiits.in address"
    ),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isLoading, error: reduxError } = useAppSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    dispatch(authStart());
    setApiError("");

    try {
      const response = await apiClient.post("/auth/login", data);

      if (response.data.success) {
        const userData = {
          id: response.data.user.userId,
          email: response.data.user.email,
          name: response.data.user.name,
          rollNo: response.data.user.rollNo,
          hostel: response.data.user.hostel,
          roomNo: response.data.user.roomNo,
          year: response.data.user.year,
          role: response.data.user.role,
          // token: localStorage.getItem("token") || "", // Token is in httpOnly cookie, but we store a reference
        };

        dispatch(loginSuccess(userData));

        // Navigate to dashboard after successful login
        const from = (location.state as { from?: string })?.from || "/dashboard";
        navigate(from, { replace: true });
        toast.success("Welcome back!");
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: unknown) {
      const errorMessage = getApiErrorMessage(error, "Network error. Please try again.");
      setApiError(errorMessage);
      dispatch(authFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  const displayError = apiError || reduxError;
  const isFormLoading = isSubmitting || isLoading;

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto w-full max-w-sm md:max-w-3xl">
        <div className={cn("flex flex-col gap-6")}>
          <Card className="overflow-hidden border-2">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-balance text-muted-foreground">
                      Login to your Hostelia account
                    </p>
                  </div>

                  {/* API Error Message */}
                  {displayError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                      {displayError}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@iiits.in"
                      disabled={isFormLoading}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        to="/contact"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={isFormLoading}
                        {...register("password")}
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
                    {errors.password && (
                      <p className="text-xs text-red-600">
                        {errors.password.message}
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
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Sign Up Link */}
                  <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <Link
                        to="/signup"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Sign up
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
              <div className="relative hidden bg-muted md:block">
                <img
                  src="/auth-pages/campus-image.webp"
                  alt="Login illustration"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
