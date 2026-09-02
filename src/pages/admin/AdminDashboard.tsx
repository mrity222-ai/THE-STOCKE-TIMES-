import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Article, Category } from '../../types';
import { 
  FileText, 
  Eye, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Flame, 
  Edit3, 
  Trash2, 
  Plus, 
  Upload, 
  FolderPlus, 
  UserPlus, 
  BarChart3, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateSub: (subRoute: string, param?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateSub }) => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | '12months'>('30days');
  
  const articles = StorageService.getArticles();
  const categories = StorageService.getCategories();
  const authors = StorageService.getAuthors();

  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;

  const topPerforming = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);
  const recentArticles = articles.slice(0, 5);

  const categoryPerformance = categories.map(cat => {
    const catArticles = articles.filter(a => a.categoryId === cat.id);
    const totalViews = catArticles.reduce((sum, a) => sum + a.views, 0);
    return {
      category: cat,
      articleCount: catArticles.length,
      totalViews,
      growth: '+14.2%'
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Banner & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            TheStoceTimes.com — Admin Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Overview of TheStoceTimes.com readership, financial publishing performance, and CMS controls.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeRange === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeRange === '7days' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              timeRange === '30days' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Readership Views</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">2,420,180</span>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Published Articles</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">{publishedCount}</span>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mt-1">
              <span>{draftCount} drafts in queue</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Authors</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">{authors.length}</span>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-600 mt-1">
              <span>Credentialed CFA/CFP</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Reading Time</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">4m 32s</span>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>High engagement rate</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Publisher Actions Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Quick Publishing Actions
          </span>
          <span className="text-xs text-slate-400 font-mono">TheStoceTimes.com Publishing Suite</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateSub('articles-new')}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group"
          >
            <Plus className="w-5 h-5 text-emerald-400 group-hover:text-white" />
            <span>New Research Article</span>
          </button>

          <button
            onClick={() => onNavigateSub('categories')}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-blue-600 text-white font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group"
          >
            <FolderPlus className="w-5 h-5 text-blue-400 group-hover:text-white" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={() => onNavigateSub('media')}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-purple-600 text-white font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group"
          >
            <Upload className="w-5 h-5 text-purple-400 group-hover:text-white" />
            <span>Upload Media</span>
          </button>

          <button
            onClick={() => onNavigateSub('analytics')}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-amber-600 text-white font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group"
          >
            <BarChart3 className="w-5 h-5 text-amber-400 group-hover:text-white" />
            <span>Readership Analytics</span>
          </button>
        </div>
      </div>

      {/* Grid: Top Performing Articles & Category Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top 5 Most Read Articles (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500" /> Top Performing Research
            </h3>
            <button 
              onClick={() => onNavigateSub('articles')}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              View All Articles →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {topPerforming.map((art, idx) => (
              <div key={art.id} className="py-3.5 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base font-black text-slate-300 font-mono w-5 shrink-0">0{idx + 1}</span>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate hover:text-emerald-600 cursor-pointer" onClick={() => onNavigateSub('articles-edit', art.id)}>
                      {art.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {art.categoryId} • {art.readTimeMinutes} min read
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-slate-900 block font-mono">{(art.views ?? 0).toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" /> Category Interest
            </h3>
            <button 
              onClick={() => onNavigateSub('categories')}
              className="text-xs font-bold text-emerald-600 hover:underline"
            >
              Manage →
            </button>
          </div>

          <div className="space-y-4">
            {categoryPerformance.map((item) => (
              <div key={item.category.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{item.category.name}</span>
                  <span className="text-slate-500 font-mono">{item.totalViews.toLocaleString()} views</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(15, (item.totalViews / 600000) * 100))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
