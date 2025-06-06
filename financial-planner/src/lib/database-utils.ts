import { DatabaseService, db } from "./database";
import type {
  UserProfile,
  ExpenseItem,
  SipInvestment,
  FinancialGoal,
  Transaction,
  DashboardStats,
} from "./database";

// Interface for exported/imported data
interface ExportedData {
  userProfiles?: UserProfile[];
  expenses?: ExpenseItem[];
  sipInvestments?: SipInvestment[];
  financialGoals?: FinancialGoal[];
  transactions?: Transaction[];
  dashboardStats?: DashboardStats[];
  exportDate?: string;
}

// Declare global window extensions for development
declare global {
  interface Window {
    DatabaseUtils: typeof DatabaseUtils;
    DatabaseService: typeof DatabaseService;
    db: typeof db;
  }
}

// Utility functions for database management and debugging
export class DatabaseUtils {
  // Clear all data (useful for testing)
  static async clearAllData() {
    try {
      // Split into multiple transactions to avoid argument limit
      await db.transaction("rw", [db.userProfiles, db.expenses], async () => {
        await db.userProfiles.clear();
        await db.expenses.clear();
      });

      await db.transaction(
        "rw",
        [db.sipInvestments, db.financialGoals],
        async () => {
          await db.sipInvestments.clear();
          await db.financialGoals.clear();
        }
      );

      await db.transaction(
        "rw",
        [db.transactions, db.dashboardStats],
        async () => {
          await db.transactions.clear();
          await db.dashboardStats.clear();
        }
      );

      console.log("All data cleared successfully");
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  }

  // Reset to default data
  static async resetToDefaults() {
    await this.clearAllData();
    await DatabaseService.initializeDefaultData();
    console.log("Database reset to defaults");
  }

  // Export all data
  static async exportData() {
    try {
      const data: ExportedData = {
        userProfiles: await db.userProfiles.toArray(),
        expenses: await db.expenses.toArray(),
        sipInvestments: await db.sipInvestments.toArray(),
        financialGoals: await db.financialGoals.toArray(),
        transactions: await db.transactions.toArray(),
        dashboardStats: await db.dashboardStats.toArray(),
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("Data exported successfully");
      return data;
    } catch (error) {
      console.error("Error exporting data:", error);
      throw error;
    }
  }

  // Import data from JSON
  static async importData(jsonData: ExportedData) {
    try {
      await this.clearAllData();

      // Split into multiple transactions to avoid argument limit
      await db.transaction("rw", [db.userProfiles, db.expenses], async () => {
        if (jsonData.userProfiles)
          await db.userProfiles.bulkAdd(jsonData.userProfiles);
        if (jsonData.expenses) await db.expenses.bulkAdd(jsonData.expenses);
      });

      await db.transaction(
        "rw",
        [db.sipInvestments, db.financialGoals],
        async () => {
          if (jsonData.sipInvestments)
            await db.sipInvestments.bulkAdd(jsonData.sipInvestments);
          if (jsonData.financialGoals)
            await db.financialGoals.bulkAdd(jsonData.financialGoals);
        }
      );

      await db.transaction(
        "rw",
        [db.transactions, db.dashboardStats],
        async () => {
          if (jsonData.transactions)
            await db.transactions.bulkAdd(jsonData.transactions);
          if (jsonData.dashboardStats)
            await db.dashboardStats.bulkAdd(jsonData.dashboardStats);
        }
      );

      console.log("Data imported successfully");
    } catch (error) {
      console.error("Error importing data:", error);
      throw error;
    }
  }

  // Get database statistics
  static async getDatabaseStats() {
    try {
      const stats = {
        userProfiles: await db.userProfiles.count(),
        expenses: await db.expenses.count(),
        sipInvestments: await db.sipInvestments.count(),
        financialGoals: await db.financialGoals.count(),
        transactions: await db.transactions.count(),
        dashboardStats: await db.dashboardStats.count(),
      };

      console.log("Database Statistics:", stats);
      return stats;
    } catch (error) {
      console.error("Error getting database stats:", error);
      throw error;
    }
  }

  // Add sample transactions for testing
  static async addSampleTransactions() {
    try {
      const sampleTransactions = [
        {
          description: "Salary Credit",
          amount: 85000,
          type: "income" as const,
          category: "Salary",
          date: new Date(),
        },
        {
          description: "Rent Payment",
          amount: -25000,
          type: "expense" as const,
          category: "Housing",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
        {
          description: "SIP Investment",
          amount: -10000,
          type: "investment" as const,
          category: "Mutual Funds",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          description: "Grocery Shopping",
          amount: -3500,
          type: "expense" as const,
          category: "Food",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
          description: "Emergency Fund Contribution",
          amount: -5000,
          type: "goal_contribution" as const,
          category: "Emergency Fund",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        },
      ];

      for (const transaction of sampleTransactions) {
        await DatabaseService.addTransaction(transaction);
      }

      console.log("Sample transactions added successfully");
    } catch (error) {
      console.error("Error adding sample transactions:", error);
      throw error;
    }
  }
}

// Make utilities available globally for debugging (only in development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.DatabaseUtils = DatabaseUtils;
  window.DatabaseService = DatabaseService;
  window.db = db;
}
