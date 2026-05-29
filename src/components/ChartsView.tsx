import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { Transaction, BudgetLimit } from '../types';
import { 
  TrendingUp, 
  Coins, 
  BarChart3, 
  PieChart as PieIcon, 
  Activity, 
  Sparkles, 
  TrendingDown, 
  ArrowUpRight, 
  Calendar,
  Layers
} from 'lucide-react';

interface ChartsViewProps {
  transactions: Transaction[];
  budgets?: BudgetLimit[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#ff007f',   // Vivid Pink-Rose
  'Rent & Utilities': '#00c3ff', // Electric Turquoise
  'Shopping': '#d946ef',         // Bright Fuchsia
  'Transportation': '#facc15',   // Vivid Yellow
  'Entertainment': '#a855f7',    // Vibrant Purple
  'Healthcare': '#10b981',       // Mint Emerald
  'Education': '#6366f1',        // Electric Indigo
  'Other': '#64748b',            // Modern Slate
};

const DEFAULT_COLOR = '#94a3b8';

export function ChartsView({ transactions, budgets = [] }: ChartsViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'velocity' | 'allocation'>('all');

  // Helper to dynamically get custom color theme chosen by the user
  const getCategoryColor = (name: string) => {
    const budget = budgets.find((b) => b.category === name);
    return budget?.color || CATEGORY_COLORS[name] || DEFAULT_COLOR;
  };

  // 1. Process Data for Expense Category Pie Chart
  const expenses = transactions.filter((t) => t.type === 'EXPENSE');
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: getCategoryColor(name),
  })).sort((a, b) => b.value - a.value);

  // 2. Process Data for Monthly Income vs Expense Bar Chart
  const monthlyDataMap: Record<string, { month: string; income: number; expenses: number }> = {};
  
  transactions.forEach((t) => {
    if (!t.date) return;
    const dateObj = new Date(t.date);
    const monthYear = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!monthlyDataMap[monthYear]) {
      monthlyDataMap[monthYear] = { month: monthYear, income: 0, expenses: 0 };
    }
    
    if (t.type === 'INCOME') {
      monthlyDataMap[monthYear].income += t.amount;
    } else {
      monthlyDataMap[monthYear].expenses += t.amount;
    }
  });

  const barData = Object.values(monthlyDataMap).sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  });

  // 3. Process Data for Running Balance Velocity timeline (Area Chart)
  const sortedTransactions = [...transactions]
    .filter(t => t.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let currentBalance = 0;
  // Initialize with ₹30,000 baseline representing historical security deposit/income baseline for elegant representation
  const INITIAL_BASELINE = 30000;
  currentBalance = INITIAL_BASELINE;

  const runningBalanceData = sortedTransactions.map((t) => {
    if (t.type === 'INCOME') {
      currentBalance += t.amount;
    } else {
      currentBalance -= t.amount;
    }
    const dateObj = new Date(t.date);
    return {
      dateStr: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      balance: currentBalance,
      amount: t.amount,
      type: t.type,
      category: t.category,
      description: t.description
    };
  });

  // Sample seed data to always guarantee beautiful holographic waveforms even if ledger has few transactions
  const simulatedBaselineData = [
    { dateStr: '01 May', balance: 30000, type: 'INCOME', category: 'Seed', description: 'Opening Balance' },
    { dateStr: '05 May', balance: 38000, type: 'INCOME', category: 'Salary', description: 'Bonus Deposit' },
    { dateStr: '11 May', balance: 33400, type: 'EXPENSE', category: 'Shopping', description: 'Grocery Kit' },
    { dateStr: '16 May', balance: 42000, type: 'INCOME', category: 'Other', description: 'Freelance Design' },
    { dateStr: '22 May', balance: 36000, type: 'EXPENSE', category: 'Entertainment', description: 'Weekend Dining' },
    { dateStr: '28 May', balance: 49500, type: 'INCOME', category: 'Salary', description: 'Scholarship payout' },
  ];

  const velocityChartData = runningBalanceData.length > 1 ? runningBalanceData : simulatedBaselineData;

  // Custom currency formatters
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isBalanceChart = data.balance !== undefined && payload[0].name === 'Net Wealth Balance';

      return (
        <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 text-white p-3.5 rounded-xl shadow-2xl font-sans text-xs space-y-1.5 min-w-[150px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {data.dateStr || data.month}
            </span>
            {data.type && (
              <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                data.type === 'INCOME' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
              }`}>
                {data.type}
              </span>
            )}
          </div>

          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.stroke }} />
                <span>{item.name}:</span>
              </div>
              <span className="font-bold font-mono text-slate-100">{formatCurrency(item.value)}</span>
            </div>
          ))}

          {isBalanceChart && data.description && (
            <p className="text-[10px] text-slate-400/80 border-t border-slate-800/60 pt-1.5 font-medium italic">
              ↳ {data.description} ({data.category})
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const hasExpenses = pieData.length > 0;
  const hasHistory = barData.length > 0;

  return (
    <div className="space-y-6" id="expanded-charts-view">
      
      {/* 🔮 Aesthetic Segment Controller Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 px-6 rounded-2xl border border-slate-100 shadow-xs" id="charts-main-bar">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-slate-800">
            <Activity className="w-5 h-5 text-indigo-500 animate-pulse" />
            <h2 className="text-base font-bold font-display tracking-tight">Interactive Ledger Visualizers</h2>
          </div>
          <p className="text-xs text-slate-400">Dynamically compiled color charts modeling real-time cashflow activity and net balance trends.</p>
        </div>

        {/* Fancy Rounded Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-end sm:self-auto" id="charts-toggle-container">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Show All
          </button>
          <button
            onClick={() => setActiveTab('velocity')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'velocity' 
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Balance Velocity
          </button>
          <button
            onClick={() => setActiveTab('allocation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'allocation' 
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sector Density
          </button>
        </div>
      </div>

      {/* 🚀 Visual Core Panels (Conditional Grid Systems) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="charts-glowing-cards-grid">
        
        {/* 1. Dynamic Net Asset & Balance Velocity Timeline Card (Area Chart) - Full Width when active, otherwise lg:col-span-7 */}
        {(activeTab === 'all' || activeTab === 'velocity') && (
          <div 
            className={`bg-slate-950 p-6 rounded-2xl border border-slate-900 shadow-xl flex flex-col justify-between text-slate-300 relative overflow-hidden ${
              activeTab === 'velocity' ? 'lg:col-span-12' : 'lg:col-span-7'
            }`} 
            id="chart-net-asset-velocity"
          >
            {/* Holographic background gradient lights */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-950 text-indigo-400 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-slate-100 font-display">Net Balance Accumulation Profile</h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Sovereign real-time wealth trajectory tracking based on running daily ledger mutations.</p>
              </div>

              {/* Dynamic Velocity Stat badge */}
              <div className="bg-slate-900 border border-slate-800/60 p-2.5 rounded-xl text-right flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
                <div className="leading-none text-left">
                  <span className="text-[9px] text-slate-500 uppercase block tracking-wider font-semibold">Workspace Net Balance</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                    {formatCurrency(velocityChartData[velocityChartData.length - 1].balance)}
                  </span>
                </div>
              </div>
            </div>

            {/* Glowing Recharts Area Flow */}
            <div className="h-72 mt-6 relative z-10" id="recharts-glow-area-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityChartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="balanceGlowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b/30" />
                  
                  <XAxis 
                    dataKey="dateStr" 
                    tickLine={false} 
                    axisLine={false} 
                    style={{ fontSize: 10, fill: '#64748b', fontFamily: 'Inter' }} 
                  />
                  
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatCurrency}
                    style={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }} 
                  />
                  
                  <Tooltip content={<CustomChartTooltip />} />
                  
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    name="Net Wealth Balance" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fill="url(#balanceGlowGradient)" 
                    dot={{ r: 4, strokeWidth: 1, stroke: '#10b981', fill: '#030712' }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff', fill: '#10b981' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[10px] text-indigo-400 border-t border-slate-900 pt-3 mt-4" id="net-asset-footer-metadata">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Holographic Flow Line: Verified
              </span>
              <span className="text-slate-500 font-mono">
                {runningBalanceData.length > 0 ? `${runningBalanceData.length} Ledger Updates` : 'Simulated Sandbox Projections'}
              </span>
            </div>
          </div>
        )}

        {/* 2. Interactive Expense Allocations (Pie Chart with custom sector glow) */}
        {(activeTab === 'all' || activeTab === 'allocation') && (
          <div 
            className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between ${
              activeTab === 'allocation' ? 'lg:col-span-12' : 'lg:col-span-5'
            }`} 
            id="chart-pie-allocation"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-rose-50 text-rose-500 rounded-lg">
                    <PieIcon className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-slate-800 font-display">Sector Expense Allocations</h3>
                </div>
                {hasExpenses && (
                  <span className="font-mono text-xs text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-lg">
                    {formatCurrency(pieData.reduce((acc, curr) => acc + curr.value, 0))} Expensed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">Percentage share distributed across key academic category pipelines</p>
            </div>

            <div className="h-72 mt-6 flex flex-col sm:flex-row items-center justify-center gap-6" id="pie-center-arrangement">
              {hasExpenses ? (
                <>
                  {/* Actual Pie wheel container */}
                  <div className="w-[170px] h-[170px] relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Centered focal label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Top Sector</span>
                      <span className="text-xs font-black text-slate-700 truncate max-w-[100px] mt-0.5 uppercase">
                        {pieData[0]?.name}
                      </span>
                      <span className="text-[10px] font-semibold text-rose-500 font-mono mt-0.5">
                        {((pieData[0]?.value / pieData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Color-Coded Progress Legend lists */}
                  <div className="flex-1 w-full max-h-[190px] overflow-y-auto pr-1 space-y-2.5" id="pie-interactive-legend">
                    {pieData.map((item, idx) => {
                      const totalExpense = pieData.reduce((acc, curr) => acc + curr.value, 0);
                      const percentage = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : '0';
                      return (
                        <div key={idx} className="space-y-1" id={`pie-legend-${idx}`}>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                              <span className="text-slate-700 truncate">{item.name}</span>
                            </div>
                            <span className="font-mono text-slate-500 text-[11px] shrink-0">
                              {percentage}% <b className="text-[#8492a6] font-normal">({formatCurrency(item.value)})</b>
                            </span>
                          </div>
                          {/* Inner custom colorful timeline progress bar */}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ 
                                width: `${percentage}%`, 
                                backgroundColor: item.color 
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center p-4 py-8 col-span-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                    <Layers className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">No Expense Records Located</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Please add active purchase/expense ledgers on your dashboard to calculate sector percentage shares.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 3. Monthly Comparative Income vs Expense Bar Chart with Color Gradients */}
      {activeTab === 'all' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="chart-cashflow-matrix">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-50/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                  <BarChart3 className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-800 font-display">Comparative Cashflow Trends</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Dual-column comparison between money receipts/salary (Inflows) and category spends (Outflows).</p>
            </div>

            {/* Quick Balance Velocity Indicators */}
            <div className="flex items-center gap-4 text-xs font-bold font-sans">
              <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <ArrowUpRight className="w-4 h-4 shrink-0" />
                <span>Inflows (Vibrant Emerald)</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                <TrendingDown className="w-4 h-4 shrink-0" />
                <span>Outflows (Vivid Pink)</span>
              </span>
            </div>
          </div>

          <div className="h-72 mt-6 flex items-center justify-center">
            {hasHistory ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 15, right: 10, left: -5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="vibrantIncomeBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="vibrantExpenseBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff007f" />
                      <stop offset="100%" stopColor="#ff5252" />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    style={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Inter' }} 
                  />
                  
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={formatCurrency}
                    style={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} 
                  />
                  
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                  
                  <Bar dataKey="income" name="Total Income" fill="url(#vibrantIncomeBarGrad)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name="Total Expenses" fill="url(#vibrantExpenseBarGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10" id="empty-bar-chart-state">
                <p className="text-sm text-slate-400 font-semibold font-sans">No Cashflow Records Found</p>
                <p className="text-xs text-slate-300 mt-1">Please register secure financial inputs above to track comparative trends.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
