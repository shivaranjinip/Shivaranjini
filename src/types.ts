export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
}

export interface BudgetLimit {
  category: string;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
}

export interface AIInsight {
  status: 'optimal' | 'warning' | 'alert';
  generalAdvice: string;
  categoryDeepDive: string;
  actionableSteps: string[];
}

export interface ExpenseSummary {
  category: string;
  amount: number;
  percentage: number;
}
