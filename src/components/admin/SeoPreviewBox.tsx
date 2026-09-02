import React, { useState } from 'react';
import { Search, Globe, Share2 } from 'lucide-react';

interface SeoPreviewBoxProps {
  title: string;
  slug: string;
  description: string;
  image?: string;
}

export const SeoPreviewBox: React.FC<SeoPreviewBoxProps> = ({ title, slug, description, image }) => {
  const [tab, setTab] = useState<'google' | 'social'>('google');

  const domain = 'thestocetimes.com';
  const displayTitle = title || 'Enter article title...';
  const displaySlug = slug || 'example-article-slug';
  const displayDesc = description || 'Enter article SEO meta description snippet...';
  const displayImage = image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
      
      {/* Header Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-emerald-600" /> Live Search & Social Snippet Preview
        </span>

        <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setTab('google')}
            className={`px-2 py-0.5 rounded transition-colors ${
              tab === 'google' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Google Search
          </button>
          <button
            type="button"
            onClick={() => setTab('social')}
            className={`px-2 py-0.5 rounded transition-colors ${
              tab === 'social' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Social OpenGraph
          </button>
        </div>
      </div>

      {tab === 'google' ? (
        /* Google Search Result Preview Card */
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1 font-sans">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium truncate">
            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>https://{domain}/article/{displaySlug}</span>
          </div>

          <h3 className="text-base font-bold text-blue-700 hover:underline cursor-pointer line-clamp-1">
            {displayTitle} | TheStoceTimes.com
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {displayDesc}
          </p>
        </div>
      ) : (
        /* Social Media OpenGraph Card Preview */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="aspect-[1.91/1] bg-slate-100 relative">
            <img src={displayImage} alt="OG Preview" className="w-full h-full object-cover" />
          </div>
          <div className="p-3 space-y-1 bg-slate-100/60">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">{domain}</span>
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{displayTitle}</h4>
            <p className="text-[11px] text-slate-600 line-clamp-2">{displayDesc}</p>
          </div>
        </div>
      )}

    </div>
  );
};
