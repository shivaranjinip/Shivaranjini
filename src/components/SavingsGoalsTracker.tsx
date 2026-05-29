import React, { useState, useEffect, useRef } from 'react';
import { SavingsGoal } from '../types';
import { Plus, PiggyBank, Calendar, Trash2, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface SavingsGoalsTrackerProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onDeleteGoal: (id: string) => void;
  onAddFunds: (id: string, amount: number) => void;
}

export function SavingsGoalsTracker({ goals, onAddGoal, onDeleteGoal, onAddFunds }: SavingsGoalsTrackerProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // States for Deposit popup/form for specific goals
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Track previous amounts to detect completion transitions (0% -> 100% boundary crossing)
  const prevAmounts = useRef<Record<string, number>>({});

  useEffect(() => {
    // Populate or catch-up goals amounts in the ref
    goals.forEach((g) => {
      if (prevAmounts.current[g.id] === undefined) {
        prevAmounts.current[g.id] = g.currentAmount;
      }
    });
  }, [goals]);

  useEffect(() => {
    goals.forEach((g) => {
      const prevAmt = prevAmounts.current[g.id];
      // Trigger celebrating confetti only if the goal was previously incomplete and is now complete
      if (prevAmt !== undefined && prevAmt < g.targetAmount && g.currentAmount >= g.targetAmount) {
        triggerConfettiBurst();
      }
      // Always store the updated amount
      prevAmounts.current[g.id] = g.currentAmount;
    });
  }, [goals]);

  const triggerConfettiBurst = () => {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Splash left-side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#3b82f6', '#10b981', '#facc15', '#a855f7', '#ff007f']
      });

      // Splash right-side
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#3b82f6', '#10b981', '#facc15', '#a855f7', '#ff007f']
      });
    }, 250);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) return;

    onAddGoal({
      name: name.trim(),
      targetAmount: targetNum,
      currentAmount: 0,
       targetDate: targetDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0], // 30 days default
    });

    setName('');
    setTargetAmount('');
    setTargetDate('');
    setShowAddForm(false);
  };

  const handleDeposit = (id: string) => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    onAddFunds(id, amt);
    setDepositGoalId(null);
    setDepositAmount('');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between h-full" id="savings-goals-panel">
      <div>
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-medium text-slate-800 font-display">Savings Goals</h3>
            <p className="text-xs text-slate-400 mt-1">Set, track, and deposit funds to your target milestones</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
            id="btn-toggle-add-goal"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Goal</span>
          </button>
        </div>

        {/* Dynamic creation drawer/form */}
        {showAddForm && (
          <form onSubmit={handleCreateGoal} className="mt-4 p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3 animate-slide-down" id="add-goal-form">
            <h4 className="text-xs font-semibold text-slate-700">Set New Target Milestone</h4>
            <div>
              <label className="block text-[10px] text-slate-500 mb-0.5">Goal Name</label>
              <input
                type="text"
                placeholder="e.g. Higher Education, New Laptop"
                id="input-goal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Target Amount (₹)</label>
                <input
                  type="number"
                  placeholder="₹ Amount"
                  id="input-goal-target"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-0.5">Target Date</label>
                <input
                  type="date"
                  id="input-goal-date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs cursor-pointer"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-1.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-save-goal"
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {/* Goals Visual Cards list */}
        <div className="space-y-4 mt-6" id="savings-goals-list">
          <AnimatePresence mode="popLayout">
            {goals.length > 0 ? (
              goals.map((g) => {
                const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
                const isTargetComplete = pct >= 100;

                return (
                  <motion.div
                    key={g.id}
                    id={`goal-card-${g.id}`}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className={`p-4 rounded-xl border ${
                      isTargetComplete 
                        ? 'border-emerald-100 bg-emerald-50/20' 
                        : 'border-slate-100 bg-white'
                    } shadow-xs flex flex-col gap-2.5 transition-all`}
                  >
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{g.name}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Deadline: {new Date(g.targetDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteGoal(g.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-sm transition-all text-[10px]"
                        title="Delete target milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Funding details */}
                    <div className="flex justify-between items-end font-mono text-xs mt-1">
                      <span className="text-slate-500">
                        Saved: <b className="text-emerald-600 font-bold">{formatCurrency(g.currentAmount)}</b>
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Target: <b className="text-slate-600 font-semibold">{formatCurrency(g.targetAmount)}</b>
                      </span>
                    </div>

                    {/* Horizontal visual progress meter bar with motion spring physics */}
                    <div className="h-2.5 w-full bg-slate-100/80 rounded-full overflow-hidden relative">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                        className={`h-full relative rounded-full ${
                          isTargetComplete 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/20' 
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-sm shadow-blue-500/20'
                        }`}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] mt-0.5">
                      <span className="font-semibold text-slate-400 font-mono">{pct.toFixed(0)}% Saved</span>
                      
                      {depositGoalId === g.id ? (
                        <div className="flex items-center gap-1 animate-slide-down">
                          <input
                            type="number"
                            placeholder="₹ Amount"
                            id={`input-fund-amount-${g.id}`}
                            value={depositAmount}
                            aria-label="Fund amount"
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-18 px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-xs rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                            required
                          />
                          <button
                            onClick={() => handleDeposit(g.id)}
                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] rounded-md font-semibold"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => setDepositGoalId(null)}
                            className="px-2 py-0.5 border border-slate-200 text-[10px] text-slate-400 rounded-md hover:bg-slate-50"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        !isTargetComplete && (
                          <button
                            onClick={() => setDepositGoalId(g.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                            id={`btn-fund-${g.id}`}
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            <span>Add Funds</span>
                          </button>
                        )
                      )}
                      {isTargetComplete && (
                        <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100 animate-pulse">
                          Goal Achieved! 🎉
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/20" id="goals-empty-state">
                <p className="text-xs text-slate-400">No target milestones created yet</p>
                <p className="text-[10px] text-slate-300 mt-0.5">Define your future dreams by creating a saving goal above</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
