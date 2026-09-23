import { Article, Author, Category, MarketIndex } from '../types';
import { GENERATED_SEO_ARTICLES } from './generatedArticles';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'stock-market',
    name: 'Stock Market',
    slug: 'stock-market',
    description: 'Real-time equity market trends, stock breakdowns, Q3 earnings analysis, technical charts, IPO reviews, and Nifty/Sensex updates.',
    icon: 'TrendingUp',
    subcategories: ['Stock Analysis', 'IPO', 'Nifty & Sensex', 'Dividends', 'Company Results', 'Beginner Guides']
  },
  {
    id: 'ipo',
    name: 'IPO',
    slug: 'ipo',
    description: 'Upcoming IPO calendar, India and global IPO watchlists, pre-apply research, listing schedules, allotment dates, and risk-focused IPO analysis.',
    icon: 'Layers',
    subcategories: ['Upcoming IPOs', 'India IPOs', 'Global IPOs', 'IPO Calendar', 'Pre-Apply Research', 'Allotment & Listing']
  },
  {
    id: 'personal-finance',
    name: 'Personal Finance',
    slug: 'personal-finance',
    description: 'Practical tactics for budgeting, wealth accumulation, credit score optimization, tax deductions, debt management, and financial independence.',
    icon: 'Wallet',
    subcategories: ['Saving Money', 'Budgeting', 'Loans', 'Credit Score', 'Credit Cards', 'Tax Basics', 'Money Management', 'Crypto Safety']
  },
  {
    id: 'banking',
    name: 'Banking',
    slug: 'banking',
    description: 'Central bank policy updates, fixed deposit (FD) interest rate comparisons, digital banking security, savings account yields, and RBI directives.',
    icon: 'Building2',
    subcategories: ['FD Rates', 'Savings Accounts', 'RBI Updates', 'Digital Banking', 'Loans & Mortgages', 'Banking Guides']
  },
  {
    id: 'investment',
    name: 'Investment',
    slug: 'investment',
    description: 'Mutual fund SIP strategies, asset allocation models, long-term equity growth, risk hedging, ETF guides, and wealth compounding techniques.',
    icon: 'PieChart',
    subcategories: ['Mutual Funds', 'SIP', 'Long-Term Investing', 'Asset Allocation', 'ETFs', 'Risk Management', 'Crypto']
  },
  {
    id: 'finance-news',
    name: 'Finance News',
    slug: 'finance-news',
    description: 'Breaking global macroeconomic updates, interest rate movements, corporate mergers, regulatory developments, and market alerts.',
    icon: 'Newspaper',
    subcategories: ['Economy', 'RBI Policy', 'Global Markets', 'Government Rules', 'Fintech', 'Market Announcements', 'Crypto Regulation']
  }
];

export const INITIAL_AUTHORS: Author[] = [
  {
    id: 'usr-admin-1',
    name: 'Primary Admin',
    role: 'Editor-in-Chief & Primary Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Chief Executive Editor & Platform Administrator',
    credentials: 'Admin',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'auth-1',
    name: 'Vikramaditya Sharma',
    role: 'Senior Equity Analyst & Derivatives Strategist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Senior Equity Analyst & Derivatives Strategist',
    credentials: 'CFA, MBA Finance',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com'
  },
  {
    id: 'auth-2',
    name: 'Priya Mukherjee',
    role: 'Personal Finance Expert & Wealth Planner',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    bio: 'Personal Finance Expert & Wealth Planner',
    credentials: 'CFP Certified',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com'
  }
];

export const INITIAL_MARKET_INDICES: MarketIndex[] = [
  { symbol: 'NIFTY 50', name: 'NSE Nifty 50', value: '24,850.40', change: '+142.30', changePercent: '+0.58%', isPositive: true },
  { symbol: 'SENSEX', name: 'BSE Sensex', value: '81,420.15', change: '+410.80', changePercent: '+0.51%', isPositive: true },
  { symbol: 'S&P 500', name: 'S&P 500 Index', value: '5,620.80', change: '+24.10', changePercent: '+0.43%', isPositive: true },
  { symbol: 'NASDAQ', name: 'Nasdaq Composite', value: '17,890.25', change: '-35.40', changePercent: '-0.20%', isPositive: false },
  { symbol: 'GOLD', name: 'Gold Spot (10g)', value: '$2,485.50', change: '+18.20', changePercent: '+0.74%', isPositive: true },
  { symbol: 'BRENT', name: 'Brent Crude Oil', value: '$78.40', change: '-1.15', changePercent: '-1.45%', isPositive: false }
];

export const INITIAL_ARTICLES: Article[] = GENERATED_SEO_ARTICLES;
