import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { LatestArticlesSection } from '../components/articles/LatestArticlesSection';

interface ContactPageProps {
  onNavigate?: (route: string, param?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Enquiry',
    message: '',
    website: '' // Honeypot anti-spam field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setErrorMessage('Please enter a message (minimum 10 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setSuccessMessage(data.message || 'Your message has been received successfully!');
        setFormData({ name: '', email: '', subject: 'General Enquiry', message: '', website: '' });
      } else {
        setErrorMessage(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage('Network connection error. Please ensure the server is online and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-[#155EEF]/35 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest">
          <Mail className="w-4 h-4 text-[#16A34A]" />
          <span>The Stoce Times Reader Desk</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-serif">
          Contact The Stoce Times
        </h1>

        <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed font-sans">
          Have a question, feedback, correction or suggestion? We would like to hear from you. The Stoce Times welcomes feedback from readers regarding our articles, market coverage, financial tools and website experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
        
        {/* Contact Form Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-[#0B1F33] font-serif">Contact Form</h2>
            <p className="text-slate-500 text-xs">Send your inquiry, feedback or correction request directly to our desk.</p>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-2xl p-4 flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-6 space-y-3 text-center animate-in fade-in duration-300">
              <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto" />
              <h3 className="font-extrabold text-lg font-serif">Message Transmitted</h3>
              <p className="text-xs text-emerald-800 font-light leading-relaxed">
                {successMessage || 'Thank you! Your message has been saved in our database and forwarded to our editorial team.'}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-bold text-emerald-700 underline hover:text-emerald-900 cursor-pointer inline-block"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              
              {/* Honeypot Anti-Spam Hidden Field */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="hidden opacity-0 pointer-events-none absolute -z-50"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="Enter a valid email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
                >
                  <option value="General Enquiry">General Enquiry</option>
                  <option value="Editorial Feedback">Editorial Feedback / Article Query</option>
                  <option value="Corrections & Updates">Corrections & Updates</option>
                  <option value="Advertising & Business Enquiries">Advertising & Business Enquiries</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Message *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your message, question, feedback or correction request..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#155EEF] leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#155EEF] hover:bg-[#155EEF]/90 disabled:bg-slate-400 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="bg-[#FFFBEB] border border-[#F59E0B] rounded-2xl p-4 text-[11px] text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Important Security Note:</span>
            </div>
            <p>Please do not send passwords, payment information, account credentials or other highly sensitive personal information through the contact form.</p>
          </div>
        </div>

        {/* Contact Info & Department Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B1F33] text-white rounded-3xl p-8 border border-slate-800 space-y-6 shadow-2xl">
            
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <h2 className="text-xl font-extrabold text-white font-serif">Contact Information</h2>
              <p className="text-slate-400 text-xs font-light">Official publication desk details.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Website</span>
                <span className="text-white font-serif text-base font-extrabold block">The Stoce Times</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">General Contact Email</span>
                <a href="mailto:contact@thestocetimes.com" className="text-emerald-400 font-mono text-xs hover:underline block font-bold">
                  contact@thestocetimes.com
                </a>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Advertising & Business Enquiries</span>
                <a href="mailto:business@thestocetimes.com" className="text-[#155EEF] font-mono text-xs hover:underline block font-bold">
                  business@thestocetimes.com
                </a>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Response Time</span>
                <p className="text-slate-300 font-light leading-relaxed">
                  We aim to review and respond to genuine enquiries as soon as reasonably possible.
                </p>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4 text-xs text-slate-700 font-light">
            <h3 className="font-extrabold text-[#0B1F33] text-sm font-serif">Editorial Feedback & Corrections</h3>
            <p>
              If you have feedback regarding an article, market analysis or other editorial content published on The Stoce Times, please include the article title or URL where relevant.
            </p>
            <p>
              We aim to provide accurate and useful financial information. If you believe an article contains an incorrect, outdated or misleading factual statement, please contact us with the relevant details for prompt review and correction.
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Related / New Articles Section */}
      <LatestArticlesSection
        title="Explore Latest Articles & Market Reports"
        subtitle="Read expert market commentary, stock analysis, and personal finance tactics."
        limit={4}
        onNavigate={onNavigate || (() => {})}
      />

    </div>
  );
};
