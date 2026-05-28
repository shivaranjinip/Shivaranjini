import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Transaction } from '../types';

interface ChartsViewProps {
  transactions: Transaction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': '#f43f5e',   // Rose
  'Rent & Utilities': '#3b82f6', // Blue
  'Shopping': '#ec4899',         // Pink
  'Transportation': '#eab308',   // Yellow
  'Entertainment': '#a855f7',    // Purple
  'Healthcare': '#14b8a6',       // Teal
  'Education': '#6366f1',        // Indigo
  'Other': '#64748b',            // Slate
};

const DEFAULT_COLOR = '#94a3b8';

export function ChartsView({ transactions }: ChartsViewProps) {
  // 1. Process Data for Expense Category Pie Chart
  const expenses = transactions.filter((t) => t.type === 'EXPENSE');
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name] || DEFAULT_COLOR,
  })).sort((a, b) => b.value - a.value);

  // 2. Process Data for Monthly Income vs Expense Bar Chart
  const monthlyDataMap: Record<string, { month: string; income: number; expenses: number }> = {};
  
  // Initialize sorting/filtering by month
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

  // Convert map to array and sort chronologically by date
  const barData = Object.values(monthlyDataMap).sort((a, b) => {
    return new Date(a.month).getTime() - new Date(b.month).getTime();
  });

  // Custom tooltips to format values into Indian Rupees
  const formatCurrencyValue = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white p-3 rounded-xl shadow-lg font-sans text-xs">
          <p className="font-semibold mb-1 text-slate-300">{payload[0].payload.name || payload[0].payload.month}</p>
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-400 capitalize">{item.name}:</span>
              <span className="font-semibold font-mono">{formatCurrencyValue(item.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const hasExpenses = pieData.length > 0;
  const hasHistory = barData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="charts-view-container">
      {/* Monthly Cashflow Analytics (Bar Chart) */}
      <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="chart-monthly-trend">
        <div>
          <h3 className="text-lg font-medium text-slate-800 font-display">Cashflow Trends</h3>
          <p className="text-xs text-slate-400 mt-1">Compare monthly income inflows against your category expenses</p>
        </div>
        <div className="h-72 mt-6 flex items-center justify-center">
          {hasHistory ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
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
                  tickFormatter={formatCurrencyValue}
                  style={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono' }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="income" name="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center">
              <p className="text-sm text-slate-400">No transaction data available yet</p>
              <p className="text-xs text-slate-300 mt-1">Please add income or expenses to view cashflow trends</p>
            </div>
          )}
        </div>
      </div>

      {/* Expense Allocation (Pie Chart) */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="chart-expense-categories">
        <div>
          <h3 className="text-lg font-medium text-slate-800 font-display">Expense Allocations</h3>
          <p className="text-xs text-slate-400 mt-1 flex justify-between">
            <span>Percentage share by categories</span>
            {hasExpenses && (
              <span className="font-mono text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                {formatCurrencyValue(pieData.reduce((acc, curr) => acc + curr.value, 0))} Total
              </span>
            )}
          </p>
        </div>
        <div className="h-72 mt-6 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4">
          {hasExpenses ? (
            <>
              <div className="w-1/2 min-w-[140px] h-[160px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Top Sector</span>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[80px]">
                    {pieData[0]?.name}
                  </span>
                </div>
              </div>

              {/* Legends list */}
              <div className="flex-1 w-full max-h-[160px] overflow-y-auto pr-1" id="category-chart-legends">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {pieData.slice(0, 6).map((item, idx) => {
                    const totalExpense = pieData.reduce((acc, curr) => acc + curr.value, 0);
                    const percentage = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : '0';
                    return (
                      <div key={idx} className="flex items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600 truncate">{item.name}</span>
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-slate-500 shrink-0">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-slate-400">No expense records found</p>
              <p className="text-xs text-slate-300 mt-1">Add expenses to see a graphical category allocation breakdown</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
