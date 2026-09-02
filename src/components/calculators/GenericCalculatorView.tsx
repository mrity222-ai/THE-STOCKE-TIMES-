import React, { useState, useMemo } from 'react';
import { CalculatorMeta, CalculatorId } from '../../types/calculators';
import { CalculationEngine } from '../../services/calculationEngine';
import { FinancialRulesService } from '../../services/financialRulesService';
import { CalculatorWrapper } from './CalculatorWrapper';
import { 
  ArrowRight, 
  Sliders, 
  TrendingUp, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  Calendar, 
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
  Building2,
  Receipt
} from 'lucide-react';

interface GenericCalculatorViewProps {
  meta: CalculatorMeta;
  onNavigate: (route: string, param?: string) => void;
}

export const GenericCalculatorView: React.FC<GenericCalculatorViewProps> = ({ meta, onNavigate }) => {
  // State for all calculators
  const [num1, setNum1] = useState<number>(1000000); // Principal / Amount / Monthly / Income
  const [num2, setNum2] = useState<number>(8.5);     // Interest Rate / Return / Rate %
  const [num3, setNum3] = useState<number>(5);       // Tenure / Years / Duration
  const [num4, setNum4] = useState<number>(0);       // Secondary input (e.g. existing EMI / deductions / final val)
  const [num5, setNum5] = useState<number>(0);       // Additional optional param
  const [strMode, setStrMode] = useState<string>('default'); // Mode (Add GST/Remove GST, Old/New Regime, Years/Months)

  const rules = FinancialRulesService.getRules();

  // Reset handler
  const handleReset = () => {
    setNum1(1000000);
    setNum2(8.5);
    setNum3(5);
    setNum4(0);
    setNum5(0);
    setStrMode('default');
  };

  // Rule Badge text
  const getRuleBadge = () => {
    if (meta.id === 'ppf-calculator') return `PPF Rate: ${rules.ppf.interestRate}% p.a. (FY ${rules.lastGlobalUpdate})`;
    if (meta.id === 'epf-calculator') return `EPF Rate: ${rules.epf.interestRate}% p.a. (FY ${rules.epf.financialYear})`;
    if (meta.id === 'income-tax-calculator') return `Tax Slabs FY ${rules.incomeTax['2026-27']?.financialYear || '2026-27'}`;
    if (meta.id === 'gst-calculator') return `GST Rates: ${rules.gst.availableRates.join('%, ')}%`;
    return undefined;
  };

  // Render Specific Calculator Content
  const renderCalculatorCanvas = () => {
    switch (meta.id) {
      
      // 3. LUMPSUM CALCULATOR
      case 'lumpsum-calculator': {
        const initial = Math.max(1000, num1);
        const rate = Math.max(1, num2);
        const yrs = Math.max(1, num3);
        const res = CalculationEngine.calculateLumpsum(initial, rate, yrs);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight border-b pb-3">Lumpsum Investment Inputs</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Initial Investment (₹)</span><span className="font-mono text-sm">₹{initial.toLocaleString('en-IN')}</span></div>
                  <input type="range" min="1000" max="10000000" step="5000" value={initial} onChange={(e) => setNum1(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Expected Return Rate (% p.a.)</span><span className="font-mono text-sm">{rate}%</span></div>
                  <input type="range" min="1" max="30" step="0.5" value={rate} onChange={(e) => setNum2(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Duration (Years)</span><span className="font-mono text-sm">{yrs} Years</span></div>
                  <input type="range" min="1" max="40" step="1" value={yrs} onChange={(e) => setNum3(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-finance-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <span className="text-xs font-bold uppercase text-slate-400">Total Projected Portfolio Value</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">₹{res.totalValue.toLocaleString('en-IN')}</div>
              <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
                <div className="flex justify-between"><span className="text-slate-400">Invested Amount</span><span className="font-bold text-white font-mono">₹{res.totalInvested.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Estimated Returns</span><span className="font-bold text-emerald-400 font-mono">₹{res.estimatedReturns.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        );
      }

      // 4. FD CALCULATOR
      case 'fd-calculator': {
        const deposit = Math.max(1000, num1);
        const rate = Math.max(1, num2);
        const yrs = Math.max(1, num3);
        const res = CalculationEngine.calculateFD(deposit, rate, yrs, 'Quarterly', true);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight border-b pb-3">Fixed Deposit Parameters</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Deposit Amount (₹)</span><span className="font-mono text-sm">₹{deposit.toLocaleString('en-IN')}</span></div>
                  <input type="range" min="5000" max="5000000" step="5000" value={deposit} onChange={(e) => setNum1(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Interest Rate (% p.a.)</span><span className="font-mono text-sm">{rate}%</span></div>
                  <input type="range" min="1" max="15" step="0.1" value={rate} onChange={(e) => setNum2(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Tenure (Years)</span><span className="font-mono text-sm">{yrs} Years</span></div>
                  <input type="range" min="1" max="10" step="1" value={yrs} onChange={(e) => setNum3(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-finance-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <span className="text-xs font-bold uppercase text-slate-400">Total FD Maturity Amount</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">₹{res.maturityAmount.toLocaleString('en-IN')}</div>
              <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
                <div className="flex justify-between"><span className="text-slate-400">Principal Deposit</span><span className="font-bold text-white font-mono">₹{res.depositAmount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Interest Earned</span><span className="font-bold text-amber-400 font-mono">₹{res.interestEarned.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        );
      }

      // 6. PPF CALCULATOR
      case 'ppf-calculator': {
        const annual = Math.min(150000, Math.max(500, num1));
        const yrs = Math.max(15, num3);
        const res = CalculationEngine.calculatePPF(annual, yrs);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight border-b pb-3">Public Provident Fund Inputs</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Annual Contribution (₹)</span><span className="font-mono text-sm">₹{annual.toLocaleString('en-IN')}</span></div>
                  <input type="range" min="500" max="150000" step="500" value={annual} onChange={(e) => setNum1(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Duration (Years)</span><span className="font-mono text-sm">{yrs} Years</span></div>
                  <input type="range" min="15" max="30" step="5" value={yrs} onChange={(e) => setNum3(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-finance-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <span className="text-xs font-bold uppercase text-slate-400">Total Tax-Free PPF Maturity Corpus</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">₹{res.maturityAmount.toLocaleString('en-IN')}</div>
              <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
                <div className="flex justify-between"><span className="text-slate-400">Total Invested</span><span className="font-bold text-white font-mono">₹{res.totalInvested.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Interest Earned ({res.applicableRate}%)</span><span className="font-bold text-emerald-400 font-mono">₹{res.estimatedInterest.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        );
      }

      // 14. GST CALCULATOR
      case 'gst-calculator': {
        const amt = Math.max(10, num1);
        const rate = num2 || 18;
        const mode = (strMode === 'remove' ? 'remove' : 'add') as 'add' | 'remove';
        const res = CalculationEngine.calculateGST(amt, rate, mode);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight border-b pb-3">GST Calculation Mode</h2>
              <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button type="button" onClick={() => setStrMode('add')} className={`flex-1 py-2 rounded-xl ${strMode !== 'remove' ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}>Add GST (Exclusive)</button>
                <button type="button" onClick={() => setStrMode('remove')} className={`flex-1 py-2 rounded-xl ${strMode === 'remove' ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}>Remove GST (Inclusive)</button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Amount (₹)</span><span className="font-mono text-sm">₹{amt.toLocaleString('en-IN')}</span></div>
                  <input type="number" value={amt} onChange={(e) => setNum1(Number(e.target.value))} className="w-full p-3 rounded-xl border border-slate-300 font-mono" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">GST Rate Slab</label>
                  <div className="grid grid-cols-4 gap-2">
                    {rules.gst.availableRates.map((r) => (
                      <button key={r} type="button" onClick={() => setNum2(r)} className={`py-2 rounded-xl text-xs font-extrabold border ${rate === r ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700'}`}>{r}%</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-finance-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <span className="text-xs font-bold uppercase text-slate-400">Total Amount After GST</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">₹{res.finalAmount.toLocaleString('en-IN')}</div>
              <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
                <div className="flex justify-between"><span className="text-slate-400">Original Base Amount</span><span className="font-bold text-white font-mono">₹{res.originalAmount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">GST Amount ({rate}%)</span><span className="font-bold text-amber-400 font-mono">₹{res.gstAmount.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        );
      }

      // 16. INCOME TAX CALCULATOR
      case 'income-tax-calculator': {
        const gross = Math.max(0, num1);
        const ded = Math.max(0, num4);
        const regime = (strMode === 'old' ? 'old' : 'new') as 'new' | 'old';
        const res = CalculationEngine.calculateIncomeTax(gross, ded, regime, '2026-27');

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight border-b pb-3">Income Tax Parameters (FY 2026-27)</h2>
              <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button type="button" onClick={() => setStrMode('new')} className={`flex-1 py-2 rounded-xl ${strMode !== 'old' ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}>New Tax Regime</button>
                <button type="button" onClick={() => setStrMode('old')} className={`flex-1 py-2 rounded-xl ${strMode === 'old' ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}>Old Tax Regime</button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Gross Annual Income (₹)</span><span className="font-mono text-sm">₹{gross.toLocaleString('en-IN')}</span></div>
                  <input type="range" min="100000" max="5000000" step="50000" value={gross} onChange={(e) => setNum1(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>

                {regime === 'old' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold"><span>Total Deductions (80C, 80D, HRA) (₹)</span><span className="font-mono text-sm">₹{ded.toLocaleString('en-IN')}</span></div>
                    <input type="number" value={ded} onChange={(e) => setNum4(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" />
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-finance-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <span className="text-xs font-bold uppercase text-slate-400">Total Tax Liability ({res.regimeName})</span>
              <div className="text-3xl sm:text-4xl font-black text-rose-400 font-mono">₹{res.totalTaxLiability.toLocaleString('en-IN')}</div>
              <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
                <div className="flex justify-between"><span className="text-slate-400">Taxable Income</span><span className="font-bold text-white font-mono">₹{res.taxableIncome.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Base Tax</span><span className="font-bold text-white font-mono">₹{res.baseTax.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">4% Health & Cess</span><span className="font-bold text-amber-400 font-mono">₹{res.cessAmount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-t border-slate-800/80 pt-2"><span className="text-slate-300 font-bold">Monthly Tax Deduction</span><span className="font-bold text-rose-400 font-mono">₹{res.monthlyTax.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        );
      }

      // DEFAULT / FALLBACK GENERIC CALCULATOR ENGINE
      default: {
        const val1 = Math.max(1000, num1);
        const val2 = Math.max(1, num2);
        const val3 = Math.max(1, num3);
        const res = CalculationEngine.calculateLumpsum(val1, val2, val3);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight border-b pb-3">{meta.name} Inputs</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Primary Amount (₹)</span><span className="font-mono text-sm">₹{val1.toLocaleString('en-IN')}</span></div>
                  <input type="range" min="1000" max="10000000" step="5000" value={val1} onChange={(e) => setNum1(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Rate / Return (% p.a.)</span><span className="font-mono text-sm">{val2}%</span></div>
                  <input type="range" min="1" max="30" step="0.5" value={val2} onChange={(e) => setNum2(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Tenure / Duration (Years)</span><span className="font-mono text-sm">{val3} Years</span></div>
                  <input type="range" min="1" max="40" step="1" value={val3} onChange={(e) => setNum3(Number(e.target.value))} className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-finance-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <span className="text-xs font-bold uppercase text-slate-400">Total Calculated Result</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">₹{res.totalValue.toLocaleString('en-IN')}</div>
              <div className="space-y-3 text-xs border-t border-slate-800 pt-4">
                <div className="flex justify-between"><span className="text-slate-400">Initial Amount</span><span className="font-bold text-white font-mono">₹{res.totalInvested.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Estimated Gain / Growth</span><span className="font-bold text-emerald-400 font-mono">₹{res.estimatedReturns.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        );
      }

    }
  };

  return (
    <CalculatorWrapper
      meta={meta}
      onNavigate={onNavigate}
      onReset={handleReset}
      ruleUsedBadge={getRuleBadge()}
      formulaText={`Result = CalculationEngine.${meta.id}(Input_1, Input_2, Input_3)`}
      exampleText={`Example: For ₹10,00,000 invested at 12% p.a. over 5 years, the estimated total value grows to ₹17,62,342.`}
      aboutText={`The ${meta.name} helps individual investors and borrowers calculate accurate financial projections, returns, or loan repayment schedules.`}
      faqs={[
        { q: `How accurate is the ${meta.name}?`, a: `The ${meta.name} uses official mathematical models and government rule parameters to compute exact figures.` },
        { q: `Are results guaranteed?`, a: `Results are illustrative projections based on user inputs and applicable interest/tax rules.` }
      ]}
    >
      {renderCalculatorCanvas()}
    </CalculatorWrapper>
  );
};
