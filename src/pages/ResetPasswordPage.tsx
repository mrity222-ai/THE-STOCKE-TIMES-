import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft, TrendingUp } from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  // Extract token from URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password strength checks
  const hasMinLen = newPassword.length >= 10;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSymbol;

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('Password does not meet all security requirements.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setIsSuccess(true);
        setStatusMsg(data.message);
      } else {
        setErrorMsg(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Network error while resetting password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-6 z-10 relative">
        
        {/* Brand Header */}
        <div className="bg-slate-900 text-white p-8 text-center space-y-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-700 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 font-mono block">
              THE STOCE TIMES — SECURITY SYSTEM
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-serif mt-1">
              Reset Admin Password
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-light">
              Enter your new 10+ character password to complete resetting your account credentials.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 pt-0 space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs rounded-xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 leading-relaxed font-medium">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                {statusMsg}
              </div>

              <button
                onClick={() => onNavigate('admin')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl cursor-pointer"
              >
                Proceed to Admin Login →
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              
              {/* New Password Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
                  New Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Enter new password"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Re-enter new password"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Password Strength Checklist */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs font-mono">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                  Password Strength Requirements:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className={hasMinLen ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {hasMinLen ? '✓' : '○'} Min 10 characters
                  </span>
                  <span className={hasUpper ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {hasUpper ? '✓' : '○'} Uppercase letter (A-Z)
                  </span>
                  <span className={hasLower ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {hasLower ? '✓' : '○'} Lowercase letter (a-z)
                  </span>
                  <span className={hasNumber ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {hasNumber ? '✓' : '○'} Number (0-9)
                  </span>
                  <span className={hasSymbol ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {hasSymbol ? '✓' : '○'} Symbol (@$!%*?)
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid || newPassword !== confirmPassword}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Resetting Password...' : 'Save New Password →'}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-white py-2 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Admin Login</span>
              </button>

            </form>
          )}

        </div>

      </div>

    </div>
  );
};
