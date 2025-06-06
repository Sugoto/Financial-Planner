import { useState, useEffect } from 'react';
import { DatabaseService } from '@/lib/database';
import type { 
  ExpenseItem, 
  SipInvestment, 
  FinancialGoal, 
  DashboardStats,
  UserProfile,
  Transaction,
  PortfolioItem
} from '@/lib/database';

// Hook for managing expenses
export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    try {
      const data = await DatabaseService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Omit<ExpenseItem, 'id' | 'userId' | 'createdAt'>) => {
    try {
      await DatabaseService.addExpense(expense);
      await loadExpenses();
      await DatabaseService.recalculateDashboardStats();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const updateExpense = async (id: number, updates: Partial<ExpenseItem>) => {
    try {
      await DatabaseService.updateExpense(id, updates);
      await loadExpenses();
      await DatabaseService.recalculateDashboardStats();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      await DatabaseService.deleteExpense(id);
      await loadExpenses();
      await DatabaseService.recalculateDashboardStats();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: loadExpenses
  };
}

// Hook for managing SIP investments
export function useSipInvestment() {
  const [sipData, setSipData] = useState<SipInvestment | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSipData = async () => {
    try {
      const data = await DatabaseService.getActiveSipInvestment();
      setSipData(data || null);
    } catch (error) {
      console.error('Error loading SIP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSipInvestment = async (updates: Partial<SipInvestment>) => {
    try {
      await DatabaseService.updateSipInvestment(updates);
      await loadSipData();
    } catch (error) {
      console.error('Error updating SIP investment:', error);
    }
  };

  useEffect(() => {
    loadSipData();
  }, []);

  return {
    sipData,
    loading,
    updateSipInvestment,
    refresh: loadSipData
  };
}

// Hook for managing financial goals
export function useFinancialGoals() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGoals = async () => {
    try {
      const data = await DatabaseService.getFinancialGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error loading financial goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGoalProgress = async (id: number, currentAmount: number) => {
    try {
      await DatabaseService.updateGoalProgress(id, currentAmount);
      await loadGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  return {
    goals,
    loading,
    updateGoalProgress,
    refresh: loadGoals
  };
}

// Hook for managing dashboard stats
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const data = await DatabaseService.getDashboardStats();
      setStats(data || null);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (updates: Partial<DashboardStats>) => {
    try {
      await DatabaseService.updateDashboardStats(updates);
      await loadStats();
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    updateStats,
    refresh: loadStats
  };
}

// Hook for managing user profile
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const data = await DatabaseService.getUserProfile();
      setProfile(data || null);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      await DatabaseService.updateUserProfile(updates);
      await loadProfile();
      await DatabaseService.recalculateDashboardStats();
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    refresh: loadProfile
  };
}

// Hook for managing transactions
export function useTransactions(limit: number = 10) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      const data = await DatabaseService.getRecentTransactions(limit);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    try {
      await DatabaseService.addTransaction(transaction);
      await loadTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [limit]);

  return {
    transactions,
    loading,
    addTransaction,
    refresh: loadTransactions
  };
}

// Hook for managing portfolio items
export function usePortfolioItems() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPortfolioItems = async () => {
    try {
      const data = await DatabaseService.getPortfolioItems();
      setPortfolioItems(data);
    } catch (error) {
      console.error('Error loading portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPortfolioItem = async (item: Omit<PortfolioItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await DatabaseService.addPortfolioItem(item);
      await loadPortfolioItems();
    } catch (error) {
      console.error('Error adding portfolio item:', error);
    }
  };

  const updatePortfolioItem = async (itemId: string, updates: Partial<PortfolioItem>) => {
    try {
      await DatabaseService.updatePortfolioItem(itemId, updates);
      await loadPortfolioItems();
    } catch (error) {
      console.error('Error updating portfolio item:', error);
    }
  };

  const deletePortfolioItem = async (itemId: string) => {
    try {
      await DatabaseService.deletePortfolioItem(itemId);
      await loadPortfolioItems();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
    }
  };

  useEffect(() => {
    loadPortfolioItems();
  }, []);

  return {
    portfolioItems,
    loading,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    refresh: loadPortfolioItems
  };
} 