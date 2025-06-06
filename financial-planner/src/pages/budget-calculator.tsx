import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calculator,
  HomeIcon,
  Zap,
  Car,
  Coffee,
  Gamepad2,
  Plus,
  Minus,
  Heart,
} from "lucide-react";
import { formatIndianNumber } from "@/lib/utils";
import { useExpenses, useUserProfile } from "@/hooks/useFinancialData";

// Define expense categories split into Needs and Wants
const NEEDS_CATEGORIES = [
  {
    id: "rent",
    title: "Rent",
    subtitle: "Monthly housing cost",
    icon: HomeIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "phone-bill",
    title: "Phone Bill",
    subtitle: "Mobile & internet services",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    id: "health",
    title: "Health",
    subtitle: "Gym & medicines",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    id: "wfh-meals",
    title: "WFH Meals",
    subtitle: "Work from home food",
    icon: Coffee,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: "travel",
    title: "Travel",
    subtitle: "Essential transportation",
    icon: Car,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
];

const WANTS_CATEGORIES = [
  {
    id: "eating-out",
    title: "Eating Out",
    subtitle: "Restaurants & dining",
    icon: Coffee,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    id: "hangout-travel",
    title: "Hangout Travel",
    subtitle: "Social & leisure travel",
    icon: Car,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    id: "movies",
    title: "Movies",
    subtitle: "Cinema & entertainment",
    icon: Gamepad2,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
  {
    id: "hotels",
    title: "Hotels",
    subtitle: "Accommodation & stays",
    icon: HomeIcon,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
];

const ALL_CATEGORIES = [...NEEDS_CATEGORIES, ...WANTS_CATEGORIES];

export function BudgetCalculatorPage() {
  const {
    expenses,
    loading: expensesLoading,
    addExpense,
    updateExpense,
  } = useExpenses();
  const { profile, loading: profileLoading } = useUserProfile();

  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [actionType, setActionType] = useState<"add" | "subtract">("add");
  const [inputAmount, setInputAmount] = useState("");

  // Update local income state when profile loads
  useEffect(() => {
    if (profile && !profileLoading) {
      setMonthlyIncome(profile.monthlyIncome.toString());
    }
  }, [profile, profileLoading]);

  // Get expense amount for a specific category
  const getCategoryAmount = (categoryId: string) => {
    const categoryTitle = ALL_CATEGORIES.find(
      (cat) => cat.id === categoryId
    )?.title;
    const expense = expenses.find((exp) => exp.category === categoryTitle);
    return expense?.amount || 0;
  };

  const income = parseFloat(monthlyIncome) || 0;

  const handleCategoryAction = (
    categoryId: string,
    action: "add" | "subtract"
  ) => {
    setCurrentCategory(categoryId);
    setActionType(action);
    setDialogOpen(true);
    setInputAmount("");
  };

  const handleConfirmAction = async () => {
    if (!inputAmount || !currentCategory) return;

    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) return;

    const categoryTitle = ALL_CATEGORIES.find(
      (cat) => cat.id === currentCategory
    )?.title;
    if (!categoryTitle) return;

    const existingExpense = expenses.find(
      (exp) => exp.category === categoryTitle
    );

    if (existingExpense) {
      const currentAmount = existingExpense.amount;
      let newAmount;

      if (actionType === "add") {
        newAmount = currentAmount + amount;
      } else {
        newAmount = Math.max(0, currentAmount - amount);
      }

      await updateExpense(existingExpense.id!, { amount: newAmount });
    } else {
      // Create new expense if it doesn't exist
      if (actionType === "add") {
        await addExpense({
          category: categoryTitle,
          amount: amount,
        });
      }
    }

    setDialogOpen(false);
    setInputAmount("");
    setCurrentCategory("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirmAction();
    }
  };

  if (expensesLoading || profileLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8" />
            Budget Calculator
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const currentCategoryData = ALL_CATEGORIES.find(
    (cat) => cat.id === currentCategory
  );

  // Calculate needs vs wants breakdown
  const needsTotal = NEEDS_CATEGORIES.reduce((sum, category) => {
    return sum + getCategoryAmount(category.id);
  }, 0);

  const wantsTotal = WANTS_CATEGORIES.reduce((sum, category) => {
    return sum + getCategoryAmount(category.id);
  }, 0);

  const needsPercentage = income > 0 ? (needsTotal / income) * 100 : 0;
  const wantsPercentage = income > 0 ? (wantsTotal / income) * 100 : 0;
  const savingsPercentage =
    income > 0 ? ((income - needsTotal - wantsTotal) / income) * 100 : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-14">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
          <Calculator className="h-8 w-8" />
          Budget Calculator
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Plan your monthly budget and track your spending
        </p>
      </div>

      {/* Income Breakdown Tracker */}
      <div>
        <CardContent>
          <div className="space-y-4">
            {/* Visual Progress Bar */}
            <div className="relative">
              <div className="flex h-6 rounded-lg overflow-hidden bg-gray-100">
                <div
                  className="bg-green-500 transition-all duration-300"
                  style={{ width: `${needsPercentage}%` }}
                />
                <div
                  className="bg-purple-500 transition-all duration-300"
                  style={{ width: `${wantsPercentage}%` }}
                />
                <div
                  className="bg-blue-500 transition-all duration-300"
                  style={{ width: `${savingsPercentage}%` }}
                />
              </div>
            </div>

            {/* Legend and Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Needs</span>
                    <span className="text-sm font-bold">
                      {needsPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ₹{formatIndianNumber(needsTotal)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Wants</span>
                    <span className="text-sm font-bold">
                      {wantsPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ₹{formatIndianNumber(wantsTotal)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Savings</span>
                    <span className="text-sm font-bold">
                      {savingsPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ₹{formatIndianNumber(income - needsTotal - wantsTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Budget Calculator */}
      <div className="space-y-6">
        {/* Needs Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Needs</CardTitle>
            <CardDescription>
              Essential expenses you can't avoid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {NEEDS_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                const amount = getCategoryAmount(category.id);

                return (
                  <Card key={category.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 ${category.bgColor} rounded-full flex items-center justify-center`}
                        >
                          <IconComponent
                            className={`h-5 w-5 ${category.color}`}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {category.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {category.subtitle}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCategoryAction(category.id, "subtract")
                          }
                          disabled={amount === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            ₹{formatIndianNumber(amount)}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCategoryAction(category.id, "add")
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Wants Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-700">Wants</CardTitle>
            <CardDescription>
              Lifestyle and entertainment expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WANTS_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                const amount = getCategoryAmount(category.id);

                return (
                  <Card key={category.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 ${category.bgColor} rounded-full flex items-center justify-center`}
                        >
                          <IconComponent
                            className={`h-5 w-5 ${category.color}`}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {category.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {category.subtitle}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCategoryAction(category.id, "subtract")
                          }
                          disabled={amount === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>

                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            ₹{formatIndianNumber(amount)}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCategoryAction(category.id, "add")
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amount Input Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "add" ? "Add" : "Subtract"} Amount
            </DialogTitle>
            <DialogDescription>
              {actionType === "add" ? "Add money to" : "Subtract money from"}{" "}
              your {currentCategoryData?.title} budget.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirmAction}>
              {actionType === "add" ? "Add" : "Subtract"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
