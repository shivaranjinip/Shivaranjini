import { useState, useEffect } from 'react';
import { Transaction, BudgetLimit, SavingsGoal } from './types';
import { SummaryCards } from './components/SummaryCards';
import { ChartsView } from './components/ChartsView';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { BudgetLimits } from './components/BudgetLimits';
import { SavingsGoalsTracker } from './components/SavingsGoalsTracker';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { Plus, Check, Moon, Sun, ShieldAlert, Sparkles, LogOut } from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';
import { ExitPage } from './components/ExitPage';

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-seed-1',
    description: 'Monthly Salary Credit',
    amount: 55000,
    type: 'INCOME',
    category: 'Salary & Bonus',
    date: '2026-05-01',
    notes: 'Inflow from primary full-time role',
  },
  {
    id: 'tx-seed-2',
    description: 'Tech Freelance Payment',
    amount: 15600,
    type: 'INCOME',
    category: 'Freelance & Gig Work',
    date: '2026-05-15',
    notes: 'Paid for responsive website redesign',
  },
  {
    id: 'tx-seed-3',
    description: 'Apartment Monthly Rent',
    amount: 12000,
    type: 'EXPENSE',
    category: 'Rent & Utilities',
    date: '2026-05-02',
    notes: 'Includes landlord maintenance charges',
  },
  {
    id: 'tx-seed-4',
    description: 'Grocery Shopping D-Mart',
    amount: 4500,
    type: 'EXPENSE',
    category: 'Food & Dining',
    date: '2026-05-05',
    notes: 'Refills of kitchen staples',
  },
  {
    id: 'tx-seed-5',
    description: 'Broadband WiFi Router Bill',
    amount: 999,
    type: 'EXPENSE',
    category: 'Rent & Utilities',
    date: '2026-05-10',
    notes: 'JioFiber 150 Mbps unlimited line',
  },
  {
    id: 'tx-seed-6',
    description: 'Nike Air Max Sneakers',
    amount: 6800,
    type: 'EXPENSE',
    category: 'Shopping',
    date: '2026-05-18',
    notes: 'Bought during spring flash sale',
  },
  {
    id: 'tx-seed-7',
    description: 'Uber Taxi to Airport',
    amount: 1250,
    type: 'EXPENSE',
    category: 'Transportation',
    date: '2026-05-20',
    notes: 'Travel for weekend family event',
  },
  {
    id: 'tx-seed-8',
    description: 'Cinema Outing & Dinner',
    amount: 2200,
    type: 'EXPENSE',
    category: 'Entertainment',
    date: '2026-05-22',
    notes: 'Food and tickets for IMAX screening',
  },
];

const INITIAL_BUDGETS: BudgetLimit[] = [
  { category: 'Food & Dining', limit: 8000 },
  { category: 'Rent & Utilities', limit: 15000 },
  { category: 'Shopping', limit: 10000 },
  { category: 'Entertainment', limit: 5000 },
];

const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'MacBook Air M3 for College',
    targetAmount: 95000,
    currentAmount: 35000,
    targetDate: '2026-12-15',
  },
  {
    id: 'goal-2',
    name: 'Emergency Buffer Cushion',
    targetAmount: 30000,
    currentAmount: 18000,
    targetDate: '2026-08-31',
  },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('expense_pro_current_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isExited, setIsExited] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLoginSuccess = (email: string, name: string) => {
    const userSession = { email, name };
    setCurrentUser(userSession);
    localStorage.setItem('expense_pro_current_session', JSON.stringify(userSession));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('expense_pro_current_session');
    setIsExited(true);
    setIsLogoutModalOpen(false);
  };

  // Load and seed initial state on component mounting
  useEffect(() => {
    const cachedTransactions = localStorage.getItem('expense_pro_transactions');
    const cachedBudgets = localStorage.getItem('expense_pro_budgets');
    const cachedGoals = localStorage.getItem('expense_pro_goals');

    if (cachedTransactions) {
      setTransactions(JSON.parse(cachedTransactions));
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem('expense_pro_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
    }

    if (cachedBudgets) {
      setBudgets(JSON.parse(cachedBudgets));
    } else {
      setBudgets(INITIAL_BUDGETS);
      localStorage.setItem('expense_pro_budgets', JSON.stringify(INITIAL_BUDGETS));
    }

    if (cachedGoals) {
      setSavingsGoals(JSON.parse(cachedGoals));
    } else {
      setSavingsGoals(INITIAL_GOALS);
      localStorage.setItem('expense_pro_goals', JSON.stringify(INITIAL_GOALS));
    }
  }, []);

  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Transaction Management Handlers
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'> & { id?: string }) => {
    let updatedTransactions: Transaction[];

    if (txData.id) {
      // Editing existing record
      updatedTransactions = transactions.map((t) =>
        t.id === txData.id ? (txData as Transaction) : t
      );
    } else {
      // Appending new record
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      };
      updatedTransactions = [newTx, ...transactions];
    }

    setTransactions(updatedTransactions);
    saveToLocalStorage('expense_pro_transactions', updatedTransactions);
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to remove this transaction record?')) {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      saveToLocalStorage('expense_pro_transactions', updated);
    }
  };

  const handleEditTransactionClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  // Budget management handlers
  const handleSaveBudgetLimit = (limitData: BudgetLimit) => {
    const exists = budgets.some((b) => b.category === limitData.category);
    let updated: BudgetLimit[];

    if (exists) {
      updated = budgets.map((b) => (b.category === limitData.category ? limitData : b));
    } else {
      updated = [...budgets, limitData];
    }

    setBudgets(updated);
    saveToLocalStorage('expense_pro_budgets', updated);
  };

  const handleDeleteBudgetLimit = (category: string) => {
    const updated = budgets.filter((b) => b.category !== category);
    setBudgets(updated);
    saveToLocalStorage('expense_pro_budgets', updated);
  };

  // Saving goals handlers
  const handleCreateSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    const updated = [...savingsGoals, newGoal];
    setSavingsGoals(updated);
    saveToLocalStorage('expense_pro_goals', updated);
  };

  const handleDeleteSavingsGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this savings goal? Funding reserves will be cleared.')) {
      const updated = savingsGoals.filter((g) => g.id !== id);
      setSavingsGoals(updated);
      saveToLocalStorage('expense_pro_goals', updated);
    }
  };

  const handleAddSavingsFunds = (id: string, amount: number) => {
    const updated = savingsGoals.map((g) => {
      if (g.id === id) {
        return {
          ...g,
          currentAmount: g.currentAmount + amount,
        };
      }
      return g;
    });

    setSavingsGoals(updated);
    saveToLocalStorage('expense_pro_goals', updated);

    // Write supporting Transaction record
    const targetGoal = savingsGoals.find((g) => g.id === id);
    if (targetGoal) {
      const savingsExpense: Omit<Transaction, 'id'> = {
        description: `Fund Allocation: ${targetGoal.name}`,
        amount,
        type: 'EXPENSE',
        category: 'Other',
        date: new Date().toISOString().split('T')[0],
        notes: 'Deducted cash added to Savings Goals milestone',
      };
      
      const newTx: Transaction = {
        ...savingsExpense,
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      };
      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);
      saveToLocalStorage('expense_pro_transactions', updatedTxs);
    }
  };

  if (isExited) {
    return <ExitPage onReturnToLogin={() => setIsExited(false)} />;
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between" id="applet-viewport">
      
      {/* 🚀 Top Navigation Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 sticky top-0 z-50 shadow-xs" id="app-navigation-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <span className="font-extrabold text-xl tracking-tight">₹</span>
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-800 flex items-center gap-1.5 leading-none">
                <span>ExpensePro</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 font-bold border border-blue-100 rounded-md px-1.5 py-0.5 mt-0.5">
                  BCA Project V1
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Personal Finance Tracking and Intelligent Advice Analyzer</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-r border-slate-100 pr-3 mr-1" id="header-user-profile">
              <div id="user-avatar" className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left col-auto">
                <p className="text-xs font-bold text-slate-700 leading-none">{currentUser.name}</p>
                <p className="text-[9px] text-slate-400 font-medium mt-0.5">{currentUser.email}</p>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Today: <b className="text-slate-600 font-bold">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</b>
            </span>
            <button
              id="btn-trigger-add-transaction"
              onClick={() => {
                setEditingTransaction(null);
                setIsFormOpen(true);
              }}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Income / Expense</span>
            </button>

            <button
              id="btn-trigger-logout"
              onClick={() => setIsLogoutModalOpen(true)}
              className="py-2.5 px-3 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
              title="Exit to Login Page"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📊 Main Content Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-1 w-full space-y-6" id="app-workspace-body">
        
        {/* Statistics Cards widgets Row */}
        <section id="stats-section">
          <SummaryCards transactions={transactions} savingsGoals={savingsGoals} />
        </section>

        {/* Analytics Dashboard (Charts Grid) */}
        <section id="charts-section">
          <ChartsView transactions={transactions} />
        </section>

        {/* Ledger and Side managers split panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ledger-splits">
          
          {/* Columns Left: Transaction actions / limits / goals */}
          <div className="lg:col-span-4 space-y-6 flex flex-col h-full justify-between" id="actions-columns-left">
            {/* Target Budgets progress lists */}
            <div className="flex-1" id="wrapper-budgets">
              <BudgetLimits
                limits={budgets}
                transactions={transactions}
                onSaveLimit={handleSaveBudgetLimit}
                onDeleteLimit={handleDeleteBudgetLimit}
              />
            </div>

            {/* Savings Goal Progress */}
            <div className="flex-1 mt-6 lg:mt-0" id="wrapper-savings font-sans">
              <SavingsGoalsTracker
                goals={savingsGoals}
                onAddGoal={handleCreateSavingsGoal}
                onDeleteGoal={handleDeleteSavingsGoal}
                onAddFunds={handleAddSavingsFunds}
              />
            </div>
          </div>

          {/* Columns Right: Financial Ledger & Intelligent AI advice manager */}
          <div className="lg:col-span-8 space-y-6 flex flex-col h-full" id="actions-columns-right">
            
            {/* AI Insights Board */}
            <div id="wrapper-ai-advisor" className="order-first">
              <AIInsightsPanel
                transactions={transactions}
                budgets={budgets}
                savingsGoals={savingsGoals}
              />
            </div>

            {/* Core Financial accounting ledger table list */}
            <div className="flex-1" id="wrapper-ledger">
              <TransactionList
                transactions={transactions}
                onDeleteTransaction={handleDeleteTransaction}
                onEditTransaction={handleEditTransactionClick}
              />
            </div>

          </div>

        </div>

      </main>

      {/* 📜 Footer Credits Section */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400" id="app-credits-footer">
        <p className="font-semibold text-slate-500">ExpensePro - Personal expensesTracker</p>
        <p className="mt-1">Successfully designed for BCA Fifth/Sixth Semester Final Year Project Demonstration</p>
        <p className="mt-2 text-[10px] text-slate-300">© 2026 ExpensePro Project Applet. Local client storage data persistent.</p>
      </footer>

      {/* 📝 Record / Edit Transaction Modal */}
      {isFormOpen && (
        <div id="transaction-modal-overlay" className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md shadow-2xl relative" id="transaction-modal-content">
            <TransactionForm
              onSave={handleSaveTransaction}
              editingTransaction={editingTransaction}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingTransaction(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 🔐 Full Custom Logout Modal Confirmation Dialog */}
      {isLogoutModalOpen && (
        <div id="logout-confirm-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 text-amber-600">
              <ShieldAlert className="w-5.5 h-5.5 animate-pulse" />
              <span className="font-bold text-sm uppercase tracking-wide">Confirm Exit</span>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to log out and terminate your current ExpensePro secure workspace session? Your budget and ledger targets will remain cached on your device.
            </p>

            <div className="flex gap-2.5 pt-1.5">
              <button
                type="button"
                id="btn-close-logout-modal"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                id="btn-confirm-secure-logout"
                onClick={handleLogout}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
              >
                Yes, Secure Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
