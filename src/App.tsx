import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SeoModal } from './components/seo/SeoModal';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { SearchPage } from './pages/SearchPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';
import { AuthorProfilePage } from './pages/AuthorProfilePage';
import { EmiCalculatorPage } from './pages/EmiCalculatorPage';
import { SipCalculatorPage } from './pages/SipCalculatorPage';
import { FinancialToolsLandingPage } from './pages/FinancialToolsLandingPage';
import { GenericCalculatorView } from './components/calculators/GenericCalculatorView';
import { ComparisonToolsLandingPage } from './pages/ComparisonToolsLandingPage';
import { GenericComparisonView } from './components/comparisons/GenericComparisonView';
import { UnsubscribePage } from './pages/UnsubscribePage';
import { CookieConsentBanner } from './components/ads/CookieConsentBanner';
import { CALCULATORS_REGISTRY, getCalculatorMetaById } from './data/calculatorsMeta';
import { COMPARISONS_REGISTRY, getComparisonMetaById } from './data/comparisonsMeta';
import { CalculatorId } from './types/calculators';
import { ComparisonToolId } from './types/comparisons';
import { CategoryId } from './types';
import { StorageService } from './services/storageService';
import { SeoService } from './services/seoService';

export function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [routeParam, setRouteParam] = useState<string | undefined>(undefined);
  const [seoModalOpen, setSeoModalOpen] = useState<boolean>(false);

  // Parse location pathname or route on initial load and popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname || '/';
      const parts = path.split('/').filter(Boolean);

      if (parts.length === 0) {
        setCurrentRoute('home');
        setRouteParam(undefined);
      } else if (
        ['stock-market', 'personal-finance', 'banking', 'investment', 'finance-news'].includes(parts[0]) &&
        parts[1]
      ) {
        setCurrentRoute('article');
        setRouteParam(parts[1]);
      } else if (parts[0] === 'article' && parts[1]) {
        setCurrentRoute('article');
        setRouteParam(parts[1]);
      } else if (parts[0] === 'author' && parts[1]) {
        setCurrentRoute('author');
        setRouteParam(parts[1]);
      } else if (parts[0] === 'search') {
        setCurrentRoute('search');
        setRouteParam(parts[1] ? decodeURIComponent(parts[1]) : undefined);
      } else if (['stock-market', 'personal-finance', 'banking', 'investment', 'finance-news'].includes(parts[0])) {
        setCurrentRoute(parts[0]);
        setRouteParam(undefined);
      } else if (parts[0] === 'about') {
        setCurrentRoute('about');
        setRouteParam(undefined);
      } else if (parts[0] === 'contact') {
        setCurrentRoute('contact');
        setRouteParam(undefined);
      } else if (parts[0] === 'legal') {
        setCurrentRoute('legal');
        setRouteParam(parts[1] || 'disclaimer');
      } else if (parts[0] === 'unsubscribe') {
        setCurrentRoute('unsubscribe');
        setRouteParam(undefined);
      } else if (parts[0] === 'admin' || parts[0] === 'login' || parts[0] === 'admin-login') {
        setCurrentRoute('admin');
        setRouteParam(undefined);
      } else if (parts[0] === 'financial-tools') {
        if (parts[1] && getCalculatorMetaById(parts[1] as CalculatorId)) {
          setCurrentRoute(parts[1]);
          setRouteParam(undefined);
        } else {
          setCurrentRoute('financial-tools');
          setRouteParam(undefined);
        }
      } else if (parts[0] === 'comparison-tools') {
        if (parts[1] && getComparisonMetaById(parts[1] as ComparisonToolId)) {
          setCurrentRoute(parts[1]);
          setRouteParam(undefined);
        } else {
          setCurrentRoute('comparison-tools');
          setRouteParam(undefined);
        }
      } else if (getCalculatorMetaById(parts[0] as CalculatorId)) {
        setCurrentRoute(parts[0]);
        setRouteParam(undefined);
      } else if (getComparisonMetaById(parts[0] as ComparisonToolId)) {
        setCurrentRoute(parts[0]);
        setRouteParam(undefined);
      } else {
        setCurrentRoute('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Update Dynamic SEO Tags & Structured JSON-LD Schemas on every route change
  useEffect(() => {
    const domain = window.location.origin;
    const calcMeta = getCalculatorMetaById(currentRoute as CalculatorId);
    const compMeta = getComparisonMetaById(currentRoute as ComparisonToolId);

    if (calcMeta) {
      SeoService.updateMetaTags(
        `${calcMeta.name} — Free Financial Calculator | The Stoce Times`,
        calcMeta.description,
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
        `${domain}/financial-tools/${calcMeta.id}`
      );
      SeoService.injectJsonLd([
        SeoService.generateWebApplicationSchema(calcMeta.name, calcMeta.description, `${domain}/financial-tools/${calcMeta.id}`),
        SeoService.generateBreadcrumbSchema([
          { name: 'Financial Tools', url: '/financial-tools' },
          { name: calcMeta.name, url: `/financial-tools/${calcMeta.id}` }
        ])
      ]);
      return;
    }

    if (compMeta) {
      SeoService.updateMetaTags(
        `${compMeta.name} — Comparison Tool | The Stoce Times`,
        compMeta.shortDescription,
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
        `${domain}/comparison-tools/${compMeta.id}`
      );
      SeoService.injectJsonLd([
        SeoService.generateWebApplicationSchema(compMeta.name, compMeta.shortDescription, `${domain}/comparison-tools/${compMeta.id}`),
        SeoService.generateBreadcrumbSchema([
          { name: 'Comparison Tools', url: '/comparison-tools' },
          { name: compMeta.name, url: `/comparison-tools/${compMeta.id}` }
        ])
      ]);
      return;
    }

    switch (currentRoute) {
      case 'home':
        SeoService.updateMetaTags(
          'The Stoce Times — Global Market News, Equity Analysis & Financial Tools',
          'The Stoce Times provides real-time stock market news, equity analysis, banking updates, personal finance guides, 20 financial calculators, and 6 comparison tools.',
          'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
          domain
        );
        SeoService.injectJsonLd(SeoService.generateWebSiteSchema());
        break;

      case 'stock-market':
        SeoService.updateMetaTags(
          'Stock Market News, Equity Analysis & Nifty 50 | The Stoce Times',
          'Latest stock market news, Nifty 50 updates, Sensex trends, IPO analysis, and equity research.',
          'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
          `${domain}/stock-market`
        );
        SeoService.injectJsonLd(SeoService.generateBreadcrumbSchema([
          { name: 'Stock Market', url: '/stock-market' }
        ]));
        break;

      case 'personal-finance':
        SeoService.updateMetaTags(
          'Personal Finance Guides & Money Planning | The Stoce Times',
          'Expert personal finance advice, SIP planning, tax strategies, budgeting frameworks, and wealth creation.',
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
          `${domain}/personal-finance`
        );
        SeoService.injectJsonLd(SeoService.generateBreadcrumbSchema([
          { name: 'Personal Finance', url: '/personal-finance' }
        ]));
        break;

      case 'banking':
        SeoService.updateMetaTags(
          'Banking News, FD Rates & Interest Rates | The Stoce Times',
          'FD interest rates, RBI monetary policy, home loan interest rates, and banking updates.',
          'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1200&q=80',
          `${domain}/banking`
        );
        SeoService.injectJsonLd(SeoService.generateBreadcrumbSchema([
          { name: 'Banking', url: '/banking' }
        ]));
        break;

      case 'investment':
        SeoService.updateMetaTags(
          'Investment Strategies & Mutual Funds | The Stoce Times',
          'Mutual fund analysis, equity investments, gold, real estate, and long-term asset allocation.',
          'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
          `${domain}/investment`
        );
        SeoService.injectJsonLd(SeoService.generateBreadcrumbSchema([
          { name: 'Investment', url: '/investment' }
        ]));
        break;

      case 'finance-news':
        SeoService.updateMetaTags(
          'Breaking Finance News & Global Market Updates | The Stoce Times',
          'Real-time financial breaking news, economic policy updates, global market reports.',
          'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
          `${domain}/finance-news`
        );
        SeoService.injectJsonLd(SeoService.generateBreadcrumbSchema([
          { name: 'Finance News', url: '/finance-news' }
        ]));
        break;

      case 'financial-tools':
        SeoService.updateMetaTags(
          '20 Free Financial Calculators | The Stoce Times',
          'Calculate SIP returns, Loan EMIs, Income Tax, FD interest, Compound interest, Inflation and retirement targets.',
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
          `${domain}/financial-tools`
        );
        SeoService.injectJsonLd(SeoService.generateBreadcrumbSchema([
          { name: 'Financial Tools', url: '/financial-tools' }
        ]));
        break;

      case 'comparison-tools':
        SeoService.updateMetaTags(
          '6 Financial Comparison Tools | The Stoce Times',
          'Compare Old vs New Tax Regime, Direct vs Regular Mutual Funds, SIP vs Lumpsum, FD vs Debt Funds, Buy vs Rent.',
          'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
          `${domain}/comparison-tools`
        );
        SeoService.injectJsonLd(SeoService.generateBreadcrumbSchema([
          { name: 'Comparison Tools', url: '/comparison-tools' }
        ]));
        break;

      case 'about':
        SeoService.updateMetaTags(
          'About Us | The Stoce Times Independent Financial Publication',
          'Learn about The Stoce Times editorial principles, independent financial journalism, research team and mission.',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
          `${domain}/about`
        );
        SeoService.injectJsonLd(SeoService.generateBreadcrumbSchema([
          { name: 'About Us', url: '/about' }
        ]));
        break;

      case 'contact':
        SeoService.updateMetaTags(
          'Contact Us | The Stoce Times Editorial Room',
          'Get in touch with The Stoce Times editorial room, press team and support.',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
          `${domain}/contact`
        );
        SeoService.injectJsonLd(SeoService.generateBreadcrumbSchema([
          { name: 'Contact Us', url: '/contact' }
        ]));
        break;

      case 'legal':
        SeoService.updateMetaTags(
          'Legal Policies, Terms & Disclaimer | The Stoce Times',
          'Privacy Policy, Terms & Conditions, Editorial Disclaimer and Cookie Policy.',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
          `${domain}/legal/${routeParam || 'disclaimer'}`
        );
        SeoService.injectJsonLd(SeoService.generateBreadcrumbSchema([
          { name: 'Legal Policies', url: `/legal/${routeParam || 'disclaimer'}` }
        ]));
        break;

      case 'admin':
        SeoService.updateMetaTags(
          'CMS Admin Panel | The Stoce Times',
          'Admin publishing portal',
          undefined,
          `${domain}/admin`,
          undefined,
          true // noIndex for Admin
        );
        break;

      default:
        break;
    }
  }, [currentRoute, routeParam]);

  const navigateTo = (
    route: string,
    param?: string,
    category?: string
  ) => {
    let pathStr = '/';

    if (
      ['stock-market', 'personal-finance', 'banking', 'investment', 'finance-news'].includes(route) &&
      param
    ) {
      pathStr = `/${route}/${param}`;
    } else if (route === 'article' && param) {
      pathStr = `/article/${param}`;
    } else if (route === 'author' && param) {
      pathStr = `/author/${param}`;
    } else if (route === 'search') {
      pathStr = param ? `/search/${encodeURIComponent(param)}` : '/search';
    } else if (route === 'legal') {
      pathStr = `/legal/${param || 'disclaimer'}`;
    } else if (route === 'login' || route === 'admin-login') {
      pathStr = '/admin/login';
    } else if (route === 'financial-tools') {
      pathStr = '/financial-tools';
    } else if (route === 'comparison-tools') {
      pathStr = '/comparison-tools';
    } else if (getCalculatorMetaById(route as CalculatorId)) {
      pathStr = `/financial-tools/${route}`;
    } else if (getComparisonMetaById(route as ComparisonToolId)) {
      pathStr = `/comparison-tools/${route}`;
    } else if (route !== 'home') {
      pathStr = `/${route}`;
    }

    window.history.pushState({}, '', pathStr);
    setCurrentRoute(
      ['stock-market', 'personal-finance', 'banking', 'investment', 'finance-news'].includes(route) && param
        ? 'article'
        : (route === 'login' || route === 'admin-login') ? 'admin' : route
    );
    setRouteParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    const calcMeta = getCalculatorMetaById(currentRoute as CalculatorId);
    if (calcMeta) {
      if (currentRoute === 'emi-calculator') return <EmiCalculatorPage onNavigate={navigateTo} />;
      if (currentRoute === 'sip-calculator') return <SipCalculatorPage onNavigate={navigateTo} />;
      return <GenericCalculatorView meta={calcMeta} onNavigate={navigateTo} />;
    }

    const compMeta = getComparisonMetaById(currentRoute as ComparisonToolId);
    if (compMeta) {
      return <GenericComparisonView meta={compMeta} onNavigate={navigateTo} />;
    }

    switch (currentRoute) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;

      case 'stock-market':
      case 'personal-finance':
      case 'banking':
      case 'investment':
      case 'finance-news':
        return <CategoryPage categoryId={currentRoute as CategoryId} onNavigate={navigateTo} />;

      case 'article':
        return <ArticleDetailPage slug={routeParam || 'nifty-50-hits-all-time-high-key-sectors-driving-bull-run'} onNavigate={navigateTo} />;

      case 'author':
        return <AuthorProfilePage authorId={routeParam || 'auth-1'} onNavigate={navigateTo} />;

      case 'search':
        return <SearchPage initialQuery={routeParam || ''} onNavigate={navigateTo} />;

      case 'about':
        return <AboutPage onNavigate={navigateTo} />;

      case 'contact':
        return <ContactPage onNavigate={navigateTo} />;

      case 'legal':
        return <LegalPage initialTab={routeParam as any} onNavigate={navigateTo} />;

      case 'financial-tools':
        return <FinancialToolsLandingPage onNavigate={navigateTo} />;

      case 'comparison-tools':
        return <ComparisonToolsLandingPage onNavigate={navigateTo} />;

      case 'admin':
        return <AdminPage onNavigate={navigateTo} />;

      case 'unsubscribe':
        return <UnsubscribePage onNavigate={navigateTo} />;

      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  const isFullWidthPage = currentRoute === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {!isFullWidthPage && (
        <Header activeTab={currentRoute} onNavigate={navigateTo} />
      )}

      <main className="flex-grow">
        {renderActiveView()}
      </main>

      {!isFullWidthPage && (
        <Footer onNavigate={navigateTo} onOpenSeoModal={() => setSeoModalOpen(true)} />
      )}

      <CookieConsentBanner />

      {/* Admin SEO Manager Inspector Modal */}
      <SeoModal isOpen={seoModalOpen} onClose={() => setSeoModalOpen(false)} />
    </div>
  );
}

export default App;
