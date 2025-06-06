import Dexie from "dexie";

// Interface definitions for all financial data types
export interface UserProfile {
  id?: number;
  name: string;
  email?: string;
  monthlyIncome: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseItem {
  id?: number;
  category: string;
  amount: number;
  userId: number;
  createdAt: Date;
}

export interface SipInvestment {
  id?: number;
  name: string;
  monthlyInvestment: number;
  expectedReturn: number;
  investmentPeriod: number;
  userId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialGoal {
  id?: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  category: "emergency" | "house" | "vacation" | "retirement" | "other";
  userId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id?: number;
  description: string;
  amount: number;
  type: "income" | "expense" | "investment" | "goal_contribution";
  category: string;
  date: Date;
  userId: number;
}

export interface DashboardStats {
  id?: number;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  lastUpdated: Date;
  userId: number;
}

// Database class extending Dexie
export class FinancialPlannerDB extends Dexie {
  userProfiles!: Dexie.Table<UserProfile, number>;
  expenses!: Dexie.Table<ExpenseItem, number>;
  sipInvestments!: Dexie.Table<SipInvestment, number>;
  financialGoals!: Dexie.Table<FinancialGoal, number>;
  transactions!: Dexie.Table<Transaction, number>;
  dashboardStats!: Dexie.Table<DashboardStats, number>;

  constructor() {
    super("FinancialPlannerDB");

    this.version(1).stores({
      userProfiles: "++id, name, email, monthlyIncome, createdAt, updatedAt",
      expenses: "++id, category, amount, userId, createdAt",
      sipInvestments:
        "++id, name, monthlyInvestment, expectedReturn, investmentPeriod, userId, isActive, createdAt, updatedAt",
      financialGoals:
        "++id, name, targetAmount, currentAmount, targetDate, category, userId, isActive, createdAt, updatedAt",
      transactions: "++id, description, amount, type, category, date, userId",
      dashboardStats:
        "++id, totalBalance, monthlyIncome, monthlyExpenses, monthlySavings, lastUpdated, userId",
    });
  }
}

// Create database instance
export const db = new FinancialPlannerDB();

// Default user ID (for single-user app)
const DEFAULT_USER_ID = 1;

// Helper functions for database operations
export class DatabaseService {
  // Initialize default data for new users
  static async initializeDefaultData() {
    try {
      // Check if user already exists
      const existingUser = await db.userProfiles.get(DEFAULT_USER_ID);
      if (existingUser) return;

      // Create default user profile
      await db.userProfiles.add({
        id: DEFAULT_USER_ID,
        name: "User",
        monthlyIncome: 85000,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create default expenses
      const defaultExpenses: Omit<ExpenseItem, "id">[] = [
        {
          category: "Housing",
          amount: 25000,
          userId: DEFAULT_USER_ID,
          createdAt: new Date(),
        },
        {
          category: "Food",
          amount: 8000,
          userId: DEFAULT_USER_ID,
          createdAt: new Date(),
        },
        {
          category: "Transportation",
          amount: 5000,
          userId: DEFAULT_USER_ID,
          createdAt: new Date(),
        },
        {
          category: "Utilities",
          amount: 3000,
          userId: DEFAULT_USER_ID,
          createdAt: new Date(),
        },
      ];
      await db.expenses.bulkAdd(defaultExpenses);

      // Create default SIP investment
      await db.sipInvestments.add({
        id: 1,
        name: "Default SIP",
        monthlyInvestment: 10000,
        expectedReturn: 12,
        investmentPeriod: 15,
        userId: DEFAULT_USER_ID,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create default financial goals
      const defaultGoals: Omit<FinancialGoal, "id">[] = [
        {
          name: "Emergency Fund",
          targetAmount: 500000,
          currentAmount: 375000,
          category: "emergency",
          userId: DEFAULT_USER_ID,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Home Down Payment",
          targetAmount: 2000000,
          currentAmount: 900000,
          category: "house",
          userId: DEFAULT_USER_ID,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Vacation Fund",
          targetAmount: 150000,
          currentAmount: 135000,
          category: "vacation",
          userId: DEFAULT_USER_ID,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      await db.financialGoals.bulkAdd(defaultGoals);

      // Create default dashboard stats
      await db.dashboardStats.add({
        id: DEFAULT_USER_ID,
        totalBalance: 245000,
        monthlyIncome: 85000,
        monthlyExpenses: 52000,
        monthlySavings: 33000,
        lastUpdated: new Date(),
        userId: DEFAULT_USER_ID,
      });
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  // User Profile operations
  static async getUserProfile(): Promise<UserProfile | undefined> {
    return await db.userProfiles.get(DEFAULT_USER_ID);
  }

  static async updateUserProfile(updates: Partial<UserProfile>) {
    await db.userProfiles.update(DEFAULT_USER_ID, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Expense operations
  static async getExpenses(): Promise<ExpenseItem[]> {
    return await db.expenses.where("userId").equals(DEFAULT_USER_ID).toArray();
  }

  static async addExpense(
    expense: Omit<ExpenseItem, "id" | "userId" | "createdAt">
  ) {
    return await db.expenses.add({
      ...expense,
      userId: DEFAULT_USER_ID,
      createdAt: new Date(),
    });
  }

  static async updateExpense(id: number, updates: Partial<ExpenseItem>) {
    await db.expenses.update(id, updates);
  }

  static async deleteExpense(id: number) {
    await db.expenses.delete(id);
  }

  // SIP operations
  static async getSipInvestments(): Promise<SipInvestment[]> {
    return await db.sipInvestments
      .where("userId")
      .equals(DEFAULT_USER_ID)
      .toArray();
  }

  static async getActiveSipInvestment(): Promise<SipInvestment | undefined> {
    return await db.sipInvestments
      .where("userId")
      .equals(DEFAULT_USER_ID)
      .and((sip) => sip.isActive)
      .first();
  }

  static async updateSipInvestment(updates: Partial<SipInvestment>) {
    const activeSip = await this.getActiveSipInvestment();
    if (activeSip && activeSip.id) {
      await db.sipInvestments.update(activeSip.id, {
        ...updates,
        updatedAt: new Date(),
      });
    }
  }

  // Financial Goals operations
  static async getFinancialGoals(): Promise<FinancialGoal[]> {
    return await db.financialGoals
      .where("userId")
      .equals(DEFAULT_USER_ID)
      .and((goal) => goal.isActive)
      .toArray();
  }

  static async updateGoalProgress(id: number, currentAmount: number) {
    await db.financialGoals.update(id, {
      currentAmount,
      updatedAt: new Date(),
    });
  }

  // Dashboard Stats operations
  static async getDashboardStats(): Promise<DashboardStats | undefined> {
    return await db.dashboardStats.get(DEFAULT_USER_ID);
  }

  static async updateDashboardStats(stats: Partial<DashboardStats>) {
    await db.dashboardStats.update(DEFAULT_USER_ID, {
      ...stats,
      lastUpdated: new Date(),
    });
  }

  // Transaction operations
  static async getRecentTransactions(
    limit: number = 10
  ): Promise<Transaction[]> {
    return await db.transactions
      .where("userId")
      .equals(DEFAULT_USER_ID)
      .reverse()
      .limit(limit)
      .toArray();
  }

  static async addTransaction(transaction: Omit<Transaction, "id" | "userId">) {
    return await db.transactions.add({
      ...transaction,
      userId: DEFAULT_USER_ID,
    });
  }

  // Utility function to recalculate dashboard stats
  static async recalculateDashboardStats() {
    const expenses = await this.getExpenses();
    const userProfile = await this.getUserProfile();

    if (!userProfile) return;

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const monthlySavings = userProfile.monthlyIncome - totalExpenses;

    await this.updateDashboardStats({
      monthlyIncome: userProfile.monthlyIncome,
      monthlyExpenses: totalExpenses,
      monthlySavings,
    });
  }
}

// Initialize database when module loads
DatabaseService.initializeDefaultData().catch(console.error);
