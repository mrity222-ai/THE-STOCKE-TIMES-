import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { LegalPageItem, LegalPageRevision } from '../../types';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { ShieldCheck, FileText, Edit3, Eye, History, CheckCircle2, Save, Globe, Lock, Clock, ArrowLeft, RotateCcw } from 'lucide-react';

export const AdminLegal: React.FC = () => {
  const currentUser = StorageService.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  const [pages, setPages] = useState<LegalPageItem[]>(() => StorageService.getLegalPages());
  const [selectedPage, setSelectedPage] = useState<LegalPageItem | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

  const refreshPages = () => {
    setPages(StorageService.getLegalPages());
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSelectPage = (page: LegalPageItem) => {
    setSelectedPage({ ...page });
    setPreviewMode(false);
    setActiveTab('editor');
  };

  const handleSavePage = (status?: 'published' | 'draft') => {
    if (!selectedPage) return;
    const finalStatus = status || selectedPage.status;
    const updated = StorageService.saveLegalPage({ ...selectedPage, status: finalStatus }, currentUser.name || 'Admin');
    setSelectedPage(updated);
    refreshPages();
    showToast(`"${updated.title}" updated and saved as ${finalStatus.toUpperCase()}!`);
  };

  const handleRestoreRevision = (revId: string) => {
    if (!selectedPage) return;
    if (window.confirm('Are you sure you want to restore this previous version?')) {
      const restored = StorageService.restoreLegalPageRevision(selectedPage.id, revId);
      if (restored) {
        setSelectedPage({ ...restored });
        refreshPages();
        showToast('Restored previous revision successfully.');
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-900 p-8 rounded-3xl text-center space-y-3 font-sans">
        <Lock className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-xl font-extrabold font-serif">Access Restricted to Admin Only</h2>
        <p className="text-xs text-rose-700 max-w-md mx-auto">
          Legal & Policy pages management is strictly reserved for Admin accounts. Authors do not have editing permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1F33] font-serif flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#16A34A]" />
            <span>Legal & Policy Pages Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Privacy Policy, Terms & Conditions, Disclaimer, Editorial Rules, About Us, and Contact pages.
          </p>
        </div>

        {selectedPage && (
          <button
            onClick={() => setSelectedPage(null)}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Legal Pages List</span>
          </button>
        )}
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {!selectedPage ? (
        /* 10 LEGAL PAGES LIST TABLE */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#0B1F33]">All Editable Legal & Policy Documents</h3>
            <span className="text-xs font-mono font-bold text-slate-400">10 Official Pages</span>
          </div>

          <div className="divide-y divide-slate-100">
            {pages.map((p) => (
              <div key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-[#155EEF] flex items-center justify-center shrink-0 border border-slate-200 font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#0B1F33]">{p.title}</h4>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        p.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">/{p.slug}</p>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      Last Updated: {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectPage(p)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Page & Content</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* PAGE EDITOR & REVISION HISTORY VIEW */
        <div className="space-y-6">

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'editor' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                >
                  Edit Document
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${activeTab === 'history' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Revision History ({selectedPage.revisions?.length || 0})</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-extrabold text-xs hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{previewMode ? 'Exit Preview' : 'Live Preview'}</span>
              </button>

              <button
                onClick={() => handleSavePage('draft')}
                className="px-4 py-2 rounded-xl border border-amber-300 text-amber-800 bg-amber-50 font-extrabold text-xs hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                onClick={() => handleSavePage('published')}
                className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-emerald-600 text-white font-extrabold text-xs shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publish Page</span>
              </button>
            </div>
          </div>

          {activeTab === 'history' ? (
            /* REVISION HISTORY VIEW */
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#0B1F33] flex items-center gap-2">
                <History className="w-4 h-4 text-[#155EEF]" />
                <span>Revision History Log for "{selectedPage.title}"</span>
              </h3>

              {(!selectedPage.revisions || selectedPage.revisions.length === 0) ? (
                <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-2xl">No previous revisions recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {selectedPage.revisions.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{rev.title}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Saved on {new Date(rev.updatedAt).toLocaleString()} by {rev.updatedBy}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRestoreRevision(rev.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer w-fit"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Version</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : previewMode ? (
            /* LIVE PREVIEW BOX */
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b pb-4">
                <span className="text-xs font-mono text-emerald-600 font-bold uppercase">/{selectedPage.slug}</span>
                <h1 className="text-3xl font-extrabold text-[#0B1F33] font-serif mt-1">{selectedPage.title}</h1>
              </div>

              <div
                className="prose max-w-none text-slate-800 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedPage.content }}
              />
            </div>
          ) : (
            /* EDITOR FORM */
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-800">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={selectedPage.title}
                    onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-extrabold text-sm text-[#0B1F33]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Page URL / Slug *</label>
                  <input
                    type="text"
                    required
                    value={selectedPage.slug}
                    onChange={(e) => setSelectedPage({ ...selectedPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Complete Page Content (Rich HTML Editor)</label>
                <RichTextEditor
                  value={selectedPage.content}
                  onChange={(html) => setSelectedPage({ ...selectedPage, content: html })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={selectedPage.seoTitle || ''}
                    onChange={(e) => setSelectedPage({ ...selectedPage, seoTitle: e.target.value })}
                    placeholder="Page SEO Title..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">SEO Meta Description</label>
                  <input
                    type="text"
                    value={selectedPage.seoDescription || ''}
                    onChange={(e) => setSelectedPage({ ...selectedPage, seoDescription: e.target.value })}
                    placeholder="Brief SEO meta description..."
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
