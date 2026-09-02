import { ComparisonMeta, ComparisonToolId } from '../types/comparisons';

export const COMPARISONS_REGISTRY: ComparisonMeta[] = [
  {
    id: 'sip-vs-fd',
    name: 'SIP vs FD Comparison',
    url: '/comparison-tools/sip-vs-fd',
    shortDescription: 'Compare potential equity SIP compounding returns with Fixed Deposit maturity values side-by-side.',
    iconName: 'TrendingUp',
    category: 'Investment'
  },
  {
    id: 'fd-vs-debt-fund',
    name: 'FD vs Debt Fund Comparison',
    url: '/comparison-tools/fd-vs-debt-fund',
    shortDescription: 'Compare FD returns with debt mutual fund expected growth, net costs, liquidity, and risk indicators.',
    iconName: 'PieChart',
    category: 'Savings & Debt'
  },
  {
    id: 'rent-vs-buy',
    name: 'Rent vs Buy Property Calculator',
    url: '/comparison-tools/rent-vs-buy',
    shortDescription: 'Evaluate the long-term financial impact of buying a house with a home loan versus renting and investing savings.',
    iconName: 'Home',
    category: 'Real Estate'
  },
  {
    id: 'loan-comparison',
    name: 'Loan A vs Loan B Comparison',
    url: '/comparison-tools/loan-comparison',
    shortDescription: 'Compare two loan options based on EMI, interest rate, processing fees, and overall repayment cost.',
    iconName: 'Scale',
    category: 'Loans & Credit'
  },
  {
    id: 'credit-card-comparison',
    name: 'Credit Card Comparison',
    url: '/comparison-tools/credit-card-comparison',
    shortDescription: 'Compare popular Indian credit cards by annual fees, reward rates, lounge access, and calculated annual benefits.',
    iconName: 'CreditCard',
    category: 'Cards & Banking'
  },
  {
    id: 'mutual-fund-comparison',
    name: 'Mutual Fund Comparison',
    url: '/comparison-tools/mutual-fund-comparison',
    shortDescription: 'Compare mutual funds side-by-side on expense ratios, AUM, risk levels, and 1Y/3Y/5Y/10Y historical return performance.',
    iconName: 'BarChart3',
    category: 'Mutual Funds'
  }
];

export const getComparisonMetaById = (id: ComparisonToolId): ComparisonMeta | undefined => {
  return COMPARISONS_REGISTRY.find(c => c.id === id);
};
