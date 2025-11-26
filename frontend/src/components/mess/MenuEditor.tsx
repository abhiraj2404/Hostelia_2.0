import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Coffee,
  UtensilsCrossed,
  Cookie,
  Moon,
  Plus,
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ChefHat,
  ClipboardList,
} from "lucide-react";
import apiClient from "@/lib/api-client";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const mealTypes = [
  { value: "Breakfast", label: "Breakfast", icon: Coffee },
  { value: "Lunch", label: "Lunch", icon: UtensilsCrossed },
  { value: "Snacks", label: "Snacks", icon: Cookie },
  { value: "Dinner", label: "Dinner", icon: Moon },
] as const;

type DayName = (typeof dayNames)[number];
type MealType = "Breakfast" | "Lunch" | "Snacks" | "Dinner";

interface MenuData {
  [day: string]: {
    [mealType: string]: string[];
  };
}

interface MenuEditorProps {
  currentMenu: MenuData | null;
  onMenuUpdate?: () => void;
}

export function MenuEditor({ currentMenu, onMenuUpdate }: MenuEditorProps) {
  const [selectedDay, setSelectedDay] = useState<DayName>("Monday");
  const [selectedMeal, setSelectedMeal] = useState<MealType>("Breakfast");
  const [items, setItems] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load items when day or meal changes
  const loadItems = (day: DayName, meal: MealType) => {
    if (currentMenu && currentMenu[day] && currentMenu[day][meal]) {
      setItems([...currentMenu[day][meal]]);
    } else {
      setItems([""]);
    }
  };

  // Ensure items are loaded on first mount and whenever `currentMenu` updates
  useEffect(() => {
    loadItems(selectedDay, selectedMeal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMenu]);

  // Handle day change
  const handleDayChange = (day: DayName) => {
    setSelectedDay(day);
    loadItems(day, selectedMeal);
    setError(null);
    setSuccess(false);
  };

  // Handle meal change
  const handleMealChange = (meal: MealType) => {
    setSelectedMeal(meal);
    loadItems(selectedDay, meal);
    setError(null);
    setSuccess(false);
  };

  // Add new item input
  const addItem = () => {
    setItems([...items, ""]);
  };

  // Remove item
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length > 0 ? newItems : [""]);
  };

  // Update item value
  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  // Save menu updates
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Filter out empty items
      const filteredItems = items.filter((item) => item.trim() !== "");

      if (filteredItems.length === 0) {
        setError("Please add at least one menu item");
        setLoading(false);
        return;
      }

      // Prepare updates payload matching backend schema (will sanitize below)

      // Backend z.record(z.enum(days), dayMenuSchema) requires ALL days to be present
      // Build updates object with all 7 days from currentMenu, then update the selected day/meal
      const allDaysUpdates: Record<string, Record<string, string[]>> = {};
      
      // Populate all days from current menu or with empty defaults
      dayNames.forEach((day) => {
        if (currentMenu && currentMenu[day]) {
          // Copy existing meals for this day
          allDaysUpdates[day] = { ...currentMenu[day] };
        } else {
          // Initialize with empty arrays for all meals if day doesn't exist
          allDaysUpdates[day] = {
            Breakfast: [],
            Lunch: [],
            Snacks: [],
            Dinner: [],
          };
        }
      });

      // Update the selected day and meal with new items
      allDaysUpdates[selectedDay][selectedMeal] = filteredItems;

      const payload = {
        updates: allDaysUpdates,
      };

      // Ensure selectedDay is a valid day string
      if (!dayNames.includes(selectedDay)) {
        setError("Invalid day selected");
        setLoading(false);
        return;
      }

      console.log("MenuEditor - Selected day:", selectedDay);
      console.log("MenuEditor - Selected meal:", selectedMeal);
      console.log("MenuEditor - Payload:", JSON.stringify(payload, null, 2));
      console.log("MenuEditor - Payload keys:", Object.keys(payload.updates));

      const response = await apiClient.put("/mess/menu", payload);
      
      console.log("MenuEditor - Response:", response.data);
      
      setSuccess(true);
      setError(null);
      
      // Call parent callback to refresh menu
      if (onMenuUpdate) {
        onMenuUpdate();
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("MenuEditor - Error:", err);
      console.error("MenuEditor - Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to update menu");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Get current meal icon
  const CurrentMealIcon =
    mealTypes.find((m) => m.value === selectedMeal)?.icon || Coffee;

  return (
    <div className="space-y-6">
      {/* Header Card with Selection Controls */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="border-b bg-linear-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-2">
            <ChefHat className="size-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Menu Editor</CardTitle>
              <CardDescription className="text-xs mt-1">
                Select a day and meal to edit menu items
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Day Selection Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="day-select" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                Select Day
              </Label>
              <Select value={selectedDay} onValueChange={(value) => handleDayChange(value as DayName)}>
                <SelectTrigger id="day-select" className="h-11">
                  <SelectValue placeholder="Choose a day" />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day) => (
                    <SelectItem key={day} value={day}>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5" />
                        <span>{day}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Meal Selection Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="meal-select" className="text-sm font-medium flex items-center gap-2">
                <CurrentMealIcon className="size-4 text-primary" />
                Select Meal
              </Label>
              <Select value={selectedMeal} onValueChange={(value) => handleMealChange(value as MealType)}>
                <SelectTrigger id="meal-select" className="h-11">
                  <SelectValue placeholder="Choose a meal" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="size-3.5" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Selection Badge */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Editing:</span>
            <Badge variant="default" className="gap-1.5">
              <Calendar className="size-3" />
              {selectedDay}
            </Badge>
            <Badge variant="secondary" className="gap-1.5">
              <CurrentMealIcon className="size-3" />
              {selectedMeal}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Menu Items Editor - Main Column */}
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Menu Items</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Add, edit, or remove items from the menu
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs gap-1.5">
                <UtensilsCrossed className="size-3" />
                {items.filter((i) => i.trim() !== "").length} items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        value={item}
                        onChange={(e) => updateItem(index, e.target.value)}
                        placeholder={`Enter item ${index + 1}`}
                        className="h-11 pr-10"
                      />
                      {item.trim() && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle2 className="size-4 text-green-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="h-11 w-11 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="w-full h-11 border-dashed hover:border-primary hover:bg-primary/5"
              >
                <Plus className="size-4 mr-2" />
                Add Another Item
              </Button>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-6 border-t">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full h-12 shadow-lg text-base"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-5 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="size-5 mr-2" />
                    Save Menu Changes
                  </>
                )}
              </Button>
            </div>

            {/* Status Messages */}
            {success && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 px-4 py-3 rounded-lg border border-green-200 dark:border-green-900">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Menu updated successfully for {selectedDay} - {selectedMeal}!</span>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg border border-destructive/20">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar - Current Menu Preview */}
        <div className="space-y-6">
          {/* Current Menu Card */}
          {currentMenu && currentMenu[selectedDay] && currentMenu[selectedDay][selectedMeal] && currentMenu[selectedDay][selectedMeal].length > 0 && (
            <Card className="shadow-lg bg-linear-to-br from-muted/50 to-muted/30 border-primary/20">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UtensilsCrossed className="size-4 text-primary" />
                  Current Menu
                </CardTitle>
                <CardDescription className="text-xs">
                  Showing saved items
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {currentMenu[selectedDay][selectedMeal].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-background/60 border"
                    >
                      <div className="size-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats Card */}
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">Unsaved Items</span>
                <Badge variant="secondary" className="text-xs">
                  {items.filter((i) => i.trim() !== "").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">Current Items</span>
                <Badge variant="outline" className="text-xs">
                  {currentMenu && currentMenu[selectedDay] && currentMenu[selectedDay][selectedMeal]
                    ? currentMenu[selectedDay][selectedMeal].length
                    : 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">Empty Fields</span>
                <Badge variant={items.filter((i) => i.trim() === "").length > 0 ? "destructive" : "outline"} className="text-xs">
                  {items.filter((i) => i.trim() === "").length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="shadow-lg bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-primary" />
                  <p>Changes are saved immediately to the database</p>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-primary" />
                  <p>Empty fields will be automatically removed before saving</p>
                </div>
                <div className="flex gap-2">
                  <Calendar className="size-4 shrink-0 mt-0.5 text-primary" />
                  <p>You can edit menus for any day of the week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
