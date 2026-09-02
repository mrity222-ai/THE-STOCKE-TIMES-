import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('finance_pulse_cookie_consent');
    if (!consent) setAccepted(false);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('finance_pulse_cookie_consent', 'accepted');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-2 text-xs">
          <h4 className="font-extrabold text-sm text-white">Privacy & Cookie Settings</h4>
          <p className="text-slate-300 leading-relaxed font-light">
            We use cookies and third-party advertising partners (such as Google AdSense) to personalize content, financial tools, and analyze traffic.
          </p>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={handleAccept}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Accept Cookies</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
