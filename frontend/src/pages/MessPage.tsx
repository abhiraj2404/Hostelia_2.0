import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks";
import apiClient from "@/lib/api-client";
import { Link } from "react-router-dom";
import { TodayMenu } from "@/components/mess/TodayMenu";
import { WeeklyMenu } from "@/components/mess/WeeklyMenu";
import { FeedbackForm } from "@/components/mess/FeedbackForm";
import { FeedbackDashboard } from "@/components/mess/FeedbackDashboard";
import { MenuEditor } from "@/components/mess/MenuEditor";
import { UtensilsCrossed, AlertCircle, Plus, BarChart3, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuData {
  [day: string]: {
    [mealType: string]: string[];
  };
}

interface FeedbackFormData {
  date: Date;
  mealType: "Breakfast" | "Lunch" | "Snacks" | "Dinner";
  rating: number;
  comment?: string;
}

function MessPage() {
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [menu, setMenu] = useState<MenuData | null>(null);
  const [menuStatus, setMenuStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  
  // Admin/Warden dashboard state
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardView, setDashboardView] = useState<"feedback" | "menu">("feedback");

  // Only students can submit feedback
  const canSubmitFeedback = user?.role === "student";
  
  // Admins and wardens can view dashboard
  const canViewDashboard = user?.role === "admin" || user?.role === "warden";

  // Fetch menu
  const fetchMenu = async () => {
    try {
      setMenuStatus("loading");
      const response = await apiClient.get("/mess/menu");
      setMenu(response.data.menu || {});
      setMenuStatus("succeeded");
    } catch (error) {
      setMenuStatus("failed");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMenu();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (feedbackStatus === "succeeded") {

      // Clear status after 3 seconds
      const timer = setTimeout(() => {
        setFeedbackStatus("idle");
        setFeedbackError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [feedbackStatus]);

  const handleFeedbackSubmit = async (data: FeedbackFormData) => {
    try {
      setFeedbackStatus("loading");
      setFeedbackError(null);

      await apiClient.post("/mess/feedback", {
        date: data.date.toISOString(),
        mealType: data.mealType,
        rating: data.rating,
        comment: data.comment?.trim() || "",
      });

      setFeedbackStatus("succeeded");
    } catch (error: any) {
      setFeedbackStatus("failed");
      setFeedbackError(
        error.response?.data?.message || "Failed to submit feedback"
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="size-16 mx-auto text-muted-foreground/50" />
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">
              Authentication Required
            </p>
            <p className="text-sm text-muted-foreground">
              Please login to view the mess menu
              {canSubmitFeedback && " and submit feedback"}
            </p>
          </div>
          <Link to="/login">
            <Button size="lg" className="shadow-lg">
              Login to View Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-muted/5 to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full border bg-card text-xs font-medium shadow-sm">
            <UtensilsCrossed className="size-3.5 text-primary" />
            <span>Mess Services</span>
          </div> */}
          <div className="flex items-center justify-between">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Mess Menu & Feedback
              </h1>
              <p className="text-muted-foreground text-sm">
                {canSubmitFeedback 
                  ? "Explore today's meals, browse the weekly menu, and share your dining experience" 
                  : canViewDashboard
                  ? "Manage mess menu and view student feedback"
                  : "Explore today's meals and browse the weekly menu schedule"
                }
              </p>
            </div>
            {canSubmitFeedback && !showFeedbackForm && (
              <Button
                onClick={() => setShowFeedbackForm(true)}
                className="shadow-lg"
              >
                <Plus className="size-4 mr-2" />
                Give Feedback
              </Button>
            )}
            {canViewDashboard && !showDashboard && (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowDashboard(true);
                    setDashboardView("feedback");
                  }}
                  className="shadow-lg"
                >
                  <BarChart3 className="size-4 mr-2" />
                  View Feedback
                </Button>
                <Button
                  onClick={() => {
                    setShowDashboard(true);
                    setDashboardView("menu");
                  }}
                  variant="outline"
                  className="shadow-lg"
                >
                  <Edit className="size-4 mr-2" />
                  Edit Menu
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Admin/Warden Dashboard View */}
        {canViewDashboard && showDashboard ? (
          <div className="space-y-6">
            {/* Dashboard Toggle */}
            <div className="flex items-center justify-between bg-card border rounded-lg px-4 py-3 shadow-sm">
              <div className="flex gap-2">
                <Button
                  variant={dashboardView === "feedback" ? "default" : "outline"}
                  onClick={() => setDashboardView("feedback")}
                  className="shadow-sm"
                >
                  <BarChart3 className="size-4 mr-2" />
                  Feedback Dashboard
                </Button>
                <Button
                  variant={dashboardView === "menu" ? "default" : "outline"}
                  onClick={() => setDashboardView("menu")}
                  className="shadow-sm"
                >
                  <Edit className="size-4 mr-2" />
                  Menu Editor
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowDashboard(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Back to Menu View
              </Button>
            </div>

            {/* Dashboard Content */}
            {dashboardView === "feedback" ? (
              <FeedbackDashboard />
            ) : (
              <MenuEditor currentMenu={menu} onMenuUpdate={fetchMenu} />
            )}
          </div>
        ) : canSubmitFeedback && showFeedbackForm ? (
          // Student Layout with Feedback: TodayMenu | WeeklyMenu | FeedbackForm
          <div className="grid gap-6 lg:grid-cols-12 xl:gap-8">
            {/* Today's Menu - Takes 4 columns */}
            <div className="lg:col-span-4">
              <TodayMenu
                selectedDate={selectedDate}
                menu={menu}
                menuStatus={menuStatus}
              />
            </div>

            {/* Weekly Menu - Takes 5 columns */}
            <div className="lg:col-span-5">
              <WeeklyMenu menu={menu} menuStatus={menuStatus} />
            </div>

            {/* Feedback Form - Takes 3 columns, sticky */}
            <div className="lg:col-span-3">
              <div className="sticky top-6">
                <FeedbackForm
                  onSubmit={handleFeedbackSubmit}
                  feedbackStatus={feedbackStatus}
                  feedbackError={feedbackError}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  onClose={() => setShowFeedbackForm(false)}
                />
              </div>
            </div>
          </div>
        ) : (
          // Layout without Feedback: TodayMenu | WeeklyMenu
          <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
            <div>
              <TodayMenu
                selectedDate={selectedDate}
                menu={menu}
                menuStatus={menuStatus}
              />
            </div>
            <div>
              <WeeklyMenu menu={menu} menuStatus={menuStatus} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessPage;
