import { CreditCardItem, MutualFundItem } from '../types/comparisons';

const CARDS_STORAGE_KEY = 'finance_pulse_credit_cards_v1';
const FUNDS_STORAGE_KEY = 'finance_pulse_mutual_funds_v1';

const defaultCards: CreditCardItem[] = [
  {
    id: 'card-1',
    name: 'HDFC Regalia Gold',
    issuer: 'HDFC Bank',
    joiningFee: 2500,
    annualFee: 2500,
    renewalFeeWaiverSpend: 300000,
    rewardRatePct: 4.0,
    cashbackRatePct: 1.5,
    loungeAccessAnnual: 12,
    forexMarkupPct: 2.0,
    minMonthlyIncome: 100000,
    categoryBestFor: 'Travel',
    welcomeBenefits: '₹2,500 Voucher + Club Marriott Membership',
    fuelSurchargeWaiver: true,
    status: 'active'
  },
  {
    id: 'card-2',
    name: 'ICICI Amazon Pay',
    issuer: 'ICICI Bank',
    joiningFee: 0,
    annualFee: 0,
    renewalFeeWaiverSpend: 0,
    rewardRatePct: 5.0,
    cashbackRatePct: 5.0,
    loungeAccessAnnual: 4,
    forexMarkupPct: 3.5,
    minMonthlyIncome: 25000,
    categoryBestFor: 'Cashback',
    welcomeBenefits: '₹500 Amazon Pay Balance',
    fuelSurchargeWaiver: true,
    status: 'active'
  },
  {
    id: 'card-3',
    name: 'SBI SimplyCLICK',
    issuer: 'SBI Card',
    joiningFee: 499,
    annualFee: 499,
    renewalFeeWaiverSpend: 100000,
    rewardRatePct: 2.5,
    cashbackRatePct: 2.5,
    loungeAccessAnnual: 4,
    forexMarkupPct: 3.5,
    minMonthlyIncome: 30000,
    categoryBestFor: 'Rewards',
    welcomeBenefits: '₹500 Amazon Gift Card',
    fuelSurchargeWaiver: true,
    status: 'active'
  },
  {
    id: 'card-4',
    name: 'Axis Bank ACE',
    issuer: 'Axis Bank',
    joiningFee: 499,
    annualFee: 499,
    renewalFeeWaiverSpend: 200000,
    rewardRatePct: 5.0,
    cashbackRatePct: 5.0,
    loungeAccessAnnual: 4,
    forexMarkupPct: 3.5,
    minMonthlyIncome: 35000,
    categoryBestFor: 'Cashback',
    welcomeBenefits: '100% Cashback up to ₹500 on Google Pay',
    fuelSurchargeWaiver: true,
    status: 'active'
  }
];

const defaultFunds: MutualFundItem[] = [
  {
    id: 'fund-1',
    name: 'Parag Parikh Flexi Cap Fund',
    amc: 'PPFAS Mutual Fund',
    category: 'Equity',
    subCategory: 'Flexi Cap',
    nav: 78.45,
    aumCr: 65400,
    expenseRatioPct: 0.58,
    exitLoad: '2% if redeemed within 365 days',
    riskLevel: 'Very High',
    return1Y: 24.5,
    return3Y: 21.2,
    return5Y: 23.8,
    return10Y: 19.5,
    status: 'active'
  },
  {
    id: 'fund-2',
    name: 'HDFC Top 100 Fund',
    amc: 'HDFC Mutual Fund',
    category: 'Equity',
    subCategory: 'Large Cap',
    nav: 942.10,
    aumCr: 34200,
    expenseRatioPct: 0.95,
    exitLoad: '1% if redeemed within 1 year',
    riskLevel: 'Very High',
    return1Y: 28.1,
    return3Y: 18.9,
    return5Y: 17.4,
    return10Y: 14.8,
    status: 'active'
  },
  {
    id: 'fund-3',
    name: 'ICICI Prudential Corporate Bond Fund',
    amc: 'ICICI Prudential MF',
    category: 'Debt',
    subCategory: 'Corporate Debt',
    nav: 26.80,
    aumCr: 27800,
    expenseRatioPct: 0.32,
    exitLoad: 'Nil',
    riskLevel: 'Moderate',
    return1Y: 7.8,
    return3Y: 7.2,
    return5Y: 7.5,
    return10Y: 8.1,
    status: 'active'
  },
  {
    id: 'fund-4',
    name: 'Nippon India Growth Fund',
    amc: 'Nippon India Mutual Fund',
    category: 'Equity',
    subCategory: 'Mid Cap',
    nav: 340.50,
    aumCr: 28900,
    expenseRatioPct: 0.82,
    exitLoad: '1% if redeemed within 1 month',
    riskLevel: 'Very High',
    return1Y: 34.2,
    return3Y: 26.4,
    return5Y: 25.1,
    return10Y: 18.2,
    status: 'active'
  }
];

export class ComparisonCatalogService {
  // Cards Catalog
  public static getCreditCards(): CreditCardItem[] {
    try {
      const data = localStorage.getItem(CARDS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load credit cards catalog', err);
    }
    return defaultCards;
  }

  public static saveCreditCard(card: CreditCardItem): void {
    const cards = this.getCreditCards();
    const index = cards.findIndex(c => c.id === card.id);
    if (index >= 0) {
      cards[index] = card;
    } else {
      cards.push({ ...card, id: card.id || 'card-' + Date.now() });
    }
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  }

  public static deleteCreditCard(id: string): void {
    const cards = this.getCreditCards().filter(c => c.id !== id);
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  }

  // Mutual Funds Catalog
  public static getMutualFunds(): MutualFundItem[] {
    try {
      const data = localStorage.getItem(FUNDS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load mutual funds catalog', err);
    }
    return defaultFunds;
  }

  public static saveMutualFund(fund: MutualFundItem): void {
    const funds = this.getMutualFunds();
    const index = funds.findIndex(f => f.id === fund.id);
    if (index >= 0) {
      funds[index] = fund;
    } else {
      funds.push({ ...fund, id: fund.id || 'fund-' + Date.now() });
    }
    localStorage.setItem(FUNDS_STORAGE_KEY, JSON.stringify(funds));
  }

  public static deleteMutualFund(id: string): void {
    const funds = this.getMutualFunds().filter(f => f.id !== id);
    localStorage.setItem(FUNDS_STORAGE_KEY, JSON.stringify(funds));
  }
}
