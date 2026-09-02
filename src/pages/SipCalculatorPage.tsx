import React, { useState, useMemo } from 'react';
import { AdSlot } from '../components/ads/AdSlot';
import { 
  Calculator, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Sliders, 
  ArrowRight, 
  HelpCircle, 
  ShieldAlert, 
  Calendar, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SipCalculatorPageProps {
  onNavigate: (route: string, param?: string) => void;
}

export const SipCalculatorPage: React.FC<SipCalculatorPageProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<'sip' | 'lumpsum'>('sip');

  // Inputs State
  const [investmentAmount, setInvestmentAmount] = useState<number>(5000); // ₹5,000 / mo
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12); // 12% p.a.
  const [tenureYears, setTenureYears] = useState<number>(10); // 10 Years

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculations
  const sipResults = useMemo(() => {
    const years = Math.max(1, tenureYears);
    const rate = expectedReturnRate;

    if (mode === 'sip') {
      const P = Math.max(100, investmentAmount);
      const i = rate / 12 / 100;
      const n = years * 12;

      const totalInvested = P * n;
      const totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const estimatedReturns = Math.max(0, totalValue - totalInvested);

      return {
        totalInvested: Math.round(totalInvested),
        estimatedReturns: Math.round(estimatedReturns),
        totalValue: Math.round(totalValue)
      };
    } else {
      // Lumpsum: A = P * (1 + r/100)^n
      const P = Math.max(500, investmentAmount);
      const totalValue = P * Math.pow(1 + rate / 100, years);
      const totalInvested = P;
      const estimatedReturns = Math.max(0, totalValue - totalInvested);

      return {
        totalInvested: Math.round(totalInvested),
        estimatedReturns: Math.round(estimatedReturns),
        totalValue: Math.round(totalValue)
      };
    }
  }, [mode, investmentAmount, expectedReturnRate, tenureYears]);

  // Yearly Growth Schedule Table Generator
  const yearlySchedule = useMemo(() => {
    const years = tenureYears;
    const rate = expectedReturnRate;
    const rows: { year: number; invested: number; returns: number; totalValue: number }[] = [];

    for (let y = 1; y <= years; y++) {
      if (mode === 'sip') {
        const P = investmentAmount;
        const i = rate / 12 / 100;
        const n = y * 12;
        const invested = P * n;
        const totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        const returns = totalValue - invested;

        rows.push({
          year: y,
          invested: Math.round(invested),
          returns: Math.round(Math.max(0, returns)),
          totalValue: Math.round(totalValue)
        });
      } else {
        const P = investmentAmount;
        const totalValue = P * Math.pow(1 + rate / 100, y);
        const invested = P;
        const returns = totalValue - invested;

        rows.push({
          year: y,
          invested: Math.round(invested),
          returns: Math.round(Math.max(0, returns)),
          totalValue: Math.round(totalValue)
        });
      }
    }

    return rows;
  }, [mode, investmentAmount, expectedReturnRate, tenureYears]);

  const investedPercent = Math.min(100, Math.round((sipResults.totalInvested / sipResults.totalValue) * 100));
  const returnsPercent = 100 - investedPercent;

  const faqs = [
    {
      q: 'What is a Systematic Investment Plan (SIP)?',
      a: 'A Systematic Investment Plan (SIP) is a disciplined method offered by mutual funds where an investor commits a fixed amount of money at automated regular intervals (monthly, quarterly) to purchase mutual fund units.'
    },
    {
      q: 'How does Rupee/Dollar Cost Averaging work in SIPs?',
      a: 'In a SIP, you buy more units when market prices are low and fewer units when prices are high. Over long investment horizons, this naturally lowers your average cost per unit without needing to time the market.'
    },
    {
      q: 'What is the difference between Monthly SIP and Lumpsum?',
      a: 'A Monthly SIP spreads capital deployment across multiple market cycles to average acquisition costs, whereas a Lumpsum invests 100% of your capital at one specific point in time.'
    },
    {
      q: 'Are returns calculated by the SIP calculator guaranteed?',
      a: 'No. Mutual fund investments are subject to market risks. The returns calculated are purely estimated/illustrative projections based on your assumed annualized rate of return.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-finance-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" />
          <span>Wealth Compounding Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          SIP Calculator
        </h1>

        <p className="text-slate-300 text-sm sm:text-base font-light max-w-3xl leading-relaxed">
          Calculate your potential mutual fund wealth creation, estimated compounding returns, and investment growth projections instantly.
        </p>

        {/* Mode Tabs */}
        <div className="pt-2 flex items-center bg-slate-800/80 p-1 rounded-2xl w-fit text-xs font-bold border border-slate-700">
          <button
            onClick={() => setMode('sip')}
            className={`px-5 py-2 rounded-xl transition-all ${mode === 'sip' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-300 hover:text-white'}`}
          >
            Monthly SIP
          </button>
          <button
            onClick={() => setMode('lumpsum')}
            className={`px-5 py-2 rounded-xl transition-all ${mode === 'lumpsum' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-300 hover:text-white'}`}
          >
            Lumpsum One-Time
          </button>
        </div>
      </div>

      {/* AD 1: Top Tool Ad Slot */}
      <AdSlot placement="calculator_top" />

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Inputs Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <span>{mode === 'sip' ? 'Monthly SIP Investment Settings' : 'Lumpsum Investment Settings'}</span>
          </h2>

          {/* Input 1: Monthly/Lumpsum Amount */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">{mode === 'sip' ? 'Monthly Investment (₹)' : 'One-Time Investment (₹)'}</label>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-slate-900 font-bold font-mono text-sm">
                <span>₹</span>
                <input
                  type="number"
                  min="500"
                  max="1000000"
                  step="500"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-28 bg-transparent focus:outline-none text-right font-mono"
                />
              </div>
            </div>

            <input
              type="range"
              min="500"
              max="500000"
              step="500"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₹500</span>
              <span>₹2.5 Lakh</span>
              <span>₹5 Lakh+</span>
            </div>
          </div>

          {/* Input 2: Expected Return Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Expected Annual Return Rate (p.a.)</label>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-slate-900 font-bold font-mono text-sm">
                <input
                  type="number"
                  min="1"
                  max="30"
                  step="0.5"
                  value={expectedReturnRate}
                  onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
                  className="w-16 bg-transparent focus:outline-none text-right font-mono"
                />
                <span>%</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5% (Debt)</span>
              <span>12% (Equity Flexi)</span>
              <span>25% (High Growth)</span>
            </div>
          </div>

          {/* Input 3: Tenure Years */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Investment Duration (Years)</label>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-slate-900 font-bold font-mono text-sm">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-16 bg-transparent focus:outline-none text-right font-mono"
                />
                <span className="text-xs text-slate-500 font-normal">Years</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 Year</span>
              <span>20 Years</span>
              <span>40 Years</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Calculate Compounding Returns</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Results Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-finance-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            
            <div className="space-y-1 border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Projected Portfolio Total Value</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                ₹{sipResults.totalValue.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400">At {expectedReturnRate}% annualized return over {tenureYears} Years</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Total Invested Amount</span>
                <span className="font-bold text-slate-300 font-mono">₹{sipResults.totalInvested.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Estimated Compounded Returns</span>
                <span className="font-bold text-emerald-400 font-mono">₹{sipResults.estimatedReturns.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Visual Ratio Bar */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${investedPercent}%` }} className="bg-slate-500 h-full transition-all duration-300"></div>
                <div style={{ width: `${returnsPercent}%` }} className="bg-emerald-500 h-full transition-all duration-300"></div>
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  Invested ({investedPercent}%)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Gain ({returnsPercent}%)
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SIP Growth Chart Visualizer */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Year-by-Year Growth Projections</h2>
          <p className="text-xs text-slate-500">Watch your principal investment compound exponentially over time.</p>
        </div>

        <div className="h-64 w-full flex items-end justify-between gap-1.5 pt-6 px-4 bg-slate-50 rounded-2xl border border-slate-100">
          {yearlySchedule.slice(0, Math.min(15, tenureYears)).map((row) => (
            <div key={row.year} className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end">
              <div 
                style={{ height: `${(row.totalValue / sipResults.totalValue) * 100}%` }}
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg group-hover:bg-emerald-500 transition-all duration-300 relative"
              >
                <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap z-10">
                  Yr {row.year}: ₹{row.totalValue.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold">Y{row.year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AD 2: Middle In-Feed Ad Slot */}
      <AdSlot placement="calculator_after_result" />

      {/* Yearly Breakdown Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-4">Yearly SIP Schedule Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-3">Year</th>
                <th className="p-3">Invested Amount</th>
                <th className="p-3">Estimated Returns</th>
                <th className="p-3">Total Portfolio Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {yearlySchedule.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">Year {row.year}</td>
                  <td className="p-3 text-slate-600">₹{row.invested.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-emerald-600 font-bold">₹{row.returns.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-extrabold text-slate-900">₹{row.totalValue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEO FAQ Accordion */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 border-b pb-2">SIP Frequently Asked Questions (FAQs)</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-between transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === index ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaq === index && (
                <div className="p-4 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-200">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Important Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Important Mutual Fund Return Disclaimer</span>
        </div>
        <p className="leading-relaxed text-amber-800">
          Disclaimer: The results provided by this SIP calculator are for educational and illustrative purposes only. Mutual fund investments are subject to market risks, and actual returns may vary based on market volatility, fund performance, taxes, and expense ratios. Returns are estimated/illustrative, not guaranteed.
        </p>
      </div>

      {/* AD 3: Bottom Banner Ad Slot */}
      <AdSlot placement="calculator_bottom" />

    </div>
  );
};
