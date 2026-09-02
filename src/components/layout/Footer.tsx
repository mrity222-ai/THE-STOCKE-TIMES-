import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { 
  TrendingUp, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Youtube,
  Code2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string, param?: string) => void;
  onOpenSeoModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSeoModal }) => {
  // Mobile accordion collapse states
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#071827] text-slate-300 border-t border-[#16A34A]/25 pt-10 pb-6 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Main Grid: Brand Block + 4 Navigation Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 pb-8 border-b border-white/10">
          
          {/* Brand Area (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer inline-flex group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif block">
                  THE STOCE TIMES
                </span>
                <span className="text-[11px] font-bold text-[#16A34A] uppercase tracking-wider block font-sans">
                  Independent Market Research, Financial News & Insights
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed pr-2 font-light">
              Market research, financial news, investment insights, personal finance, 20 calculators, and educational resources.
            </p>

            {/* Social Icons (High Contrast, Platform Colors & Tooltips) */}
            <div className="flex items-center gap-2.5 pt-1">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                title="Follow The Stoce Times on Twitter"
                className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-all cursor-pointer shadow-xs"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                title="Connect with The Stoce Times on LinkedIn"
                className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-all cursor-pointer shadow-xs"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                title="Follow The Stoce Times on Facebook"
                className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all cursor-pointer shadow-xs"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                title="Subscribe to The Stoce Times on YouTube"
                className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-200 hover:text-white hover:bg-[#FF0000] hover:border-[#FF0000] transition-all cursor-pointer shadow-xs"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Columns (Accordion on Mobile, Grid on Desktop) */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Column 1: EXPLORE */}
            <div className="border-b border-white/5 sm:border-b-0 pb-3 sm:pb-0">
              <button
                onClick={() => toggleAccordion('explore')}
                className="w-full flex items-center justify-between sm:justify-start gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest border-l-2 border-[#16A34A] pl-2.5 cursor-pointer py-1"
              >
                <span>EXPLORE</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 sm:hidden transition-transform ${openSection === 'explore' ? 'rotate-180' : ''}`} />
              </button>

              <ul className={`space-y-2 text-xs font-medium text-slate-300 mt-3 ${openSection === 'explore' ? 'block' : 'hidden sm:block'}`}>
                <li>
                  <button onClick={() => onNavigate('stock-market')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Stock Market</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('personal-finance')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Personal Finance</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('banking')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Banking</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('investment')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Investment</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('finance-news')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Finance News</button>
                </li>
              </ul>
            </div>

            {/* Column 2: FINANCIAL TOOLS */}
            <div className="border-b border-white/5 sm:border-b-0 pb-3 sm:pb-0">
              <button
                onClick={() => toggleAccordion('tools')}
                className="w-full flex items-center justify-between sm:justify-start gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest border-l-2 border-[#16A34A] pl-2.5 cursor-pointer py-1"
              >
                <span>FINANCIAL TOOLS</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 sm:hidden transition-transform ${openSection === 'tools' ? 'rotate-180' : ''}`} />
              </button>

              <ul className={`space-y-2 text-xs font-medium text-slate-300 mt-3 ${openSection === 'tools' ? 'block' : 'hidden sm:block'}`}>
                <li>
                  <button onClick={() => onNavigate('financial-tools')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">20 Financial Calculators</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('comparison-tools')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">6 Comparison Tools</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('sip-calculator')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">SIP Calculator</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('emi-calculator')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">EMI Calculator</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('income-tax-calculator')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Income Tax Calculator</button>
                </li>
              </ul>
            </div>

            {/* Column 3: ABOUT */}
            <div className="border-b border-white/5 sm:border-b-0 pb-3 sm:pb-0">
              <button
                onClick={() => toggleAccordion('about')}
                className="w-full flex items-center justify-between sm:justify-start gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest border-l-2 border-[#16A34A] pl-2.5 cursor-pointer py-1"
              >
                <span>ABOUT US</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 sm:hidden transition-transform ${openSection === 'about' ? 'rotate-180' : ''}`} />
              </button>

              <ul className={`space-y-2 text-xs font-medium text-slate-300 mt-3 ${openSection === 'about' ? 'block' : 'hidden sm:block'}`}>
                <li>
                  <button onClick={() => onNavigate('about')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">About Editorial Desk</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('contact')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Contact Us</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('search')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Search News</button>
                </li>
              </ul>
            </div>

            {/* Column 4: LEGAL */}
            <div className="pb-3 sm:pb-0">
              <button
                onClick={() => toggleAccordion('legal')}
                className="w-full flex items-center justify-between sm:justify-start gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest border-l-2 border-[#16A34A] pl-2.5 cursor-pointer py-1"
              >
                <span>LEGAL & POLICIES</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 sm:hidden transition-transform ${openSection === 'legal' ? 'rotate-180' : ''}`} />
              </button>

              <ul className={`space-y-2 text-xs font-medium text-slate-300 mt-3 ${openSection === 'legal' ? 'block' : 'hidden sm:block'}`}>
                <li>
                  <button onClick={() => onNavigate('legal', 'privacy')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Privacy Policy</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal', 'terms')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Terms & Conditions</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal', 'disclaimer')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Disclaimer</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal', 'cookie')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Cookie Policy</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal', 'editorial')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Editorial Policy</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal', 'corrections')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Corrections Policy</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal', 'dmca')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">DMCA Policy</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal', 'affiliate')} className="hover:text-[#16A34A] transition-colors cursor-pointer py-1 block">Affiliate Disclosure</button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Financial Disclaimer Box & Read Full Disclaimer Link */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2 text-xs text-slate-400 font-light">
          <div className="flex items-center gap-2 font-extrabold text-amber-400 uppercase tracking-wider text-[11px]">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>FINANCIAL & REGULATORY DISCLAIMER</span>
          </div>
          <p className="leading-relaxed">
            The information published on The Stoce Times is provided for general informational and educational purposes only. It should not be considered personalized investment, financial, tax, accounting or legal advice. Financial markets involve risk, and readers should conduct their own research and consider consulting a qualified professional before making financial decisions.
            <button
              onClick={() => onNavigate('legal', 'disclaimer')}
              className="text-[#16A34A] font-bold hover:underline ml-1 inline-flex items-center gap-1 cursor-pointer"
            >
              Read full disclaimer →
            </button>
          </p>
        </div>

        {/* Bottom Copyright & Clean Non-Duplicate Links Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© {currentYear} The Stoce Times. All Rights Reserved.</p>

          <div className="flex flex-wrap items-center gap-3.5">
            <button 
              onClick={onOpenSeoModal} 
              className="hover:text-[#16A34A] transition-colors flex items-center gap-1 text-slate-300 cursor-pointer font-bold"
              title="View HTML Sitemap"
            >
              <Code2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>HTML Sitemap</span>
            </button>

            <span>|</span>

            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact Us
            </button>

            <span>|</span>

            <button
              onClick={() => onNavigate('legal', 'corrections')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Corrections Policy
            </button>

            <span>|</span>

            <button
              onClick={() => onNavigate('legal', 'privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Accessibility
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
