import { useState } from "react";
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
  PlusCircle, 
  MinusCircle, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator
} from "lucide-react";
import { formatIndianNumber } from "@/lib/utils";

interface ExpenseItem {
  id: number;
  category: string;
  amount: number;
}

export function BudgetCalculatorPage() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: 1, category: "Housing", amount: 25000 },
    { id: 2, category: "Food", amount: 8000 },
    { id: 3, category: "Transportation", amount: 5000 },
    { id: 4, category: "Utilities", amount: 3000 },
  ]);
  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const income = parseFloat(monthlyIncome) || 0;
  const savings = income - totalExpenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const expenseRate = income > 0 ? (totalExpenses / income) * 100 : 0;

  const addExpense = () => {
    if (newExpenseCategory && newExpenseAmount) {
      const newExpense: ExpenseItem = {
        id: Date.now(),
        category: newExpenseCategory,
        amount: parseFloat(newExpenseAmount) || 0,
      };
      setExpenses([...expenses, newExpense]);
      setNewExpenseCategory("");
      setNewExpenseAmount("");
    }
  };

  const removeExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const updateExpense = (id: number, newAmount: number) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, amount: newAmount } : expense
    ));
  };

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
          <div className="grid gap-6 md:grid-cols-2">
            {/* Income Input */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Income</CardTitle>
                <CardDescription>
                  Enter your total monthly income
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Income Amount</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="₹85,000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                  />
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Monthly Income</span>
                    <span className="text-lg font-bold text-green-600">
                      ₹{formatIndianNumber(income)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Summary</CardTitle>
                <CardDescription>Overview of your monthly budget</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Income</span>
                    <span className="font-bold text-green-600">₹{formatIndianNumber(income)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Expenses</span>
                    <span className="font-bold text-red-600">₹{formatIndianNumber(totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Net Savings</span>
                    <span className={`font-bold ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{formatIndianNumber(savings)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Savings Rate</span>
                    <span>{savingsRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.max(0, savingsRate)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expenses Management */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
              <CardDescription>
                Manage your monthly expenses by category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Expense */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="new-category">Category</Label>
                  <Input
                    id="new-category"
                    placeholder="e.g., Entertainment"
                    value={newExpenseCategory}
                    onChange={(e) => setNewExpenseCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-amount">Amount</Label>
                  <Input
                    id="new-amount"
                    type="number"
                    placeholder="₹5,000"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addExpense} className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </div>

              {/* Expenses List */}
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{expense.category}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Input
                        type="number"
                        value={expense.amount}
                        onChange={(e) => updateExpense(expense.id, parseFloat(e.target.value) || 0)}
                        className="w-32 text-right"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeExpense(expense.id)}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Expenses</span>
                  <span className="text-lg font-bold text-red-600">
                    ₹{formatIndianNumber(totalExpenses)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expenseRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {expenseRate > 80 ? "Consider reducing expenses" : "Good expense management"}
                </p>
                <Progress value={expenseRate} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savingsRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {savingsRate >= 20 ? "Excellent savings rate!" : "Try to save more"}
                </p>
                <Progress value={Math.max(0, savingsRate)} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{formatIndianNumber(savings * 12)}</div>
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
              <div className="space-y-4">
                {expenses.map((expense) => {
                  const percentage = totalExpenses > 0 ? (expense.amount / totalExpenses) * 100 : 0;
                  return (
                    <div key={expense.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{expense.category}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium">₹{formatIndianNumber(expense.amount)}</span>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 