import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, HelpCircle, ArrowRight } from 'lucide-react';

export const SipCalculatorWidget: React.FC = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12);
  const [tenureYears, setTenureYears] = useState<number>(10);

  // SIP Formula: M = P * ({[1 + i]^n - 1} / i) * (1 + i)
  const calculateSip = () => {
    const monthlyRate = expectedReturnRate / 12 / 100;
    const months = tenureYears * 12;
    
    const totalInvested = monthlyInvestment * months;
    
    // Future Value formula
    const futureValue = monthlyInvestment * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    const estimatedReturns = Math.max(0, futureValue - totalInvested);

    return {
      totalInvested: Math.round(totalInvested),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(futureValue)
    };
  };

  const { totalInvested, estimatedReturns, totalValue } = calculateSip();

  const investedPercent = Math.min(100, Math.round((totalInvested / totalValue) * 100));
  const returnsPercent = 100 - investedPercent;

  return (
    <div className="bg-[#0B1F33] text-white rounded-xl p-5 shadow-sm border border-slate-800 space-y-4 font-sans">
      
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#16A34A]/20 text-[#16A34A] flex items-center justify-center border border-[#16A34A]/30">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white font-serif leading-snug">SIP Returns Calculator</h3>
            <p className="text-[11px] text-slate-400 font-light">Project monthly wealth compounding</p>
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="space-y-3 text-xs">
        
        {/* Slider 1: Monthly Investment */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-semibold text-slate-300">Monthly SIP (₹)</span>
            <span className="font-bold text-[#16A34A] font-mono">₹{monthlyInvestment.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min="500"
            max="100000"
            step="500"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            className="w-full accent-[#16A34A] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Slider 2: Expected Annual Return */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-semibold text-slate-300">Return Rate (% p.a.)</span>
            <span className="font-bold text-[#16A34A] font-mono">{expectedReturnRate}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="0.5"
            value={expectedReturnRate}
            onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
            className="w-full accent-[#16A34A] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Slider 3: Time Horizon */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-semibold text-slate-300">Duration (Years)</span>
            <span className="font-bold text-[#16A34A] font-mono">{tenureYears} Yrs</span>
          </div>
          <input
            type="range"
            min="1"
            max="35"
            step="1"
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-[#16A34A] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

      </div>

      {/* Results Projection Card */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2.5">
        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">Projected Portfolio Value</span>
        
        <div className="text-2xl font-extrabold text-[#16A34A] font-mono">
          ₹{totalValue.toLocaleString('en-IN')}
        </div>

        {/* Visual Ratio Bar */}
        <div className="space-y-1 pt-1">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div style={{ width: `${investedPercent}%` }} className="bg-slate-500 h-full transition-all duration-300"></div>
            <div style={{ width: `${returnsPercent}%` }} className="bg-[#16A34A] h-full transition-all duration-300"></div>
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-400">
            <span>Invested: ₹{totalInvested.toLocaleString('en-IN')}</span>
            <span className="text-[#16A34A]">Gain: ₹{estimatedReturns.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
