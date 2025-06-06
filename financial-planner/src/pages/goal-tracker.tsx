import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  Calculator,
} from "lucide-react";
import {
  useDashboardStats,
  usePortfolioItems,
  useSipInvestment,
} from "@/hooks/useFinancialData";
import { formatIndianNumber } from "@/lib/utils";

interface GoalCalculationResult {
  monthsWithoutInflation: number;
  yearsWithoutInflation: number;
  monthsWithInflation: number;
  yearsWithInflation: number;
  currentNetWorth: number;
  targetAmount: number;
  monthlyContribution: number;
  progress: number;
  requiredMonthlyInvestment: number;
  shortfall: number;
}

const TARGET_AMOUNT = 10000000; // 1 Cr
const INFLATION_RATE = 0.06; // 6% annual inflation
const EXPECTED_RETURN = 0.12; // 12% annual return (default)

const calculateTimeToReachGoal = (
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number,
  annualReturn: number,
  inflationRate: number = 0
) => {
  if (monthlyContribution <= 0) {
    return { months: Infinity, years: Infinity };
  }

  const monthlyReturn = (annualReturn - inflationRate) / 12;
  const adjustedTarget = targetAmount;

  if (currentAmount >= adjustedTarget) {
    return { months: 0, years: 0 };
  }

  let months = 0;
  let amount = currentAmount;

  while (amount < adjustedTarget && months < 600) {
    // Cap at 50 years
    amount = amount * (1 + monthlyReturn) + monthlyContribution;
    months++;
  }

  return {
    months,
    years: Math.floor(months / 12),
  };
};

const calculateRequiredMonthlyInvestment = (
  currentAmount: number,
  targetAmount: number,
  timeYears: number,
  annualReturn: number
) => {
  const monthlyReturn = annualReturn / 12;
  const totalMonths = timeYears * 12;

  if (totalMonths <= 0) return 0;

  const futureValueOfCurrent =
    currentAmount * Math.pow(1 + monthlyReturn, totalMonths);
  const remainingAmount = targetAmount - futureValueOfCurrent;

  if (remainingAmount <= 0) return 0;

  const monthlyPayment =
    remainingAmount /
    ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

  return Math.max(0, monthlyPayment);
};

export function GoalTrackerPage() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { portfolioItems, loading: portfolioLoading } = usePortfolioItems();
  const { sipData, loading: sipLoading } = useSipInvestment();

  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [calculation, setCalculation] = useState<GoalCalculationResult | null>(
    null
  );

  const calculateGoal = useCallback(() => {
    if (!stats || !portfolioItems) return;

    // Calculate current net worth
    const portfolioTotal = portfolioItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const currentNetWorth = portfolioTotal;

    // Calculate monthly savings available for investment
    const availableForInvestment = 100000;

    // Calculate time without inflation
    const { months: monthsWithoutInflation, years: yearsWithoutInflation } =
      calculateTimeToReachGoal(
        currentNetWorth,
        TARGET_AMOUNT,
        availableForInvestment,
        EXPECTED_RETURN,
        0
      );

    // Calculate time with inflation
    const inflationAdjustedTarget =
      TARGET_AMOUNT * Math.pow(1 + INFLATION_RATE, yearsWithoutInflation);
    const { months: monthsWithInflation, years: yearsWithInflation } =
      calculateTimeToReachGoal(
        currentNetWorth,
        inflationAdjustedTarget,
        availableForInvestment,
        EXPECTED_RETURN,
        INFLATION_RATE
      );

    // Progress calculation - based on inflation toggle
    const currentTarget = inflationAdjusted
      ? inflationAdjustedTarget
      : TARGET_AMOUNT;
    const progress = (currentNetWorth / currentTarget) * 100;

    // Calculate required monthly investment to reach goal in reasonable time (10 years)
    const targetTimeYears = 10;
    const requiredMonthlyInvestment = calculateRequiredMonthlyInvestment(
      currentNetWorth,
      currentTarget,
      targetTimeYears,
      EXPECTED_RETURN
    );

    const shortfall = Math.max(
      0,
      requiredMonthlyInvestment - availableForInvestment
    );

    setCalculation({
      monthsWithoutInflation,
      yearsWithoutInflation,
      monthsWithInflation,
      yearsWithInflation,
      currentNetWorth,
      targetAmount: currentTarget,
      monthlyContribution: availableForInvestment,
      progress,
      requiredMonthlyInvestment,
      shortfall,
    });
  }, [stats, portfolioItems, inflationAdjusted]);

  useEffect(() => {
    if (
      !statsLoading &&
      !portfolioLoading &&
      !sipLoading &&
      stats &&
      portfolioItems
    ) {
      calculateGoal();
    }
  }, [
    stats,
    portfolioItems,
    sipData,
    inflationAdjusted,
    statsLoading,
    portfolioLoading,
    sipLoading,
    calculateGoal,
  ]);

  if (statsLoading || portfolioLoading || sipLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Goal Tracker</h1>
          <p className="mt-2 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Goal Tracker</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Track your progress towards reaching ₹1 Crore net worth
        </p>
      </div>

      {/* Inflation Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculation Settings
              </CardTitle>
              <CardDescription>
                Adjust your calculation preferences
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="inflation-toggle">Post Inflation</Label>
              <Switch
                id="inflation-toggle"
                checked={inflationAdjusted}
                onCheckedChange={setInflationAdjusted}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {inflationAdjusted
              ? "Calculations include 6% annual inflation rate"
              : "Calculations are at current value without inflation adjustment"}
          </div>
        </CardContent>
      </Card>

      {/* Goal Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Net Worth
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{formatIndianNumber(calculation?.currentNetWorth || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total portfolio value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{formatIndianNumber(calculation?.targetAmount || TARGET_AMOUNT)}
            </div>
            <p className="text-xs text-muted-foreground">
              {inflationAdjusted ? "Inflation adjusted" : "Current value"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Investment
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{formatIndianNumber(calculation?.monthlyContribution || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available monthly savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculation?.progress.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Goal completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>
            Your journey to ₹1 Crore{" "}
            {inflationAdjusted ? "(inflation adjusted)" : "(current value)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-lg font-bold text-blue-600">
                {calculation?.progress.toFixed(1)}%
              </span>
            </div>
            <Progress value={calculation?.progress || 0} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                ₹{formatIndianNumber(calculation?.currentNetWorth || 0)}
              </span>
              <span>
                ₹
                {formatIndianNumber(calculation?.targetAmount || TARGET_AMOUNT)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time to Goal */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time to Reach Goal
            </CardTitle>
            <CardDescription>
              Based on current savings and investment rate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Without Inflation:</span>
                <span className="text-lg font-bold text-green-600">
                  {calculation?.yearsWithoutInflation === Infinity
                    ? "∞"
                    : `${calculation?.yearsWithoutInflation} years ${
                        (calculation?.monthsWithoutInflation || 0) % 12
                      } months`}
                </span>
              </div>

              {inflationAdjusted && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    With 6% Inflation:
                  </span>
                  <span className="text-lg font-bold text-orange-600">
                    {calculation?.yearsWithInflation === Infinity
                      ? "∞"
                      : `${calculation?.yearsWithInflation} years ${
                          (calculation?.monthsWithInflation || 0) % 12
                        } months`}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
