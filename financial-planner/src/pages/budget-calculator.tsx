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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  HomeIcon,
  Zap,
  Car,
  Coffee,
  ShoppingCart,
  Gamepad2,
  Plus,
  Minus,
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
  {
    id: "office",
    title: "Office",
    subtitle: "Work-related expenses",
    icon: ShoppingCart,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
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

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const income = parseFloat(monthlyIncome) || 0;
  const savings = income - totalExpenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const expenseRate = income > 0 ? (totalExpenses / income) * 100 : 0;

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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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

      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Budget Calculator</TabsTrigger>
          <TabsTrigger value="analysis">Budget Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
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
                    <Card
                      key={category.id}
                      className="relative border-green-200"
                    >
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
                    <Card
                      key={category.id}
                      className="relative border-purple-200"
                    >
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
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expense Ratio
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {expenseRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {expenseRate > 80
                    ? "Consider reducing expenses"
                    : "Good expense management"}
                </p>
                <Progress value={expenseRate} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Savings Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {savingsRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {savingsRate >= 20
                    ? "Excellent savings rate!"
                    : "Try to save more"}
                </p>
                <Progress
                  value={Math.max(0, savingsRate)}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Annual Savings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{formatIndianNumber(savings * 12)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Projected annual savings
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Your spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Needs Breakdown */}
                <div>
                  <h4 className="text-lg font-semibold text-green-700 mb-3">
                    Needs
                  </h4>
                  <div className="space-y-3">
                    {NEEDS_CATEGORIES.map((category) => {
                      const amount = getCategoryAmount(category.id);
                      const percentage =
                        totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

                      if (amount === 0) return null;

                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {category.title}
                            </span>
                            <div className="text-right">
                              <span className="text-sm font-medium">
                                ₹{formatIndianNumber(amount)}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Wants Breakdown */}
                <div>
                  <h4 className="text-lg font-semibold text-purple-700 mb-3">
                    Wants
                  </h4>
                  <div className="space-y-3">
                    {WANTS_CATEGORIES.map((category) => {
                      const amount = getCategoryAmount(category.id);
                      const percentage =
                        totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

                      if (amount === 0) return null;

                      return (
                        <div key={category.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {category.title}
                            </span>
                            <div className="text-right">
                              <span className="text-sm font-medium">
                                ₹{formatIndianNumber(amount)}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
