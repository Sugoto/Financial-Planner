import { useState } from "react";
import {
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
  ShoppingCart,
  Pin,
  Smile,
  Apple,
} from "lucide-react";
import { formatIndianNumber } from "@/lib/utils";
import { useExpenses, useUserProfile } from "@/hooks/useFinancialData";

// Define needs as a simple list with predefined amounts
const NEEDS_LIST = [
  {
    title: "Rent",
    subtitle: "Monthly housing cost",
    amount: 25000,
    icon: HomeIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Phone Bill",
    subtitle: "Mobile & internet services",
    amount: 333,
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    title: "Gym",
    subtitle: "Monthly gym membership",
    amount: 1500,
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    title: "Toiletries",
    subtitle: "Personal care essentials",
    amount: 1500,
    icon: ShoppingCart,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  {
    title: "Fruits",
    subtitle: "Daily fresh fruit bowl",
    amount: 1500,
    icon: Apple,
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
  {
    id: "shopping",
    title: "Shopping",
    subtitle: "Clothing, electronics, etc.",
    icon: ShoppingCart,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  {
    id: "snacks",
    title: "Snacks",
    subtitle: "Snacks & beverages",
    icon: Coffee,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    id: "supplements",
    title: "Supplements",
    subtitle: "Protein & health supplements",
    icon: Heart,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
];

const ALL_CATEGORIES = [...WANTS_CATEGORIES];

export function BudgetCalculatorPage() {
  const {
    expenses,
    loading: expensesLoading,
    addExpense,
    updateExpense,
  } = useExpenses();
  const { loading: profileLoading } = useUserProfile();

  const [monthlyBudget, setMonthlyBudget] = useState("40000");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [actionType, setActionType] = useState<"add" | "subtract">("add");
  const [inputAmount, setInputAmount] = useState("");

  // Get expense amount for a specific category
  const getCategoryAmount = (categoryId: string) => {
    const categoryTitle = ALL_CATEGORIES.find(
      (cat) => cat.id === categoryId
    )?.title;
    const expense = expenses.find((exp) => exp.category === categoryTitle);
    return expense?.amount || 0;
  };

  const budget = parseFloat(monthlyBudget) || 0;

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
  const needsTotal = NEEDS_LIST.reduce((sum: number, category) => {
    return sum + category.amount;
  }, 0);

  const wantsTotal = WANTS_CATEGORIES.reduce((sum, category) => {
    return sum + getCategoryAmount(category.id);
  }, 0);

  const needsPercentage = budget > 0 ? (needsTotal / budget) * 100 : 0;
  const wantsPercentage = budget > 0 ? (wantsTotal / budget) * 100 : 0;
  const savingsPercentage =
    budget > 0 ? ((budget - needsTotal - wantsTotal) / budget) * 100 : 0;

  return (
    <div className="mx-auto max-w-8xl space-y-14">
      {/* Header */}
      <div className="flex items-center justify-between px-7">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Budget Calculator
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Plan your monthly budget and track your spending
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Label htmlFor="monthly-budget" className="text-sm font-medium">
            Monthly Budget
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              ₹
            </span>
            <Input
              id="monthly-budget"
              type="text"
              value={formatIndianNumber(parseFloat(monthlyBudget) || 0)}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^\d]/g, "");
                setMonthlyBudget(numericValue);
              }}
              className="pl-8 w-48 text-right text-lg font-semibold"
              placeholder="40,000"
            />
          </div>
        </div>
      </div>

      {/* Budget Breakdown Tracker */}
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
                    ₹{formatIndianNumber(budget - needsTotal - wantsTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Budget Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Categories */}
        <div>
          <CardHeader className="pb-5">
            <CardTitle className="text-green-700 flex items-center gap-2">
              <Pin className="h-5 w-5" />
              Needs
            </CardTitle>
            <CardDescription>
              Fixed essential expenses that don't change monthly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {NEEDS_LIST.map((category, index) => {
                const IconComponent = category.icon;
                const amount = category.amount;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 ${category.bgColor} rounded-full flex items-center justify-center`}
                      >
                        <IconComponent
                          className={`h-4 w-4 ${category.color}`}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {category.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm font-bold">
                      ₹{formatIndianNumber(amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </div>

        {/* Wants Categories */}
        <div>
          <CardHeader className="pb-5">
            <CardTitle className="text-purple-700 flex items-center gap-2">
              <Smile className="h-5 w-5" />
              Wants
            </CardTitle>
            <CardDescription>
              Variable lifestyle and entertainment expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WANTS_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                const amount = getCategoryAmount(category.id);

                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 ${category.bgColor} rounded-full flex items-center justify-center`}
                      >
                        <IconComponent
                          className={`h-4 w-4 ${category.color}`}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {category.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCategoryAction(category.id, "subtract")
                        }
                        disabled={amount === 0}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <div className="text-sm font-bold min-w-[60px] text-center">
                        ₹{formatIndianNumber(amount)}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCategoryAction(category.id, "add")}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </div>
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
