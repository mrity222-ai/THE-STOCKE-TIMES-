import { 
  AdPlacementKey, 
  AdUnit, 
  AdSenseConfig, 
  Advertiser, 
  AdCampaign, 
  HouseAd, 
  SponsoredArticle, 
  AdAnalytics, 
  AdFrequencyRules, 
  CookieConsentSettings 
} from '../types/ads';

const AD_CONFIG_KEY = 'finance_pulse_ads_config_v1';
const PLACEMENTS_CONFIG_KEY = 'finance_pulse_placements_config_v1';
const AD_UNITS_KEY = 'finance_pulse_ad_units_v1';
const ADSENSE_KEY = 'finance_pulse_adsense_v1';
const HOUSE_ADS_KEY = 'finance_pulse_house_ads_v1';
const ANALYTICS_KEY = 'finance_pulse_ad_analytics_v1';

export interface PlacementSetting {
  placementKey: AdPlacementKey;
  label: string;
  pageGroup: 'Home' | 'Articles' | 'Categories' | 'Search' | 'Calculators' | 'Comparisons' | 'Global';
  enabled: boolean;
  network: 'google-adsense' | 'direct' | 'house' | 'sponsored';
  device: 'all' | 'desktop' | 'mobile';
}

const defaultPlacements: PlacementSetting[] = [
  { placementKey: 'global_top', label: 'Global Top Header Banner (global_top)', pageGroup: 'Global', enabled: true, network: 'google-adsense', device: 'all' },
  { placementKey: 'homepage_mid', label: 'Homepage In-Feed Mid Ad (homepage_mid)', pageGroup: 'Home', enabled: true, network: 'house', device: 'all' },
  { placementKey: 'homepage-sidebar', label: 'Homepage Sidebar Ad (homepage_sidebar)', pageGroup: 'Home', enabled: true, network: 'google-adsense', device: 'desktop' },
  
  { placementKey: 'category_top', label: 'Category Page Top Hero Banner (category_top)', pageGroup: 'Categories', enabled: true, network: 'google-adsense', device: 'all' },
  { placementKey: 'category_mid', label: 'Category Page In-Feed Mid Ad (category_mid)', pageGroup: 'Categories', enabled: true, network: 'google-adsense', device: 'all' },
  
  { placementKey: 'article_top', label: 'Article Reader Top Ad (article_top)', pageGroup: 'Articles', enabled: true, network: 'google-adsense', device: 'all' },
  { placementKey: 'article_mid', label: 'Article In-Article Mid Content Ad (article_mid)', pageGroup: 'Articles', enabled: true, network: 'google-adsense', device: 'all' },
  { placementKey: 'article_bottom', label: 'Article Reader Bottom Ad (article_bottom)', pageGroup: 'Articles', enabled: true, network: 'google-adsense', device: 'all' },
  { placementKey: 'article_sidebar', label: 'Article Desktop Sidebar Sticky Ad (article_sidebar)', pageGroup: 'Articles', enabled: true, network: 'house', device: 'desktop' },
  
  { placementKey: 'search-page', label: 'Search Page Below Search Bar Ad (search_page)', pageGroup: 'Search', enabled: true, network: 'google-adsense', device: 'all' },
  
  { placementKey: 'calculator_top', label: 'Financial Calculator Top Intro Ad (calculator_top)', pageGroup: 'Calculators', enabled: true, network: 'google-adsense', device: 'all' },
  { placementKey: 'calculator_after_result', label: 'Calculator Immediately After Result (calculator_after_result)', pageGroup: 'Calculators', enabled: true, network: 'google-adsense', device: 'all' },
  { placementKey: 'calculator_bottom', label: 'Financial Calculator Bottom Ad (calculator_bottom)', pageGroup: 'Calculators', enabled: true, network: 'google-adsense', device: 'all' },
  
  { placementKey: 'comparison_top', label: 'Comparison Tool Top Intro Ad (comparison_top)', pageGroup: 'Comparisons', enabled: true, network: 'google-adsense', device: 'all' },
  { placementKey: 'comparison_after_result', label: 'Comparison Immediately After Result (comparison_after_result)', pageGroup: 'Comparisons', enabled: true, network: 'google-adsense', device: 'all' },
  { placementKey: 'comparison_bottom', label: 'Comparison Tool Bottom Ad (comparison_bottom)', pageGroup: 'Comparisons', enabled: true, network: 'google-adsense', device: 'all' },
  
  { placementKey: 'footer_global', label: 'Global Pre-Footer Banner Ad (footer_global)', pageGroup: 'Global', enabled: true, network: 'google-adsense', device: 'all' }
];

const defaultFrequencyRules: AdFrequencyRules = {
  globalAdsMasterSwitch: true,
  googleAdsenseEnabled: true,
  directAdsEnabled: true,
  houseAdsEnabled: true,
  sponsoredContentEnabled: true,
  maxAdsPerArticle: 5,
  minContentWordDistance: 300,
  maxSidebarAds: 2,
  maxMobileAds: 4,
  desktopMaxAds: 5,
  mobileMaxAds: 4
};

const defaultAdSense: AdSenseConfig = {
  publisherId: 'ca-pub-5020716602157264',
  autoAdsEnabled: true,
  manualAdsEnabled: true,
  verificationCode: '<meta name="google-adsense-account" content="ca-pub-5020716602157264">',
  scriptLoaded: true
};

const defaultAdUnits: AdUnit[] = [
  {
    id: 'unit-1',
    name: 'Global Top Header Leaderboard',
    type: 'display',
    network: 'google-adsense',
    slotId: '9876543210',
    placement: 'global_top',
    targetDevice: 'all',
    status: 'active'
  },
  {
    id: 'unit-2',
    name: 'Article Top Banner',
    type: 'in-article',
    network: 'google-adsense',
    slotId: '1234567890',
    placement: 'article_top',
    targetDevice: 'all',
    status: 'active'
  },
  {
    id: 'unit-3',
    name: 'Calculator Top Banner',
    type: 'responsive',
    network: 'google-adsense',
    slotId: '5544332211',
    placement: 'calculator_top',
    targetDevice: 'all',
    status: 'active'
  },
  {
    id: 'unit-4',
    name: 'Article Sidebar Sticky Ad',
    type: 'display',
    network: 'google-adsense',
    slotId: '6677889900',
    placement: 'article_sidebar',
    targetDevice: 'desktop',
    status: 'active'
  }
];

const defaultHouseAds: HouseAd[] = [
  {
    id: 'house-1',
    name: 'SIP Calculator Promotion',
    headline: 'Free SIP Wealth Calculator',
    description: 'Estimate mutual fund compounding returns & 20-year wealth projections in 1 click.',
    ctaText: 'Calculate Returns →',
    destinationUrl: '/financial-tools/sip-calculator',
    desktopImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    altText: 'Free SIP Wealth Calculator Banner',
    targetWindow: '_self',
    placement: 'article_sidebar',
    deviceTargeting: 'all',
    priority: 'high',
    rotationWeight: 100,
    impressions: 4850,
    clicks: 215,
    ctr: 4.43,
    status: 'active',
    title: 'Free SIP Wealth Calculator',
    targetUrl: '/financial-tools/sip-calculator',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'house-2',
    name: 'Home Loan EMI Calculator Promo',
    headline: 'Instant Home Loan EMI Tool',
    description: 'Compare SBI, HDFC & ICICI home loan EMIs and check amortization schedules.',
    ctaText: 'Check EMI Now →',
    destinationUrl: '/financial-tools/emi-calculator',
    desktopImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    mobileImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80',
    altText: 'Home Loan EMI Calculator Banner',
    targetWindow: '_self',
    placement: 'homepage_mid',
    deviceTargeting: 'all',
    priority: 'high',
    rotationWeight: 80,
    impressions: 3200,
    clicks: 140,
    ctr: 4.38,
    status: 'active',
    title: 'Instant Home Loan EMI Tool',
    targetUrl: '/financial-tools/emi-calculator',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'
  }
];

export class AdService {
  
  public static getRules(): AdFrequencyRules {
    try {
      const data = localStorage.getItem(AD_CONFIG_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load ad rules', err);
    }
    return defaultFrequencyRules;
  }

  public static saveRules(rules: AdFrequencyRules): void {
    localStorage.setItem(AD_CONFIG_KEY, JSON.stringify(rules));
  }

  // Placements Configuration
  public static getPlacementsConfig(): PlacementSetting[] {
    try {
      const data = localStorage.getItem(PLACEMENTS_CONFIG_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load placements config', err);
    }
    return defaultPlacements;
  }

  public static savePlacementsConfig(config: PlacementSetting[]): void {
    localStorage.setItem(PLACEMENTS_CONFIG_KEY, JSON.stringify(config));
  }

  public static isPlacementEnabled(placementKey: AdPlacementKey): boolean {
    const rules = this.getRules();
    if (!rules.globalAdsMasterSwitch) return false;
    const placements = this.getPlacementsConfig();
    const setting = placements.find(p => p.placementKey === placementKey);
    return setting ? setting.enabled : true;
  }

  public static getPlacementSetting(placementKey: AdPlacementKey): PlacementSetting | undefined {
    return this.getPlacementsConfig().find(p => p.placementKey === placementKey);
  }

  public static getAdUnits(): AdUnit[] {
    try {
      const data = localStorage.getItem(AD_UNITS_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load ad units', err);
    }
    return defaultAdUnits;
  }

  public static saveAdUnit(unit: AdUnit): void {
    const units = this.getAdUnits();
    const idx = units.findIndex(u => u.id === unit.id);
    if (idx >= 0) units[idx] = unit;
    else units.push({ ...unit, id: unit.id || 'unit-' + Date.now() });
    localStorage.setItem(AD_UNITS_KEY, JSON.stringify(units));
  }

  public static deleteAdUnit(id: string): void {
    const units = this.getAdUnits().filter(u => u.id !== id);
    localStorage.setItem(AD_UNITS_KEY, JSON.stringify(units));
  }

  public static getAdSenseConfig(): AdSenseConfig {
    try {
      const data = localStorage.getItem(ADSENSE_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load AdSense config', err);
    }
    return defaultAdSense;
  }

  public static saveAdSenseConfig(config: AdSenseConfig): void {
    localStorage.setItem(ADSENSE_KEY, JSON.stringify(config));
  }

  public static getHouseAds(): HouseAd[] {
    try {
      const data = localStorage.getItem(HOUSE_ADS_KEY);
      if (data) return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load house ads', err);
    }
    return defaultHouseAds;
  }

  public static saveHouseAd(ad: HouseAd): void {
    const ads = this.getHouseAds();
    const idx = ads.findIndex(a => a.id === ad.id);
    if (idx >= 0) ads[idx] = ad;
    else ads.push({ ...ad, id: ad.id || 'house-' + Date.now() });
    localStorage.setItem(HOUSE_ADS_KEY, JSON.stringify(ads));
  }

  // Analytics Tracker
  public static trackImpression(placement: AdPlacementKey): void {
    try {
      const data = localStorage.getItem(ANALYTICS_KEY);
      const analytics: Record<string, { impressions: number; clicks: number }> = data ? JSON.parse(data) : {};
      if (!analytics[placement]) analytics[placement] = { impressions: 0, clicks: 0 };
      analytics[placement].impressions += 1;
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
    } catch (err) {
      console.error('Tracking error', err);
    }
  }

  public static trackClick(placement: AdPlacementKey): void {
    try {
      const data = localStorage.getItem(ANALYTICS_KEY);
      const analytics: Record<string, { impressions: number; clicks: number }> = data ? JSON.parse(data) : {};
      if (!analytics[placement]) analytics[placement] = { impressions: 0, clicks: 0 };
      analytics[placement].clicks += 1;
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
    } catch (err) {
      console.error('Tracking click error', err);
    }
  }

  public static getAnalytics(): AdAnalytics[] {
    try {
      const data = localStorage.getItem(ANALYTICS_KEY);
      const raw: Record<string, { impressions: number; clicks: number }> = data ? JSON.parse(data) : {};
      
      const placements = this.getPlacementsConfig();

      return placements.map((p) => {
        const imp = raw[p.placementKey]?.impressions || Math.floor(Math.random() * 1200) + 400;
        const clk = raw[p.placementKey]?.clicks || Math.floor(imp * 0.025);
        const ctr = imp > 0 ? Number(((clk / imp) * 100).toFixed(2)) : 0;
        const rpm = (imp / 1000) * 45;

        return {
          placement: p.placementKey,
          impressions: imp,
          clicks: clk,
          ctrPct: ctr,
          estimatedEarnings: Math.round(rpm)
        };
      });
    } catch (err) {
      console.error('Failed to compute analytics', err);
    }
    return [];
  }

  // Automatic In-Article Ad Inserter
  public static insertInArticleAds(contentHtml: string): string {
    const rules = this.getRules();
    if (!rules.globalAdsMasterSwitch || !this.isPlacementEnabled('article_mid')) {
      return contentHtml;
    }

    const paragraphs = contentHtml.split(/(<\/p>)/i);
    if (paragraphs.length < 4) return contentHtml;

    let adCount = 0;
    const maxAds = rules.maxAdsPerArticle || 5;
    let result = '';

    for (let i = 0; i < paragraphs.length; i++) {
      result += paragraphs[i];
      if (paragraphs[i].toLowerCase() === '</p>') {
        const pIndex = Math.floor(i / 2);
        // Inject after paragraph 2, 4, 6, 8, 10
        if ((pIndex === 2 || pIndex === 4 || pIndex === 6 || pIndex === 8 || pIndex === 10) && adCount < maxAds) {
          adCount++;
          result += `\n<div class="my-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center shadow-sm">
            <div class="flex items-center justify-between mb-1.5 px-1">
              <span class="text-[10px] uppercase font-bold text-slate-400">Advertisement</span>
              <span class="text-[10px] font-mono text-emerald-600 font-bold">TheStoceTimes.com In-Article Ad #${adCount}</span>
            </div>
            <div class="bg-white border border-slate-200 p-4 rounded-xl text-xs text-slate-600 font-mono flex items-center justify-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>[Google AdSense / Direct Sponsored Banner — Slot #${adCount}]</span>
            </div>
          </div>\n`;
        }
      }
    }

    return result;
  }
}
