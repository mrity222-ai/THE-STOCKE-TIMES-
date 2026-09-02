export type ComparisonToolId = 
  | 'sip-vs-fd'
  | 'fd-vs-debt-fund'
  | 'rent-vs-buy'
  | 'loan-comparison'
  | 'credit-card-comparison'
  | 'mutual-fund-comparison';

export interface ComparisonMeta {
  id: ComparisonToolId;
  name: string;
  url: string;
  shortDescription: string;
  iconName: string;
  category: string;
}

export interface CreditCardItem {
  id: string;
  name: string;
  issuer: string;
  joiningFee: number;
  annualFee: number;
  renewalFeeWaiverSpend: number;
  rewardRatePct: number;
  cashbackRatePct: number;
  loungeAccessAnnual: number;
  forexMarkupPct: number;
  minMonthlyIncome: number;
  categoryBestFor: 'Rewards' | 'Cashback' | 'Travel' | 'Low Fee';
  welcomeBenefits: string;
  fuelSurchargeWaiver: boolean;
  status: 'active' | 'draft';
}

export interface MutualFundItem {
  id: string;
  name: string;
  amc: string;
  category: 'Equity' | 'Debt' | 'Hybrid' | 'Index';
  subCategory: string;
  nav: number;
  aumCr: number;
  expenseRatioPct: number;
  exitLoad: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  return1Y: number;
  return3Y: number;
  return5Y: number;
  return10Y: number;
  status: 'active' | 'draft';
}
