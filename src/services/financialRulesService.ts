import { FinancialRulesConfig, IncomeTaxRules, PPFRules, EPFRules, NPSRules, GSTRules, InflationRules, RuleAuditLog } from '../types/calculators';

const RULES_STORAGE_KEY = 'finance_pulse_financial_rules_v1';
const AUDIT_LOG_KEY = 'finance_pulse_rules_audit_v1';

const defaultRules: FinancialRulesConfig = {
  incomeTax: {
    '2026-27': {
      financialYear: '2026-27',
      status: 'published',
      updatedAt: '2026-04-01',
      updatedBy: 'Admin (System)',
      effectiveFrom: '2026-04-01',
      newRegime: {
        standardDeduction: 75000,
        rebateLimit: 700000,
        rebateMaxAmount: 25000,
        cessRate: 4,
        slabs: [
          { minIncome: 0, maxIncome: 400000, rate: 0, fixedTax: 0 },
          { minIncome: 400001, maxIncome: 800000, rate: 5, fixedTax: 0 },
          { minIncome: 800001, maxIncome: 1200000, rate: 10, fixedTax: 20000 },
          { minIncome: 1200001, maxIncome: 1600000, rate: 15, fixedTax: 60000 },
          { minIncome: 1600001, maxIncome: 2000000, rate: 20, fixedTax: 120000 },
          { minIncome: 2000001, maxIncome: 2400000, rate: 25, fixedTax: 200000 },
          { minIncome: 2400001, maxIncome: -1, rate: 30, fixedTax: 300000 }
        ]
      },
      oldRegime: {
        standardDeduction: 50000,
        rebateLimit: 500000,
        rebateMaxAmount: 12500,
        cessRate: 4,
        slabs: [
          { minIncome: 0, maxIncome: 250000, rate: 0, fixedTax: 0 },
          { minIncome: 250001, maxIncome: 500000, rate: 5, fixedTax: 0 },
          { minIncome: 500001, maxIncome: 1000000, rate: 20, fixedTax: 12500 },
          { minIncome: 1000001, maxIncome: -1, rate: 30, fixedTax: 112500 }
        ]
      }
    },
    '2025-26': {
      financialYear: '2025-26',
      status: 'published',
      updatedAt: '2025-04-01',
      updatedBy: 'Admin (System)',
      effectiveFrom: '2025-04-01',
      newRegime: {
        standardDeduction: 75000,
        rebateLimit: 700000,
        rebateMaxAmount: 25000,
        cessRate: 4,
        slabs: [
          { minIncome: 0, maxIncome: 300000, rate: 0, fixedTax: 0 },
          { minIncome: 300001, maxIncome: 700000, rate: 5, fixedTax: 0 },
          { minIncome: 700001, maxIncome: 1000000, rate: 10, fixedTax: 20000 },
          { minIncome: 1000001, maxIncome: 1200000, rate: 15, fixedTax: 50000 },
          { minIncome: 1200001, maxIncome: 1500000, rate: 20, fixedTax: 80000 },
          { minIncome: 1500001, maxIncome: -1, rate: 30, fixedTax: 140000 }
        ]
      },
      oldRegime: {
        standardDeduction: 50000,
        rebateLimit: 500000,
        rebateMaxAmount: 12500,
        cessRate: 4,
        slabs: [
          { minIncome: 0, maxIncome: 250000, rate: 0, fixedTax: 0 },
          { minIncome: 250001, maxIncome: 500000, rate: 5, fixedTax: 0 },
          { minIncome: 500001, maxIncome: 1000000, rate: 20, fixedTax: 12500 },
          { minIncome: 1000001, maxIncome: -1, rate: 30, fixedTax: 112500 }
        ]
      }
    }
  },
  ppf: {
    interestRate: 7.1,
    minAnnualContribution: 500,
    maxAnnualContribution: 150000,
    lockInYears: 15,
    extensionYears: 5,
    compoundingFrequency: 'Yearly',
    effectiveFrom: '2026-04-01',
    status: 'published',
    updatedAt: '2026-04-01'
  },
  epf: {
    employeeContributionPercent: 12,
    employerContributionPercent: 12,
    epsContributionPercent: 8.33,
    wageCeiling: 15000,
    interestRate: 8.25,
    financialYear: '2026-27',
    status: 'published',
    updatedAt: '2026-04-01'
  },
  nps: {
    minMonthlyContribution: 500,
    expectedReturnPercent: 10.0,
    expectedAnnuityRatePercent: 6.0,
    annuityPercentMin: 40,
    status: 'published',
    updatedAt: '2026-04-01'
  },
  gst: {
    availableRates: [5, 12, 18, 28],
    defaultRate: 18,
    status: 'published',
    updatedAt: '2026-04-01'
  },
  inflation: {
    defaultInflationRate: 6.0,
    updatedAt: '2026-04-01'
  },
  lastGlobalUpdate: new Date().toISOString().split('T')[0]
};

export class FinancialRulesService {
  public static getRules(): FinancialRulesConfig {
    try {
      const data = localStorage.getItem(RULES_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Failed to load financial rules from storage', err);
    }
    return defaultRules;
  }

  public static saveRules(rules: FinancialRulesConfig): void {
    try {
      rules.lastGlobalUpdate = new Date().toISOString().split('T')[0];
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
    } catch (err) {
      console.error('Failed to save financial rules', err);
    }
  }

  public static getIncomeTaxRules(fy: string = '2026-27'): IncomeTaxRules {
    const rules = this.getRules();
    return rules.incomeTax[fy] || rules.incomeTax['2026-27'];
  }

  public static getPPFRules(): PPFRules {
    return this.getRules().ppf;
  }

  public static getEPFRules(): EPFRules {
    return this.getRules().epf;
  }

  public static getNPSRules(): NPSRules {
    return this.getRules().nps;
  }

  public static getGSTRules(): GSTRules {
    return this.getRules().gst;
  }

  public static getInflationRules(): InflationRules {
    return this.getRules().inflation;
  }

  // Audit Logs
  public static getAuditLogs(): RuleAuditLog[] {
    try {
      const data = localStorage.getItem(AUDIT_LOG_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error('Failed to get audit logs', err);
    }
    return [
      {
        id: 'log-1',
        ruleType: 'EPF Interest Rate',
        financialYear: '2026-27',
        oldValue: '8.15%',
        newValue: '8.25%',
        updatedBy: 'Admin',
        timestamp: '2026-04-01 10:30 AM',
        status: 'published'
      },
      {
        id: 'log-2',
        ruleType: 'PPF Interest Rate',
        financialYear: '2026-27',
        oldValue: '7.1%',
        newValue: '7.1%',
        updatedBy: 'Admin',
        timestamp: '2026-04-01 09:15 AM',
        status: 'published'
      }
    ];
  }

  public static addAuditLog(log: Omit<RuleAuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newLog: RuleAuditLog = {
      ...log,
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString()
    };
    logs.unshift(newLog);
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs.slice(0, 50)));
  }
}
