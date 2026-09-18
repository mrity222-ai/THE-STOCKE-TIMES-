import React, { useEffect } from 'react';
import { AdPlacementKey } from '../../types/ads';
import { AdService } from '../../services/adService';
import { Sparkles, Info } from 'lucide-react';

interface AdSlotProps {
  placement: AdPlacementKey;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
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

  useEffect(() => {
    if (isEnabled) {
      AdService.trackImpression(placement);
      try {
        AdService.ensureAdSenseScript();
        // Push to window.adsbygoogle when AdSense script is loaded
        if (window && (window as any).adsbygoogle) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch (err) {
        // Ignore AdSense script initialization errors when offline
      }
    }
  }, [placement, isEnabled]);

  if (!isEnabled) {
    return null; // Ad placement disabled from Admin Panel or Master Switch is OFF
  }

  // Determine reserved minimum height based on placement type to prevent CLS (Cumulative Layout Shift)
  const isSidebar = placement.includes('sidebar');
  const reservedMinHeight = isSidebar ? 'min-h-[280px]' : 'min-h-[100px] sm:min-h-[120px]';

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
      <div className={`my-4 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md ${reservedMinHeight} flex flex-col justify-between ${className}`}>
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

  if (placementSetting?.network !== 'google-adsense' || !rules.googleAdsenseEnabled || !adsense.manualAdsEnabled || !adsense.publisherId) {
    return null;
  }

  const activeUnit = AdService.getAdUnits().find((unit) => {
    const deviceOk = unit.targetDevice === 'all' || unit.targetDevice === currentDevice;
    return unit.placement === placement && unit.status === 'active' && unit.network === 'google-adsense' && deviceOk;
  });

  if (!activeUnit?.slotId) {
    return null;
  }

  // Google AdSense Responsive Unit Container (Fixed reserved bounding box to eliminate CLS)
  return (
    <div className={`my-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 text-center shadow-sm overflow-hidden ${reservedMinHeight} flex flex-col justify-between ${className}`}>
      
      {/* Strict AdSense Disclosure Header (Mandatory Rule: Clear ADVERTISEMENT label) */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono uppercase mb-2 border-b border-slate-200/70 pb-1">
        <span className="font-bold tracking-wider text-slate-400">ADVERTISEMENT</span>
        <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Google AdSense • {adsense.publisherId}</span>
        </span>
      </div>

      {/* AdSense Responsive Ins Container */}
      <div 
        onClick={() => AdService.trackClick(placement)}
        className={`${reservedMinHeight} bg-white border border-slate-200/80 rounded-xl flex items-center justify-center p-3 transition-colors group relative overflow-hidden`}
      >
        {/* Real AdSense Ins Element */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: isSidebar ? '250px' : '90px' }}
          data-ad-client={adsense.publisherId}
          data-ad-slot={activeUnit.slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

      </div>

    </div>
  );
};
