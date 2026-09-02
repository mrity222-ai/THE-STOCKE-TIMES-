import React, { useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { ApiService } from '../../services/apiService';

interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  created_at: string;
}

interface CommentsSectionProps {
  articleId: string;
  readingTheme: 'light' | 'dark';
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  articleId,
  readingTheme,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    try {
     const response = await fetch(`http://localhost:5000/api/comments/${articleId}`);

      if (!response.ok) {
        throw new Error('Failed to load comments');
      }

      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !content.trim()) {
      setMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
   const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_id: articleId,
          author_name: name.trim(),
          author_email: email.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post comment');
      }

      setName('');
      setEmail('');
      setContent('');
      setMessage('Comment submitted. It will appear after admin approval.');
    } catch (error) {
      console.error('Failed to post comment:', error);
      setMessage('Unable to submit comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`rounded-2xl border p-6 sm:p-8 font-sans ${
        readingTheme === 'dark'
          ? 'bg-[#111827] border-[#1E293B] text-white'
          : 'bg-white border-[#E2E8F0] text-[#0B1F33]'
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-[#16A34A]" />
        <div>
          <h2 className="text-2xl font-extrabold font-serif">
            Comments
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Share your thoughts about this article.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#16A34A]"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#16A34A]"
          />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#16A34A] resize-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#16A34A] text-white font-bold hover:bg-[#15803D] disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Posting...' : 'Post Comment'}
        </button>

        {message && (
          <p className="text-sm text-slate-500">
            {message}
          </p>
        )}
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">
            No approved comments yet. Be the first to comment.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">
                  {comment.author_name}
                </span>

                <span className="text-xs text-slate-400">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};