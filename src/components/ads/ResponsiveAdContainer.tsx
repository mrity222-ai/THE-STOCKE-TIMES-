import React from 'react';
import { AdPlacementKey } from '../../types/ads';
import { AdSlot } from './AdSlot';
import { Info, Sparkles } from 'lucide-react';

export type ResponsiveAdFormat = 'leaderboard' | 'banner' | 'in-feed' | 'rectangle' | 'sidebar' | 'billboard';

interface ResponsiveAdContainerProps {
  placement: AdPlacementKey;
  format?: ResponsiveAdFormat;
  className?: string;
  reserveHeightClass?: string;
  label?: string;
}

/**
 * Standard IAB & Google AdSense Fixed-Height Containers
 * Reserves layout geometry before the ad script executes to guarantee 0.00 Cumulative Layout Shift (CLS).
 */
const FORMAT_HEIGHT_CLASSES: Record<ResponsiveAdFormat, { wrapper: string; inner: string }> = {
  // Leaderboard (728x90 desktop, 970x90 large, 320x100 mobile)
  leaderboard: {
    wrapper: 'h-[125px] sm:h-[140px] md:h-[155px] min-h-[125px] sm:min-h-[140px] md:min-h-[155px]',
    inner: 'h-[85px] sm:h-[95px] md:h-[105px]'
  },
  // Compact horizontal banner (320x50 mobile, 468x60 tablet, 728x90 desktop)
  banner: {
    wrapper: 'h-[110px] sm:h-[125px] md:h-[135px] min-h-[110px] sm:min-h-[125px] md:min-h-[135px]',
    inner: 'h-[70px] sm:h-[80px] md:h-[90px]'
  },
  // In-Feed responsive unit (fluid / 336x280 / 300x250)
  'in-feed': {
    wrapper: 'h-[290px] sm:h-[310px] min-h-[290px] sm:min-h-[310px]',
    inner: 'h-[240px] sm:h-[260px]'
  },
  // Medium Rectangle (300x250 / 336x280)
  rectangle: {
    wrapper: 'h-[295px] sm:h-[315px] min-h-[295px] sm:min-h-[315px]',
    inner: 'h-[245px] sm:h-[265px]'
  },
  // Sidebar Skyscraper / Medium Rectangle (300x250 / 300x600)
  sidebar: {
    wrapper: 'h-[315px] sm:h-[335px] min-h-[315px] sm:min-h-[335px]',
    inner: 'h-[265px] sm:h-[285px]'
  },
  // Large Billboard (970x250 desktop billboard, 300x250 mobile)
  billboard: {
    wrapper: 'h-[150px] sm:h-[260px] md:h-[285px] min-h-[150px] sm:min-h-[260px] md:min-h-[285px]',
    inner: 'h-[105px] sm:h-[210px] md:h-[235px]'
  }
};

/**
 * ResponsiveAdContainer
 * Enforces AdSense Layout Policies by wrapping ad units into fixed-height,
 * layout-contained wrapper elements that eliminate layout shifts (CLS).
 */
export const ResponsiveAdContainer: React.FC<ResponsiveAdContainerProps> = ({
  placement,
  format = 'banner',
  className = '',
  reserveHeightClass,
  label = 'ADVERTISEMENT'
}) => {
  const heightConfig = FORMAT_HEIGHT_CLASSES[format] || FORMAT_HEIGHT_CLASSES.banner;
  const appliedWrapperHeight = reserveHeightClass || heightConfig.wrapper;

  return (
    <div
      data-ad-fixed-container="true"
      data-ad-placement={placement}
      data-ad-format={format}
      style={{ contain: 'layout paint' }}
      className={`w-full my-6 sm:my-8 overflow-hidden rounded-2xl bg-slate-50/90 border border-slate-200/90 p-3 sm:p-4 shadow-2xs transition-all flex flex-col justify-between ${appliedWrapperHeight} ${className}`}
    >
      {/* Strict AdSense Disclosure Label */}
      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 border-b border-slate-200/70 pb-1.5 mb-2 select-none">
        <span className="font-extrabold tracking-wider text-slate-500 flex items-center gap-1.5">
          <Info className="w-3 h-3 text-slate-400" />
          <span>{label}</span>
        </span>
        <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70"></span>
          <span>Responsive Unit</span>
        </span>
      </div>

      {/* Fixed Reserved Ad Slot Core Area */}
      <div className={`w-full flex items-center justify-center relative overflow-hidden bg-white/80 rounded-xl border border-slate-200/60 ${heightConfig.inner}`}>
        <AdSlot
          placement={placement}
          className="w-full my-0 p-0 border-0 shadow-none bg-transparent"
        />
      </div>
    </div>
  );
};
