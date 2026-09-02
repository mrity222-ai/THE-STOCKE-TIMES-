import React, { useEffect, useMemo } from 'react';
import { StorageService } from '../services/storageService';
import { ArticleCard } from '../components/articles/ArticleCard';
import { SeoService } from '../services/seoService';
import { Award, BookOpen, Eye, Twitter, Linkedin, CheckCircle2, UserCheck, ArrowLeft } from 'lucide-react';

interface AuthorProfilePageProps {
  authorId: string;
  onNavigate: (route: string, param?: string) => void;
}

export const AuthorProfilePage: React.FC<AuthorProfilePageProps> = ({ authorId, onNavigate }) => {
  const author = useMemo(() => {
    return StorageService.getAuthorById(authorId) || StorageService.getAuthors()[0];
  }, [authorId]);

  const authorArticles = useMemo(() => {
    return StorageService.getArticles().filter(
      a => (a.authorId === author.id || a.authorId === authorId) && a.status === 'published'
    );
  }, [author, authorId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const domain = window.location.origin;

    if (author) {
      SeoService.updateMetaTags(
        `${author.name} — Author Profile & Financial Analysis | The Stoce Times`,
        `Read financial research, stock market analysis, and articles published by ${author.name} (${author.role}, ${author.credentials}) on The Stoce Times.`,
        author.avatar,
        `${domain}/author/${author.id}`,
        `${domain}/author/${author.id}`
      );

      SeoService.injectJsonLd([
        {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": author.name,
          "jobTitle": author.role,
          "description": author.bio,
          "image": author.avatar,
          "knowsAbout": ["Financial Planning", "Stock Market", "Investment Analysis", "Personal Finance"],
          "worksFor": {
            "@type": "NewsMediaOrganization",
            "name": "TheStoceTimes.com",
            "url": domain
          },
          "sameAs": [author.twitter, author.linkedin].filter(Boolean)
        },
        SeoService.generateBreadcrumbSchema([
          { name: "About Us", url: "/about" },
          { name: `Author: ${author.name}`, url: `/author/${author.id}` }
        ])
      ]);
    }
  }, [author]);

  if (!author) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Author Not Found</h2>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#155EEF] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return Home
        </button>
      </div>
    );
  }

  const totalViews = authorArticles.reduce((acc, a) => acc + (a.views || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-sans">
      
      {/* Back Navigation Bar */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-900 cursor-pointer">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('about')} className="hover:text-slate-900 cursor-pointer">Authors</button>
        <span>/</span>
        <span className="text-slate-900 font-bold">{author.name}</span>
      </div>

      {/* Author Profile Header Card */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#0B1F33] to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          
          {/* Author Avatar Image */}
          <div className="shrink-0 relative">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border-4 border-[#16A34A] shadow-2xl"
            />
            <div className="absolute -bottom-2 -right-2 bg-[#16A34A] text-white p-2 rounded-2xl shadow-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Author Meta & Bio */}
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Verified Author & Analyst
              </span>
              {author.credentials && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {author.credentials}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
              {author.name}
            </h1>

            <p className="text-emerald-400 font-mono text-sm font-semibold">
              {author.role} • The Stoce Times Editorial Desk
            </p>

            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed max-w-3xl">
              {author.bio}
            </p>

            {/* Author Metrics & Social Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 border-t border-slate-800 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-300">
                <BookOpen className="w-4 h-4 text-[#16A34A]" />
                <span><strong className="text-white font-bold">{authorArticles.length}</strong> Articles Published</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-300">
                <Eye className="w-4 h-4 text-[#16A34A]" />
                <span><strong className="text-white font-bold">{totalViews.toLocaleString()}</strong> Cumulative Views</span>
              </div>

              <div className="flex items-center gap-3 ml-auto md:ml-0">
                {author.twitter && (
                  <a
                    href={author.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    title="Twitter Profile"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {author.linkedin && (
                  <a
                    href={author.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-[#155EEF] hover:bg-slate-700 transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Author Publications Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0B1F33] font-serif">
              Articles & Market Research by {author.name}
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Showing {authorArticles.length} published financial insights, stock analysis, and guides.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Peer Reviewed
          </span>
        </div>

        {authorArticles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No articles published by this author yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
