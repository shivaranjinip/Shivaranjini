import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, AlertCircle, ArrowRight, Wallet } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (userEmail: string, userName: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Suggested admin demo credentials
  const DEMO_EMAIL = 'demo@expensepro.com';
  const DEMO_PASSWORD = 'password123';
  const DEMO_NAME = 'Demonstration User';

  // Handle standard actions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // 1. Validation
      if (!email.trim() || !password.trim()) {
        setError('All fields are required.');
        setLoading(false);
        return;
      }

      if (!isLogin && !name.trim()) {
        setError('Please enter your name.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Direct Demo Credential Match
        if (email.toLowerCase() === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD) {
          onLoginSuccess(DEMO_EMAIL, DEMO_NAME);
          setLoading(false);
          return;
        }

        // Check local storage registered users
        const storedUsers = localStorage.getItem('expense_pro_registered_users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const foundUser = users.find(
            (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
          );

          if (foundUser) {
            onLoginSuccess(foundUser.email, foundUser.name);
            setLoading(false);
            return;
          }
        }

        setError('Invalid email or password. You can use the Demo Credentials below.');
      } else {
        // Sign Up/Registration Action
        const storedUsers = localStorage.getItem('expense_pro_registered_users');
        const users = storedUsers ? JSON.parse(storedUsers) : [];

        // Check duplicate
        if (email.toLowerCase() === DEMO_EMAIL.toLowerCase() || users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
          setError('An account with this email address already exists.');
          setLoading(false);
          return;
        }

        const newUser = {
          name: name.trim(),
          email: email.trim(),
          password: password
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem('expense_pro_registered_users', JSON.stringify(updatedUsers));

        // Auto transition and login
        onLoginSuccess(newUser.email, newUser.name);
      }
      setLoading(false);
    }, 600);
  };

  const handleUseDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setIsLogin(true);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 md:p-8 font-sans" id="login-viewport">
      
      {/* Upper Logo / Brand header */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center py-4" id="login-top-logo">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg">
            ₹
          </div>
          <div>
            <span className="font-bold text-lg text-slate-100 font-display tracking-tight">ExpensePro</span>
            <span className="text-[9px] text-blue-400 font-bold ml-1.5 border border-blue-900/40 bg-blue-950/80 px-1 py-0.5 rounded">
              SECURE
            </span>
          </div>
        </div>
        <div id="login-header-academic">
          <span className="text-[10px] text-slate-500 font-medium tracking-wide">BCA FINAL LEVEL PROJECT</span>
        </div>
      </div>

      {/* Main visual & form grid container */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-center my-auto py-8" id="login-container">
        
        {/* Left Side: Brand presentation / pitch */}
        <div className="md:col-span-6 space-y-6 text-slate-300 pr-0 md:pr-4" id="login-visual-text">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-blue-400 border border-slate-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Secure Enterprise Architecture</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight font-display">
            Navigate your wealth with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">absolute control</span>.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            ExpensePro provides precise category tracking, real-time dynamic budget control limits, goals allocation pipelines, and bespoke client analytics in one unified ledger workspace.
          </p>

          {/* Quick Stats list */}
          <div className="grid grid-cols-2 gap-4 pt-2" id="login-stats">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-900">
              <span className="block text-xl font-bold text-blue-400">100%</span>
              <span className="text-[11px] text-slate-500 font-medium font-sans">Local Data Security</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-900">
              <span className="block text-xl font-bold text-indigo-400 font-mono">₹ Live</span>
              <span className="text-[11px] text-slate-500 font-medium font-sans font-sans">Multi-Category Ledger</span>
            </div>
          </div>
        </div>

        {/* Right Side: LogIn and Register unified secure control card */}
        <div className="md:col-span-6" id="login-card-wrapper">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 space-y-6" id="login-card">
            
            {/* Toggle state selector tabs */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800" id="login-toggle-tabs">
              <button
                type="button"
                id="tab-select-login"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  isLogin
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-select-register"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                  !isLogin
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                New Account
              </button>
            </div>

            {/* Error messaging bar */}
            {error && (
              <div
                className="p-3 bg-rose-950/20 border border-rose-900/40 text-rose-400 rounded-xl text-xs flex items-center gap-2"
                id="login-error-toast"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Credential login forms */}
            <form onSubmit={handleSubmit} className="space-y-4" id="login-action-form">
              {!isLogin && (
                <div className="space-y-1.5" id="form-group-name">
                  <label className="text-xs font-semibold text-slate-400 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                      placeholder="e.g. Shivanand Patil"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5" id="form-group-email">
                <label className="text-xs font-semibold text-slate-400 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    placeholder="e.g. you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5" id="form-group-password">
                <label className="text-xs font-semibold text-slate-400 block">Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-login-submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Saving Session...</span>
                ) : (
                  <>
                    <span>{isLogin ? 'Access Account Workspace' : 'Create Secure ID'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Assist section for Examiners and Quick start */}
            {isLogin && (
              <div className="pt-4 border-t border-slate-800/60" id="login-demo-aid">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">
                      Project Demo Sandbox Acc
                    </span>
                    <button
                      type="button"
                      id="btn-quick-fill-demo"
                      onClick={handleUseDemo}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                    >
                      Fill Credentials
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                    <div>
                      <span className="text-slate-500">Email:</span> <b className="font-mono text-slate-300">{DEMO_EMAIL}</b>
                    </div>
                    <div>
                      <span className="text-slate-500">Pwd:</span> <b className="font-mono text-slate-300">{DEMO_PASSWORD}</b>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Footer copyright marker */}
      <div className="text-center py-4 border-t border-slate-900 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-600 gap-2" id="login-footer">
        <p>© 2026 ExpensePro Academic Project Sandbox Client. All rights reserved.</p>
        <p className="font-medium bg-slate-900 border border-slate-800 text-slate-500 px-2 py-0.5 rounded">
          Local Storage Session Cache Mode
        </p>
      </div>

    </div>
  );
}
