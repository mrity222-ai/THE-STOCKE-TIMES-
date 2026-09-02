import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Mail, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';

interface UnsubscribePageProps {
  onNavigate: (route: string) => void;
}

export const UnsubscribePage: React.FC<UnsubscribePageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'pending' | 'unsubscribed' | 'error'>('pending');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      handleUnsubscribe(emailParam);
    }
  }, []);

  const handleUnsubscribe = (targetEmail: string) => {
    try {
      const subs = StorageService.getSubscribers();
      const target = subs.find(s => s.email.toLowerCase() === targetEmail.toLowerCase());
      if (target) {
        StorageService.updateSubscriberStatus(target.id, 'Unsubscribed');
      } else {
        StorageService.addSubscriber(targetEmail);
        const newSubs = StorageService.getSubscribers();
        const created = newSubs.find(s => s.email.toLowerCase() === targetEmail.toLowerCase());
        if (created) StorageService.updateSubscriberStatus(created.id, 'Unsubscribed');
      }
      setStatus('unsubscribed');
    } catch (e) {
      setStatus('error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      handleUnsubscribe(email.trim());
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 font-sans space-y-6 animate-in fade-in duration-200">
      
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-6 text-center">
        
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F33] font-serif">
            Unsubscribe from The Stoce Times
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-light leading-relaxed">
            We are sorry to see you go. You can unsubscribe or re-subscribe anytime.
          </p>
        </div>

        {status === 'unsubscribed' ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 rounded-2xl space-y-2 text-xs">
            <CheckCircle2 className="w-6 h-6 text-[#16A34A] mx-auto" />
            <p className="font-bold text-sm">Successfully Unsubscribed</p>
            <p className="text-slate-600">
              <strong>{email}</strong> has been removed from our daily article broadcast stream.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Your Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter email to unsubscribe"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Confirm Unsubscribe
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#155EEF] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to The Stoce Times Homepage
          </button>
        </div>

      </div>

    </div>
  );
};
