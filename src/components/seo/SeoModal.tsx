import React, { useState } from 'react';
import { SeoService } from '../../services/seoService';
import { StorageService } from '../../services/storageService';
import { X, Code2, FileCode, Bot, Copy, Check } from 'lucide-react';
import { Article } from '../../types';

interface SeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArticle?: Article;
}

export const SeoModal: React.FC<SeoModalProps> = ({ isOpen, onClose, currentArticle }) => {
  const [activeTab, setActiveTab] = useState<'schema' | 'sitemap' | 'robots'>('schema');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const articles = StorageService.getArticles();

  const schemaObj = currentArticle
    ? SeoService.generateArticleSchema(currentArticle)
    : SeoService.generateBreadcrumbSchema([{ name: 'Stock Market', url: '/stock-market' }]);

  const schemaJson = JSON.stringify(schemaObj, null, 2);
  const sitemapXml = SeoService.generateSitemapXml(articles);
  const robotsTxt = SeoService.generateRobotsTxt();

  const getActiveContent = () => {
    switch (activeTab) {
      case 'schema': return schemaJson;
      case 'sitemap': return sitemapXml;
      case 'robots': return robotsTxt;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0B1F33]">Publication SEO Engine Inspector</h3>
              <p className="text-[11px] text-slate-500 font-medium">Inspect generated JSON-LD Schemas, Sitemap XML & Robots.txt</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold font-sans">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schema' ? 'bg-white text-[#0B1F33] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> JSON-LD Schema
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sitemap' ? 'bg-white text-[#0B1F33] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" /> Sitemap.xml
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'robots' ? 'bg-white text-[#0B1F33] shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> Robots.txt
          </button>
        </div>

        {/* Code Content Box */}
        <div className="relative bg-slate-900 rounded-2xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 shadow-inner border border-slate-800">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <pre className="pt-2">{getActiveContent()}</pre>
        </div>

      </div>
    </div>
  );
};
