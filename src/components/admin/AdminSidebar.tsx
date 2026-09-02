import React from 'react';
import { 
  TrendingUp, 
  LayoutDashboard, 
  FileText, 
  FolderTree, 
  Tag, 
  Image as ImageIcon, 
  Users, 
  Flame, 
  Sparkles, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  PlusCircle,
  Clock,
  FileCheck,
  ShieldCheck,
  Calculator,
  Layers,
  DollarSign,
  Mail,
  Camera
} from 'lucide-react';
import { StorageService } from '../../services/storageService';

interface AdminSidebarProps {
  activeNav: string;
  onNavSelect: (navKey: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeNav,
  onNavSelect,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onLogout
}) => {
  const [currentUser, setCurrentUser] = React.useState(() => StorageService.getCurrentUser());

  React.useEffect(() => {
    const handleUpdate = () => {
      setCurrentUser(StorageService.getCurrentUser());
    };
    window.addEventListener('user-profile-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isAuthorRole = currentUser.role === 'author';

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
    { 
      key: 'articles', 
      label: 'Articles', 
      icon: FileText,
      subItems: [
        { key: 'articles', label: isAuthorRole ? 'My Articles' : 'All Articles' },
        { key: 'articles-new', label: 'Write New Article' },
        { key: 'articles-drafts', label: 'My Drafts' }
      ]
    },
    { key: 'subscribers', label: 'Subscribers', icon: Mail, adminOnly: true },
    { key: 'ads', label: 'Monetization & Ads', icon: DollarSign, adminOnly: true },
    { key: 'rules', label: 'Financial Rules', icon: ShieldCheck, adminOnly: true },
    { key: 'catalogs', label: 'Product Catalogs', icon: Layers, adminOnly: true },
    { key: 'categories', label: 'Categories', icon: FolderTree, adminOnly: true },
    { key: 'tags', label: 'Tags', icon: Tag, adminOnly: true },
    { key: 'media', label: 'Media Gallery', icon: ImageIcon },
    { key: 'authors', label: 'Users & Authors', icon: Users, adminOnly: true },
    { key: 'trending', label: 'Trending Articles', icon: Flame, adminOnly: true },
    { key: 'featured', label: 'Featured Articles', icon: Sparkles, adminOnly: true },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, adminOnly: true },
    { key: 'comments', label: 'Comments', icon: MessageSquare, adminOnly: true },
    { key: 'legal', label: 'Legal & Policies', icon: ShieldCheck, adminOnly: true },
    { key: 'settings', label: 'Settings', icon: Settings, adminOnly: true }
  ];

  const visibleNavItems = isAuthorRole
    ? navItems.filter(item => !item.adminOnly)
    : navItems;

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}`}
      >
        
        {/* Top Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div 
            onClick={() => onNavSelect(isAuthorRole ? 'articles' : 'dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-700 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-serif font-black text-[#ffffff] text-sm tracking-tight leading-none">
                  TheStoceTimes
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                  {isAuthorRole ? 'Author Workspace' : 'Control Portal'}
                </span>
              </div>
            )}
          </div>

          <button 
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          
          {isAuthorRole && (
            <div className="mb-4 bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Logged as Author</span>
              </div>
              <p className="text-[10px] text-emerald-400/80 leading-tight">
                Author permissions active: Create articles, save drafts & manage your own stories.
              </p>
            </div>
          )}

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.key || (item.subItems && item.subItems.some(sub => sub.key === activeNav));

            return (
              <div key={item.key} className="space-y-1">
                <button
                  onClick={() => onNavSelect(item.key)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black' 
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>

                {/* Sub Items */}
                {!collapsed && item.subItems && (
                  <div className="ml-8 pl-2 border-l border-slate-800 space-y-1">
                    {item.subItems.map((sub) => (
                      <button
                        key={sub.key}
                        onClick={() => onNavSelect(sub.key)}
                        className={`w-full text-left py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer block ${
                          activeNav === sub.key
                            ? 'text-emerald-400 font-bold bg-slate-800/50'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Info & Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2.5 py-2 bg-slate-800/60 rounded-xl border border-slate-800 relative group">
              <label className="relative cursor-pointer shrink-0" title="Click to change profile picture">
                <img 
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                  alt={currentUser.name} 
                  className="w-9 h-9 rounded-full object-cover border-2 border-[#16A34A] group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const dataUrl = evt.target?.result as string;
                        if (dataUrl) {
                          const updatedUser = { ...currentUser, avatar: dataUrl };
                          StorageService.setCurrentUser(updatedUser);
                          StorageService.saveUser(updatedUser);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              <div className="flex flex-col overflow-hidden text-xs">
                <span className="font-bold text-white truncate">{currentUser.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono capitalize">{currentUser.role}</span>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all cursor-pointer border border-slate-800 hover:border-rose-900/50"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

      </aside>
    </>
  );
};
