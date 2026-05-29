import React, { useState } from 'react';
import { BudgetLimit, Transaction } from '../types';
import { AlertTriangle, ShieldCheck, Plus, Trash2, Palette } from 'lucide-react';

interface BudgetLimitsProps {
  limits: BudgetLimit[];
  transactions: Transaction[];
  onSaveLimit: (limit: BudgetLimit) => void;
  onDeleteLimit: (category: string) => void;
}

export const CATEGORY_DEFAULT_COLORS: Record<string, string> = {
  'Food & Dining': '#ff007f',   // Vivid Pink-Rose
  'Rent & Utilities': '#00c3ff', // Electric Turquoise
  'Shopping': '#d946ef',         // Bright Fuchsia
  'Transportation': '#facc15',   // Vivid Yellow
  'Entertainment': '#a855f7',    // Vibrant Purple
  'Healthcare': '#10b981',       // Mint Emerald
  'Education': '#6366f1',        // Electric Indigo
  'Other': '#64748b',            // Modern Slate
};

const COLOR_PRESETS = [
  '#ff007f', // Vivid Pink-Rose
  '#00c3ff', // Electric Turquoise
  '#d946ef', // Bright Fuchsia
  '#facc15', // Vivid Yellow
  '#a855f7', // Vibrant Purple
  '#10b981', // Mint Emerald
  '#6366f1', // Electric Indigo
  '#64748b', // Modern Slate
];

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
  const [selectedColor, setSelectedColor] = useState(CATEGORY_DEFAULT_COLORS[CATEGORIES_LIST[0]]);
  const [newLimit, setNewLimit] = useState('');
  const [errorCode, setErrorCode] = useState('');
  
  // Track which category currently has its color popover open
  const [activeColorPickerCat, setActiveColorPickerCat] = useState<string | null>(null);

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
      color: selectedColor,
    });
    setNewLimit('');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Auto fill default gorgeous preset color mapping
    const fallbackColor = CATEGORY_DEFAULT_COLORS[category] || '#64748b';
    setSelectedColor(fallbackColor);
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
              const activeColor = b.color || CATEGORY_DEFAULT_COLORS[b.category] || '#64748b';
              const isExceeded = pct >= 100;
              const isWarning = pct >= 80 && pct < 100;

              return (
                <div 
                  key={b.category} 
                  id={`budget-card-${b.category.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="p-4 rounded-xl border flex flex-col gap-2.5 transition-all duration-300 shadow-2xs hover:shadow-xs"
                  style={{
                    backgroundColor: `${activeColor}07`, // Very subtle matching theme light tint (hex + alpha 3%)
                    borderColor: `${activeColor}2d`,     // Matching border color with elegant translucent weight
                  }}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{b.category}</span>
                    <div className="flex items-center gap-1.5">
                      {/* Interactive Palette toggler inside card */}
                      <button
                        onClick={() => setActiveColorPickerCat(activeColorPickerCat === b.category ? null : b.category)}
                        className="hover:scale-110 p-1 rounded-sm transition-all cursor-pointer text-slate-400 hover:text-slate-600"
                        title="Pick Category Theme Color"
                        type="button"
                      >
                        <Palette className="w-3.5 h-3.5 transition-colors" style={{ color: activeColor }} />
                      </button>
                      <button
                        onClick={() => onDeleteLimit(b.category)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-sm transition-all text-[10px] cursor-pointer"
                        title="Remove budget target"
                        type="button"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Active color palette customization popover inside card */}
                  {activeColorPickerCat === b.category && (
                    <div className="p-3 bg-white border border-slate-100 rounded-xl mt-1 space-y-2.5 shadow-sm animate-fade-in">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Change Color Theme</span>
                        <button 
                          type="button" 
                          onClick={() => setActiveColorPickerCat(null)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 font-bold hover:underline cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {COLOR_PRESETS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              onSaveLimit({
                                ...b,
                                color,
                              });
                            }}
                            className={`w-6.5 h-6.5 rounded-full border transition-all cursor-pointer hover:scale-110 relative ${
                              activeColor === color 
                                ? 'ring-2 ring-slate-800 ring-offset-1 scale-105 shadow-sm' 
                                : 'border-slate-200'
                            }`}
                            style={{ backgroundColor: color }}
                            title={`Choose ${color}`}
                          >
                            {activeColor === color && (
                              <span className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-black">✓</span>
                            )}
                          </button>
                        ))}
                        
                        {/* Inline color picker inside card */}
                        <div className="relative w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition duration-200">
                          <input
                            type="color"
                            value={activeColor}
                            onChange={(e) => {
                              onSaveLimit({
                                ...b,
                                color: e.target.value,
                              });
                            }}
                            className="w-6 h-6 rounded-full border-0 p-0 overflow-hidden cursor-pointer bg-transparent absolute inset-0 opacity-0 z-10"
                            title="Custom Color Pick"
                          />
                          <div 
                            className="w-5 h-5 rounded-full border border-white/25 shadow-xs flex items-center justify-center text-[10px] font-black text-white"
                            style={{ backgroundColor: activeColor }}
                          >
                            +
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-end font-mono">
                    <span className="text-xs text-slate-500 leading-none">
                      Spent: <b className="text-slate-800 font-bold">{formatCurrency(spent)}</b>
                    </span>
                    <span className="text-[11px] text-slate-400 leading-none">
                      Limit: <b className="text-slate-600 font-semibold">{formatCurrency(b.limit)}</b>
                    </span>
                  </div>

                  {/* Horizontal visual meter bar custom styled with selected category theme color */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${isExceeded ? 'animate-pulse' : ''}`}
                      style={{ 
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: activeColor,
                        boxShadow: `0 1px 4px ${activeColor}33`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] mt-0.5">
                    <div 
                      className="px-2.5 py-0.5 border rounded-full font-bold transition-all text-[9px] uppercase tracking-wide"
                      style={{
                        backgroundColor: `${activeColor}15`,
                        borderColor: `${activeColor}44`,
                        color: activeColor,
                      }}
                    >
                      {isExceeded ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          <span>Exceeded by {formatCurrency(spent - b.limit)}</span>
                        </span>
                      ) : isWarning ? (
                        <span className="flex items-center gap-1">
                          <span>Warning: Near Limit</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <span>Safe Budget</span>
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-400 font-bold">{pct.toFixed(0)}%</span>
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
      <form onSubmit={handleUpdateLimit} className="mt-6 pt-4 border-t border-slate-100 space-y-3.5" id="budget-setter-form">
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
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg text-xs focus:outline-hidden text-slate-600 cursor-pointer h-[38px] font-semibold"
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

        {/* Dynamic color palette preset buttons below inputs */}
        <div className="space-y-1.5" id="form-theme-colors">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category Theme Color</label>
          <div className="flex flex-wrap items-center gap-1.5">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-6 h-6 rounded-full border transition-all cursor-pointer hover:scale-110 relative ${
                  selectedColor === color 
                    ? 'ring-2 ring-slate-800 ring-offset-1 scale-105 shadow-sm' 
                    : 'border-slate-200'
                }`}
                style={{ backgroundColor: color }}
                title={`Select ${color}`}
              >
                {selectedColor === color && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-black">✓</span>
                )}
              </button>
            ))}
            
            {/* Native Custom color input picker */}
            <div className="relative w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 bg-slate-50 hover:bg-slate-100 transition duration-200">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-6 h-6 rounded-full border-0 p-0 overflow-hidden cursor-pointer bg-transparent absolute inset-0 opacity-0 z-10"
                title="Custom Color Theme Picker"
              />
              <div 
                className="w-5 h-5 rounded-full border border-white/20 shadow-xs flex items-center justify-center text-[10px] font-black text-white"
                style={{ backgroundColor: selectedColor }}
              >
                +
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          id="btn-add-budget"
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Budget Target</span>
        </button>
      </form>
    </div>
  );
}
