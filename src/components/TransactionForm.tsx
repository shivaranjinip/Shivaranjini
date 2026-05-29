import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { AlertCircle, Check, X } from 'lucide-react';

interface TransactionFormProps {
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  editingTransaction?: Transaction | null;
  onCancel: () => void;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Rent & Utilities',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary & Bonus',
  'Investments',
  'Freelance & Gig Work',
  'Gifts & Refunds',
  'Other Income',
];

export function TransactionForm({ onSave, editingTransaction, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Sync state if editing a transaction
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNotes(editingTransaction.notes || '');
    } else {
      // Set defaults for new transaction
      setType('EXPENSE');
      setDescription('');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [editingTransaction]);

  // Dynamically update category selections when Type toggles, or when editing toggles type
  useEffect(() => {
    const categoriesForType = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    if (!categoriesForType.includes(category)) {
      setCategory(categoriesForType[0]);
    }
  }, [type, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please provide a short description.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a valid, positive number greater than 0.');
      return;
    }

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    onSave({
      id: editingTransaction?.id,
      description: description.trim(),
      amount: numAmount,
      type,
      category,
      date,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm" id="transaction-form-panel">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <h3 className="text-lg font-medium text-slate-800 font-display">
          {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
        </h3>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-lg transition-all"
          title="Cancel"
          id="btn-cancel-form"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" id="transaction-form">
        {/* Error Callout */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Income / Expense Toggle Switch */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200/50">
          <button
            type="button"
            id="btn-toggle-expense"
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setType('EXPENSE')}
          >
            Expense
          </button>
          <button
            type="button"
            id="btn-toggle-income"
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'INCOME'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setType('INCOME')}
          >
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-[11px] font-semibold text-slate-400 text-sm">₹</span>
            <input
              type="number"
              step="0.01"
              id="input-transaction-amount"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm font-mono font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
          <input
            type="text"
            id="input-transaction-description"
            placeholder="e.g. Grocery payment, Rent deposit"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800"
            required
          />
        </div>

        {/* Category & Date in grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
            <select
              value={category}
              id="select-transaction-category"
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 cursor-pointer"
            >
              {type === 'EXPENSE'
                ? EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))
                : INCOME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input
              type="date"
              id="input-transaction-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Extra Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Additional Notes (Optional)</label>
          <textarea
            id="input-transaction-notes"
            placeholder="Store locations, tag references, invoice details..."
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            id="btn-cancel-submit"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="btn-save-transaction"
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{editingTransaction ? 'Save Changes' : 'Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
