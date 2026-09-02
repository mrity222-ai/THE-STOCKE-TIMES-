import { CalculatorMeta, CalculatorId } from '../types/calculators';

export const CALCULATORS_REGISTRY: CalculatorMeta[] = [
  // 1. Loans & EMI
  {
    id: 'emi-calculator',
    name: 'EMI Calculator',
    url: '/financial-tools/emi-calculator',
    category: 'Loans & EMI',
    description: 'Calculate your monthly loan EMI, total interest, and complete repayment schedule for Home, Personal, Car, or Education loans.',
    iconName: 'Calculator',
    tags: ['EMI', 'Home Loan', 'Car Loan', 'Personal Loan', 'Repayment']
  },
  {
    id: 'loan-eligibility-calculator',
    name: 'Loan Eligibility Calculator',
    url: '/financial-tools/loan-eligibility-calculator',
    category: 'Loans & EMI',
    description: 'Determine the maximum loan amount you can borrow based on your monthly income, existing EMIs, and debt-to-income ratio.',
    iconName: 'Building2',
    tags: ['Loan Limit', 'FOIR', 'Eligibility', 'Income', 'Borrowing']
  },

  // 2. Investment
  {
    id: 'sip-calculator',
    name: 'SIP Calculator',
    url: '/financial-tools/sip-calculator',
    category: 'Investment',
    description: 'Calculate potential mutual fund wealth accumulation and compounding growth through Systematic Investment Plans (SIP).',
    iconName: 'TrendingUp',
    tags: ['SIP', 'Mutual Funds', 'Wealth', 'Compounding', 'Equity']
  },
  {
    id: 'lumpsum-calculator',
    name: 'Lumpsum Calculator',
    url: '/financial-tools/lumpsum-calculator',
    category: 'Investment',
    description: 'Estimate future returns and portfolio value for one-time lumpsum mutual fund or stock investments.',
    iconName: 'PieChart',
    tags: ['Lumpsum', 'One-Time Investment', 'Mutual Funds', 'Returns']
  },
  {
    id: 'cagr-calculator',
    name: 'CAGR Calculator',
    url: '/financial-tools/cagr-calculator',
    category: 'Investment',
    description: 'Calculate the Compound Annual Growth Rate (CAGR) of your investments over any period of time.',
    iconName: 'BarChart3',
    tags: ['CAGR', 'Annual Growth', 'Return Rate', 'Stocks', 'Portfolio']
  },
  {
    id: 'swp-calculator',
    name: 'SWP Calculator',
    url: '/financial-tools/swp-calculator',
    category: 'Investment',
    description: 'Plan systematic monthly withdrawals from your mutual fund investments while tracking remaining corpus growth.',
    iconName: 'ArrowUpRight',
    tags: ['SWP', 'Withdrawal', 'Monthly Income', 'Pension', 'Corpus']
  },
  {
    id: 'sip-vs-lumpsum',
    name: 'SIP vs Lumpsum Calculator',
    url: '/financial-tools/sip-vs-lumpsum',
    category: 'Investment',
    description: 'Compare Systematic Investment Plans (SIP) side-by-side with Lumpsum investments to evaluate optimal wealth strategies.',
    iconName: 'SlidersHorizontal',
    tags: ['SIP vs Lumpsum', 'Mutual Fund Comparison', 'Returns Comparison']
  },

  // 3. Savings
  {
    id: 'fd-calculator',
    name: 'FD Calculator',
    url: '/financial-tools/fd-calculator',
    category: 'Savings',
    description: 'Calculate Fixed Deposit maturity amount, compounding interest earnings, and payout options across cumulative & non-cumulative schemes.',
    iconName: 'Vault',
    tags: ['FD', 'Fixed Deposit', 'Bank FD', 'Maturity', 'Interest Rate']
  },
  {
    id: 'rd-calculator',
    name: 'RD Calculator',
    url: '/financial-tools/rd-calculator',
    category: 'Savings',
    description: 'Compute total deposits, interest accrued, and final maturity payout for bank Recurring Deposits (RD).',
    iconName: 'Clock',
    tags: ['RD', 'Recurring Deposit', 'Monthly Savings', 'Interest']
  },
  {
    id: 'ppf-calculator',
    name: 'PPF Calculator',
    url: '/financial-tools/ppf-calculator',
    category: 'Savings',
    description: 'Project your Public Provident Fund (PPF) tax-free maturity corpus, yearly interest, and 15-year wealth growth.',
    iconName: 'ShieldCheck',
    tags: ['PPF', 'Tax Free', 'Govt Scheme', '15 Years', 'Section 80C']
  },
  {
    id: 'epf-calculator',
    name: 'EPF Calculator',
    url: '/financial-tools/epf-calculator',
    category: 'Savings',
    description: 'Estimate your Employee Provident Fund retirement balance incorporating employee contribution, employer share, and annual salary increments.',
    iconName: 'Briefcase',
    tags: ['EPF', 'PF Balance', 'Employee Share', 'Retirement Corpus']
  },
  {
    id: 'nps-calculator',
    name: 'NPS Calculator',
    url: '/financial-tools/nps-calculator',
    category: 'Savings',
    description: 'Calculate National Pension System retirement corpus, 60% lump-sum payout, and monthly annuity pension stream.',
    iconName: 'Award',
    tags: ['NPS', 'Pension Scheme', 'Retirement', 'Annuity', 'Tax Saving']
  },

  // 4. Tax & Salary
  {
    id: 'income-tax-calculator',
    name: 'Income Tax Calculator',
    url: '/financial-tools/income-tax-calculator',
    category: 'Tax & Salary',
    description: 'Calculate total tax liability, cess, and compare Old Tax Regime vs New Tax Regime for current Financial Years.',
    iconName: 'Receipt',
    tags: ['Income Tax', 'Tax Slabs', 'New Regime', 'Old Regime', 'Section 80C']
  },
  {
    id: 'salary-calculator',
    name: 'Salary Calculator',
    url: '/financial-tools/salary-calculator',
    category: 'Tax & Salary',
    description: 'Calculate your monthly in-hand take-home salary from gross CTC after EPF, Professional Tax, and allowance deductions.',
    iconName: 'DollarSign',
    tags: ['Salary Breakup', 'CTC to Inhand', 'Take Home Salary', 'PF Deduction']
  },
  {
    id: 'gst-calculator',
    name: 'GST Calculator',
    url: '/financial-tools/gst-calculator',
    category: 'Tax & Salary',
    description: 'Calculate GST amounts for 5%, 12%, 18%, and 28% tax slabs in Add GST and Remove GST modes.',
    iconName: 'Percent',
    tags: ['GST', 'Goods and Services Tax', 'Inclusive GST', 'Exclusive GST']
  },

  // 5. Financial Planning
  {
    id: 'retirement-calculator',
    name: 'Retirement Calculator',
    url: '/financial-tools/retirement-calculator',
    category: 'Financial Planning',
    description: 'Determine the total retirement nest egg required to maintain your lifestyle after accounting for inflation and life expectancy.',
    iconName: 'Sun',
    tags: ['Retirement Planning', 'Corpus Needed', 'Inflation Adjusted', 'Expenses']
  },
  {
    id: 'inflation-calculator',
    name: 'Inflation Calculator',
    url: '/financial-tools/inflation-calculator',
    category: 'Financial Planning',
    description: 'Calculate how inflation erodes purchasing power and compute future costs of living.',
    iconName: 'Flame',
    tags: ['Inflation', 'Purchasing Power', 'Future Cost', 'Consumer Prices']
  },
  {
    id: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    url: '/financial-tools/compound-interest-calculator',
    category: 'Financial Planning',
    description: 'Calculate compound interest accrued on savings across Daily, Monthly, Quarterly, and Yearly compounding frequencies.',
    iconName: 'Sparkles',
    tags: ['Compound Interest', 'Compounding Frequency', 'Interest Accumulation']
  },
  {
    id: 'simple-interest-calculator',
    name: 'Simple Interest Calculator',
    url: '/financial-tools/simple-interest-calculator',
    category: 'Financial Planning',
    description: 'Calculate basic simple interest and total repayment amounts effortlessly using SI = P × R × T / 100.',
    iconName: 'Divide',
    tags: ['Simple Interest', 'Loan Interest', 'Flat Rate']
  },
  {
    id: 'net-worth-calculator',
    name: 'Net Worth Calculator',
    url: '/financial-tools/net-worth-calculator',
    category: 'Financial Planning',
    description: 'Compute your total personal net worth by subtracting total liabilities (debts/loans) from total financial and physical assets.',
    iconName: 'Landmark',
    tags: ['Net Worth', 'Assets', 'Liabilities', 'Wealth Health', 'Financial Standing']
  }
];

export const getCalculatorMetaById = (id: CalculatorId): CalculatorMeta | undefined => {
  return CALCULATORS_REGISTRY.find(c => c.id === id);
};

export const getCalculatorsByCategory = (category: string): CalculatorMeta[] => {
  return CALCULATORS_REGISTRY.filter(c => c.category === category);
};
