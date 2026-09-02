import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { Author, UserAccount } from '../../types';
import { Plus, Edit3, Trash2, Users, Eye, Twitter, Linkedin, CheckCircle2, X, Shield, Lock, Mail, UserCheck, UserX } from 'lucide-react';

export const AdminAuthors: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(() => StorageService.getUsers());
  const articles = StorageService.getArticles();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserAccount> | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const refreshUsers = () => {
    setUsers(StorageService.getUsers());
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleOpenNew = () => {
    setEditingUser({
      id: `auth-${Date.now()}`,
      name: '',
      email: '',
      password: 'author@123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      role: 'author',
      status: 'active',
      bio: 'Staff Financial Writer',
      credentials: 'CFA, MBA Finance'
    });
    setIsModalOpen(true);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name || !editingUser.email) {
      alert('Please fill in Full Name and Email Address.');
      return;
    }

    const saved = StorageService.saveUser({
      ...editingUser,
      id: editingUser.id || `auth-${Date.now()}`,
      createdAt: editingUser.createdAt || new Date().toISOString()
    } as UserAccount);

    refreshUsers();
    setIsModalOpen(false);
    setEditingUser(null);
    showToast(`Author account (${saved.email}) created successfully with ID: ${saved.id}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user account for ${name}?`)) {
      StorageService.deleteUser(id);
      refreshUsers();
      showToast('User account deleted.');
    }
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-[#0B1F33] font-serif flex items-center gap-2">
            <Users className="w-6 h-6 text-[#155EEF]" />
            <span>User & Author Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-light">
            Create author logins, generate unique Author IDs, and manage permissions & access status.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="bg-[#16A34A] hover:bg-emerald-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer w-fit transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add User / Author</span>
        </button>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Users / Authors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((usr) => {
          const userArticles = articles.filter(a => a.authorId === usr.id);
          const totalViews = userArticles.reduce((sum, a) => sum + (a.views || 0), 0);

          return (
            <div key={usr.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative group">
              
              <div className="space-y-3 text-center">
                <div className="relative w-20 h-20 mx-auto">
                  <img
                    src={usr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={usr.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow"
                  />
                  <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${usr.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </div>
                
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{usr.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      usr.role === 'admin' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-blue-50 text-[#155EEF] border-blue-200'
                    }`}>
                      {usr.role}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      usr.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}>
                      {usr.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 mt-2 space-y-0.5">
                    <div><strong>ID:</strong> {usr.id}</div>
                    <div><strong>Email:</strong> {usr.email}</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-600 pt-1 border-t border-slate-100">
                  <span><strong>{userArticles.length}</strong> articles</span>
                  <span>•</span>
                  <span><strong>{totalViews.toLocaleString()}</strong> views</span>
                </div>

                {usr.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-light">
                    {usr.bio}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {usr.credentials || 'Author'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditingUser({ ...usr }); setIsModalOpen(true); }}
                    className="px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-[#155EEF] hover:text-white rounded-lg transition-colors text-xs font-bold cursor-pointer"
                  >
                    Edit User
                  </button>

                  {usr.role !== 'admin' && (
                    <button
                      onClick={() => handleDelete(usr.id, usr.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base font-serif flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#155EEF]" />
                <span>{editingUser.id ? 'Edit User / Author Account' : 'Create New Author Account'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-4 text-xs">
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 font-mono">
                <strong>Generated Author ID:</strong> {editingUser.id || `auth-${Date.now()}`}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address (Login) *</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="author@thestocetimes.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="author@123"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Role *</label>
                  <select
                    value={editingUser.role || 'author'}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-slate-50"
                  >
                    <option value="author">Author (Restricted Access)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Status *</label>
                  <select
                    value={editingUser.status || 'active'}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-slate-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Credentials / Designation</label>
                  <input
                    type="text"
                    value={editingUser.credentials || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, credentials: e.target.value })}
                    placeholder="e.g. CFA, MBA Finance"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Profile Image URL</label>
                <input
                  type="text"
                  value={editingUser.avatar || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bio / Profile Info</label>
                <textarea
                  rows={2}
                  value={editingUser.bio || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                  placeholder="Short bio..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border font-bold text-slate-700">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#16A34A] text-white font-extrabold shadow cursor-pointer">
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
