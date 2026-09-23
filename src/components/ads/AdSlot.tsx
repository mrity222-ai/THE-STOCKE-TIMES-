import React, { useEffect, useReducer, useRef, useState } from 'react';
import { AdPlacementKey } from '../../types/ads';
import { AdService } from '../../services/adService';
import { Sparkles, Info } from 'lucide-react';

interface AdSlotProps {
  placement: AdPlacementKey;
  className?: string;
}

const extractAdCodeAttribute = (code: string | undefined, attr: string): string => {
  if (!code) return '';
  const match = code.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match?.[1]?.trim() || '';
};

const extractFirstAdCodeAttribute = (codes: Array<string | undefined>, attr: string): string => {
  for (const code of codes) {
    const value = extractAdCodeAttribute(code, attr);
    if (value) return value;
  }
  return '';
};

const isSafeCreativeUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

const isImageCreative = (url: string): boolean => /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(url);

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  const [, refreshConfig] = useReducer((value: number) => value + 1, 0);
  const [adSenseCollapsed, setAdSenseCollapsed] = useState(false);
  const googleAdRef = useRef<HTMLDivElement>(null);
  const rules = AdService.getRules();
  const adsense = AdService.getAdSenseConfig();
  const houseAds = AdService.getHouseAds();
  const placementSetting = AdService.getPlacementSetting(placement);

  const getCurrentDevice = (): 'desktop' | 'mobile' => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  };

  const currentDevice = getCurrentDevice();
  const matchesDevice = !placementSetting || placementSetting.device === 'all' || placementSetting.device === currentDevice;
  const isEnabled = AdService.isPlacementEnabled(placement) && matchesDevice;
  const isSidebar = placement.includes('sidebar');
  const reservedMinHeight = isSidebar ? 'min-h-[280px]' : 'min-h-[100px] sm:min-h-[120px]';
  const activeUnit = AdService.getAdUnits().find((unit) => {
    const deviceOk = unit.targetDevice === 'all' || unit.targetDevice === currentDevice;
    return unit.placement === placement && unit.status === 'active' && deviceOk;
  });
  const htmlAdCode = activeUnit?.customCode || '';
  const ampAdCode = activeUnit?.ampCode || '';
  const snippetClient = extractFirstAdCodeAttribute([htmlAdCode, ampAdCode], 'data-ad-client');
  const snippetSlot = extractFirstAdCodeAttribute([htmlAdCode, ampAdCode], 'data-ad-slot');
  const snippetFormat = extractFirstAdCodeAttribute([htmlAdCode, ampAdCode], 'data-ad-format') || extractFirstAdCodeAttribute([ampAdCode], 'data-auto-format');
  const snippetResponsive = extractFirstAdCodeAttribute([htmlAdCode, ampAdCode], 'data-full-width-responsive') || (ampAdCode.includes('data-full-width') ? 'true' : '');
  const effectiveClient = snippetClient || adsense.publisherId;
  const effectiveSlot = snippetSlot || activeUnit?.slotId || '';
  const creativeUrl = activeUnit?.creativeUrl?.trim();
  const destinationUrl = activeUnit?.destinationUrl?.trim();
  const isGoogleUnit = activeUnit?.network === 'google-adsense';
  const canRenderGoogleUnit = Boolean(
    placementSetting?.network === 'google-adsense' &&
    isGoogleUnit &&
    rules.googleAdsenseEnabled &&
    adsense.manualAdsEnabled &&
    effectiveClient &&
    effectiveSlot
  );

  useEffect(() => {
    return AdService.subscribeToChanges(refreshConfig);
  }, []);

  useEffect(() => {
    setAdSenseCollapsed(false);
  }, [placement, effectiveClient, effectiveSlot, canRenderGoogleUnit]);

  useEffect(() => {
    if (isEnabled) {
      AdService.trackImpression(placement);
    }

    if (isEnabled && canRenderGoogleUnit) {
      try {
        AdService.ensureAdSenseScript();
        if (window && (window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch (err) {
        // Ignore AdSense script initialization errors when offline.
      }
    }
  }, [placement, isEnabled, canRenderGoogleUnit]);

  useEffect(() => {
    if (!isEnabled || !canRenderGoogleUnit) return;

    const container = googleAdRef.current;
    if (!container || typeof MutationObserver === 'undefined') return;

    let cancelled = false;
    const startedAt = Date.now();
    const getStatus = () => {
      const ins = container.querySelector<HTMLElement>('.adsbygoogle');
      const adStatus = ins?.getAttribute('data-ad-status');
      const hasRenderedCreative = adStatus === 'filled' && Boolean(container.querySelector('iframe'));
      const waitedLongEnough = Date.now() - startedAt > 2600;

      if (hasRenderedCreative) return 'filled';
      if (adStatus === 'unfilled' || waitedLongEnough) return 'unfilled';
      return 'pending';
    };

    const collapseIfUnfilled = () => {
      if (cancelled) return;
      if (getStatus() === 'unfilled') setAdSenseCollapsed(true);
    };

    const observer = new MutationObserver(() => {
      if (getStatus() === 'filled') {
        setAdSenseCollapsed(false);
      } else {
        collapseIfUnfilled();
      }
    });

    observer.observe(container, {
      attributes: true,
      childList: true,
      subtree: true
    });

    const shortTimer = window.setTimeout(collapseIfUnfilled, 2800);
    const longTimer = window.setTimeout(collapseIfUnfilled, 8000);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(shortTimer);
      window.clearTimeout(longTimer);
    };
  }, [isEnabled, canRenderGoogleUnit, placement, effectiveClient, effectiveSlot]);

  if (!isEnabled) {
    return null; // Ad placement disabled from Admin Panel or Master Switch is OFF
  }

  // House Ad rendering (Strict AdSense Policy Compliance: clearly marked as Promoted Tool)
  const now = new Date();
  const activeHouseAds = houseAds.filter((h) => {
    const startsOk = !h.startDate || new Date(h.startDate) <= now;
    const endsOk = !h.endDate || new Date(h.endDate) >= now;
    const impressionOk = !h.maxImpressions || (h.impressions || 0) < h.maxImpressions;
    const clickOk = !h.maxClicks || (h.clicks || 0) < h.maxClicks;
    const deviceOk = !h.deviceTargeting || h.deviceTargeting === 'all' || h.deviceTargeting === currentDevice;
    return h.placement === placement && h.status === 'active' && startsOk && endsOk && impressionOk && clickOk && deviceOk;
  });
  const houseAd = activeHouseAds.sort((a, b) => {
    const priorityRank = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityRank[a.priority || 'medium'];
    const bPriority = priorityRank[b.priority || 'medium'];
    if (bPriority !== aPriority) return bPriority - aPriority;
    return (b.rotationWeight || 0) - (a.rotationWeight || 0);
  })[0];

  if (rules.houseAdsEnabled && placementSetting?.network === 'house' && houseAd) {
    const activeHouse = houseAd;
    const targetUrl = activeHouse.targetUrl || activeHouse.destinationUrl || '/';
    return (
      <div data-ad-placement={placement} className={`my-4 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md ${reservedMinHeight} flex flex-col justify-between ${className}`}>
        {/* Strict Non-Deceptive Disclosure Label */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>PROMOTED FINANCIAL TOOL</span>
          </span>
          <span className="text-[9px] uppercase font-mono font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            SPONSORED
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-white font-serif">{activeHouse.title}</h4>
            <p className="text-xs text-slate-300 font-light max-w-xl">{activeHouse.description}</p>
          </div>

          <a
            href={targetUrl}
            target={activeHouse.targetWindow || '_self'}
            rel={activeHouse.targetWindow === '_blank' ? 'noopener noreferrer sponsored' : 'sponsored'}
            onClick={() => AdService.trackClick(placement)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow shrink-0 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>{activeHouse.ctaText}</span>
          </a>
        </div>
      </div>
    );
  }

  if (
    activeUnit &&
    (placementSetting?.network === 'direct' || placementSetting?.network === 'sponsored') &&
    ((placementSetting.network === 'direct' && rules.directAdsEnabled) || (placementSetting.network === 'sponsored' && rules.sponsoredContentEnabled)) &&
    activeUnit.network === placementSetting.network &&
    isSafeCreativeUrl(creativeUrl)
  ) {
    const creative = creativeUrl as string;
    const creativeBody = isImageCreative(creative) ? (
      <img
        src={creative}
        alt={`${activeUnit.name} advertisement`}
        className="max-h-[280px] w-full object-contain rounded-xl bg-white"
        loading="lazy"
      />
    ) : (
      <iframe
        src={creative}
        title={`${activeUnit.name} advertisement`}
        className="min-h-[250px] w-full rounded-xl border-0 bg-white"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    );

    return (
      <div data-ad-placement={placement} className={`my-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 text-center shadow-sm overflow-hidden ${reservedMinHeight} flex flex-col justify-between ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase mb-2 border-b border-slate-200/70 pb-1">
          <span className="font-bold tracking-wider text-slate-400">ADVERTISEMENT</span>
          <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            <span>{placementSetting.network === 'sponsored' ? 'Sponsored' : 'Direct Ad'}</span>
          </span>
        </div>

        {destinationUrl ? (
          <a href={destinationUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={() => AdService.trackClick(placement)}>
            {creativeBody}
          </a>
        ) : (
          creativeBody
        )}
      </div>
    );
  }

  if (!canRenderGoogleUnit || adSenseCollapsed) {
    return null;
  }

  // Google AdSense Responsive Unit Container (Fixed reserved bounding box to eliminate CLS)
  return (
    <div ref={googleAdRef} data-ad-placement={placement} className={`my-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 text-center shadow-sm overflow-hidden ${reservedMinHeight} flex flex-col justify-between ${className}`}>
      
      {/* Strict AdSense Disclosure Header (Mandatory Rule: Clear ADVERTISEMENT label) */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase mb-2 border-b border-slate-200/70 pb-1">
        <span className="font-bold tracking-wider text-slate-400">ADVERTISEMENT</span>
        <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Google AdSense • {effectiveClient}</span>
        </span>
      </div>

      {/* AdSense Responsive Ins Container */}
      <div className={`${reservedMinHeight} bg-white border border-slate-200/80 rounded-xl flex items-center justify-center p-3 transition-colors group relative overflow-hidden`}>
        {/* Real AdSense Ins Element */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: isSidebar ? '250px' : '90px' }}
          data-ad-client={effectiveClient}
          data-ad-slot={effectiveSlot}
          data-ad-format={snippetFormat || (activeUnit?.type === 'in-article' ? 'fluid' : 'auto')}
          data-full-width-responsive={snippetResponsive || 'true'}
        />

      </div>

    </div>
  );
};
