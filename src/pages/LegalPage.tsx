import React, { useState } from 'react';
import { ShieldCheck, FileText, AlertTriangle, Scale, Cookie, BookOpen, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';
import { LatestArticlesSection } from '../components/articles/LatestArticlesSection';

interface LegalPageProps {
  initialTab?: 'privacy' | 'disclaimer' | 'terms' | 'cookie' | 'editorial' | 'corrections' | 'dmca' | 'affiliate';
  defaultTab?: 'privacy' | 'disclaimer' | 'terms' | 'cookie' | 'editorial' | 'corrections' | 'dmca' | 'affiliate';
  onNavigate?: (route: string, param?: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ initialTab, defaultTab, onNavigate }) => {
  const activeTab = (initialTab || defaultTab || 'disclaimer') as any;
  const [tab, setTab] = useState<'privacy' | 'disclaimer' | 'terms' | 'cookie' | 'editorial' | 'corrections' | 'dmca' | 'affiliate'>(activeTab);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-[#155EEF]/35 text-white p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-3">
        <div className="flex items-center gap-2 text-[#16A34A] font-bold text-xs uppercase tracking-wider">
          <Scale className="w-4 h-4" />
          <span>The Stoce Times Legal & Compliance</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight font-serif text-white">Legal Standards & Financial Disclaimers</h1>
        <p className="text-slate-300 text-xs font-mono">Last updated: August 2026</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-[#E2E8F0] shadow-sm text-xs font-bold gap-2">
        <button
          onClick={() => setTab('disclaimer')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'disclaimer' ? 'bg-[#0B1F33] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Disclaimer</span>
        </button>

        <button
          onClick={() => setTab('privacy')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'privacy' ? 'bg-[#0B1F33] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>Privacy Policy</span>
        </button>

        <button
          onClick={() => setTab('terms')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'terms' ? 'bg-[#0B1F33] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-[#155EEF]" />
          <span>Terms & Conditions</span>
        </button>

        <button
          onClick={() => setTab('cookie')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'cookie' ? 'bg-[#0B1F33] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cookie className="w-4 h-4 text-purple-400" />
          <span>Cookie Policy</span>
        </button>

        <button
          onClick={() => setTab('editorial')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'editorial' ? 'bg-[#0B1F33] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>Editorial Policy</span>
        </button>

        <button
          onClick={() => setTab('corrections')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'corrections' ? 'bg-[#0B1F33] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-sky-400" />
          <span>Corrections Policy</span>
        </button>

        <button
          onClick={() => setTab('dmca')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'dmca' ? 'bg-[#0B1F33] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>DMCA Policy</span>
        </button>

        <button
          onClick={() => setTab('affiliate')}
          className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            tab === 'affiliate' ? 'bg-[#0B1F33] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-teal-400" />
          <span>Affiliate Disclosure</span>
        </button>
      </div>

      {/* Main Document Content */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E8F0] shadow-sm text-slate-800 space-y-6 text-sm leading-relaxed font-light">
        
        {/* DISCLAIMER */}
        {tab === 'disclaimer' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">Financial Disclaimer</h2>
              <span className="text-xs text-slate-400 font-mono">Last Updated: August 2026</span>
            </div>

            <p>The information published on The Stoce Times is provided for general informational and educational purposes only.</p>
            <p>Nothing published on this website should be considered personalized investment, financial, tax, accounting or legal advice.</p>

            <div className="space-y-3 pt-2">
              <h3 className="text-base font-extrabold text-[#0B1F33]">Investment Risk</h3>
              <p>Financial markets involve risk. Investing or trading may result in partial or complete loss of capital. Readers should consider their own financial circumstances, risk tolerance and objectives before making financial decisions. Where appropriate, consult a qualified financial professional.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">Market Analysis & Opinions</h3>
              <p>Articles published on The Stoce Times may contain analysis, opinions, estimates, forecasts, interpretations and commentary. These represent editorial analysis based on information available at the time of publication. Market conditions can change and actual outcomes may differ significantly from expectations.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">Stocks & Securities</h3>
              <p>References to stocks, companies, mutual funds, securities, indices, sectors or other financial instruments are provided for informational purposes. The mention of a particular security or company does not automatically constitute a recommendation to buy, sell or hold that security.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">Financial News</h3>
              <p>Financial news and market information may change rapidly. Although reasonable efforts are made to provide useful and accurate information, The Stoce Times does not guarantee that every piece of information will remain accurate or current after publication.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">Financial Calculators</h3>
              <p>Financial calculators and comparison tools on The Stoce Times are intended for estimation and educational purposes. Calculator results are not guarantees of actual financial outcomes. Actual results may vary depending on interest rates, taxes, fees, market performance, regulations and individual circumstances.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">Third-Party Information</h3>
              <p>Some articles may refer to information obtained from publicly available sources, official announcements, company disclosures, exchanges, financial institutions or other third parties. While we may attempt to verify relevant information, we cannot guarantee the completeness or accuracy of information supplied by third parties.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">No Guaranteed Returns</h3>
              <p>The Stoce Times does not guarantee investment returns, trading profits, market performance, financial outcomes, future stock prices, or future investment results.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">Advertisements & Affiliates</h3>
              <p>The website may display advertisements and may contain affiliate links where applicable. Advertising or affiliate relationships do not automatically constitute an endorsement or investment recommendation. Any affiliate relationship, where applicable, does not change our editorial purpose.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">Reader Responsibility</h3>
              <p>Readers are responsible for conducting their own research and making their own financial decisions. Information published on The Stoce Times should be considered as one source of information rather than a substitute for professional advice.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">Acceptance</h3>
              <p>By using The Stoce Times, you acknowledge that financial information involves uncertainty and risk and that you are responsible for your own financial decisions.</p>
            </div>
          </div>
        )}

        {/* PRIVACY POLICY */}
        {tab === 'privacy' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">Privacy Policy</h2>
              <span className="text-xs text-slate-400 font-mono">Last Updated: August 2026</span>
            </div>

            <p>The Stoce Times respects your privacy and is committed to protecting information that may be collected when you use our website.</p>
            <p>This Privacy Policy explains what information may be collected, how it may be used and the choices available to you.</p>
            <p>By using The Stoce Times, you acknowledge the practices described in this Privacy Policy.</p>

            <div className="space-y-4 pt-2">
              <h3 className="text-base font-extrabold text-[#0B1F33]">1. Information We May Collect</h3>
              <p>Depending on how you use our website, we may collect or receive certain information, including:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Name and email address submitted through contact or subscription forms</li>
                <li>Search queries and website interaction information</li>
                <li>Browser information, device type, and IP address</li>
                <li>Approximate geographic information and pages visited</li>
                <li>Cookies and similar technologies</li>
              </ul>
              <p className="text-xs text-slate-500">We do not intentionally request sensitive personal information unless it is necessary for a specific purpose and voluntarily provided.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">2. How We Use Information</h3>
              <p>Information may be used to operate the website, respond to enquiries, improve website functionality and user experience, analyze traffic and content performance, maintain security, and comply with applicable legal obligations.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">3. Contact Information</h3>
              <p>If you voluntarily submit information through our contact form, we may use that information to respond to your enquiry. We do not sell your submitted contact information simply because you contacted us.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">4. Cookies</h3>
              <p>The Stoce Times may use cookies and similar technologies to remember preferences, improve website functionality, understand visitor behavior, measure performance, and support advertising. You can manage cookies through your browser settings.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">5. Analytics & Advertising</h3>
              <p>We may use analytics services to understand how visitors interact with the website. The Stoce Times may also display advertisements from third-party advertising providers. If Google AdSense is used on the website, Google and its advertising partners may use cookies or similar technologies in accordance with their applicable policies.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">6. Third-Party Websites</h3>
              <p>Our articles and pages may contain links to third-party websites or services. We do not control the privacy practices or security of external websites. We recommend reviewing their policies before providing personal information.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">7. Data Security & Children's Privacy</h3>
              <p>We take reasonable measures to protect information collected through our website. The Stoce Times is not specifically directed toward children, and we do not knowingly collect personal information from children.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">8. Contact</h3>
              <p>If you have questions regarding this Privacy Policy, please contact us at: <a href="mailto:privacy@thestocetimes.com" className="text-[#155EEF] font-bold hover:underline">privacy@thestocetimes.com</a></p>
            </div>
          </div>
        )}

        {/* TERMS & CONDITIONS */}
        {tab === 'terms' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">Terms & Conditions</h2>
              <span className="text-xs text-slate-400 font-mono">Last Updated: August 2026</span>
            </div>

            <p>Welcome to The Stoce Times. These Terms & Conditions govern your use of the The Stoce Times website and its content, tools and services.</p>
            <p>By accessing or using the website, you agree to these Terms & Conditions. If you do not agree with these terms, please discontinue use of the website.</p>

            <div className="space-y-4 pt-2">
              <h3 className="text-base font-extrabold text-[#0B1F33]">1. About The Stoce Times</h3>
              <p>The Stoce Times is an independent financial information and editorial platform providing financial news, market research, analysis, educational content, financial calculators, comparison tools and related information.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">2. Informational & Educational Purpose</h3>
              <p>Content published on The Stoce Times is provided primarily for informational and educational purposes. Nothing on this website should be interpreted as personalized investment, financial, tax, accounting or legal advice.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">3. Investment Risk</h3>
              <p>Investing and trading involve risk. The value of investments can rise or fall, and investors may lose some or all of their invested capital. Past performance does not guarantee future results.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">4. Market Analysis & Predictions</h3>
              <p>Articles may contain market commentary, opinions, forecasts, and estimates based on information available at the time of publication. No market prediction should be treated as guaranteed.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">5. Financial Calculators</h3>
              <p>Financial calculators and comparison tools are intended for estimation and educational purposes. Results may differ from actual outcomes due to interest rate fluctuations, taxes, fees, and market conditions.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">6. Intellectual Property</h3>
              <p>Unless otherwise stated, original articles, written content, branding, graphics, website design and other materials created by The Stoce Times are protected by applicable intellectual property laws. You may not reproduce or commercially exploit substantial portions without permission.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">7. Limitation of Liability & Contact</h3>
              <p>To the extent permitted by applicable law, The Stoce Times shall not be responsible for losses or damages arising from reliance on information published on the website.</p>
              <p>For questions regarding these Terms & Conditions, email us at: <a href="mailto:terms@thestocetimes.com" className="text-[#155EEF] font-bold hover:underline">terms@thestocetimes.com</a></p>
            </div>
          </div>
        )}

        {/* COOKIE POLICY */}
        {tab === 'cookie' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">Cookie Policy</h2>
              <span className="text-xs text-slate-400 font-mono">Last Updated: August 2026</span>
            </div>

            <p>This Cookie Policy explains how The Stoce Times may use cookies and similar technologies when you visit our website.</p>

            <div className="space-y-4 pt-2">
              <h3 className="text-base font-extrabold text-[#0B1F33]">1. What Are Cookies?</h3>
              <p>Cookies are small text files that websites may store on your device when you visit them. They can help websites remember information, understand visitor behavior, improve functionality and support certain services.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">2. How We Use Cookies</h3>
              <p>The Stoce Times may use cookies for purposes including website functionality, security, user preferences, analytics, performance measurement, advertising, and understanding traffic flow.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">3. Types of Cookies</h3>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Essential Cookies:</strong> Required for basic operation, security, and navigation.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the website.</li>
                <li><strong>Preference Cookies:</strong> Remember user preferences where applicable.</li>
                <li><strong>Advertising Cookies:</strong> Third-party providers may use cookies to display or measure ads.</li>
              </ul>

              <h3 className="text-base font-extrabold text-[#0B1F33]">4. Google AdSense & Third-Party Cookies</h3>
              <p>The Stoce Times may use Google AdSense to display advertisements. If AdSense is enabled, Google and its partners may use cookies to display and measure ads according to their policies.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">5. Managing Cookies & Contact</h3>
              <p>You can manage or disable cookies through your browser settings. If you have questions about this Cookie Policy, contact us at: <a href="mailto:privacy@thestocetimes.com" className="text-[#155EEF] font-bold hover:underline">privacy@thestocetimes.com</a></p>
            </div>
          </div>
        )}

        {/* EDITORIAL POLICY */}
        {tab === 'editorial' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">Editorial Policy</h2>
              <span className="text-xs text-slate-400 font-mono">Last Updated: August 2026</span>
            </div>

            <p>The Stoce Times is committed to providing independent, objective, and unbiased financial journalism and research.</p>

            <div className="space-y-4 pt-2">
              <h3 className="text-base font-extrabold text-[#0B1F33]">1. Editorial Independence</h3>
              <p>Our editorial decisions are made independently of commercial considerations, advertisers, or corporate partners. Paid stock promotions and sponsored content are strictly forbidden without explicit disclosure.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">2. Fact-Checking & Source Verification</h3>
              <p>All news reports and financial analysis are verified against primary data sources including stock exchanges (NSE/BSE), company regulatory filings, central bank disclosures (RBI), and official press statements.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">3. Conflict of Interest Disclosure</h3>
              <p>Our authors and equity research analysts adhere to strict ethical standards. Any personal holding or financial interest in covered assets is disclosed within the respective article.</p>
            </div>
          </div>
        )}

        {/* CORRECTIONS POLICY */}
        {tab === 'corrections' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">Corrections Policy</h2>
              <span className="text-xs text-slate-400 font-mono">Last Updated: August 2026</span>
            </div>

            <p>The Stoce Times strives for total accuracy in all published articles, data points, interest rates, and equity metrics.</p>

            <div className="space-y-4 pt-2">
              <h3 className="text-base font-extrabold text-[#0B1F33]">1. Prompt Corrections</h3>
              <p>When an error of fact or calculation is identified, we correct it promptly. Substantive corrections include a note indicating what was updated and when.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">2. Reporting an Error</h3>
              <p>Readers who spot an error or factual inaccuracy are encouraged to submit a correction request via our <button onClick={() => onNavigate && onNavigate('contact')} className="text-[#155EEF] font-bold hover:underline">Contact Form</button> or email <a href="mailto:editor@thestocetimes.com" className="text-[#155EEF] font-bold hover:underline">editor@thestocetimes.com</a>.</p>
            </div>
          </div>
        )}

        {/* DMCA / COPYRIGHT POLICY */}
        {tab === 'dmca' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">Copyright & DMCA Policy</h2>
              <span className="text-xs text-slate-400 font-mono">Last Updated: August 2026</span>
            </div>

            <p>The Stoce Times respects the intellectual property rights of creators and copyright holders.</p>

            <div className="space-y-4 pt-2">
              <h3 className="text-base font-extrabold text-[#0B1F33]">1. Copyright Notice</h3>
              <p>All original articles, graphics, tool designs, and underlying code are the intellectual property of The Stoce Times unless otherwise stated.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">2. DMCA Takedown Requests</h3>
              <p>If you believe your copyrighted work has been infringed on our website, please send a DMCA Takedown Notice to our Designated Copyright Agent at <a href="mailto:copyright@thestocetimes.com" className="text-[#155EEF] font-bold hover:underline">copyright@thestocetimes.com</a> containing: (a) description of copyrighted work, (b) URL location on our site, and (c) your contact information.</p>
            </div>
          </div>
        )}

        {/* AFFILIATE DISCLOSURE */}
        {tab === 'affiliate' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">Affiliate & Sponsorship Disclosure</h2>
              <span className="text-xs text-slate-400 font-mono">Last Updated: August 2026</span>
            </div>

            <p>Transparency is fundamental to our relationship with our readers.</p>

            <div className="space-y-4 pt-2">
              <h3 className="text-base font-extrabold text-[#0B1F33]">1. Affiliate Links</h3>
              <p>Some product links on our comparison tables (such as demat accounts, credit cards, or mutual fund apps) may be affiliate links. If you click a link and sign up, we may earn a small referral commission at no additional cost to you.</p>

              <h3 className="text-base font-extrabold text-[#0B1F33]">2. No Impact on Rankings</h3>
              <p>Affiliate partnerships do not influence our editorial evaluations, star ratings, or calculator output. We only feature products that meet our independent research benchmarks.</p>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Related / New Articles Section */}
      <LatestArticlesSection
        title="Latest Financial Articles & Research"
        subtitle="Stay informed with expert market commentary, personal finance guides, and regulatory updates."
        limit={4}
        onNavigate={onNavigate || (() => {})}
      />

    </div>
  );
};
