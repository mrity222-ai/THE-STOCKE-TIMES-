import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storageService';
import { CommentItem } from '../../types';
import { MessageSquare, Check, X, Trash2, ShieldAlert, CheckCircle2 } from 'lucide-react';
const COMMENTS_API = 'http://localhost:5000/api/admin/comments';

export const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'spam'>('all');
  const [toastMsg, setToastMsg] = useState('');

  const refreshComments = async () => {
    try {
      const response = await fetch(COMMENTS_API);

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();

      const formattedComments = data.map((comment: any) => ({
        id: comment.id,
        articleId: comment.article_id,
        authorName: comment.author_name,
        authorEmail: comment.author_email,
        content: comment.content,
        status: comment.status,
        createdAt: comment.created_at,
        articleTitle: comment.article_id
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Failed to load admin comments:', error);
      showToast('Unable to load comments.');
    }
  };

  useEffect(() => {
    refreshComments();
  }, []);


  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleUpdateStatus = async (
    id: string,
    status: 'approved' | 'pending' | 'spam'
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/comments/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update comment status');
      }

      await refreshComments();
      showToast(`Comment marked as ${status}.`);
    } catch (error) {
      console.error('Failed to update comment status:', error);
      showToast('Unable to update comment status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this comment permanently?')) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/comments/${id}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete comment');
        }

        await refreshComments();
        showToast('Comment deleted.');
      } catch (error) {
        console.error('Failed to delete comment:', error);
        showToast('Unable to delete comment.');
      }
    }
  };

  const filtered = comments.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Reader Comments Moderation</h2>
          <p className="text-xs text-slate-500 mt-0.5">Approve, flag, or delete reader comments across your published articles.</p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200">
          {(['all', 'approved', 'pending', 'spam'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl transition-all capitalize ${filter === s ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Comments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="p-4">Reader Name & Email</th>
                <th className="p-4">Article</th>
                <th className="p-4">Comment Content</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((com) => (
                <tr key={com.id} className="hover:bg-slate-50 transition-colors">

                  <td className="p-4 font-bold text-slate-900">
                    <div>
                      <span>{com.authorName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{com.authorEmail}</span>
                    </div>
                  </td>

                  <td className="p-4 font-semibold text-emerald-600 max-w-xs truncate">
                    {com.articleTitle}
                  </td>

                  <td className="p-4 max-w-sm text-slate-700 leading-relaxed italic">
                    "{com.content}"
                  </td>

                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {new Date(com.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase border ${com.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      com.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                      {com.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {com.status !== 'approved' && (
                        <button onClick={() => handleUpdateStatus(com.id, 'approved')} className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors font-bold" title="Approve Comment">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {com.status !== 'spam' && (
                        <button onClick={() => handleUpdateStatus(com.id, 'spam')} className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg transition-colors font-bold" title="Flag as Spam">
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(com.id)} className="p-1.5 text-slate-400 hover:text-rose-600" title="Delete Comment">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
