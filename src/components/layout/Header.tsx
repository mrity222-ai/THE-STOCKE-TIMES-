import React, { useState, useEffect, useRef } from 'react';
import { MarketTickerBar } from './MarketTickerBar';
import { StorageService } from '../../services/storageService';
import { MarketDataService } from '../../services/marketDataService';
import { CALCULATORS_REGISTRY } from '../../data/calculatorsMeta';
import { COMPARISONS_REGISTRY } from '../../data/comparisonsMeta';
import { MarketIndex } from '../../types';
import { 
  Search, 
  Menu, 
  X, 
  ChevronDown,
  Calculator,
  ArrowRight,
  Scale,
  Activity,
  Sliders,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onNavigate: (route: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [toolsMegaOpen, setToolsMegaOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>(StorageService.getMarketIndices());

  const megaMenuRef = useRef<HTMLDivElement>(null);

  const primaryNavLinks = [
    { label: 'HOME', route: 'home' },
    { label: 'STOCK MARKET', route: 'stock-market' },
    { label: 'PERSONAL FINANCE', route: 'personal-finance' },
    { label: 'BANKING', route: 'banking' },
    { label: 'INVESTMENT', route: 'investment' },
    { label: 'FINANCE NEWS', route: 'finance-news' },
  ];

  // Quick calculators preview for mega menu
  const topCalculators = CALCULATORS_REGISTRY.slice(0, 5);
  const topComparisons = COMPARISONS_REGISTRY.slice(0, 5);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time Yahoo Finance API market data subscription
  useEffect(() => {
    const unsubscribe = MarketDataService.subscribeToLiveUpdates((liveData) => {
      if (liveData && liveData.length > 0) {
        setMarketIndices(liveData);
      }
    }, 10000); // Live poll every 10 seconds

    return () => unsubscribe();
  }, []);

  // Close mega menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setToolsMegaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search', searchQuery.trim());
      setSearchQuery('');
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white transition-all duration-200" style={{
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.06)' : 'none'
    }}>

      {/* ==========================================
          LEVEL 1 — BRAND BAR (White Background)
         ========================================== */}
      <div className="bg-white border-b border-[#E2E8F0] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Mobile Left: Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#0B1F33] hover:bg-slate-100 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* LEFT: Wordmark Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex flex-col cursor-pointer group shrink-0"
          >
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 font-sans block -mb-1">
              THE
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0B1F33] font-serif tracking-tight leading-none group-hover:text-[#155EEF] transition-colors">
              STOCE TIMES
            </span>
            {/* Subtle green accent line under wordmark */}
            <div className="border-b-2 border-[#16A34A]/80 w-12 pt-0.5 transition-all group-hover:w-full group-hover:border-[#155EEF]" />
          </div>

          {/* CENTER: Desktop Search Box */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex items-center relative w-72 sm:w-80 lg:w-96"
          >
            <input
              type="text"
              placeholder="Search markets, stocks, articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#111827] placeholder-slate-400 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#155EEF] focus:bg-white transition-all font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          </form>

          {/* RIGHT: Functional Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden p-2 rounded-lg text-[#0B1F33] hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle search input"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Financial Tools Shortcut */}
            <button
              onClick={() => onNavigate('financial-tools')}
              className="hidden sm:flex items-center gap-2 bg-[#0B1F33] hover:bg-[#0B1F33]/90 text-white text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Calculator className="w-4 h-4 text-[#16A34A]" />
              <span>Financial Tools</span>
            </button>
          </div>

        </div>

        {/* Mobile Expandable Search Input */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search markets, stocks, articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#111827] placeholder-slate-400 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>
          </div>
        )}
      </div>


      {/* ==========================================
          LEVEL 2 — PRIMARY NAVIGATION (Navy Bar - Larger Font & Increased Spacing)
         ========================================== */}
      <div className="bg-[#0B1F33] hidden lg:block border-b border-slate-800 text-white select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between relative" ref={megaMenuRef}>
          
          <nav className="flex items-center gap-2 font-sans text-sm font-bold tracking-wide">
            {primaryNavLinks.map((link) => {
              const isActive = activeTab === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => onNavigate(link.route)}
                  className={`px-4.5 py-3.5 transition-colors cursor-pointer relative flex items-center text-xs xl:text-sm ${
                    isActive ? 'text-white font-extrabold' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {/* Active Indicator 3px Green Line */}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[3px] bg-[#16A34A] rounded-t" />
                  )}
                </button>
              );
            })}

            {/* TOOLS MEGA MENU BUTTON & DROPDOWN CONTAINER */}
            <div className="relative">
              <button
                onClick={() => setToolsMegaOpen(!toolsMegaOpen)}
                className={`px-3.5 py-3 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  toolsMegaOpen || activeTab.includes('calculator') || activeTab.includes('vs') || activeTab.includes('tools')
                    ? 'text-white font-extrabold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>TOOLS & CALCULATORS</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#16A34A] transition-transform duration-200 ${toolsMegaOpen ? 'rotate-180' : ''}`} />
                {(activeTab.includes('calculator') || activeTab.includes('vs')) && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#16A34A]" />
                )}
              </button>

              {/* TOOLS MEGA-MENU DROPDOWN */}
              {toolsMegaOpen && (
                <div className="absolute top-full right-0 left-auto mt-1 w-[560px] max-w-[calc(100vw-32px)] bg-white text-[#111827] rounded-2xl shadow-2xl border border-[#E2E8F0] p-6 z-[100] grid grid-cols-2 gap-6 animate-in fade-in duration-150">
                  
                  {/* Column 1: CALCULATORS */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Calculator className="w-4 h-4 text-[#155EEF]" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B1F33] font-serif">CALCULATORS</span>
                    </div>

                    <div className="space-y-1">
                      {topCalculators.map(calc => (
                        <button
                          key={calc.id}
                          onClick={() => { setToolsMegaOpen(false); onNavigate(calc.id); }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#155EEF]">{calc.name}</span>
                          <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#155EEF] group-hover:translate-x-1 transition-transform shrink-0" />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => { setToolsMegaOpen(false); onNavigate('financial-tools'); }}
                      className="text-xs font-extrabold text-[#155EEF] hover:underline pt-2 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Financial Tools (20) →</span>
                    </button>
                  </div>

                  {/* Column 2: COMPARISONS */}
                  <div className="space-y-3 border-l border-slate-100 pl-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Scale className="w-4 h-4 text-[#16A34A]" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B1F33] font-serif">COMPARISONS</span>
                    </div>

                    <div className="space-y-1">
                      {topComparisons.map(comp => (
                        <button
                          key={comp.id}
                          onClick={() => { setToolsMegaOpen(false); onNavigate(comp.id); }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer"
                        >
                          <span className="text-xs font-bold text-slate-800 group-hover:text-[#16A34A]">{comp.name}</span>
                          <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-[#16A34A] group-hover:translate-x-1 transition-transform shrink-0" />
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => { setToolsMegaOpen(false); onNavigate('comparison-tools'); }}
                      className="text-xs font-extrabold text-[#16A34A] hover:underline pt-2 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Comparison Suites (6) →</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          </nav>

          {/* Header Level 2 Right Info */}
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            <span>LIVE YAHOO API FEED</span>
          </div>

        </div>
      </div>


      {/* ==========================================
          LEVEL 3 — MARKET TICKER (Deep Navy Bar)
         ========================================== */}
      <MarketTickerBar indices={marketIndices} />


      {/* ==========================================
          MOBILE NAVIGATION DRAWER
         ========================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 pt-4 pb-8 space-y-6 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">THE</span>
              <span className="text-xl font-extrabold text-[#0B1F33] font-serif">STOCE TIMES</span>
            </div>
            <span className="text-xs font-bold text-[#16A34A]">Publication Menu</span>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {primaryNavLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => { onNavigate(link.route); setMobileMenuOpen(false); }}
                className={`w-full p-3 rounded-xl text-left font-bold text-xs flex items-center justify-between transition-colors min-h-[44px] cursor-pointer ${
                  activeTab === link.route ? 'bg-[#0B1F33] text-white' : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>{link.label}</span>
                {activeTab === link.route && <span className="w-2 h-2 rounded-full bg-[#16A34A]" />}
              </button>
            ))}
          </div>

          {/* Tools & Comparison Section */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">INTERACTIVE SUITES</span>
            
            <button
              onClick={() => { onNavigate('financial-tools'); setMobileMenuOpen(false); }}
              className="w-full p-3 rounded-xl bg-blue-50 text-[#155EEF] font-extrabold text-xs flex items-center justify-between min-h-[44px] cursor-pointer"
            >
              <span>20 FINANCIAL CALCULATORS</span>
              <Calculator className="w-4 h-4 text-[#155EEF]" />
            </button>

            <button
              onClick={() => { onNavigate('comparison-tools'); setMobileMenuOpen(false); }}
              className="w-full p-3 rounded-xl bg-emerald-50 text-[#16A34A] font-extrabold text-xs flex items-center justify-between min-h-[44px] cursor-pointer"
            >
              <span>6 COMPARISON TOOLS</span>
              <Scale className="w-4 h-4 text-[#16A34A]" />
            </button>
          </div>

          {/* Trust & Company Links */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600">
            <button
              onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-left cursor-pointer min-h-[44px] flex items-center"
            >
              About Us
            </button>
            <button
              onClick={() => { onNavigate('contact'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-left cursor-pointer min-h-[44px] flex items-center"
            >
              Contact Us
            </button>
          </div>

        </div>
      )}

    </header>
  );
};
