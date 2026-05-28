import React, { useState } from 'react';
import { BudgetLimit, Transaction } from '../types';
import { AlertTriangle, ShieldCheck, Plus, Trash2, Edit } from 'lucide-react';

interface BudgetLimitsProps {
  limits: BudgetLimit[];
  transactions: Transaction[];
  onSaveLimit: (limit: BudgetLimit) => void;
  onDeleteLimit: (category: string) => void;
}

const CATEGORIES_LIST = [
  'Food & Dining',
  'Rent & Utilities',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
];

export function BudgetLimits({ limits, transactions, onSaveLimit, onDeleteLimit }: BudgetLimitsProps) {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES_LIST[0]);
  const [newLimit, setNewLimit] = useState('');
  const [errorCode, setErrorCode] = useState('');

  // Extract expenses and calculate category consumption
  const expenses = transactions.filter((t) => t.type === 'EXPENSE');
  const categorySpent: Record<string, number> = {};
  expenses.forEach((t) => {
    categorySpent[t.category] = (categorySpent[t.category] || 0) + t.amount;
  });

  const handleUpdateLimit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCode('');

    const limitVal = parseFloat(newLimit);
    if (isNaN(limitVal) || limitVal <= 0) {
      setErrorCode('Limit must be a positive number.');
      return;
    }

    onSaveLimit({
      category: selectedCategory,
      limit: limitVal,
    });
    setNewLimit('');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between h-full" id="budget-limits-panel">
      <div>
        <h3 className="text-lg font-medium text-slate-800 font-display">Target Budgets</h3>
        <p className="text-xs text-slate-400 mt-1">Set spending thresholds per category to curb overspending</p>

        {/* Budgets Progress Bar Stack */}
        <div className="space-y-4 mt-6" id="budgets-progress-bars">
          {limits.length > 0 ? (
            limits.map((b) => {
              const spent = categorySpent[b.category] || 0;
              const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 150) : 0;
              
              // Dynamic CSS styling based on threshold danger status
              let barColor = 'bg-emerald-500';
              let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
              if (pct >= 100) {
                barColor = 'bg-rose-500 animate-pulse';
                badgeColor = 'text-rose-700 bg-rose-50 border-rose-100';
              } else if (pct >= 80) {
                barColor = 'bg-amber-500';
                badgeColor = 'text-amber-700 bg-amber-50 border-amber-100';
              }

              return (
                <div key={b.category} id={`budget-card-${b.category.toLowerCase().replace(/\s+/g, '-')}`} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{b.category}</span>
                    <button
                      onClick={() => onDeleteLimit(b.category)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-sm transition-all text-[10px]"
                      title="Remove budget target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-end font-mono">
                    <span className="text-xs text-slate-500">
                      Spent: <b className="text-slate-800 font-bold">{formatCurrency(spent)}</b>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Limit: <b className="text-slate-600 font-semibold">{formatCurrency(b.limit)}</b>
                    </span>
                  </div>

                  {/* Horizontal visual meter bar */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] mt-0.5">
                    <div className={`px-2 py-0.5 border rounded-full font-medium ${badgeColor}`}>
                      {pct >= 100 ? (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Exceeded by {formatCurrency(spent - b.limit)}</span>
                        </span>
                      ) : pct >= 80 ? (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Close to Limit</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Safe Buffer</span>
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-400 font-semibold">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-xs text-slate-400">No active budgets are configured</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Use the inputs below to target category limit thresholds</p>
            </div>
          )}
        </div>
      </div>

      {/* Budget Limit Setter form card */}
      <form onSubmit={handleUpdateLimit} className="mt-6 pt-4 border-t border-slate-100 space-y-3" id="budget-setter-form">
        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Configure Limits</h4>
        
        {errorCode && (
          <p className="text-[10px] text-rose-500 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-100">
            {errorCode}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={selectedCategory}
            id="select-budget-category"
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-xs focus:outline-hidden text-slate-600 cursor-pointer h-[38px]"
          >
            {CATEGORIES_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="relative">
            <span className="absolute left-2.5 top-[11px] text-[11px] font-semibold text-slate-400">₹</span>
            <input
              type="number"
              placeholder="Budget Limit"
              id="input-budget-limit"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="w-full pl-6 pr-2.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-xs font-mono text-slate-700 h-[38px] focus:outline-hidden"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          id="btn-add-budget"
          className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Budget Target</span>
        </button>
      </form>
    </div>
  );
}
