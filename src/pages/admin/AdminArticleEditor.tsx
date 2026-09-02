import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Article, Category, Author } from '../../types';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { MediaLibraryModal } from '../../components/admin/MediaLibraryModal';
import { SeoPreviewBox } from '../../components/admin/SeoPreviewBox';
import {
  FileText,
  Save,
  Send,
  Clock,
  Image as ImageIcon,
  Tag,
  FolderTree,
  User,
  Search,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Flame,
  Globe,
  Upload
} from 'lucide-react';

interface AdminArticleEditorProps {
  initialArticle?: Article | null;
  onBack: () => void;
  onSaved: () => void;
}

export const AdminArticleEditor: React.FC<AdminArticleEditorProps> = ({ initialArticle, onBack, onSaved }) => {
  const categories = StorageService.getCategories();
  const authors = StorageService.getAuthors();

  const [formData, setFormData] = useState<Partial<Article>>({
    id: initialArticle?.id,
    title: initialArticle?.title || '',
    slug: initialArticle?.slug || '',
    categoryId: initialArticle?.categoryId || 'stock-market',
    subCategory: initialArticle?.subCategory || 'Stock Analysis',
    authorId: initialArticle?.authorId || authors[0]?.id || 'author-1',
    featuredImage: initialArticle?.featuredImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    excerpt: initialArticle?.excerpt || '',
    content: initialArticle?.content || '<h2>Introduction</h2>\n<p>Write detailed financial research and analysis here...</p>\n<h2>Key Highlights</h2>\n<ul>\n<li>Point 1</li>\n<li>Point 2</li>\n</ul>',
    highlights: initialArticle?.highlights || ['Key financial insight 1', 'Key financial insight 2'],
    readTimeMinutes: initialArticle?.readTimeMinutes || 5,
    status: initialArticle?.status || 'published',
    publishedAt: initialArticle?.publishedAt || new Date().toISOString(),
    showPublishedDate: initialArticle?.showPublishedDate ?? true,
    scheduledDate: initialArticle?.scheduledDate || '',
    isFeatured: initialArticle?.isFeatured || false,
    isTrending: initialArticle?.isTrending || false,
    tags: initialArticle?.tags || ['Finance', 'Stock Market'],
    seoTitle: initialArticle?.seoTitle || initialArticle?.title || '',
    seoDescription: initialArticle?.seoDescription || initialArticle?.excerpt || '',
    focusKeywords: initialArticle?.focusKeywords || ['stocks', 'finance'],
    canonicalUrl: initialArticle?.canonicalUrl || '',
    ogTitle: initialArticle?.ogTitle || '',
    ogDescription: initialArticle?.ogDescription || ''
  });

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'featured' | 'editor'>('featured');
  const [newTagInput, setNewTagInput] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };


  // FAQ state + functions
  const [faqs, setFaqs] = useState<
    { id: string; question: string; answer: string }[]
  >([]);

  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  const loadFaqs = async () => {
    if (!formData.id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/articles/${formData.id}/faqs`
      );

      if (!response.ok) {
        throw new Error('Failed to load FAQs');
      }

      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, [formData.id]);

  const handleAddFaq = async () => {
    if (!formData.id) {
      showToast('Please save the article first.');
      return;
    }

    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      showToast('Please enter both question and answer.');
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/admin/faqs',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            article_id: formData.id,
            question: faqQuestion.trim(),
            answer: faqAnswer.trim(),
            sort_order: faqs.length,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add FAQ');
      }

      setFaqQuestion('');
      setFaqAnswer('');
      await loadFaqs();

      showToast('FAQ added successfully.');
    } catch (error) {
      console.error('Failed to add FAQ:', error);
      showToast('Unable to add FAQ.');
    }
  };

  const handleUpdateFaq = async () => {
    if (!editingFaqId) return;

    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      showToast('Please enter both question and answer.');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/faqs/${editingFaqId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: faqQuestion.trim(),
            answer: faqAnswer.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update FAQ');
      }

      setFaqQuestion('');
      setFaqAnswer('');
      setEditingFaqId(null);

      await loadFaqs();
      showToast('FAQ updated successfully.');
    } catch (error) {
      console.error('Failed to update FAQ:', error);
      showToast('Unable to update FAQ.');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('Delete this FAQ permanently?')) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/faqs/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete FAQ');
      }

      await loadFaqs();
      showToast('FAQ deleted successfully.');
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      showToast('Unable to delete FAQ.');
    }
  };

  const handleEditFaq = (faq: {
    id: string;
    question: string;
    answer: string;
  }) => {
    setEditingFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
  };














  const handleTitleChange = (newTitle: string) => {
    const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      slug: prev.slug ? prev.slug : autoSlug,
      seoTitle: prev.seoTitle ? prev.seoTitle : newTitle
    }));
  };

  const currentUser = StorageService.getCurrentUser();
  const isAuthorRole = currentUser.role === 'author';

  const handleSave = (status: 'published' | 'draft' | 'scheduled') => {
    if (!formData.title || !formData.content) {
      alert('Please fill in Article Title and Content.');
      return;
    }

    if (isAuthorRole && status === 'published') {
      alert('Author role permission restriction: Only Admins can publish articles. Saving as Draft.');
      status = 'draft';
    }

    const currentTimestamp = new Date().toISOString();
    const finalPublishDate = status === 'published'
      ? (formData.status !== 'published' ? currentTimestamp : (formData.publishedAt || currentTimestamp))
      : (formData.publishedAt || currentTimestamp);

    const authorToUse = isAuthorRole ? currentUser.id : (formData.authorId || currentUser.id);

    const saved = StorageService.saveArticle({
      ...formData,
      authorId: authorToUse,
      status,
      publishedAt: finalPublishDate,
      showPublishedDate: formData.showPublishedDate ?? true
    } as any);

    // If published by Admin, send email broadcast notification to all subscribers
    if (status === 'published' && !isAuthorRole) {
      const activeSubscribers = StorageService.getSubscribers()
        .filter(s => s.status === 'Active' && s.verificationStatus === 'Verified')
        .map(s => s.email);

      fetch('http://localhost:5000/api/subscribers/notify-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: saved.title,
          excerpt: saved.excerpt,
          featuredImage: saved.featuredImage,
          slug: saved.slug,
          subscribers: activeSubscribers
        })
      }).catch(err => console.log('Subscriber notify error:', err));
    }

    setToastMsg(`Article ${status === 'published' ? 'published & broadcasted' : 'saved as ' + status} successfully!`);
    setTimeout(() => {
      onSaved();
    }, 1200);
  };

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      const tagStr = newTagInput.trim();
      const currentTags = formData.tags || [];
      if (!currentTags.includes(tagStr)) {
        setFormData({ ...formData, tags: [...currentTags, tagStr] });
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter(t => t !== tagToRemove)
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
            title="Back to Articles List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {formData.id ? 'Edit Financial Article' : 'Author New Finance Article'}
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Status: {formData.status?.toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave('draft')}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-extrabold text-xs hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>

          {!isAuthorRole ? (
            <button
              onClick={() => handleSave('published')}
              className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-emerald-600 text-white font-extrabold text-xs shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Publish & Notify Subscribers
            </button>
          ) : (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              Publishing Reserved for Admin
            </span>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main 2-Column Grid (Main Editor 8 Cols, Settings Sidebar 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Title & Writing Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Article Title Input */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <label className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Article Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter article title..."
              className="w-full text-xl sm:text-2xl font-black text-slate-900 placeholder-slate-300 focus:outline-none bg-transparent"
            />
          </div>

          {/* Excerpt Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <label className="text-xs font-bold text-slate-700">Short Description / Excerpt *</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value, seoDescription: formData.seoDescription || e.target.value })}
              placeholder="Summarize key takeaways in 2 sentences for search engines & readers..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Main Rich Text Editor Canvas */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase text-slate-400 tracking-wider block">Article Content Canvas *</label>
            <RichTextEditor
              value={formData.content || ''}
              onChange={(content) => setFormData({ ...formData, content })}
              onOpenMediaPicker={() => {
                setMediaTarget('editor');
                setIsMediaModalOpen(true);
              }}
            />
          </div>

          {/* Live SEO Google Search Snippet Preview Box */}
          <SeoPreviewBox
            title={formData.seoTitle || formData.title || ''}
            slug={formData.slug || ''}
            description={formData.seoDescription || formData.excerpt || ''}
            image={formData.featuredImage}
          />

        </div>

        {/* Right Sidebar: Publish, Category, Tags, Media, SEO (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Publish & Status Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" /> Publish Settings
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-slate-50"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="pending">Pending Review</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Author</label>
                <select
                  value={formData.authorId}
                  onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-slate-50"
                >
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Read Time (min)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.readTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, readTimeMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              {/* Article Date: Admin can manually select the date displayed on the article */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Article Date
                </label>

                <input
                  type="date"
                  value={
                    formData.publishedAt
                      ? formData.publishedAt.split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publishedAt: e.target.value || ''
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-slate-50"
                />
              </div>

              {/* Dedicated Scheduled Publish Date & Time Picker */}
              {formData.status === 'scheduled' && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1.5 animate-in fade-in">
                  <label className="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" /> Scheduled Publish Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={
                      formData.scheduledDate
                        ? formData.scheduledDate.substring(0, 16)
                        : (formData.publishedAt ? formData.publishedAt.substring(0, 16) : new Date().toISOString().substring(0, 16))
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: e.target.value,
                        publishedAt: e.target.value
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-blue-300 font-mono text-xs font-bold bg-white text-blue-950 shadow-xs"
                  />
                  <p className="text-[10px] text-blue-700 font-medium">
                    This article is scheduled to publish on the specified date & time.
                  </p>
                </div>
              )}

              {/* Show/Hide Article Date: Controls whether the article date is visible on the website */}
              <div className="pt-2 flex items-center justify-between">
                <label className="font-bold text-slate-700">
                  Show Article Date
                </label>

                <input
                  type="checkbox"
                  checked={formData.showPublishedDate ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      showPublishedDate: e.target.checked
                    })
                  }
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Pin Lead Featured
                </label>
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> Pin Trending
                </label>
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => handleSave('draft')}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow"
              >
                Publish Article
              </button>
            </div>
          </div>

          {/* Category Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-purple-600" /> Category & Subcategory
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-slate-50"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subcategory Topic</label>
                <input
                  type="text"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  placeholder="e.g. IPO, Nifty, SIP, FD Rates..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" /> Featured Image
              </h3>
              <button
                type="button"
                onClick={() => {
                  setMediaTarget('featured');
                  setIsMediaModalOpen(true);
                }}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                Media Library
              </button>
            </div>

            <div className="space-y-3">
              {formData.featuredImage && (
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={formData.featuredImage} alt="Featured Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Direct Gallery / File Picker Upload Button */}
              <div className="flex items-center gap-2">
                <label className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Upload from Gallery / Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          if (dataUrl) {
                            setFormData({ ...formData, featuredImage: dataUrl });
                            StorageService.addMediaItem({
                              name: file.name,
                              url: dataUrl,
                              altText: file.name
                            });
                            showToast('Image uploaded from device gallery!');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <input
                type="text"
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                placeholder="Or paste image URL (https://...)"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          </div>

          {/* Tags Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" /> Article Tags
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add tag..."
                  className="flex-1 p-2 rounded-xl border border-slate-300"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-slate-900 text-white font-bold rounded-xl"
                >
                  + Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(formData.tags || []).map((t) => (
                  <span key={t} className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                    #{t}
                    <button type="button" onClick={() => handleRemoveTag(t)} className="text-slate-400 hover:text-rose-600">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Frequently Asked Questions
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Add questions and answers specific to this article.
                </p>
              </div>
            </div>

            {/* Add / Edit FAQ */}
            <div className="space-y-3">
              <input
                type="text"
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                placeholder="Enter FAQ question..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />

              <textarea
                rows={3}
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                placeholder="Enter FAQ answer..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs resize-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={editingFaqId ? handleUpdateFaq : handleAddFaq}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
                >
                  {editingFaqId ? 'Update FAQ' : 'Add FAQ'}
                </button>

                {editingFaqId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaqId(null);
                      setFaqQuestion('');
                      setFaqAnswer('');
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* FAQ List */}
            <div className="space-y-3">
              {faqs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No FAQs added for this article yet.
                </p>
              ) : (
                faqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className="border border-slate-200 rounded-2xl p-4 bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs font-extrabold text-slate-900">
                          Q{index + 1}. {faq.question}
                        </p>

                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditFaq(faq)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-emerald-600 text-[11px] font-bold"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 text-[11px] font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Advanced SEO Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" /> SEO Controls
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">SEO Title</label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Focus Keyword</label>
                <input
                  type="text"
                  value={formData.focusKeywords ? formData.focusKeywords.join(', ') : ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    focusKeywords: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="nifty 50, sip calculator..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SEO Meta Description</label>
                <textarea
                  rows={2}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                ></textarea>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Media Library Selector Modal */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectImage={(url) => {
          if (mediaTarget === 'featured') {
            setFormData(prev => ({ ...prev, featuredImage: url }));
          } else {
            const imgHtml = `\n<figure>\n  <img src="${url}" alt="Article graphic" />\n</figure>\n`;
            setFormData(prev => ({ ...prev, content: (prev.content || '') + imgHtml }));
          }
        }}
      />

    </div>
  );
};
