import { useState, useEffect } from 'react';
import { Transaction, BudgetLimit, SavingsGoal, AIInsight } from '../types';
import { Sparkles, Loader2, RefreshCw, AlertCircle, CheckCircle2, AlertTriangle, Lightbulb, ClipboardList } from 'lucide-react';

interface AIInsightsPanelProps {
  transactions: Transaction[];
  budgets: BudgetLimit[];
  savingsGoals: SavingsGoal[];
}

const ANALYSIS_PHASES = [
  'Auditing ledger item trends...',
  'Calculating net savings coefficients...',
  'Analyzing budget and threshold ceilings...',
  'Formulating actionable financial insights...',
];

export function AIInsightsPanel({ transactions, budgets, savingsGoals }: AIInsightsPanelProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(ANALYSIS_PHASES[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Cycle through funny/professional loading analysis slogans
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      let stepIndex = 0;
      interval = setInterval(() => {
        stepIndex = (stepIndex + 1) % ANALYSIS_PHASES.length;
        setLoadingPhase(ANALYSIS_PHASES[stepIndex]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleFetchInsights = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          budgets,
          savingsGoals,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server failed to analyze records.');
      }

      const data = await response.json();
      setInsight(data);
      setCheckedSteps({}); // Reset steps
    } catch (err: any) {
      console.error('Failed to get insights:', err);
      setErrorMessage(err.message || 'Unable to communicate with financial servers. Check configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStep = (index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md text-white flex flex-col justify-between h-full" id="ai-insights-panel">
      {/* Panel header section */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/10 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-medium font-display leading-tight">Smart AI Growth Analyst</h3>
              <p className="text-[10px] text-slate-400">Powered by Secure Predictive Analysis Engines</p>
            </div>
          </div>
          {insight && !isLoading && (
            <button
              onClick={handleFetchInsights}
              className="p-1.5 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              title="Regenerate Insights"
              id="btn-regenerate-insights"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Loading state visual indicator */}
        {isLoading && (
          <div className="my-10 flex flex-col items-center justify-center text-center animate-fade-in" id="ai-insights-loading">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-200">{loadingPhase}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[250px]">Our secure advice engine is checking your actual financial statements...</p>
          </div>
        )}

        {/* Error State display screen */}
        {errorMessage && !isLoading && (
          <div className="my-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs flex items-start gap-3" id="ai-insights-error">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <p className="font-semibold text-rose-200">Unable To Conduct AI Analysis</p>
              <p className="text-slate-400 mt-1">{errorMessage}</p>
              <div className="mt-3.5 flex flex-col gap-1 text-[11px] bg-black/20 p-2.5 rounded-lg border border-white/5">
                <span className="font-semibold text-white">How to fix in VS Code:</span>
                <span>1. Export as a ZIP / GitHub and open in VS Code.</span>
                <span>2. Create a file named <code className="font-mono bg-slate-900 px-1 rounded text-red-400">.env</code> in the project root.</span>
                <span>3. Add: <code className="font-mono bg-slate-900 px-1 rounded text-emerald-400">AI_ANALYSIS_KEY="your_api_key"</code></span>
              </div>
            </div>
          </div>
        )}

        {/* Static Prompt Onboarding if no insights yet */}
        {!insight && !isLoading && !errorMessage && (
          <div className="my-8 text-center" id="ai-insights-onboarding">
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 text-slate-300 max-w-sm mx-auto flex flex-col items-center gap-3">
              <Lightbulb className="w-8 h-8 text-amber-400" />
              <p className="text-xs leading-relaxed">
                Connect your account ledger and budgets directly. Our finance assistant can audit your categories, budget buffers, savings gaps, and formulate localized solutions.
              </p>
              <button
                onClick={handleFetchInsights}
                id="btn-fetch-insights-initial"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Let Smart AI Audit My Expenses
              </button>
            </div>
          </div>
        )}

        {/* Result analysis presentation block */}
        {insight && !isLoading && !errorMessage && (
          <div className="mt-6 space-y-5 animate-fade-in" id="ai-insights-result">
            {/* Colored Status Gauge bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Finance Profile Status</span>
              {insight.status === 'optimal' ? (
                <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-3 py-1 border border-emerald-500/10 rounded-full font-semibold text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OPTIMAL CASHFLOW</span>
                </span>
              ) : insight.status === 'warning' ? (
                <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-3 py-1 border border-amber-500/10 rounded-full font-semibold text-[10px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>NEAR BUDGET CEILINGS</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-rose-500/20 text-rose-400 px-3 py-1 border border-rose-500/10 rounded-full font-semibold text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>CRITICAL BALANCE DANGER</span>
                </span>
              )}
            </div>

            {/* General advice summary */}
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">Executive Summary</span>
              <p className="text-xs text-slate-200 leading-relaxed font-light">{insight.generalAdvice}</p>
            </div>

            {/* Category deep dive details */}
            <div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-2">Category Spending Audit</span>
              <p className="text-xs text-slate-300 leading-relaxed font-light">{insight.categoryDeepDive}</p>
            </div>

            {/* Concrete list of checkboxes for actionable steps */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block mb-3 flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Actionable Growth Milestones</span>
              </span>
              <div className="space-y-2.5">
                {insight.actionableSteps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleStep(idx)}
                    className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-center gap-3 ${
                      checkedSteps[idx]
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-400'
                        : 'bg-slate-800/30 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                        checkedSteps[idx]
                          ? 'bg-emerald-500 border-emerald-500 text-slate-900'
                          : 'border-slate-600'
                      }`}
                    >
                      {checkedSteps[idx] && (
                        <svg className="w-3 h-3 fill-none stroke-current stroke-3" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs ${checkedSteps[idx] ? 'line-through text-slate-500' : ''}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {insight && !isLoading && (
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <span>Advice changes dynamically as you upload more statements</span>
          <button
            onClick={handleFetchInsights}
            id="btn-re-evaluate-insights"
            className="text-blue-400 hover:text-blue-300 font-bold"
          >
            Re-evaluate Logs
          </button>
        </div>
      )}
    </div>
  );
}
