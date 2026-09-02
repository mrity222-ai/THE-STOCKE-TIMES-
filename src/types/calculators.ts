export type FinancialToolCategory = 
  | 'Loans & EMI'
  | 'Investment'
  | 'Savings'
  | 'Tax & Salary'
  | 'Financial Planning';

export type CalculatorId =
  | 'emi-calculator'
  | 'sip-calculator'
  | 'lumpsum-calculator'
  | 'fd-calculator'
  | 'rd-calculator'
  | 'ppf-calculator'
  | 'epf-calculator'
  | 'nps-calculator'
  | 'cagr-calculator'
  | 'compound-interest-calculator'
  | 'simple-interest-calculator'
  | 'loan-eligibility-calculator'
  | 'inflation-calculator'
  | 'gst-calculator'
  | 'salary-calculator'
  | 'income-tax-calculator'
  | 'sip-vs-lumpsum'
  | 'swp-calculator'
  | 'retirement-calculator'
  | 'net-worth-calculator';

export interface CalculatorMeta {
  id: CalculatorId;
  name: string;
  url: string;
  category: FinancialToolCategory;
  description: string;
  iconName: string;
  tags: string[];
}

export interface TaxSlab {
  minIncome: number;
  maxIncome: number; // Infinity represented by -1
  rate: number; // percentage, e.g. 5 for 5%
  fixedTax: number;
}

export interface TaxRegimeRules {
  standardDeduction: number;
  rebateLimit: number;
  rebateMaxAmount: number;
  cessRate: number; // e.g. 4 for 4%
  slabs: TaxSlab[];
}

export interface IncomeTaxRules {
  financialYear: string; // e.g. '2026-27'
  oldRegime: TaxRegimeRules;
  newRegime: TaxRegimeRules;
  effectiveFrom: string;
  status: 'draft' | 'published';
  updatedAt: string;
  updatedBy: string;
}

export interface PPFRules {
  interestRate: number; // e.g. 7.1
  minAnnualContribution: number; // e.g. 500
  maxAnnualContribution: number; // e.g. 150000
  lockInYears: number; // 15
  extensionYears: number; // 5
  compoundingFrequency: 'Yearly';
  effectiveFrom: string;
  status: 'draft' | 'published';
  updatedAt: string;
}

export interface EPFRules {
  employeeContributionPercent: number; // e.g. 12
  employerContributionPercent: number; // e.g. 12
  epsContributionPercent: number; // e.g. 8.33
  wageCeiling: number; // e.g. 15000
  interestRate: number; // e.g. 8.25
  financialYear: string; // '2026-27'
  status: 'draft' | 'published';
  updatedAt: string;
}

export interface NPSRules {
  minMonthlyContribution: number;
  expectedReturnPercent: number; // e.g. 10
  expectedAnnuityRatePercent: number; // e.g. 6
  annuityPercentMin: number; // 40
  status: 'draft' | 'published';
  updatedAt: string;
}

export interface GSTRules {
  availableRates: number[]; // e.g. [5, 12, 18, 28]
  defaultRate: number; // 18
  status: 'draft' | 'published';
  updatedAt: string;
}

export interface InflationRules {
  defaultInflationRate: number; // e.g. 6.0
  updatedAt: string;
}

export interface FinancialRulesConfig {
  incomeTax: Record<string, IncomeTaxRules>; // key is financialYear, e.g. '2026-27'
  ppf: PPFRules;
  epf: EPFRules;
  nps: NPSRules;
  gst: GSTRules;
  inflation: InflationRules;
  lastGlobalUpdate: string;
}

export interface RuleAuditLog {
  id: string;
  ruleType: string;
  financialYear?: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  timestamp: string;
  status: 'draft' | 'published';
}
