import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, DollarSign } from "lucide-react";
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
const SAVINGS_RETURN = 0.03; // 3% annual return for savings account
const MONTHLY_INVESTMENT = 100000; // ₹1 lac for investments at 12% return
const MONTHLY_SAVINGS = 200000 - 40000 - MONTHLY_INVESTMENT; // ₹60k for savings account at 4% return

const calculateTimeToReachGoal = (
  currentAmount: number,
  targetAmount: number,
  monthlyInvestment: number,
  monthlySavings: number,
  investmentReturn: number,
  savingsReturn: number,
  inflationRate: number = 0
) => {
  if (monthlyInvestment <= 0 && monthlySavings <= 0) {
    return { months: Infinity, years: Infinity };
  }

  const monthlyInvestmentReturn = (investmentReturn - inflationRate) / 12;
  const monthlySavingsReturn = (savingsReturn - inflationRate) / 12;
  const adjustedTarget = targetAmount;

  if (currentAmount >= adjustedTarget) {
    return { months: 0, years: 0 };
  }

  let months = 0;
  let investmentAmount = currentAmount;
  let savingsAmount = 0;

  while (investmentAmount + savingsAmount < adjustedTarget && months < 600) {
    // Cap at 50 years
    investmentAmount =
      investmentAmount * (1 + monthlyInvestmentReturn) + monthlyInvestment;
    savingsAmount = savingsAmount * (1 + monthlySavingsReturn) + monthlySavings;
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
  investmentReturn: number,
  savingsReturn: number,
  monthlySavings: number
) => {
  const monthlyInvestmentReturn = investmentReturn / 12;
  const monthlySavingsReturn = savingsReturn / 12;
  const totalMonths = timeYears * 12;

  if (totalMonths <= 0) return 0;

  // Calculate future value of current investment amount
  const futureValueOfCurrent =
    currentAmount * Math.pow(1 + monthlyInvestmentReturn, totalMonths);

  // Calculate future value of savings contributions
  const futureValueOfSavings =
    monthlySavings *
    ((Math.pow(1 + monthlySavingsReturn, totalMonths) - 1) /
      monthlySavingsReturn);

  const remainingAmount =
    targetAmount - futureValueOfCurrent - futureValueOfSavings;

  if (remainingAmount <= 0) return 0;

  const monthlyInvestmentPayment =
    remainingAmount /
    ((Math.pow(1 + monthlyInvestmentReturn, totalMonths) - 1) /
      monthlyInvestmentReturn);

  return Math.max(0, monthlyInvestmentPayment);
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

    // Monthly amounts

    // Calculate time without inflation
    const { months: monthsWithoutInflation, years: yearsWithoutInflation } =
      calculateTimeToReachGoal(
        currentNetWorth,
        TARGET_AMOUNT,
        MONTHLY_INVESTMENT,
        MONTHLY_SAVINGS,
        EXPECTED_RETURN,
        SAVINGS_RETURN,
        0
      );

    // Calculate time with inflation
    const inflationAdjustedTarget =
      TARGET_AMOUNT * Math.pow(1 + INFLATION_RATE, yearsWithoutInflation);
    const { months: monthsWithInflation, years: yearsWithInflation } =
      calculateTimeToReachGoal(
        currentNetWorth,
        inflationAdjustedTarget,
        MONTHLY_INVESTMENT,
        MONTHLY_SAVINGS,
        EXPECTED_RETURN,
        SAVINGS_RETURN,
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
      EXPECTED_RETURN,
      SAVINGS_RETURN,
      MONTHLY_SAVINGS
    );

    const shortfall = Math.max(
      0,
      requiredMonthlyInvestment - MONTHLY_INVESTMENT
    );

    setCalculation({
      monthsWithoutInflation,
      yearsWithoutInflation,
      monthsWithInflation,
      yearsWithInflation,
      currentNetWorth,
      targetAmount: currentTarget,
      monthlyContribution: MONTHLY_INVESTMENT + MONTHLY_SAVINGS,
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
      {/* Header with Inflation Toggle */}
      <div className="flex items-start justify-between">
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold tracking-tight">Goal Tracker</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Track your progress towards reaching ₹1 Crore net worth
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="inflation-toggle" className="text-sm font-medium">
              Post Inflation
            </Label>
            <Switch
              id="inflation-toggle"
              checked={inflationAdjusted}
              onCheckedChange={setInflationAdjusted}
            />
          </div>
          <div className="text-xs text-muted-foreground text-right max-w-48">
            {inflationAdjusted
              ? "Calculations include 6% annual inflation rate"
              : "Calculations are at current value without inflation adjustment"}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-lg font-bold text-blue-600">
                {inflationAdjusted
                  ? calculation?.yearsWithInflation === Infinity
                    ? "∞ years"
                    : `${calculation?.yearsWithInflation}y ${
                        (calculation?.monthsWithInflation || 0) % 12
                      }m left`
                  : calculation?.yearsWithoutInflation === Infinity
                  ? "∞ years"
                  : `${calculation?.yearsWithoutInflation}y ${
                      (calculation?.monthsWithoutInflation || 0) % 12
                    }m left`}
              </span>
            </div>
            <Progress
              value={calculation?.progress || 0}
              className="h-3 [&>div]:bg-blue-600"
            />
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
      </div>

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
              ₹{formatIndianNumber(MONTHLY_INVESTMENT)}
            </div>
            <p className="text-xs text-muted-foreground">
              at 12% annual return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Savings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{formatIndianNumber(MONTHLY_SAVINGS)}
            </div>
            <p className="text-xs text-muted-foreground">at 3% annual return</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
