import React, { useState, useMemo } from 'react';
import { ComparisonMeta, ComparisonToolId, CreditCardItem, MutualFundItem } from '../../types/comparisons';
import { ComparisonEngine } from '../../services/comparisonEngine';
import { ComparisonCatalogService } from '../../services/comparisonCatalogService';
import { ComparisonWrapper } from './ComparisonWrapper';
import { formatCurrency, getCurrencyLabel } from '../../utils/currency';
import { useCurrencyPreference } from '../../hooks/useCurrencyPreference';
import { 
  Scale, 
  TrendingUp, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  Calendar, 
  Sparkles,
  PieChart,
  Home,
  CreditCard,
  BarChart3,
  Award,
  Check
} from 'lucide-react';

interface GenericComparisonViewProps {
  meta: ComparisonMeta;
  onNavigate: (route: string, param?: string) => void;
}

export const GenericComparisonView: React.FC<GenericComparisonViewProps> = ({ meta, onNavigate }) => {
  const cardsCatalog = useMemo(() => ComparisonCatalogService.getCreditCards(), []);
  const fundsCatalog = useMemo(() => ComparisonCatalogService.getMutualFunds(), []);
  useCurrencyPreference();
  const currencyLabel = getCurrencyLabel();
  const money = (value: number) => formatCurrency(value);

  // Shared state variables
  const [val1, setVal1] = useState<number>(5000);   // SIP / Rent / Monthly Spend
  const [val2, setVal2] = useState<number>(12);     // SIP Return % / Rent Increase %
  const [val3, setVal3] = useState<number>(1000000); // FD Amount / Loan Amount / Property Price
  const [val4, setVal4] = useState<number>(7.1);    // FD Rate % / Loan Rate %
  const [val5, setVal5] = useState<number>(5);      // Tenure Years / Holding Years

  // Selection states
  const [selectedCardA, setSelectedCardA] = useState<string>(cardsCatalog[0]?.id || 'card-1');
  const [selectedCardB, setSelectedCardB] = useState<string>(cardsCatalog[1]?.id || 'card-2');
  const [selectedFundA, setSelectedFundA] = useState<string>(fundsCatalog[0]?.id || 'fund-1');
  const [selectedFundB, setSelectedFundB] = useState<string>(fundsCatalog[1]?.id || 'fund-2');

  const handleReset = () => {
    setVal1(5000);
    setVal2(12);
    setVal3(1000000);
    setVal4(7.1);
    setVal5(5);
  };

  const renderComparisonCanvas = () => {
    switch (meta.id) {
      
      // 1. SIP VS FD COMPARISON
      case 'sip-vs-fd': {
        const res = ComparisonEngine.compareSipVsFd(val1, val2, val3, val4, val5);

        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Inputs */}
              <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-extrabold text-slate-900 text-base border-b pb-3">SIP Parameters</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold"><span>Monthly SIP ({currencyLabel})</span><span className="font-mono">{money(val1)}</span></div>
                  <input type="range" min="500" max="100000" step="500" value={val1} onChange={(e) => setVal1(Number(e.target.value))} className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  
                  <div className="flex justify-between text-xs font-bold pt-2"><span>Expected SIP Return (% p.a.)</span><span className="font-mono">{val2}%</span></div>
                  <input type="range" min="1" max="25" step="0.5" value={val2} onChange={(e) => setVal2(Number(e.target.value))} className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer" />
                </div>

                <h3 className="font-extrabold text-slate-900 text-base border-b pb-3 pt-4">FD Parameters</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold"><span>FD Deposit Amount ({currencyLabel})</span><span className="font-mono">{money(val3)}</span></div>
                  <input type="range" min="10000" max="5000000" step="10000" value={val3} onChange={(e) => setVal3(Number(e.target.value))} className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer" />

                  <div className="flex justify-between text-xs font-bold pt-2"><span>FD Interest Rate (% p.a.)</span><span className="font-mono">{val4}%</span></div>
                  <input type="range" min="1" max="15" step="0.1" value={val4} onChange={(e) => setVal4(Number(e.target.value))} className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer" />

                  <div className="flex justify-between text-xs font-bold pt-2"><span>Tenure (Years)</span><span className="font-mono">{val5} Years</span></div>
                  <input type="range" min="1" max="30" step="1" value={val5} onChange={(e) => setVal5(Number(e.target.value))} className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer" />
                </div>
              </div>

              {/* Right Side-by-Side Results */}
              <div className="lg:col-span-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* SIP Card */}
                  <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <span className="text-xs font-bold uppercase text-emerald-400">SIP Strategy</span>
                    <div>
                      <span className="text-2xl font-black text-white font-mono block">{money(res.sip.value)}</span>
                      <span className="text-[11px] text-slate-400">Total Value</span>
                    </div>
                    <div className="space-y-1 text-xs border-t border-slate-800 pt-3">
                      <div className="flex justify-between"><span className="text-slate-400">Invested:</span><span className="font-mono font-bold">{money(res.sip.invested)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Est. Returns:</span><span className="font-mono font-bold text-emerald-400">{money(res.sip.returns)}</span></div>
                    </div>
                  </div>

                  {/* FD Card */}
                  <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <span className="text-xs font-bold uppercase text-blue-400">FD Strategy</span>
                    <div>
                      <span className="text-2xl font-black text-white font-mono block">{money(res.fd.value)}</span>
                      <span className="text-[11px] text-slate-400">Maturity Value</span>
                    </div>
                    <div className="space-y-1 text-xs border-t border-slate-800 pt-3">
                      <div className="flex justify-between"><span className="text-slate-400">Principal:</span><span className="font-mono font-bold">{money(res.fd.principal)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Interest:</span><span className="font-mono font-bold text-amber-400">{money(res.fd.interest)}</span></div>
                    </div>

                  </div>

                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl font-bold text-xs space-y-1">
                  <span>Higher Returns Option: {res.higherReturnsOption}</span>
                  <p className="font-mono font-normal text-emerald-800">
                    Difference in final value: {money(res.difference)} higher with {res.higherReturnsOption}.
                  </p>
                </div>
              </div>

            </div>
          </div>
        );
      }

      // 3. RENT VS BUY COMPARISON
      case 'rent-vs-buy': {
        const res = ComparisonEngine.compareRentVsBuy(val3, 20, 8.5, 20, 6, val1, 7, 10, val5);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-3">Property & Rent Parameters</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Property Price ({currencyLabel})</span><span className="font-mono">{money(val3)}</span></div>
                  <input type="range" min="1000000" max="20000000" step="500000" value={val3} onChange={(e) => setVal3(Number(e.target.value))} className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Monthly Rent ({currencyLabel})</span><span className="font-mono">{money(val1)}</span></div>
                  <input type="range" min="5000" max="100000" step="2500" value={val1} onChange={(e) => setVal1(Number(e.target.value))} className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Holding Duration (Years)</span><span className="font-mono">{val5} Years</span></div>
                  <input type="range" min="1" max="30" step="1" value={val5} onChange={(e) => setVal5(Number(e.target.value))} className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase">BUYING PROPERTY</span>
                  <div className="text-2xl font-black font-mono">{money(res.buy.netPosition)}</div>
                  <span className="text-[10px] text-slate-400 block">Net Wealth Position</span>
                  <div className="text-[11px] text-slate-300 pt-2 border-t border-slate-800 space-y-1">
                    <div>Prop Value: {money(res.buy.estimatedPropValue)}</div>
                    <div>Total Cost: {money(res.buy.totalCost)}</div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-3">
                  <span className="text-xs font-bold text-blue-400 uppercase">RENTING & INVESTING</span>
                  <div className="text-2xl font-black font-mono">{money(res.rent.netPosition)}</div>
                  <span className="text-[10px] text-slate-400 block">Net Wealth Position</span>
                  <div className="text-[11px] text-slate-300 pt-2 border-t border-slate-800 space-y-1">
                    <div>Savings Growth: {money(res.rent.investmentValue)}</div>
                    <div>Rent Paid: {money(res.rent.totalRentPaid)}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl font-bold text-xs">
                Financially Favorable Choice: {res.financiallyFavorable} (Difference: {money(res.financialDifference)})
              </div>
            </div>
          </div>
        );
      }

      // 5. CREDIT CARD COMPARISON
      case 'credit-card-comparison': {
        const cardA = cardsCatalog.find(c => c.id === selectedCardA) || cardsCatalog[0];
        const cardB = cardsCatalog.find(c => c.id === selectedCardB) || cardsCatalog[1];
        const res = ComparisonEngine.compareCreditCards(cardA, cardB, 15000, 10000, 3000, 5000);

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Credit Card A</label>
                <select value={selectedCardA} onChange={(e) => setSelectedCardA(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-900">
                  {cardsCatalog.map(c => <option key={c.id} value={c.id}>{c.name} ({c.issuer})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Credit Card B</label>
                <select value={selectedCardB} onChange={(e) => setSelectedCardB(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-900">
                  {cardsCatalog.map(c => <option key={c.id} value={c.id}>{c.name} ({c.issuer})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 text-lg">{cardA.name}</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded">{cardA.categoryBestFor}</span>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between"><span>Annual Fee:</span><strong className="font-mono">{money(cardA.annualFee)}</strong></div>
                  <div className="flex justify-between"><span>Lounge Access:</span><strong>{cardA.loungeAccessAnnual} Visits/yr</strong></div>
                  <div className="flex justify-between"><span>Est. Net Benefit:</span><strong className="font-mono text-emerald-600 font-extrabold">{money(res.benefitA.netAnnualBenefit)}/yr</strong></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 text-lg">{cardB.name}</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded">{cardB.categoryBestFor}</span>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between"><span>Annual Fee:</span><strong className="font-mono">{money(cardB.annualFee)}</strong></div>
                  <div className="flex justify-between"><span>Lounge Access:</span><strong>{cardB.loungeAccessAnnual} Visits/yr</strong></div>
                  <div className="flex justify-between"><span>Est. Net Benefit:</span><strong className="font-mono text-emerald-600 font-extrabold">{money(res.benefitB.netAnnualBenefit)}/yr</strong></div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // 6. MUTUAL FUND COMPARISON
      case 'mutual-fund-comparison': {
        const fundA = fundsCatalog.find(f => f.id === selectedFundA) || fundsCatalog[0];
        const fundB = fundsCatalog.find(f => f.id === selectedFundB) || fundsCatalog[1];

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Mutual Fund A</label>
                <select value={selectedFundA} onChange={(e) => setSelectedFundA(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-900">
                  {fundsCatalog.map(f => <option key={f.id} value={f.id}>{f.name} ({f.category})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Mutual Fund B</label>
                <select value={selectedFundB} onChange={(e) => setSelectedFundB(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 font-bold text-slate-900">
                  {fundsCatalog.map(f => <option key={f.id} value={f.id}>{f.name} ({f.category})</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm border-b pb-3">Side-by-Side Fund Comparison</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-slate-300 uppercase font-bold">
                    <tr>
                      <th className="p-3">Metric</th>
                      <th className="p-3">{fundA.name}</th>
                      <th className="p-3">{fundB.name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr><td className="p-3 font-bold text-slate-900">Category</td><td className="p-3">{fundA.category} ({fundA.subCategory})</td><td className="p-3">{fundB.category} ({fundB.subCategory})</td></tr>
                    <tr><td className="p-3 font-bold text-slate-900">Expense Ratio</td><td className="p-3 text-emerald-600 font-bold">{fundA.expenseRatioPct}%</td><td className="p-3 text-emerald-600 font-bold">{fundB.expenseRatioPct}%</td></tr>
                    <tr><td className="p-3 font-bold text-slate-900">AUM</td><td className="p-3">{money(fundA.aumCr * 10000000)}</td><td className="p-3">{money(fundB.aumCr * 10000000)}</td></tr>
                    <tr><td className="p-3 font-bold text-slate-900">5Y CAGR Return</td><td className="p-3 font-bold text-emerald-600">{fundA.return5Y}%</td><td className="p-3 font-bold text-emerald-600">{fundB.return5Y}%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      // DEFAULT LOAN / OTHER COMPARISON
      default: {
        const res = ComparisonEngine.compareLoans(val3, val4, val5, 5000, val3, val4 + 1, val5, 2500);

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 text-lg">Loan Scenario A</h3>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3 font-mono">
                  <div className="flex justify-between"><span>Monthly EMI:</span><strong className="text-slate-900 font-bold">{money(res.loanA.monthlyEmi)}</strong></div>
                  <div className="flex justify-between"><span>Total Interest:</span><strong className="text-amber-600 font-bold">{money(res.loanA.totalInterest)}</strong></div>
                  <div className="flex justify-between"><span>Total Repayment:</span><strong className="text-slate-900 font-extrabold">{money(res.loanA.totalRepayment)}</strong></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 text-lg">Loan Scenario B</h3>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3 font-mono">
                  <div className="flex justify-between"><span>Monthly EMI:</span><strong className="text-slate-900 font-bold">{money(res.loanB.monthlyEmi)}</strong></div>
                  <div className="flex justify-between"><span>Total Interest:</span><strong className="text-amber-600 font-bold">{money(res.loanB.totalInterest)}</strong></div>
                  <div className="flex justify-between"><span>Total Repayment:</span><strong className="text-slate-900 font-extrabold">{money(res.loanB.totalRepayment)}</strong></div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl font-bold text-xs">
              Lower Cost Choice: {res.lowerCostLoan} (Savings: {money(res.costDifference)})
            </div>
          </div>
        );
      }

    }
  };

  return (
    <ComparisonWrapper
      meta={meta}
      onNavigate={onNavigate}
      onReset={handleReset}
      summaryOptionA="Option A: Side-by-side calculated returns and costs"
      summaryOptionB="Option B: Side-by-side calculated returns and costs"
      winnerOption="Neutral Financial Comparison"
      aboutText={`The ${meta.name} helps users compare two financial decisions side-by-side using transparent mathematical formulas and catalog parameters.`}
      methodologyText={`Calculations compare net wealth position, total cost of interest, or projected returns based on entered rates and catalog features.`}
      faqs={[
        { q: `How does the ${meta.name} work?`, a: `It computes the net financial outcome of two alternatives using standard financial formulas.` },
        { q: `Are results guaranteed?`, a: `Results are illustrative projections based on user inputs and product catalog assumptions.` }
      ]}
    >
      {renderComparisonCanvas()}
    </ComparisonWrapper>
  );
};
