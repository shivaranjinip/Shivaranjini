import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Transaction, SavingsGoal } from '../types';

interface SummaryCardsProps {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
}

export function SummaryCards({ transactions, savingsGoals }: SummaryCardsProps) {
  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expenses;

  const totalSavedInGoals = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      id: 'summary-balance',
      title: 'Current Balance',
      value: balance,
      formatted: formatCurrency(balance),
      icon: Wallet,
      color: balance >= 0 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100',
      description: 'Total savings cash on hand',
    },
    {
      id: 'summary-income',
      title: 'Total Income',
      value: income,
      formatted: formatCurrency(income),
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      description: 'Incoming salary & cash inflow',
    },
    {
      id: 'summary-expenses',
      title: 'Total Expenses',
      value: expenses,
      formatted: formatCurrency(expenses),
      icon: TrendingDown,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      description: 'Outgoing cash of all classes',
    },
    {
      id: 'summary-goals',
      title: 'Saved in Goals',
      value: totalSavedInGoals,
      formatted: formatCurrency(totalSavedInGoals),
      icon: PiggyBank,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      description: 'Reserved for targeted dreams',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="tracker-summary-cards">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{card.title}</span>
              <div className={`p-2.5 rounded-xl border ${card.color}`}>
                <Icon className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-semibold font-mono tracking-tight text-slate-800">
                {card.formatted}
              </span>
              <p className="text-xs text-slate-400 mt-1">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
