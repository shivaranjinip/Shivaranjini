import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, AlertCircle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

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

  // Suggested demo credentials
  const DEMO_EMAIL = 'demo@expensepro.com';
  const DEMO_PASSWORD = 'password123';
  const DEMO_NAME = 'Demonstration User';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (!email.trim() || !password.trim()) {
        setError('All credentials fields are required.');
        setLoading(false);
        return;
      }

      if (!isLogin && !name.trim()) {
        setError('Please enter your full name to set up the sovereign ledger.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Security password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Direct match with Demo Credentials
        if (email.toLowerCase() === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD) {
          onLoginSuccess(DEMO_EMAIL, DEMO_NAME);
          setLoading(false);
          return;
        }

        // Search local registered database
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

        setError('Invalid credentials combination. Use the Quick-Fill Demo Sandbox Key listed below.');
      } else {
        // Sign Up/New account registration
        const storedUsers = localStorage.getItem('expense_pro_registered_users');
        const users = storedUsers ? JSON.parse(storedUsers) : [];

        if (email.toLowerCase() === DEMO_EMAIL.toLowerCase() || users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
          setError('A secure portfolio ledger with this email already exists.');
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

        onLoginSuccess(newUser.email, newUser.name);
      }
      setLoading(false);
    }, 550);
  };

  const handleUseDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setIsLogin(true);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-organic-bg text-organic-text-on font-nunito" id="login-screen-view">
      
      {/* LEFT SECTION: Authenticating Desk */}
      <section className="w-full md:w-[45%] lg:w-[40%] flex flex-col justify-between px-6 md:px-12 lg:px-16 py-8 bg-organic-bg z-1 z-10 border-r border-[#eae6de] shadow-lg">
        
        {/* Upper Brand Badge */}
        <div className="flex items-center justify-between pb-4" id="login-header text-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-organic-primary rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-organic-primary/20">
              ₹
            </div>
            <div>
              <span className="font-header text-base text-organic-text-on font-bold tracking-tight block">Expense</span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-organic-primary mt-[-2px] block">
                Sovereign Ledger
              </span>
            </div>
          </div>
        </div>

        {/* Core Auth Forms block */}
        <div className="my-auto py-8 space-y-6" id="auth-flow-wrapper">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-organic-primary/10 text-organic-primary-dark text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-organic-primary" />
              <span>Grounded Financial Intent</span>
            </div>
            
            <h1 className="font-serif text-3.5xl font-black text-organic-text-on tracking-tight leading-tight pt-1">
              {isLogin ? 'Welcome Back' : 'Create Ledger'}
            </h1>
            <p className="text-xs text-organic-secondary leading-relaxed">
              {isLogin 
                ? 'Manage your household budgets, income pipelines, and academic targets with steady steps.'
                : 'Seed your database instance locally and secure it with a private client-side ledger key.'
              }
            </p>
          </div>

          {/* Dual Toggle Selectors */}
          <div className="flex bg-organic-surface-low border border-organic-border/70 p-1 rounded-xl" id="auth-state-toggles">
            <button
              type="button"
              id="btn-toggle-to-sigin"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isLogin
                  ? 'bg-organic-primary text-white shadow-xs'
                  : 'text-organic-secondary hover:text-organic-text-on'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="btn-toggle-to-create"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-organic-primary text-white shadow-xs'
                  : 'text-organic-secondary hover:text-organic-text-on'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Authentication Alert Feedback */}
          {error && (
            <div className="p-3 bg-red-100/40 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2" id="auth-toast-problem">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Actual Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4" id="credentials-inner-form">
            {!isLogin && (
              <div className="space-y-1" id="form-name-field">
                <label className="text-[11px] font-bold text-[#6b6358] uppercase tracking-wide ml-0.5">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 o-4 text-organic-primary/60" />
                  <input
                    type="text"
                    required
                    id="input-name-register"
                    placeholder="e.g. Shivanand Patil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 pl-9 bg-white border border-[#c4c8bc] focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 rounded-xl text-xs text-organic-text-on outline-hidden transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1" id="form-email-field">
              <label className="text-[11px] font-bold text-[#6b6358] uppercase tracking-wide ml-0.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 o-4 text-organic-primary/60" />
                <input
                  type="email"
                  required
                  id="input-email-auth"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 pl-9 bg-white border border-[#c4c8bc] focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 rounded-xl text-xs text-organic-text-on outline-hidden transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1" id="form-password-field">
              <div className="flex justify-between items-center text-[11px] font-bold text-[#6b6358] uppercase tracking-wide ml-0.5">
                <span>Security Password</span>
                {isLogin && (
                  <span className="text-[10px] text-organic-primary hover:underline cursor-not-allowed">Reset Key</span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 o-4 text-organic-primary/60" />
                <input
                  type="password"
                  required
                  id="input-password-auth"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pl-9 bg-white border border-[#c4c8bc] focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 rounded-xl text-xs text-organic-text-on outline-hidden transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              id="submit-auth-primary-action"
              disabled={loading}
              className="w-full py-3 px-4 bg-organic-primary hover:bg-organic-primary-dark active:scale-[0.99] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {loading ? (
                <span className="flex items-center gap-1.5 animate-pulse">
                  <ShieldCheck className="w-4 h-4 text-emerald-300 animate-spin" />
                  <span>Committing Security handshake...</span>
                </span>
              ) : (
                <>
                  <span>{isLogin ? 'Access Secure Portfolio' : 'Initialize Dynamic Ledger'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Assist Sandbox Card */}
          {isLogin && (
            <div className="p-3.5 bg-organic-surface-card border border-organic-border/60 rounded-xl space-y-2 text-xs" id="academic-demo-card">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#6b6358] block">
                  Examiner Sandbox Credentials
                </span>
                <button
                  type="button"
                  id="btn-use-quick-auth-demo"
                  onClick={handleUseDemo}
                  className="text-[10px] text-organic-primary hover:text-organic-primary-dark font-black underline transition-colors cursor-pointer"
                >
                  Quick Fill Demo
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#6b6358] font-semibold font-mono">
                <div>
                  <span className="text-slate-400">UID:</span> <b className="text-organic-text-on bg-white px-1 py-0.5 rounded border border-organic-border/30">{DEMO_EMAIL}</b>
                </div>
                <div>
                  <span className="text-slate-400">KEY:</span> <b className="text-organic-text-on bg-white px-1 py-0.5 rounded border border-organic-border/30">password123</b>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project Credits */}
        <footer className="text-[10px] text-organic-secondary/80 border-t border-organic-border/40 pt-4 flex flex-col gap-1" id="academic-notes">
          <p className="font-semibold text-organic-text-on">© 2026 Expense Project.</p>
          <p>Rooted in Clarity • Secured with Sovereign Device LocalStorage</p>
        </footer>

      </section>

      {/* RIGHT SECTION: Organic Earthy Interactive Branding Graphic */}
      <section className="hidden md:flex relative w-full md:w-[55%] lg:w-[60%] h-full bg-[#f0e8db] items-center justify-center overflow-hidden p-12 select-none" id="right-branding-panel">
        
        {/* Holographic glowing organic clouds */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-organic-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-40 left-10 w-96 h-96 bg-[#c4a66a]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-8" id="right-core-content">
          
          {/* Main Floating 3D Artwork Element */}
          <div className="floating-element max-w-[420px] filter drop-shadow-[0_24px_64px_rgba(74,124,89,0.22)]" id="floating-artwork">
            <img 
              alt="Organic isometric financial growth illustration" 
              className="w-full h-auto object-contain rounded-2xl" 
              src="https://lh3.googleusercontent.com/aida/ADBb0ugYU7lnPoRae0WpJwpBj3b8bI-FgnAAZsrnQcB08IUllHu3h8pku6Ctffo9QxGPGWB6zPagMm4wqolHgaLjoXRlCYu5xOie3OhuT28BMyH5s5hepw1is7LY9_TZSaUNPnB98STGIIJFNE-HVqiL5ygEOiPMGsODfgaxPbf4yuB2Du324UABtw80hmuMHaFpQkBU5jTTPw7F2c8XuPQpsUg1tNX3JYtFgOq38tMAnujv-fP90JlLdO1AMQiH"
            />
          </div>

          <div className="max-w-md space-y-3" id="right-copy">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-organic-primary text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Grounded in Intention</span>
            </span>
            <h2 className="font-serif text-3xl font-black text-organic-primary-dark tracking-tight leading-tight">
              Sovereign Asset Cultivation
            </h2>
            <p className="text-sm text-[#4a4538] leading-relaxed">
              Experience a highly structured approaches to consumer accounting. Expense helps you cultivate your funds with calm, purposeful, and steady milestones.
            </p>
          </div>

        </div>

        {/* Fancy organic curve banner */}
        <svg className="absolute bottom-0 left-0 w-full h-auto text-organic-primary/5 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,224C960,245,1056,235,1152,202.7C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="currentColor"></path>
        </svg>

      </section>

    </div>
  );
}
