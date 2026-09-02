import React, { useState, useEffect } from 'react';
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

  const adminUser = StorageService.getAdminUser() || { 
    name: 'Admin User', 
    email: 'admin@thestocetimes.com', 
    role: 'Editor-in-Chief', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' 
  };

  useEffect(() => {
    ApiService.checkBackendStatus().then(setDbStatus);
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
        <div className="relative">
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {quickAddOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
              <button
                onClick={() => { setQuickAddOpen(false); onQuickAction('new-article'); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-600" /> New Article
              </button>
              <button
                onClick={() => { setQuickAddOpen(false); onQuickAction('new-category'); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4 text-blue-600" /> New Category
              </button>
              <button
                onClick={() => { setQuickAddOpen(false); onQuickAction('upload-media'); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 flex items-center gap-2"
              >
                <Upload className="w-4 h-4 text-purple-600" /> Upload Media
              </button>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={adminUser.avatar}
              alt={adminUser.name}
              className="w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-sm"
            />
            <span className="hidden md:inline font-bold text-xs text-slate-800">{adminUser.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150 space-y-1">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <span className="font-extrabold text-xs text-slate-900 block">{adminUser.name}</span>
                <span className="text-[10px] text-slate-500 font-mono block">{adminUser.email}</span>
                <span className="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 border border-emerald-200 uppercase">
                  {adminUser.role}
                </span>
              </div>

              <button
                onClick={() => { setProfileDropdownOpen(false); onQuickAction('profile'); }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-slate-400" /> Profile & Credentials
              </button>
              
              <button
                onClick={() => { setProfileDropdownOpen(false); onQuickAction('settings'); }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-slate-400" /> System Settings
              </button>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
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
