import React, { useState, useMemo } from 'react';
import { AdSlot } from '../components/ads/AdSlot';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Percent, 
  PieChart as PieChartIcon, 
  Table as TableIcon, 
  ArrowRight, 
  HelpCircle, 
  ShieldAlert,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EmiCalculatorPageProps {
  onNavigate: (route: string, param?: string) => void;
}

export const EmiCalculatorPage: React.FC<EmiCalculatorPageProps> = ({ onNavigate }) => {
  // Inputs State
  const [loanAmount, setLoanAmount] = useState<number>(1000000); // ₹10 Lakhs default
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5% p.a.
  const [tenureValue, setTenureValue] = useState<number>(5); // 5
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [loanType, setLoanType] = useState<string>('Home Loan');

  // Amortization Schedule View & Pagination
  const [scheduleView, setScheduleView] = useState<'yearly' | 'monthly'>('yearly');
  const [monthlyPage, setMonthlyPage] = useState<number>(1);

  // Comparison State
  const [compareLoanAmount, setCompareLoanAmount] = useState<number>(1000000);
  const [compareRateA, setCompareRateA] = useState<number>(8.5);
  const [compareRateB, setCompareRateB] = useState<number>(9.5);
  const [compareTenureA, setCompareTenureA] = useState<number>(5);
  const [compareTenureB, setCompareTenureB] = useState<number>(5);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Effective tenure in months
  const tenureMonths = tenureType === 'years' ? tenureValue * 12 : tenureValue;

  // EMI Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const emiResults = useMemo(() => {
    const P = Math.max(1000, loanAmount);
    const r = interestRate / 12 / 100;
    const n = Math.max(1, tenureMonths);

    let monthlyEmi = 0;
    if (r > 0) {
      monthlyEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      monthlyEmi = P / n;
    }

    const totalRepayment = monthlyEmi * n;
    const totalInterest = Math.max(0, totalRepayment - P);

    return {
      monthlyEmi: Math.round(monthlyEmi),
      totalInterest: Math.round(totalInterest),
      totalRepayment: Math.round(totalRepayment),
      principalAmount: P
    };
  }, [loanAmount, interestRate, tenureMonths]);

  // Amortization Schedule Table Generator
  const amortizationSchedule = useMemo(() => {
    const P = emiResults.principalAmount;
    const r = interestRate / 12 / 100;
    const n = tenureMonths;
    const emi = emiResults.monthlyEmi;

    let balance = P;
    const monthlyList: { month: number; year: number; opening: number; principal: number; interest: number; payment: number; closing: number }[] = [];
    const yearlyMap: Record<number, { year: number; opening: number; principal: number; interest: number; payment: number; closing: number }> = {};

    for (let m = 1; m <= n; m++) {
      const opening = balance;
      const interestPaid = balance * r;
      const principalPaid = Math.min(balance, emi - interestPaid);
      const closing = Math.max(0, balance - principalPaid);
      balance = closing;

      const yearNum = Math.ceil(m / 12);

      monthlyList.push({
        month: m,
        year: yearNum,
        opening: Math.round(opening),
        principal: Math.round(principalPaid),
        interest: Math.round(interestPaid),
        payment: Math.round(principalPaid + interestPaid),
        closing: Math.round(closing)
      });

      if (!yearlyMap[yearNum]) {
        yearlyMap[yearNum] = {
          year: yearNum,
          opening: Math.round(opening),
          principal: 0,
          interest: 0,
          payment: 0,
          closing: 0
        };
      }

      yearlyMap[yearNum].principal += Math.round(principalPaid);
      yearlyMap[yearNum].interest += Math.round(interestPaid);
      yearlyMap[yearNum].payment += Math.round(principalPaid + interestPaid);
      yearlyMap[yearNum].closing = Math.round(closing);
    }

    const yearlyList = Object.values(yearlyMap);
    return { monthlyList, yearlyList };
  }, [emiResults, interestRate, tenureMonths]);

  // Comparison Calculator Helper
  const calcScenario = (amount: number, rate: number, tenureYrs: number) => {
    const P = amount;
    const r = rate / 12 / 100;
    const n = tenureYrs * 12;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emi * n;
    const totalInt = totalPay - P;
    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInt),
      totalPayment: Math.round(totalPay)
    };
  };

  const scenarioA = calcScenario(compareLoanAmount, compareRateA, compareTenureA);
  const scenarioB = calcScenario(compareLoanAmount, compareRateB, compareTenureB);
  const isASaver = scenarioA.totalInterest < scenarioB.totalInterest;

  // Percentage shares for Donut chart
  const principalShare = Math.round((emiResults.principalAmount / emiResults.totalRepayment) * 100);
  const interestShare = 100 - principalShare;

  const faqs = [
    {
      q: 'What is Equated Monthly Installment (EMI)?',
      a: 'An Equated Monthly Installment (EMI) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. EMIs are used to pay off both interest and principal each month so that over a specified number of years, the loan is fully paid off.'
    },
    {
      q: 'How is loan EMI calculated?',
      a: 'EMI is calculated using the standard formula: E = P × r × (1 + r)^n / ((1 + r)^n - 1), where P is Principal Loan Amount, r is monthly interest rate (annual rate divided by 12), and n is monthly tenure duration.'
    },
    {
      q: 'Which factors directly affect my monthly EMI?',
      a: 'Three core variables dictate your EMI: (1) Principal Loan Amount, (2) Interest Rate charged by bank/lender, and (3) Loan Tenure. Increasing tenure lowers EMI but increases total interest paid over time.'
    },
    {
      q: 'How can I reduce my total loan EMI burden?',
      a: 'You can lower your EMI or total interest by making lump-sum prepayments towards principal, opting for a longer loan tenure, balance transferring to a bank with lower interest rates, or negotiating a rate discount based on a strong credit score (800+).'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-finance-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          <span>Interactive Financial Tool</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          EMI Calculator
        </h1>

        <p className="text-slate-300 text-sm sm:text-base font-light max-w-3xl leading-relaxed">
          Calculate your monthly loan EMI, total interest obligations, and complete repayment breakdown instantly for Home, Personal, Car, and Education loans.
        </p>
      </div>

      {/* AD 1: Top Ad Slot */}
      <AdSlot placement="global_top" />

      {/* Main Two-Column Calculator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side — Inputs Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" /> Loan Parameters
            </h2>
            
            {/* Loan Type Selector */}
            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Home Loan">Home Loan</option>
              <option value="Personal Loan">Personal Loan</option>
              <option value="Car Loan">Car Loan</option>
              <option value="Education Loan">Education Loan</option>
              <option value="Other Loan">Other Loan</option>
            </select>
          </div>

          {/* Input 1: Loan Amount */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Loan Amount (₹)</label>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-slate-900 font-bold font-mono text-sm">
                <span>₹</span>
                <input
                  type="number"
                  min="50000"
                  max="50000000"
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-32 bg-transparent focus:outline-none text-right font-mono"
                />
              </div>
            </div>

            <input
              type="range"
              min="50000"
              max="50000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>₹50,000</span>
              <span>₹2.5 Crore</span>
              <span>₹5 Crore</span>
            </div>
          </div>

          {/* Input 2: Interest Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-slate-700">Interest Rate (% per year)</label>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-slate-900 font-bold font-mono text-sm">
                <input
                  type="number"
                  min="1"
                  max="30"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-16 bg-transparent focus:outline-none text-right font-mono"
                />
                <span>%</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="30"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1%</span>
              <span>15%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Input 3: Loan Tenure */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <label className="font-bold text-slate-700">Loan Tenure</label>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setTenureType('years')}
                    className={`px-2 py-0.5 rounded ${tenureType === 'years' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                  >
                    Years
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenureType('months')}
                    className={`px-2 py-0.5 rounded ${tenureType === 'months' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                  >
                    Months
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-slate-900 font-bold font-mono text-sm">
                <input
                  type="number"
                  min="1"
                  max={tenureType === 'years' ? 40 : 480}
                  value={tenureValue}
                  onChange={(e) => setTenureValue(Number(e.target.value))}
                  className="w-16 bg-transparent focus:outline-none text-right font-mono"
                />
                <span className="text-xs text-slate-500 font-normal">{tenureType}</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max={tenureType === 'years' ? 35 : 420}
              step="1"
              value={tenureValue}
              onChange={(e) => setTenureValue(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1 {tenureType}</span>
              <span>{tenureType === 'years' ? '15 Years' : '180 Months'}</span>
              <span>{tenureType === 'years' ? '35 Years' : '420 Months'}</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Calculate EMI Instantly</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

        {/* Right Side — Results & Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main EMI Result Box */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-finance-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            
            <div className="space-y-1 border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Calculated Monthly EMI</span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                ₹{emiResults.monthlyEmi.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400">For {loanType} at {interestRate}% p.a.</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Principal Loan Amount</span>
                <span className="font-bold text-white font-mono">₹{emiResults.principalAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Total Interest Payable</span>
                <span className="font-bold text-amber-400 font-mono">₹{emiResults.totalInterest.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-300 font-bold">Total Amount Payable</span>
                <span className="font-extrabold text-emerald-400 text-sm font-mono">₹{emiResults.totalRepayment.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Donut Chart Visualizer */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Breakdown Share</span>
              
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${principalShare}%` }} className="bg-slate-400 h-full transition-all duration-300"></div>
                <div style={{ width: `${interestShare}%` }} className="bg-amber-500 h-full transition-all duration-300"></div>
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  Principal ({principalShare}%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Interest ({interestShare}%)
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Loan Comparison Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Compare Loan Scenarios</h2>
          <p className="text-xs text-slate-500">Evaluate two interest rate or tenure options side-by-side to choose the lowest cost option.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Scenario A */}
          <div className={`p-6 rounded-2xl border ${isASaver ? 'bg-emerald-50/50 border-emerald-500' : 'bg-slate-50 border-slate-200'} space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">Loan Option A</span>
              {isASaver && (
                <span className="bg-emerald-600 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  Lower Interest Saver
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={compareRateA}
                  onChange={(e) => setCompareRateA(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tenure (Years)</label>
                <input
                  type="number"
                  value={compareTenureA}
                  onChange={(e) => setCompareTenureA(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between"><span className="text-slate-500">Monthly EMI:</span><strong className="text-slate-900">₹{scenarioA.emi.toLocaleString('en-IN')}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Interest:</span><strong className="text-amber-700">₹{scenarioA.totalInterest.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          {/* Scenario B */}
          <div className={`p-6 rounded-2xl border ${!isASaver ? 'bg-emerald-50/50 border-emerald-500' : 'bg-slate-50 border-slate-200'} space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">Loan Option B</span>
              {!isASaver && (
                <span className="bg-emerald-600 text-white font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
                  Lower Interest Saver
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={compareRateB}
                  onChange={(e) => setCompareRateB(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tenure (Years)</label>
                <input
                  type="number"
                  value={compareTenureB}
                  onChange={(e) => setCompareTenureB(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between"><span className="text-slate-500">Monthly EMI:</span><strong className="text-slate-900">₹{scenarioB.emi.toLocaleString('en-IN')}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Interest:</span><strong className="text-amber-700">₹{scenarioB.totalInterest.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

        </div>
      </div>

      {/* EMI Amortization Schedule Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">EMI Amortization Schedule</h2>
            <p className="text-xs text-slate-500">Yearly & monthly repayment schedule detailing opening balance, principal paid, and interest paid.</p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setScheduleView('yearly')}
              className={`px-3 py-1.5 rounded-xl transition-all ${scheduleView === 'yearly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'}`}
            >
              Yearly Schedule
            </button>
            <button
              onClick={() => setScheduleView('monthly')}
              className={`px-3 py-1.5 rounded-xl transition-all ${scheduleView === 'monthly' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'}`}
            >
              Monthly Schedule
            </button>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-3">{scheduleView === 'yearly' ? 'Year' : 'Month'}</th>
                <th className="p-3">Opening Balance</th>
                <th className="p-3">Principal Paid</th>
                <th className="p-3">Interest Paid</th>
                <th className="p-3">Total Payment</th>
                <th className="p-3">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {(scheduleView === 'yearly' ? amortizationSchedule.yearlyList : amortizationSchedule.monthlyList.slice((monthlyPage - 1) * 12, monthlyPage * 12)).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{scheduleView === 'yearly' ? `Year ${row.year}` : `Month ${(row as any).month}`}</td>
                  <td className="p-3">₹{row.opening.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-emerald-600 font-bold">₹{row.principal.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-amber-600">₹{row.interest.toLocaleString('en-IN')}</td>
                  <td className="p-3 font-bold">₹{row.payment.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-slate-500">₹{row.closing.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Monthly Pagination Controls */}
        {scheduleView === 'monthly' && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-mono">
            <span>Page {monthlyPage} of {Math.ceil(amortizationSchedule.monthlyList.length / 12)}</span>
            <div className="flex gap-2 font-bold">
              <button
                disabled={monthlyPage === 1}
                onClick={() => setMonthlyPage(monthlyPage - 1)}
                className="px-3 py-1 rounded bg-slate-100 text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={monthlyPage >= Math.ceil(amortizationSchedule.monthlyList.length / 12)}
                onClick={() => setMonthlyPage(monthlyPage + 1)}
                className="px-3 py-1 rounded bg-slate-100 text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SEO Information & FAQ Section */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Understanding Loan EMIs & Repayment</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Equated Monthly Installments (EMIs) are structured repayment schedules that allow borrowers to spread large purchases or capital borrowings over extended timeframes.
          </p>
          {/* AD 2: Middle In-Feed Ad Slot */}
          <AdSlot placement="calculator_after_result" />
        </div>

        {/* SEO FAQ Accordion Container */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Frequently Asked Questions (FAQs)</h3>
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

      {/* Legal & Educational Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Important Financial Calculator Disclaimer</span>
        </div>
        <p className="leading-relaxed text-amber-800">
          Disclaimer: The results provided by this calculator are for educational and illustrative purposes only. Actual loan costs, processing fees, or repayment schedules may vary based on market conditions.
        </p>
      </div>

      {/* AD 3: Bottom Banner Ad Slot */}
      <AdSlot placement="calculator_bottom" />

    </div>
  );
};
