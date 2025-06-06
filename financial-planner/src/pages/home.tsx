import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  DollarSign,
  PiggyBank,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
} from "lucide-react";
import { useDashboardStats, useFinancialGoals } from "@/hooks/useFinancialData";
import { formatIndianNumber } from "@/lib/utils";

export function HomePage() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { goals, loading: goalsLoading } = useFinancialGoals();

  if (statsLoading || goalsLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Financial Dashboard
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Financial Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Take control of your finances and plan for your future
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{formatIndianNumber(stats?.totalBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{formatIndianNumber(stats?.monthlyIncome || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +5.2%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{formatIndianNumber(stats?.monthlyExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +2.1%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Savings
            </CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{formatIndianNumber(stats?.monthlySavings || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8.7%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Goals */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your finances with these quick tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/budget-calculator">
                <Calculator className="mr-2 h-4 w-4" />
                Budget Calculator
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/sip-calculator">
                <TrendingUp className="mr-2 h-4 w-4" />
                SIP Calculator
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/">
                <Target className="mr-2 h-4 w-4" />
                Set Financial Goal
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Goals</CardTitle>
            <CardDescription>
              Track your progress towards your goals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => {
              const progress =
                goal.targetAmount > 0
                  ? (goal.currentAmount / goal.targetAmount) * 100
                  : 0;
              const getProgressColor = (category: string) => {
                switch (category) {
                  case "emergency":
                    return "bg-green-600";
                  case "house":
                    return "bg-blue-600";
                  case "vacation":
                    return "bg-purple-600";
                  default:
                    return "bg-gray-600";
                }
              };

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(
                        goal.category
                      )}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Salary Credit</p>
                  <p className="text-xs text-muted-foreground">
                    Today, 2:30 PM
                  </p>
                </div>
              </div>
              <span className="text-green-600 font-medium">+₹85,000</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Rent Payment</p>
                  <p className="text-xs text-muted-foreground">
                    Yesterday, 10:00 AM
                  </p>
                </div>
              </div>
              <span className="text-red-600 font-medium">-₹25,000</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <PiggyBank className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">SIP Investment</p>
                  <p className="text-xs text-muted-foreground">
                    2 days ago, 9:00 AM
                  </p>
                </div>
              </div>
              <span className="text-blue-600 font-medium">-₹10,000</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
