import { useState } from "react";
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
import { useUserProfile, usePortfolioItems } from "@/hooks/useFinancialData";
import { formatIndianNumber } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Icon mapping for database stored icons
const iconMap = {
  DollarSign,
  TrendingUp,
  PiggyBank,
  Wallet,
  Target,
};

interface PortfolioItem {
  id?: number;
  itemId: string;
  name: string;
  category: string;
  amount: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

export function PortfolioPage() {
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const {
    portfolioItems: dbPortfolioItems,
    loading: portfolioLoading,
    updatePortfolioItem,
    refresh: refreshPortfolioItems,
  } = usePortfolioItems();

  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  // Convert database portfolio items to component format
  const portfolioItems: PortfolioItem[] = dbPortfolioItems.map((item) => ({
    ...item,
    icon: iconMap[item.icon as keyof typeof iconMap] || DollarSign,
  }));

  // Add income item from profile
  const incomeItem: PortfolioItem = {
    itemId: "income",
    name: "Monthly Income",
    category: "Income",
    amount: profile?.monthlyIncome || 0,
    icon: DollarSign,
    color: "bg-green-100 text-green-600",
    description: "Your total monthly income from all sources",
  };

  const allPortfolioItems = [incomeItem, ...portfolioItems];

  const handleAmountUpdate = async (itemId: string, newAmount: number) => {
    // If it's income, update the user profile
    if (itemId === "income" && profile) {
      try {
        await updateProfile({ monthlyIncome: newAmount });
      } catch (error) {
        console.error("Error updating income:", error);
      }
    } else {
      // Update portfolio item in database
      try {
        await updatePortfolioItem(itemId, { amount: newAmount });
      } catch (error) {
        console.error("Error updating portfolio item:", error);
      }
    }
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    try {
      // Trigger recalculation of dashboard stats
      await DatabaseService.recalculateDashboardStats();
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Run migrations first to ensure data consistency
      const migrationsApplied = await DatabaseService.migratePortfolioData();

      // Refresh portfolio items from database
      await refreshPortfolioItems();

      setLastSaved(new Date());

      // Show feedback if migrations were applied
      if (migrationsApplied > 0) {
        console.log(
          `Portfolio refreshed with ${migrationsApplied} data migrations applied`
        );
      }
    } catch (error) {
      console.error("Error refreshing portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total assets excluding income
  const totalAssets = portfolioItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const groupedItems = allPortfolioItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, PortfolioItem[]>);

  if (profileLoading || portfolioLoading) {
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
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="mr-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
        </div>

        {/* Pie Chart */}
        <div className="space-y-4">
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Portfolio Items by Category */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {allPortfolioItems.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.itemId}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color} flex-shrink-0`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base leading-tight">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="text-sm leading-tight mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      id={`amount-${item.itemId}`}
                      type="text"
                      value={
                        localValues[item.itemId] ??
                        `₹${formatIndianNumber(item.amount)}`
                      }
                      onChange={(e) => {
                        // Remove ₹ symbol and commas for editing
                        const rawValue = e.target.value.replace(/[₹,]/g, "");
                        setLocalValues((prev) => ({
                          ...prev,
                          [item.itemId]: rawValue,
                        }));
                      }}
                      onBlur={(e) => {
                        const rawValue = e.target.value.replace(/[₹,]/g, "");
                        const numericValue = parseFloat(rawValue) || 0;
                        handleAmountUpdate(item.itemId, numericValue);
                        // Format the value after saving
                        setLocalValues((prev) => ({
                          ...prev,
                          [item.itemId]: `₹${formatIndianNumber(numericValue)}`,
                        }));
                      }}
                      onFocus={(e) => {
                        // Show raw number for editing
                        const rawValue = e.target.value.replace(/[₹,]/g, "");
                        setLocalValues((prev) => ({
                          ...prev,
                          [item.itemId]: rawValue,
                        }));
                      }}
                      placeholder="₹0"
                      className="text-center bg-transparent border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 rounded-none px-0 pb-2 transition-colors duration-200"
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
