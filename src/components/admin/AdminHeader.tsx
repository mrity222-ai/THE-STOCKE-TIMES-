import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  User, 
  ChevronDown, 
  FileText, 
  FolderPlus, 
  Upload, 
  LogOut, 
  Settings, 
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Database
} from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { ApiService } from '../../services/apiService';

interface AdminHeaderProps {
  pageTitle: string;
  onToggleMobileSidebar: () => void;
  onQuickAction: (action: 'new-article' | 'new-category' | 'upload-media' | 'settings' | 'profile' | 'view-site') => void;
  onLogout: () => void;
  onGlobalSearch: (q: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  pageTitle,
  onToggleMobileSidebar,
  onQuickAction,
  onLogout,
  onGlobalSearch
}) => {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; dbName?: string }>({ connected: false });
  const [currentUser, setCurrentUser] = useState(() => StorageService.getCurrentUser());

  const quickAddRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const toggleQuickAdd = () => {
    setQuickAddOpen(prev => {
      if (!prev) setProfileDropdownOpen(false);
      return !prev;
    });
  };

  const toggleProfile = () => {
    setProfileDropdownOpen(prev => {
      if (!prev) setQuickAddOpen(false);
      return !prev;
    });
  };

  useEffect(() => {
    ApiService.checkBackendStatus().then(setDbStatus);

    const handleUpdate = () => {
      setCurrentUser(StorageService.getCurrentUser());
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setQuickAddOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setQuickAddOpen(false);
        setProfileDropdownOpen(false);
      }
    };

    window.addEventListener('user-profile-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('user-profile-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onGlobalSearch(searchQuery.trim());
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between shadow-sm">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Center & Right Controls */}
      <div className="flex items-center gap-3">
        
        {/* Live MySQL Database Status Badge */}
        <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold ${
          dbStatus.connected 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            : 'bg-amber-50 text-amber-800 border-amber-300'
        }`}>
          <Database className={`w-3.5 h-3.5 ${dbStatus.connected ? 'text-emerald-600' : 'text-amber-600'}`} />
          <span>{dbStatus.connected ? `MySQL: Connected (${dbStatus.dbName})` : 'Database: Local Cache Active'}</span>
        </div>

        {/* View Public Site Link */}
        <button
          onClick={() => onQuickAction('view-site')}
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
        >
          <span>View Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* Quick + Add Action Dropdown */}
        <div className="relative" ref={quickAddRef}>
          <button
            onClick={toggleQuickAdd}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${quickAddOpen ? 'rotate-180' : ''}`} />
          </button>

          {quickAddOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
              <button
                onClick={() => { setQuickAddOpen(false); onQuickAction('new-article'); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-600" /> New Article
              </button>
              <button
                onClick={() => { setQuickAddOpen(false); onQuickAction('new-category'); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-blue-600" /> New Category
              </button>
              <button
                onClick={() => { setQuickAddOpen(false); onQuickAction('upload-media'); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-purple-600" /> Upload Media
              </button>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={toggleProfile}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-sm"
            />
            <span className="hidden md:inline font-bold text-xs text-slate-800">{currentUser.name}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150 space-y-1">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900 block">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 font-mono block">{currentUser.email}</span>
                <span className="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 border border-emerald-200 uppercase">
                  {currentUser.role}
                </span>
              </div>

              <button
                onClick={() => { setProfileDropdownOpen(false); onQuickAction('profile'); }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" /> Profile & Credentials
              </button>
              
              <button
                onClick={() => { setProfileDropdownOpen(false); onQuickAction('settings'); }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" /> System Settings
              </button>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
