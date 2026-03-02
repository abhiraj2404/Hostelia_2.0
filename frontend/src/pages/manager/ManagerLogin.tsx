import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { cn, getApiErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { authStart, loginSuccess, authFailure } from "@/features/auth/authSlice";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

const managerLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type ManagerLoginFormData = z.infer<typeof managerLoginSchema>;

export default function ManagerLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error: reduxError } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ManagerLoginFormData>({
    resolver: zodResolver(managerLoginSchema),
  });

  const onSubmit = async (data: ManagerLoginFormData) => {
    dispatch(authStart());
    setApiError("");

    try {
      const response = await apiClient.post("/auth/manager-login", data);

      if (response.data.success) {
        const userData = {
          id: response.data.user.userId,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
        };

        dispatch(loginSuccess(userData));
        setTimeout(() => {
          navigate("/manager/dashboard", { replace: true });
        }, 0);
        toast.success("Welcome back, Manager!");
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="border-2">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Manager Login</h1>
                <p className="text-sm text-muted-foreground">
                  Platform administration portal
                </p>
              </div>

              {displayError && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {displayError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="manager@hostelia.com"
                  disabled={isFormLoading}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    disabled={isFormLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className={cn("w-full", isFormLoading && "opacity-80")}
                disabled={isFormLoading}
              >
                {isFormLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
