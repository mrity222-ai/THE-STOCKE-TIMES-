import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Mail, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface NewsletterBoxProps {
  onNavigate?: (route: string, param?: string) => void;
  className?: string;
}

export const NewsletterBox: React.FC<NewsletterBoxProps> = ({ onNavigate, className = '' }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert('Please accept the consent terms to subscribe.');
      return;
    }
    if (email.trim()) {
      StorageService.addSubscriber(email.trim());
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 6000);
    }
  };

  return (
    <div className={`bg-[#0B1F33] text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4 font-sans relative overflow-hidden ${className}`}>
      
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>Daily Intelligence Briefing</span>
        </div>

        <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug font-serif">
          Join 85,000+ Investors Receiving Our Daily Market Pulse
        </h3>

        <p className="text-slate-300 text-xs font-light leading-relaxed">
          Get institutional stock breakdowns, central bank policy updates, tax-saving blueprints, and high-yield banking alerts delivered straight to your inbox.
        </p>
      </div>

      {submitted ? (
        <div className="bg-[#16A34A]/20 border border-[#16A34A]/40 text-emerald-300 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
          <span>Thank you for subscribing. You will now receive our latest market news and articles.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              required
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#155EEF] font-medium"
            />
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-300">
            <input
              type="checkbox"
              id="newsletter-consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 rounded accent-[#16A34A] cursor-pointer"
            />
            <label htmlFor="newsletter-consent" className="cursor-pointer font-light leading-snug">
              I agree to receive daily market updates and accept the{' '}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('legal', 'privacy')}
                className="text-emerald-400 underline font-bold hover:text-emerald-300"
              >
                Privacy Policy
              </button>.
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-[#155EEF] hover:bg-[#155EEF]/90 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Subscribe Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 pt-2 font-medium border-t border-slate-800/80">
        <span className="flex items-center gap-1 text-[#16A34A]">
          <ShieldCheck className="w-3 h-3" /> Zero Spam Guarantee
        </span>
        <span>•</span>
        <span>Unsubscribe Anytime</span>
      </div>

    </div>
  );
};
