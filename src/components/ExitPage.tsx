import React from 'react';
import { ShieldCheck, LogIn, Sparkles, KeyRound } from 'lucide-react';

interface ExitPageProps {
  onReturnToLogin: () => void;
}

export function ExitPage({ onReturnToLogin }: ExitPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-4 md:p-8 font-sans" id="exit-viewport">
      
      {/* Top Header Logo */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center py-4" id="exit-top-header">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg">
            ₹
          </div>
          <div>
            <span className="font-bold text-lg text-slate-100 font-display tracking-tight">ExpensePro</span>
            <span className="text-[9px] text-emerald-400 font-bold ml-1.5 border border-emerald-900/40 bg-emerald-950/80 px-1 py-0.5 rounded uppercase tracking-wider">
              Finalized
            </span>
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide">BCA FINAL LEVEL PROJECT</span>
        </div>
      </div>

      {/* Main Exit card in center */}
      <div className="max-w-md mx-auto w-full my-auto py-12" id="exit-container">
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl p-8 space-y-6 text-center text-slate-300" id="exit-card">
          
          <div className="mx-auto w-16 h-16 bg-emerald-950/40 border border-emerald-800/30 rounded-2xl flex items-center justify-center text-emerald-400" id="exit-animation-wrapper">
            <ShieldCheck className="w-9 h-9 animate-bounce" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-blue-400 border border-slate-800/80 text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Session Terminated Safely</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight font-display">
              Logged Out Successfully
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your ExpensePro session has been closed securely. All database transaction ledgers and cache changes have been encrypted and committed to local device cache safely.
            </p>
          </div>

          {/* Local storage info block */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/60 text-left space-y-2.5 text-xs" id="exit-security-info">
            <div className="flex items-start gap-2.5 text-slate-400">
              <KeyRound className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block text-[11px] uppercase tracking-wider">Data Privacy Guarantee</span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  No server logs or remote entities have access to your budgets, goals, or income reports. Your session remains strictly sovereign.
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            id="btn-return-login"
            onClick={onReturnToLogin}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/10 text-white font-semibold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Return to Login Portal</span>
          </button>

        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center py-4 border-t border-slate-900 max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-600 gap-2" id="exit-footer">
        <p>© 2026 ExpensePro Academic Project Sandbox Client. All rights reserved.</p>
        <p className="font-medium bg-slate-900 border border-slate-800 text-slate-500 px-2 py-0.5 rounded">
          Local Storage Session Cache Mode
        </p>
      </div>

    </div>
  );
}
