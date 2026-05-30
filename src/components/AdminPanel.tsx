import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Settings, 
  Database, 
  Activity, 
  Trash2, 
  Edit2, 
  ShieldCheck, 
  ArrowLeft, 
  Plus, 
  Save, 
  UserPlus, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, BudgetLimit, SavingsGoal } from '../types';

interface AdminPanelProps {
  onBackToDashboard: () => void;
  currentUser: { email: string; name: string };
  onImpersonateUser: (email: string, name: string) => void;
  transactions: Transaction[];
  budgets: BudgetLimit[];
  savingsGoals: SavingsGoal[];
  onResetAllData: () => void;
  onUpdateTransactions: (txs: Transaction[]) => void;
}

export function AdminPanel({
  onBackToDashboard,
  currentUser,
  onImpersonateUser,
  transactions,
  budgets,
  savingsGoals,
  onResetAllData,
  onUpdateTransactions
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'database' | 'settings'>('users');
  
  // -- USERS MANAGEMENT STATES --
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // User Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  // -- SYSTEM SETTINGS STATES --
  const [alertThreshold, setAlertThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('expense_pro_alert_threshold');
    return saved ? parseInt(saved, 10) : 80;
  });
  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    return localStorage.getItem('expense_pro_currency_symbol') || '₹';
  });
  const [announcementBanner, setAnnouncementBanner] = useState<string>(() => {
    return localStorage.getItem('expense_pro_announcement') || 'Welcome Examiners! Use this interactive Admin Panel to simulate users, reset data, and configure thresholds.';
  });
  
  // Hardcoded default demo user for display and impersonation fallback
  const DEMO_USER = {
    name: 'Demonstration User',
    email: 'demo@expensepro.com',
    password: 'password123'
  };

  // Load registered users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const stored = localStorage.getItem('expense_pro_registered_users');
    const registered = stored ? JSON.parse(stored) : [];
    // Ensure the hardcoded DEMO_USER is formatted nicely or included if not present
    setUsersList(registered);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setUserError('All fields are required.');
      return;
    }

    if (formPassword.length < 6) {
      setUserError('Password must be at least 6 characters.');
      return;
    }

    const emailLower = formEmail.toLowerCase().trim();

    if (emailLower === DEMO_USER.email) {
      setUserError('Cannot modify or overwrite the primary sandbox credentials.');
      return;
    }

    const stored = localStorage.getItem('expense_pro_registered_users');
    let registered = stored ? JSON.parse(stored) : [];

    if (editingUserId) {
      // Edit User
      const existsIdx = registered.findIndex((u: any) => u.email.toLowerCase() === emailLower && u.email !== editingUserId);
      if (existsIdx !== -1) {
        setUserError('A user with this email already exists.');
        return;
      }

      registered = registered.map((u: any) => {
        if (u.email === editingUserId) {
          return { name: formName.trim(), email: emailLower, password: formPassword };
        }
        return u;
      });

      setUserSuccess('User account updated successfully!');
    } else {
      // Create User
      const exists = registered.some((u: any) => u.email.toLowerCase() === emailLower);
      if (exists) {
        setUserError('A user with this email address already exists.');
        return;
      }

      registered.push({ name: formName.trim(), email: emailLower, password: formPassword });
      setUserSuccess('New user account added to sovereign ledger!');
    }

    localStorage.setItem('expense_pro_registered_users', JSON.stringify(registered));
    setUsersList(registered);
    cancelUserForm();
  };

  const cancelUserForm = () => {
    setIsAddingUser(false);
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
  };

  const handleEditClick = (user: any) => {
    setEditingUserId(user.email);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(user.password || '');
    setIsAddingUser(true);
  };

  const handleDeleteUser = (email: string) => {
    if (confirm(`Are you sure you want to permanently delete user ${email}?`)) {
      const stored = localStorage.getItem('expense_pro_registered_users');
      let registered = stored ? JSON.parse(stored) : [];
      registered = registered.filter((u: any) => u.email !== email);
      localStorage.setItem('expense_pro_registered_users', JSON.stringify(registered));
      setUsersList(registered);
      
      // If current playing user is deleted, force logout/impersonation back to demo
      if (currentUser.email === email) {
        onImpersonateUser(DEMO_USER.email, DEMO_USER.name);
      }
      setUserSuccess('User account removed successfully!');
    }
  };

  const togglePasswordVisibility = (email: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [email]: !prev[email]
    }));
  };

  // -- SETTINGS ACTIONS --
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('expense_pro_alert_threshold', alertThreshold.toString());
    localStorage.setItem('expense_pro_currency_symbol', currencySymbol);
    localStorage.setItem('expense_pro_announcement', announcementBanner);
    
    // Dispatch custom event to let other components know settings updated
    window.dispatchEvent(new Event('expense_pro_settings_changed'));
    
    alert('System settings successfully saved and applied globally!');
  };

  // -- SEED SIMULATED DATA --
  const handleSeedMockData = () => {
    const categories = ['Food & Dining', 'Rent & Utilities', 'Shopping', 'Entertainment', 'Transportation', 'Healthcare', 'Education', 'Other'];
    const descriptions = [
      'Gourmet Cafeteria Feast',
      'Electric Power Grid Inflow',
      'Organic Denim Jackets',
      'Retro Arcade Play tokens',
      'Inter-Metro Fuel Top-up',
      'Clinical Prescription Re-up',
      'Reference Textbook Purchase',
      'Co-Working Space Espresso',
      'Weekly Groceries Supermarket',
      'Academics Coding Course Subscription'
    ];

    const seededTxs: Transaction[] = [];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
      const dayOffset = Math.floor(Math.random() * 25);
      const randomDate = new Date();
      randomDate.setDate(now.getDate() - dayOffset);

      const type = Math.random() > 0.3 ? 'EXPENSE' : 'INCOME';
      const category = type === 'EXPENSE' 
        ? categories[Math.floor(Math.random() * (categories.length - 1))] 
        : 'Salary & Bonus';

      seededTxs.push({
        id: `tx-mock-${Date.now()}-${i}`,
        description: type === 'INCOME' ? 'Seeded Inflow Freelance' : descriptions[Math.floor(Math.random() * descriptions.length)],
        amount: Math.floor(Math.random() * 8500) + 150,
        type,
        category,
        date: randomDate.toISOString().split('T')[0],
        notes: `Simulated transaction generated via the Admin Panel under user ${currentUser.email}`
      });
    }

    const updated = [...seededTxs, ...transactions];
    onUpdateTransactions(updated);
    alert('Injected 10 simulated transactions with dynamic high-density vectors into your current account workspace!');
  };

  // -- DOWNLOAD SYSTEM STATEJSON --
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      transactions,
      budgets,
      savingsGoals,
      users: usersList,
      currentUser
    }, null, 2));
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `spendwise_system_dump_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-nunito" id="admin-panel-viewport">
      
      {/* Upper Status Announcement Ribbon */}
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2" id="admin-ribbon">
        <Activity className="w-4 h-4 animate-spin text-slate-950" />
        <span>Expense Admin Mode Active — Impersonate users, seed metrics, and toggle database configurations</span>
      </div>

      {/* Main Container Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4.5">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display tracking-tight text-slate-800">Sovereign Admin Control Center</h1>
                <span className="text-[10px] uppercase font-extrabold tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  DEVELOPER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Manage users local storage databases, seed demonstration graphics, and modify global parameters</p>
            </div>
          </div>

          <button
            onClick={onBackToDashboard}
            className="self-start md:self-auto py-2 px-4 bg-slate-800 hover:bg-slate-950 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Financial Dashboard</span>
          </button>
        </div>

        {/* Live Counters Banner Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Accounts</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-800">{usersList.length + 1}</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">Live</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ledger Records</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-800">{transactions.length}</span>
              <span className="text-[10px] text-slate-400 font-medium">Tx Entries</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Budget Goals</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-800">{budgets.length}</span>
              <span className="text-[10px] text-slate-400 font-medium">Categories</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Session</span>
            <div className="mt-1 flex flex-col truncate">
              <span className="text-xs font-bold text-slate-800 leading-none truncate">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 mt-1 truncate">{currentUser.email}</span>
            </div>
          </div>
        </div>

        {/* Outer body Split Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-1">
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'users' 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Sovereign Users Directory</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-extrabold font-mono">
                  {usersList.length + 1}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'database' 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Simulate & Seed Labs</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'settings' 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Config & Global Limits</span>
              </button>
            </div>

            {/* Impersonation state tip */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                <Info className="w-4 h-4" />
                <span>Examiner Tip:</span>
              </div>
              <p className="text-[#3b5998] leading-relaxed text-[11px]">
                Click <b className="text-blue-900 font-bold">"Impersonate"</b> beside any registered user account. The applet will immediately reload and shift to that user's view, allowing you to test independent ledgers side-by-side!
              </p>
            </div>
          </div>

          {/* Core Content Body panel */}
          <div className="lg:col-span-9">
            
            {/* -- 1. REGISTRY / USERS TAB -- */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
                      <span>Sovereign Accounts Registry</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-black">
                        LocalStorage Enabled
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Add, update, remove, or impersonate sovereign account entries stored inside private device cookies</p>
                  </div>
                  {!isAddingUser && (
                    <button
                      onClick={() => setIsAddingUser(true)}
                      className="self-start sm:self-auto py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Ledger User</span>
                    </button>
                  )}
                </div>

                {/* Toast alerts inside user settings panel */}
                {userError && (
                  <div className="p-3 bg-red-100/40 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shrink-0" />
                    <p className="font-semibold">{userError}</p>
                  </div>
                )}
                {userSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs rounded-xl flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                    <p className="font-semibold">{userSuccess}</p>
                  </div>
                )}

                {/* Form to create/edit user */}
                <AnimatePresence>
                  {isAddingUser && (
                    <motion.form
                      initial={{ opacity: 0, y: -15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      onSubmit={handleSaveUser}
                      className="p-4 border border-slate-200/80 bg-slate-50 rounded-xl space-y-4"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                          {editingUserId ? 'Modify Sovereign Ledger Account' : 'Initialize New Account'}
                        </h3>
                        <button
                          type="button"
                          onClick={cancelUserForm}
                          className="text-[10px] text-slate-400 hover:text-slate-600 font-bold hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#6b6358] uppercase tracking-wide">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ramesh Kumar"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#c4c8bc] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#6b6358] uppercase tracking-wide">Email</label>
                          <input
                            type="email"
                            required
                            placeholder="ramesh@example.com"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#c4c8bc] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 rounded-lg text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#6b6358] uppercase tracking-wide">Security Phrase</label>
                          <input
                            type="text"
                            required
                            placeholder="Must be min 6 chars"
                            value={formPassword}
                            onChange={(e) => setFormPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#c4c8bc] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={cancelUserForm}
                          className="py-1.5 px-4 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 text-xs font-semibold cursor-pointer"
                        >
                          Discard
                        </button>
                        <button
                          type="submit"
                          className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{editingUserId ? 'Apply Shifts' : 'Deploy Account'}</span>
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Primary registry accounts stack */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold text-[#6b6358] uppercase tracking-wider">
                        <th className="py-3 px-4">Profile Account</th>
                        <th className="py-3 px-4">Credentials Email</th>
                        <th className="py-3 px-4">Sandbox Password</th>
                        <th className="py-3 px-4">Workspace Status</th>
                        <th className="py-3 px-4 text-right">Actions Panel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      
                      {/* Hardcoded system demo row */}
                      <tr className={currentUser.email === DEMO_USER.email ? "bg-blue-50/20" : ""}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-[10px]">
                              S
                            </div>
                            <div>
                              <span className="font-semibold block text-slate-800">{DEMO_USER.name}</span>
                              <span className="text-[9px] text-[#705c30] bg-[#f8e0a8] px-1.5 py-0.2 rounded font-bold uppercase tracking-wide">
                                Sandbox Default
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{DEMO_USER.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-slate-600">
                              {showPasswords[DEMO_USER.email] ? DEMO_USER.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(DEMO_USER.email)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              {showPasswords[DEMO_USER.email] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {currentUser.email === DEMO_USER.email ? (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Active Session</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Inactive</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {currentUser.email !== DEMO_USER.email ? (
                            <button
                              onClick={() => onImpersonateUser(DEMO_USER.email, DEMO_USER.name)}
                              className="py-1 px-2.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold rounded-md transition-all cursor-pointer"
                            >
                              Impersonate
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold">Currently Viewing</span>
                          )}
                        </td>
                      </tr>

                      {/* Registered database rows */}
                      {usersList.length > 0 ? (
                        usersList.map((user) => (
                          <tr key={user.email} className={currentUser.email === user.email ? "bg-blue-50/20" : ""}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-[10px]">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-semibold block text-slate-800">{user.name}</span>
                                  <span className="text-[9px] text-[#2a6038] bg-[#c8e8d0] px-1.5 py-0.2 rounded font-bold uppercase tracking-wide">
                                    Local Registrant
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">{user.email}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-slate-600">
                                  {showPasswords[user.email] ? user.password : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(user.email)}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                  {showPasswords[user.email] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {currentUser.email === user.email ? (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Active Session</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium font-mono">Standby</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end items-center gap-2">
                                {currentUser.email !== user.email ? (
                                  <button
                                    onClick={() => onImpersonateUser(user.email, user.name)}
                                    className="py-1 px-2 text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-bold rounded-md transition-all cursor-pointer"
                                  >
                                    Impersonate
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50/80 border border-emerald-100 px-2 py-0.5 rounded-full mr-2">Viewing</span>
                                )}

                                <button
                                  onClick={() => handleEditClick(user)}
                                  className="text-slate-400 hover:text-slate-700 p-1 rounded-sm"
                                  title="Edit Credentials"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.email)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-sm"
                                  title="Delete Account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 text-[11px]">
                            No external account registrants exist. Use the button above to seed or register mock candidates.
                          </td>
                        </tr>
                      )}

                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* -- 2. SEED & DATA LABS TAB -- */}
            {activeTab === 'database' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
                    <Database className="w-5 h-5 text-slate-800" />
                    <span>Dynamic Seeding & Integrity Engine</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Inject randomized transaction streams, format system memory, or clone full configurations for project assessments</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card: Mock Transactions Injector */}
                  <div className="p-5 rounded-xl border border-slate-200/80 space-y-3.5 bg-slate-50/20">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Sparkles className="w-4.5 h-4.5 text-blue-600" />
                      <span className="text-xs font-extrabold uppercase tracking-wider">Simulate Transact Stack</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Populates 10 dynamic, fully descriptive transactions (income credits & expense charges) spanning the last 25 days, targeting Food, Ride Hailing, Books, Co-Working, and Tech. Updates charts instantly!
                    </p>
                    <button
                      type="button"
                      onClick={handleSeedMockData}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Inject 10 Mock Transactions</span>
                    </button>
                  </div>

                  {/* Card: Save Snapshot */}
                  <div className="p-5 rounded-xl border border-slate-200/80 space-y-3.5 bg-slate-50/20">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Download className="w-4.5 h-4.5 text-blue-600" />
                      <span className="text-xs font-extrabold uppercase tracking-wider">Export State Snapshot</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Saves an offline readable JSON file containing all device local state arrays: user accounts, ledger streams, category priorities, limits, and goals. Extremely useful for grading backups.
                    </p>
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Project State (JSON)</span>
                    </button>
                  </div>
                </div>

                {/* Dangerous reset parameters */}
                <div className="p-5 rounded-xl border border-rose-100 bg-rose-50/30 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-800 uppercase tracking-widest">Zone of Devastation</h4>
                      <p className="text-[11px] text-rose-500 leading-normal mt-1">
                        Performing a hard reset wipes all browser local databases (limits, custom goals, added profiles) and seeds pristine default elements in their place. This cannot be undone once committed.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('CRITICAL ACTION: Resetting will clear all transaction ledger logs, custom user registries, and reset categories to demo defaults. Are you absolutely sure?')) {
                          onResetAllData();
                          loadUsers();
                          alert('System memory wiped and successfully re-seeded with benchmark demo credentials.');
                        }
                      }}
                      className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-rose-600/10"
                    >
                      <span>Hard System Database WIPE & RESEED</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* -- 3. SYSTEM PREFERENCES & LIMITS TAB -- */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
                    <Sliders className="w-5 h-5 text-slate-800" />
                    <span>Global Controls & Alert Limits</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Customize global alerts, currencies, and announcements broadcast to the SpendWise sandbox frame</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Select currency symbol */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#6b6358] uppercase tracking-wide">System Currency Symbol</label>
                      <select
                        value={currencySymbol}
                        onChange={(e) => setCurrencySymbol(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        <option value="₹">Rupees (₹) — default for INR</option>
                        <option value="$">US Dollar ($)</option>
                        <option value="€">Euro (€)</option>
                        <option value="£">Pound Sterling (£)</option>
                        <option value="¥">Yen / Yuan (¥)</option>
                      </select>
                    </div>

                    {/* Numeric Alert threshold slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px] font-bold text-[#6b6358] uppercase tracking-wide">
                        <span>Safe Budget Warning Target</span>
                        <span className="font-mono text-blue-600 text-xs">{alertThreshold}% Spent</span>
                      </div>
                      <div className="flex items-center gap-3 py-1">
                        <input
                          type="range"
                          min="30"
                          max="95"
                          step="5"
                          value={alertThreshold}
                          onChange={(e) => setAlertThreshold(parseInt(e.target.value, 10))}
                          className="flex-1 accent-slate-900 cursor-grab"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Alerts turn to yellow warning state once budget exceeds this dynamic threshold ratio</p>
                    </div>

                  </div>

                  {/* Announcement Banner */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#6b6358] uppercase tracking-wide block">Broadband System Announcement Banner</label>
                    <textarea
                      placeholder="Type a custom broadcast notification..."
                      rows={3}
                      value={announcementBanner}
                      onChange={(e) => setAnnouncementBanner(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200/80 rounded-xl text-xs text-slate-700 outline-hidden focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-400">This banner will display prominently at the very top of the financial workspace for all logged-in accounts.</p>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      className="py-2 px-5 bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Apply Preferences</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
