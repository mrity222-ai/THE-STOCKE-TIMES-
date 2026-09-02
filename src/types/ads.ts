export type AdPlacementKey = 
  | 'global_top'
  | 'homepage_mid'
  | 'category_top'
  | 'category_mid'
  | 'article_top'
  | 'article_mid'
  | 'article_bottom'
  | 'article_sidebar'
  | 'calculator_top'
  | 'calculator_after_result'
  | 'calculator_bottom'
  | 'comparison_top'
  | 'comparison_after_result'
  | 'comparison_bottom'
  | 'footer_global'
  | 'header-top-banner'
  | 'below-navigation'
  | 'homepage-top'
  | 'homepage-between-articles'
  | 'homepage-sidebar'
  | 'article-before-content'
  | 'article-after-intro'
  | 'article-middle-content'
  | 'article-after-content'
  | 'category-between-articles'
  | 'search-page'
  | 'footer-banner';

export type AdType = 'display' | 'native' | 'in-article' | 'in-feed' | 'responsive';
export type AdNetwork = 'google-adsense' | 'direct' | 'house' | 'sponsored';
export type TargetDevice = 'all' | 'desktop' | 'mobile' | 'tablet';

export interface AdUnit {
  id: string;
  name: string;
  type: AdType;
  network: AdNetwork;
  slotId: string;
  placement: AdPlacementKey;
  targetDevice: TargetDevice;
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
}

export interface AdSenseConfig {
  publisherId: string; // e.g. ca-pub-1234567890123456
  autoAdsEnabled: boolean;
  manualAdsEnabled: boolean;
  verificationCode: string;
  scriptLoaded: boolean;
}

export interface Advertiser {
  id: string;
  companyName: string;
  logo: string;
  website: string;
  contactEmail: string;
  status: 'active' | 'inactive';
}

export interface AdCampaign {
  id: string;
  name: string;
  advertiserId: string;
  placement: AdPlacementKey;
  targetDevice: TargetDevice;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'active' | 'paused' | 'completed';
  creative: {
    imageUrl: string;
    title: string;
    description: string;
    ctaText: string;
    destinationUrl: string;
  };
}

export type AdPriority = 'low' | 'medium' | 'high';
export type AdLifecycleStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'expired';

export interface HouseAd {
  id: string;
  name: string; // Ad Name (Admin Identification)
  headline: string; // Main Promotional Heading
  description?: string; // Short Description
  desktopImage: string; // Banner Image Desktop
  mobileImage?: string; // Banner Image Mobile
  altText?: string; // Image Alt Text for Accessibility & SEO
  ctaText: string; // CTA Button Text (e.g. "Explore Now")
  destinationUrl: string; // Target URL
  targetWindow?: '_blank' | '_self'; // Open link in Same / New Tab

  // Display Settings
  placement: AdPlacementKey;
  deviceTargeting?: TargetDevice;
  targetCategoryIds?: string[];
  targetArticleIds?: string[];
  startDate?: string;
  endDate?: string;
  priority?: AdPriority;
  rotationWeight?: number;
  maxImpressions?: number;
  maxClicks?: number;

  // Tracking & Management
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  status: AdLifecycleStatus | 'active' | 'inactive';
  internalNotes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;

  // Legacy field support
  title?: string;
  targetUrl?: string;
  imageUrl?: string;
}

export interface SponsoredArticle {
  id: string;
  title: string;
  sponsorName: string;
  sponsorLogo: string;
  articleSlug: string;
  disclosureText: string; // "Sponsored Content" or "Advertisement"
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface AdAnalytics {
  placement: AdPlacementKey;
  impressions: number;
  clicks: number;
  ctrPct: number;
  estimatedEarnings: number;
}

export interface AdFrequencyRules {
  globalAdsMasterSwitch: boolean;
  googleAdsenseEnabled: boolean;
  directAdsEnabled: boolean;
  houseAdsEnabled: boolean;
  sponsoredContentEnabled: boolean;
  maxAdsPerArticle: number; // e.g. 4
  minContentWordDistance: number; // e.g. 500 words
  maxSidebarAds: number; // e.g. 2
  maxMobileAds: number; // e.g. 3
  desktopMaxAds: number; // e.g. 5
  mobileMaxAds: number; // e.g. 3
}

export interface CookieConsentSettings {
  enabled: boolean;
  message: string;
  acceptButtonText: string;
  privacyPolicyUrl: string;
}
