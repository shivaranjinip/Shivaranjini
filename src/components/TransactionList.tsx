import { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { Search, Filter, ArrowUpDown, Trash2, Edit2, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onDeleteTransaction, onEditTransaction }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // Extract unique categories for filter drop-down
  const categories = useMemo(() => {
    const list = transactions.map((t) => t.category);
    return Array.from(new Set(list));
  }, [transactions]);

  // Handle transaction sorting and filtering pipeline
  const processedTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(term) ||
          (t.notes && t.notes.toLowerCase().includes(term))
      );
    }

    // Filter by Type
    if (selectedType !== 'ALL') {
      result = result.filter((t) => t.type === selectedType);
    }

    // Filter by Category
    if (selectedCategory !== 'ALL') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Sort by Date or Amount
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, selectedType, selectedCategory, sortBy, sortOrder]);

  // Pagination bounds calculated dynamically
  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return processedTransactions.slice(startIdx, startIdx + itemsPerPage);
  }, [processedTransactions, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Toggle sorting headers
  const handleSortToggle = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = ['ID', 'Description', 'Amount', 'Type', 'Category', 'Date', 'Notes'];
    const rows = processedTransactions.map((t) => [
      t.id,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      t.type,
      t.category,
      t.date,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ExpensePro_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between" id="ledger-view-panel">
      <div>
        {/* Title and CSV Download button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-medium text-slate-800 font-display">Financial Ledger</h3>
            <p className="text-xs text-slate-400 mt-1">Review, filter, and audit detailed income or expense listings</p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={processedTransactions.length === 0}
            id="btn-export-csv"
            className="self-start sm:self-auto py-2 px-4 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-45 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4" id="ledger-filters">
          {/* Search bar */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-[11px] w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search description or notes..."
              id="input-ledger-search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100/30 focus:bg-white rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative md:col-span-3">
            <select
              value={selectedType}
              id="select-filter-type"
              aria-label="Filter by type"
              onChange={(e) => {
                setSelectedType(e.target.value as TransactionType | 'ALL');
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100/30 rounded-xl text-xs focus:outline-hidden text-slate-600 h-[38px] cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="EXPENSE">Expenses Only</option>
              <option value="INCOME">Income Only</option>
            </select>
          </div>

          {/* Filter by Category */}
          <div className="relative md:col-span-4">
            <select
              value={selectedCategory}
              id="select-filter-category"
              aria-label="Filter by category"
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100/30 rounded-xl text-xs focus:outline-hidden text-slate-600 h-[38px] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto mt-6" id="ledger-table-container">
          {paginatedTransactions.length > 0 ? (
            <table className="w-full text-left border-collapse" id="ledger-table">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 cursor-pointer select-none hover:text-slate-600 group" onClick={() => handleSortToggle('date')}>
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3 group-hover:text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right cursor-pointer select-none hover:text-slate-600 group" onClick={() => handleSortToggle('amount')}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3 group-hover:text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-55">
                {paginatedTransactions.map((t) => (
                  <tr key={t.id} id={`row-${t.id}`} className="hover:bg-slate-50/75 group/row transition-colors text-xs text-slate-700">
                    {/* Description & optional notes */}
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-semibold text-slate-800">{t.description}</p>
                        {t.notes && <p className="text-[10px] text-slate-400 mt-0.5 max-w-[200px] truncate">{t.notes}</p>}
                      </div>
                    </td>

                    {/* Category tag */}
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded-full text-[10px] whitespace-nowrap">
                        {t.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 font-mono text-slate-500">
                      {new Date(t.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Amount (color coded by income/expense) */}
                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={`font-mono font-bold ${
                          t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-700'
                        }`}
                      >
                        {t.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(t.amount)}
                      </span>
                    </td>

                    {/* Edit / Delete actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover/row:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(t)}
                          className="p-1 px-2 hover:bg-blue-50 text-blue-500 rounded-md transition"
                          title="Edit transaction"
                          id={`btn-edit-${t.id}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-1 px-2 hover:bg-rose-50 text-rose-500 rounded-md transition"
                          title="Delete transaction"
                          id={`btn-delete-${t.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10" id="ledger-empty-state">
              <span className="text-sm text-slate-400">No matching search query of transactions found</span>
              <p className="text-xs text-slate-300 mt-1">Refine your query filters or record a new transaction</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4" id="ledger-pagination">
          <span className="text-xs text-slate-400 font-medium">
            Page <span className="text-slate-600 font-bold">{currentPage}</span> of{' '}
            <span className="text-slate-600 font-bold">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-40 transition-all cursor-pointer"
              id="btn-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-40 transition-all cursor-pointer"
              id="btn-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
