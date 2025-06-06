import { useState, useEffect } from "react";
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
  Gift,
  Utensils,
  Edit3,
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

// Define bonus categories (isolated from budget calculations)
const BONUS_LIST = [
  {
    title: "Office Lunch",
    subtitle: "Daily office lunch expenses",
    amount: 10000,
    icon: Utensils,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    isFixed: true,
  },
  {
    title: "Office Snacks",
    subtitle: "Office snacks & beverages",
    amount: 1000,
    icon: Coffee,
    color: "text-brown-600",
    bgColor: "bg-amber-100",
    isFixed: true,
  },
  {
    id: "bonusly",
    title: "Bonusly",
    subtitle: "Variable bonus expenses",
    amount: 0,
    icon: Gift,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    isFixed: false,
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
  const [inputAmount, setInputAmount] = useState("100");

  // State for bonus variable amount
  const [bonuslyAmount, setBonuslyAmount] = useState(0);

  // Initialize bonusly amount from database when expenses load
  useEffect(() => {
    const bonusExpense = expenses.find((exp) => exp.category === "Bonusly");
    if (bonusExpense) {
      setBonuslyAmount(bonusExpense.amount);
    }
  }, [expenses]);

  // Get expense amount for a specific category
  const getCategoryAmount = (categoryId: string) => {
    const categoryTitle = ALL_CATEGORIES.find(
      (cat) => cat.id === categoryId
    )?.title;
    const expense = expenses.find((exp) => exp.category === categoryTitle);
    return expense?.amount || 0;
  };

  const budget = parseFloat(monthlyBudget) || 0;

  const handleCategoryEdit = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setDialogOpen(true);
  };

  const handleAmountAction = async (action: "add" | "subtract") => {
    if (!currentCategory) return;

    const changeAmount = parseFloat(inputAmount) || 0;
    if (changeAmount <= 0) return;

    // Handle bonus category separately
    if (currentCategory === "bonusly") {
      let newBonusAmount = 0;
      if (action === "add") {
        newBonusAmount = bonuslyAmount + changeAmount;
      } else {
        newBonusAmount = Math.max(0, bonuslyAmount - changeAmount);
      }

      setBonuslyAmount(newBonusAmount);

      // Save to database
      const existingBonusExpense = expenses.find(
        (exp) => exp.category === "Bonusly"
      );

      if (existingBonusExpense) {
        await updateExpense(existingBonusExpense.id!, {
          amount: newBonusAmount,
        });
      } else if (newBonusAmount > 0) {
        await addExpense({
          category: "Bonusly",
          amount: newBonusAmount,
        });
      }
      return;
    }

    const categoryTitle = ALL_CATEGORIES.find(
      (cat) => cat.id === currentCategory
    )?.title;
    if (!categoryTitle) return;

    const existingExpense = expenses.find(
      (exp) => exp.category === categoryTitle
    );

    let newAmount = 0;
    if (existingExpense) {
      const currentAmount = existingExpense.amount;
      if (action === "add") {
        newAmount = currentAmount + changeAmount;
      } else {
        newAmount = Math.max(0, currentAmount - changeAmount);
      }
      await updateExpense(existingExpense.id!, { amount: newAmount });
    } else if (action === "add") {
      // Create new expense if it doesn't exist and we're adding
      await addExpense({
        category: categoryTitle,
        amount: changeAmount,
      });
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

  const currentCategoryData =
    currentCategory === "bonusly"
      ? BONUS_LIST.find((cat) => cat.id === "bonusly")
      : ALL_CATEGORIES.find((cat) => cat.id === currentCategory);

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
      {/* Bonus Section */}
      <div>
        <CardHeader className="pb-5">
          <CardTitle className="text-orange-700 flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Bonus
          </CardTitle>
          <CardDescription>
            Additional expenses not included in budget calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BONUS_LIST.map((category, index) => {
              const IconComponent = category.icon;
              const amount = category.isFixed
                ? category.amount
                : category.id === "bonusly"
                ? bonuslyAmount
                : category.amount;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 ${category.bgColor} rounded-full flex items-center justify-center`}
                    >
                      <IconComponent className={`h-5 w-5 ${category.color}`} />
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
                    <div className="text-sm font-bold min-w-[80px] text-center">
                      ₹{formatIndianNumber(amount)}
                    </div>

                    {!category.isFixed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCategoryEdit(category.id!)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </div>
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
                      <div className="text-sm font-bold min-w-[60px] text-center">
                        ₹{formatIndianNumber(amount)}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCategoryEdit(category.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </div>
      </div>

      {/* Amount Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Amount</DialogTitle>
            <DialogDescription>
              Adjust the amount for {currentCategoryData?.title}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="flex items-center justify-center space-x-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAmountAction("subtract")}
                className="h-14 w-14 p-0 rounded-full"
              >
                <Minus className="h-6 w-6" />
              </Button>

              <div className="flex flex-col items-center space-y-3">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Change Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    value={formatIndianNumber(parseFloat(inputAmount) || 0)}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^\d]/g, "");
                      setInputAmount(numericValue);
                    }}
                    className="pl-8 w-36 text-center text-lg font-semibold"
                    placeholder="100"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => handleAmountAction("add")}
                className="h-14 w-14 p-0 rounded-full"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Current: ₹
              {formatIndianNumber(
                currentCategory === "bonusly"
                  ? bonuslyAmount
                  : getCategoryAmount(currentCategory)
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
