import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  Wallet,
  Target,
  Save,
  RefreshCw,
} from "lucide-react";
import { DatabaseService } from "@/lib/database";
import { useUserProfile } from "@/hooks/useFinancialData";
import { formatIndianNumber } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface PortfolioItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

export function PortfolioPage() {
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: "income",
      name: "Monthly Income",
      category: "Income",
      amount: 0,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      description: "Your total monthly income from all sources",
    },
    {
      id: "savings",
      name: "Savings Account",
      category: "Cash",
      amount: 150000,
      icon: PiggyBank,
      color: "bg-blue-100 text-blue-600",
      description: "Emergency fund and liquid savings",
    },
    {
      id: "mutual_funds",
      name: "Mutual Funds",
      category: "Investments",
      amount: 85000,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
      description: "SIP and lump sum mutual fund investments",
    },
    {
      id: "fixed_deposits",
      name: "Fixed Deposits",
      category: "Safe Investments",
      amount: 200000,
      icon: Wallet,
      color: "bg-teal-100 text-teal-600",
      description: "FDs and other fixed income instruments",
    },
    {
      id: "epf",
      name: "EPF/PPF",
      category: "Retirement",
      amount: 125000,
      icon: Target,
      color: "bg-rose-100 text-rose-600",
      description: "Provident fund and retirement savings",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (profile) {
      // Update the income item with actual data
      setPortfolioItems((prev) =>
        prev.map((item) =>
          item.id === "income"
            ? { ...item, amount: profile.monthlyIncome }
            : item
        )
      );
    }
  }, [profile]);

  const handleAmountUpdate = async (itemId: string, newAmount: number) => {
    // Update the local state immediately
    setPortfolioItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, amount: newAmount } : item
      )
    );

    // If it's income, update the user profile
    if (itemId === "income" && profile) {
      try {
        await updateProfile({ monthlyIncome: newAmount });
      } catch (error) {
        console.error("Error updating income:", error);
      }
    }
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    try {
      // Save income to profile
      const incomeItem = portfolioItems.find((item) => item.id === "income");
      if (incomeItem && profile) {
        await DatabaseService.updateUserProfile({
          monthlyIncome: incomeItem.amount,
        });
      }

      // Here you would save other portfolio items to a separate table if needed
      // For now, we'll just update the timestamp
      setLastSaved(new Date());

      // Recalculate dashboard stats
      await DatabaseService.recalculateDashboardStats();
    } catch (error) {
      console.error("Error saving portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAssets = portfolioItems
    .filter((item) => item.id !== "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const groupedItems = portfolioItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, PortfolioItem[]>);

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Portfolio Overview
          </h1>
          <p className="text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Portfolio Overview
          </h1>
          <p className="text-muted-foreground">
            Manage your assets and income sources
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <div className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          <Button onClick={handleSaveAll} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Net Worth and Asset Allocation Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Net Worth Display */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-muted-foreground">
              Total Net Worth
            </h2>
            <p className="text-4xl font-bold text-foreground">
              ₹{formatIndianNumber(totalAssets)}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Monthly Income
              </span>
              <span className="text-sm font-medium">
                ₹
                {formatIndianNumber(
                  portfolioItems.find((item) => item.id === "income")?.amount ||
                    0
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Total Assets
              </span>
              <span className="text-sm font-medium">
                ₹{formatIndianNumber(totalAssets)}
              </span>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-muted-foreground">
            Asset Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(groupedItems)
                    .filter(([category]) => category !== "Income")
                    .map(([category, items]) => {
                      const categoryTotal = items.reduce(
                        (sum, item) => sum + item.amount,
                        0
                      );
                      return {
                        name: category,
                        value: categoryTotal,
                        percentage:
                          totalAssets > 0
                            ? ((categoryTotal / totalAssets) * 100).toFixed(1)
                            : 0,
                      };
                    })}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                >
                  {Object.entries(groupedItems)
                    .filter(([category]) => category !== "Income")
                    .map((_, index) => {
                      const colors = [
                        "#3b82f6",
                        "#8b5cf6",
                        "#f97316",
                        "#06b6d4",
                        "#ef4444",
                      ];
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      );
                    })}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `₹${formatIndianNumber(Number(value))}`,
                    "Amount",
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Portfolio Items by Category */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {portfolioItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color} flex-shrink-0`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base leading-tight">{item.name}</CardTitle>
                    <CardDescription className="text-sm leading-tight mt-1">{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id={`amount-${item.id}`}
                      type="number"
                      value={item.amount}
                      onChange={(e) =>
                        handleAmountUpdate(
                          item.id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="₹0"
                      className="text-right"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
