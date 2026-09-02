import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Category } from '../../types';
import { Plus, Edit3, Trash2, FolderTree, Eye, TrendingUp, CheckCircle2, X } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(StorageService.getCategories());
  const articles = StorageService.getArticles();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const refreshCategories = () => {
    setCategories(StorageService.getCategories());
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleOpenNew = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      icon: 'TrendingUp',
      subcategories: ['Guides', 'Analysis']
    });
    setIsModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;

    StorageService.saveCategory(editingCategory as any);
    refreshCategories();
    setIsModalOpen(false);
    setEditingCategory(null);
    showToast('Category saved successfully!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      StorageService.deleteCategory(id);
      refreshCategories();
      showToast('Category deleted.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Categories Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Organize your TheStoceTimes.com platform into clear content verticals.</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const catArticles = articles.filter(a => a.categoryId === cat.id);
          const totalViews = catArticles.reduce((sum, a) => sum + a.views, 0);

          return (
            <div key={cat.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-base">{cat.name}</span>
                  <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {catArticles.length} Articles
                  </span>
                </div>

                <span className="text-[10px] font-mono text-slate-400 block">ID: {cat.id} • Slug: /{cat.slug}</span>
                
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{cat.description}</p>

                <div className="pt-2 flex flex-wrap gap-1">
                  {cat.subcategories.map(sub => (
                    <span key={sub} className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" /> {totalViews.toLocaleString()} views
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditingCategory({ ...cat }); setIsModalOpen(true); }}
                    className="p-2 text-slate-700 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingCategory.id ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. Real Estate & Mortgages"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Summarize what topics this category covers..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subcategories (Comma Separated)</label>
                <input
                  type="text"
                  value={editingCategory.subcategories ? editingCategory.subcategories.join(', ') : ''}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    subcategories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Guides, Analysis, Market Rates..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border font-bold text-slate-700">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold shadow">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
