import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Article } from '../../types';
import { AdSlot } from '../../components/ads/AdSlot';
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  Sparkles,
  CheckSquare,
  Square,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  FileCheck,
  Calendar,
  X
} from 'lucide-react';

interface AdminArticlesProps {
  onNavigateSub: (subRoute: string, param?: string) => void;
  onEditArticle: (article: Article) => void;
}

export const AdminArticles: React.FC<AdminArticlesProps> = ({ onNavigateSub, onEditArticle }) => {
  const [articles, setArticles] = useState<Article[]>(StorageService.getArticles());
  const categories = StorageService.getCategories();
  const authors = StorageService.getAuthors();
  const currentUser = StorageService.getCurrentUser();
  const isAuthorRole = currentUser.role === 'author';

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState('');

  // Scheduled Date Modal Edit State
  const [editingScheduleArticle, setEditingScheduleArticle] = useState<Article | null>(null);
  const [scheduleDateInput, setScheduleDateInput] = useState('');

  const refreshArticles = () => {
    setArticles(StorageService.getArticles());
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredArticles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredArticles.map(a => a.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected articles?`)) {
      StorageService.bulkDeleteArticles(selectedIds);
      setSelectedIds([]);
      refreshArticles();
      showToast(`${selectedIds.length} articles deleted.`);
    }
  };

  const handleBulkPublish = () => {
    if (selectedIds.length === 0) return;
    StorageService.bulkUpdateStatus(selectedIds, 'published');
    setSelectedIds([]);
    refreshArticles();
    showToast(`${selectedIds.length} articles published.`);
  };

  const handleBulkDraft = () => {
    if (selectedIds.length === 0) return;
    StorageService.bulkUpdateStatus(selectedIds, 'draft');
    setSelectedIds([]);
    refreshArticles();
    showToast(`${selectedIds.length} articles moved to draft.`);
  };

  const handleDeleteSingle = (id: string) => {
    if (window.confirm('Delete this article?')) {
      StorageService.deleteArticle(id);
      refreshArticles();
      showToast('Article deleted.');
    }
  };

  const handleTogglePublishSingle = (id: string) => {
    StorageService.togglePublishStatus(id);
    refreshArticles();
    showToast('Publish status updated.');
  };

  // Open Scheduled Date Editor Modal
  const handleOpenScheduleModal = (article: Article) => {
    setEditingScheduleArticle(article);
    const existingDate = article.scheduledDate || article.publishedAt || new Date().toISOString();
    setScheduleDateInput(existingDate.substring(0, 16));
  };

  // Save Updated Scheduled Date & Time
  const handleSaveScheduleDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheduleArticle || !scheduleDateInput) return;

    const updated: Article = {
      ...editingScheduleArticle,
      status: 'scheduled',
      scheduledDate: scheduleDateInput,
      publishedAt: scheduleDateInput,
      updatedAt: new Date().toISOString()
    };

    StorageService.saveArticle(updated);
    refreshArticles();
    setEditingScheduleArticle(null);
    showToast(`Scheduled date for "${updated.title}" updated successfully!`);
  };

  const filteredArticles = articles.filter(art => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || art.title.toLowerCase().includes(q) || art.excerpt.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || art.categoryId === selectedCategory;
    const matchesAuthor = selectedAuthor === 'all' || art.authorId === selectedAuthor;
    const matchesStatus = selectedStatus === 'all' || art.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesAuthor && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'draft':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">

      {/* Top Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-serif">Articles Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage, edit, publish, schedule or update release dates for all finance articles.</p>
        </div>

        <button
          onClick={() => onNavigateSub('articles-new')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold">

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold"
          >
            <option value="all">All Authors</option>
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled ({articles.filter(a => a.status === 'scheduled').length})</option>
            <option value="pending">Pending Review</option>
          </select>
        </div>

      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
          <span className="font-bold">{selectedIds.length} items selected</span>
          <div className="flex items-center gap-2">
            <button onClick={handleBulkPublish} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg">
              Publish Selected
            </button>
            <button onClick={handleBulkDraft} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg">
              Move to Draft
            </button>
            <button onClick={handleBulkDelete} className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg">
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-4 w-10 text-center">
                  <button onClick={handleSelectAll}>
                    {selectedIds.length === filteredArticles.length && filteredArticles.length > 0
                      ? <CheckSquare className="w-4 h-4 text-emerald-400" />
                      : <Square className="w-4 h-4 text-slate-500" />
                    }
                  </button>
                </th>
                <th className="p-4">Article</th>
                <th className="p-4">Category</th>
                <th className="p-4">Author</th>
                <th className="p-4">Views</th>
                <th className="p-4">Date / Scheduled</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredArticles.map((art) => {
                const author = StorageService.getAuthorById(art.authorId);
                const isSelected = selectedIds.includes(art.id);
                return (
                  <tr key={art.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-slate-50/90' : ''}`}>

                    <td className="p-4 text-center font-sans">
                      <button onClick={() => handleToggleSelect(art.id)}>
                        {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                      </button>
                    </td>

                    <td className="p-4 max-w-xs sm:max-w-md font-sans">
                      <div className="flex items-center gap-3">
                        <img
                          src={art.featuredImage}
                          alt={art.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div>
                          <span
                            onClick={() => onEditArticle(art)}
                            className="font-bold text-slate-900 hover:text-emerald-600 cursor-pointer block line-clamp-1 text-sm font-serif"
                          >
                            {art.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            /{art.slug} • {art.readTimeMinutes}m read
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-800 font-sans">
                      <span className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md text-[11px]">
                        {art.categoryId}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-slate-700 font-sans">
                      {author?.name.split(',')[0] || 'Admin'}
                    </td>

                    <td className="p-4 font-bold font-mono text-emerald-600">
                      {(art.views ?? 0).toLocaleString()}
                    </td>

                    <td className="p-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={art.status === 'scheduled' ? 'text-blue-600 font-bold' : 'text-slate-500'}>
                          {art.status === 'scheduled'
                            ? (art.scheduledDate ? art.scheduledDate.replace('T', ' ') : new Date(art.publishedAt).toLocaleDateString())
                            : new Date(art.publishedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleOpenScheduleModal(art)}
                          className="p-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors"
                          title="Edit Scheduled Date & Time"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="p-4 font-sans">
                      <button
                        onClick={() => handleTogglePublishSingle(art.id)}
                        className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase border cursor-pointer ${getStatusBadgeClass(art.status)}`}
                      >
                        {art.status}
                      </button>
                    </td>

                    <td className="p-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenScheduleModal(art)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                          title="Update Schedule Date & Time"
                        >
                          <Clock className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditArticle(art)}
                          className="p-2 text-slate-700 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                          title="Edit Full Article"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {!isAuthorRole && (
                          <button
                            onClick={() => handleDeleteSingle(art.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Article (Admin Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULED DATE & TIME EDIT MODAL */}
      {editingScheduleArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl border border-slate-200 text-xs">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base font-serif flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" /> Update Scheduled Publish Date
              </h3>
              <button onClick={() => setEditingScheduleArticle(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheduleDate} className="space-y-4">
              <div>
                <span className="font-bold text-slate-900 block text-sm line-clamp-1 mb-1 font-serif">
                  {editingScheduleArticle.title}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  Current Status: <span className="uppercase font-bold text-blue-600">{editingScheduleArticle.status}</span>
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Select Scheduled Release Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDateInput}
                  onChange={(e) => setScheduleDateInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 shadow-xs"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed text-[11px]">
                ℹ️ Updating this date will save the article as <strong>SCHEDULED</strong> and release it automatically on the specified timestamp.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingScheduleArticle(null)}
                  className="px-4 py-2 rounded-xl border font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-xs cursor-pointer"
                >
                  Save Scheduled Date
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
