import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Coins,
  PiggyBank,
  Wallet,
  Target,
  Save,
  RefreshCw,
} from "lucide-react";
import { DatabaseService } from "@/lib/database";
import { useUserProfile } from "@/hooks/useFinancialData";
import { formatIndianNumber } from "@/lib/utils";

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
      id: "stocks",
      name: "Direct Stocks",
      category: "Investments",
      amount: 45000,
      icon: Coins,
      color: "bg-orange-100 text-orange-600",
      description: "Individual stock holdings",
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

      {/* Portfolio Items by Category */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">{category}</Badge>
                <span className="text-lg">{category} Portfolio</span>
              </CardTitle>
              <CardDescription>
                Manage your {category.toLowerCase()} investments and values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {items.map((item) => {
                  const Icon = item.icon;
                  const categoryTotal = items.reduce(
                    (sum, i) => sum + i.amount,
                    0
                  );
                  const percentage =
                    categoryTotal > 0 ? (item.amount / categoryTotal) * 100 : 0;

                  return (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`amount-${item.id}`}>
                          Amount {item.id === "income" ? "(Monthly)" : ""}
                        </Label>
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

                      {items.length > 1 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Share in {category}</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-1" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Asset Allocation Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>
            Distribution of your wealth across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groupedItems)
              .filter(([category]) => category !== "Income")
              .map(([category, items]) => {
                const categoryTotal = items.reduce(
                  (sum, item) => sum + item.amount,
                  0
                );
                const percentage =
                  totalAssets > 0 ? (categoryTotal / totalAssets) * 100 : 0;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category}</span>
                      <span>
                        ₹{formatIndianNumber(categoryTotal)} (
                        {percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
