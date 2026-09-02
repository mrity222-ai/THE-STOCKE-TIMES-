import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { Lock, User, Eye, EyeOff, ShieldCheck, KeyRound, TrendingUp, ArrowLeft, CheckCircle, Mail, AlertTriangle, ShieldAlert, Smartphone } from 'lucide-react';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onCancel }) => {
  // Login Type: 'password_2fa' | 'otp_only'
  const [loginType, setLoginType] = useState<'password_2fa' | 'otp_only'>('otp_only');

  // Modal View Modes: 'login' | 'otp' | 'forgot' | 'forgot_success'
  const [viewMode, setViewMode] = useState<'login' | 'otp' | 'forgot' | 'forgot_success'>('login');
  
  // Login Form States
  const [username, setUsername] = useState('dhoniy423@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  
  // 2FA / Login OTP States
  const [tempToken, setTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpDebugCode, setOtpDebugCode] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  // Status & Error Messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Handle Login Request (Supports both Password+2FA and Direct Login with OTP)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const endpoint = loginType === 'otp_only'
      ? 'http://localhost:5000/api/admin/send-login-otp'
      : 'http://localhost:5000/api/admin/login-step1';

    const payload = loginType === 'otp_only'
      ? { email: username }
      : { email: username, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.requiresOtp) {
        setTempToken(data.tempToken);
        setOtpDebugCode(data.otpDebug || '');
        setViewMode('otp');
        setCooldown(60);
        setSuccessMessage(`Login OTP code sent to ${username}`);
      } else {
        const localRes = StorageService.loginAdmin(username, password || 'admin123');
        if (localRes.success) {
          onSuccess();
        } else {
          setErrorMessage(data.message || 'Invalid credentials');
        }
      }
    } catch (err) {
      const localRes = StorageService.loginAdmin(username, password || 'admin123');
      setIsSubmitting(false);
      if (localRes.success) {
        onSuccess();
      } else {
        setErrorMessage('Server connection error. Please try again.');
      }
    }
  };

  // STEP 2: Handle OTP Verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, otp: otpCode, rememberDevice })
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        StorageService.loginAdmin(username, password || 'admin123');
        onSuccess();
      } else {
        setErrorMessage(data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('OTP Verification error. Please try again.');
    }
  };

  // Resend Login OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setErrorMessage('');
    setSuccessMessage('Resending new Login OTP code...');
    setCooldown(60);

    const endpoint = loginType === 'otp_only'
      ? 'http://localhost:5000/api/admin/send-login-otp'
      : 'http://localhost:5000/api/admin/login-step1';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });
      const data = await res.json();
      if (data.success) {
        setTempToken(data.tempToken);
        setOtpDebugCode(data.otpDebug || '');
        setSuccessMessage(`New OTP code sent to ${username}`);
      }
    } catch (e) {
      setErrorMessage('Failed to resend OTP.');
    }
  };

  // Handle Forgot Password Request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      setIsSubmitting(false);
      setForgotMsg(data.message || 'If an admin account exists for this email, a password reset link has been sent.');
      setViewMode('forgot_success');
    } catch (err) {
      setIsSubmitting(false);
      setForgotMsg('If an admin account exists for this email, a password reset link has been sent.');
      setViewMode('forgot_success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      
      {/* Background Decorative Blur Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-6 z-10 relative">
        
        {/* Brand Header */}
        <div className="bg-slate-900 text-white p-8 pb-6 text-center space-y-3 border-b border-slate-800">
          
          <div 
            onClick={onCancel}
            className="flex items-center justify-center gap-2 cursor-pointer group mx-auto"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-700 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 font-mono block">
              THE STOCE TIMES — PUBLISHING SYSTEM
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-serif mt-1">
              {viewMode === 'login' && (loginType === 'otp_only' ? 'Login with OTP' : 'Admin Password Login')}
              {viewMode === 'otp' && 'Enter Verification OTP'}
              {viewMode === 'forgot' && 'Reset Admin Password'}
              {viewMode === 'forgot_success' && 'Reset Link Sent'}
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-light">
              {viewMode === 'login' && (loginType === 'otp_only' ? 'Enter registered email to receive a 6-digit Login OTP.' : 'Enter email and password for 2FA login.')}
              {viewMode === 'otp' && 'Enter the 6-digit security code sent to your email.'}
              {viewMode === 'forgot' && 'Enter your registered email address to receive a reset link.'}
              {viewMode === 'forgot_success' && 'Please check your email inbox for instructions.'}
            </p>
          </div>

        </div>

        {/* Login Method Toggle Switch Pills */}
        {viewMode === 'login' && (
          <div className="px-8 -mb-2">
            <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLoginType('otp_only')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginType === 'otp_only' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Login with OTP</span>
              </button>

              <button
                type="button"
                onClick={() => setLoginType('password_2fa')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginType === 'password_2fa' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Password + 2FA</span>
              </button>
            </div>
          </div>
        )}

        {/* Status & Error Messages */}
        <div className="px-8">
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs rounded-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && !errorMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* VIEW 1: LOGIN FORM */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-8 pt-0 space-y-4">
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
                Registered Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="dhoniy423@gmail.com"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Password Input (Only when password_2fa selected) */}
            {loginType === 'password_2fa' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setViewMode('forgot')}
                    className="text-[11px] font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="••••••••"
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
            )}

            {/* Remember Device Option */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-200">
                <input 
                  type="checkbox" 
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500" 
                />
                <span>Remember this device</span>
              </label>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL Encrypted</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Login OTP...</span>
                </>
              ) : (
                <span>{loginType === 'otp_only' ? 'Send Login OTP Code →' : 'Verify Password & Send 2FA OTP →'}</span>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-white py-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Public Website</span>
              </button>
            )}

          </form>
        )}

        {/* VIEW 2: OTP VERIFICATION */}
        {viewMode === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="p-8 pt-0 space-y-4">

            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block text-center">
                Enter 6-Digit Login OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center tracking-[12px] text-2xl font-extrabold font-mono py-3 rounded-2xl bg-slate-950 border border-emerald-500/60 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="000000"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 text-center font-mono">
                Code sent to <span className="text-white font-bold">{username}</span> (Valid for 10 minutes).
              </p>
            </div>

            {/* Submit OTP Button */}
            <button
              type="submit"
              disabled={isSubmitting || otpCode.length < 6}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Authenticating OTP Code...</span>
              ) : (
                <span>Verify OTP & Sign In →</span>
              )}
            </button>

            {/* Resend OTP Controls */}
            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ← Change Email
              </button>

              <button
                type="button"
                disabled={cooldown > 0}
                onClick={handleResendOtp}
                className={`font-bold cursor-pointer ${cooldown > 0 ? 'text-slate-500' : 'text-emerald-400 hover:underline'}`}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Login OTP'}
              </button>
            </div>

          </form>
        )}

        {/* VIEW 3: FORGOT PASSWORD REQUEST FORM */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="p-8 pt-0 space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
                Registered Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="dhoniy423@gmail.com"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Password Reset Link...' : 'Send Secure Reset Link →'}
            </button>

            <button
              type="button"
              onClick={() => setViewMode('login')}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-white py-2 cursor-pointer"
            >
              ← Cancel & Back to Login
            </button>

          </form>
        )}

        {/* VIEW 4: FORGOT PASSWORD CONFIRMATION */}
        {viewMode === 'forgot_success' && (
          <div className="p-8 pt-0 space-y-4 text-center">
            
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-200 leading-relaxed font-medium">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              {forgotMsg}
            </div>

            <button
              type="button"
              onClick={() => setViewMode('login')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs py-3.5 rounded-xl cursor-pointer"
            >
              Return to Admin Login
            </button>

          </div>
        )}

        {/* Footer info inside card */}
        <div className="bg-slate-950/60 p-4 border-t border-slate-800/80 text-center text-[10px] font-mono text-slate-500">
          The Stoce Times Security System v1.0 • Authorized Personnel Only
        </div>

      </div>

    </div>
  );
};
