import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { Article } from '../types';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminLoginModal } from '../components/admin/AdminLoginModal';

import { AdminDashboard } from './admin/AdminDashboard';
import { AdminArticles } from './admin/AdminArticles';
import { AdminArticleEditor } from './admin/AdminArticleEditor';
import { AdminCategories } from './admin/AdminCategories';
import { AdminAuthors } from './admin/AdminAuthors';
import { AdminAnalytics } from './admin/AdminAnalytics';
import { AdminComments } from './admin/AdminComments';
import { AdminSettings } from './admin/AdminSettings';
import { AdminFinancialRules } from './admin/AdminFinancialRules';
import { AdminComparisonCatalogs } from './admin/AdminComparisonCatalogs';
import { AdminAds } from './admin/AdminAds';
import { AdminSubscribers } from './admin/AdminSubscribers';
import { AdminLegal } from './admin/AdminLegal';
import { AdminAiEngine } from './admin/AdminAiEngine';
import { AdminPopupNotifications } from './admin/AdminPopupNotifications';

interface AdminPageProps {
  onNavigate: (route: string, param?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(StorageService.isAdminAuthenticated());
  const [subNav, setSubNav] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Selected Article for Editing
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  if (!isAuthenticated) {
    return (
      <AdminLoginModal
        onSuccess={() => setIsAuthenticated(true)}
        onCancel={() => onNavigate('home')}
      />
    );
  }

  const handleLogout = () => {
    StorageService.logoutAdmin();
    setIsAuthenticated(false);
    onNavigate('home');
  };

  const handleNavSelect = (navKey: string) => {
    setSubNav(navKey);
    setMobileSidebarOpen(false);
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticle(art);
    setSubNav('articles-edit');
  };

  const handleQuickAction = (action: string) => {
    if (action === 'new-article') {
      setEditingArticle(null);
      setSubNav('articles-new');
    } else if (action === 'new-category') {
      setSubNav('categories');
    } else if (action === 'settings') {
      setSubNav('settings');
    } else if (action === 'view-site') {
      onNavigate('home');
    }
  };

  const getPageTitle = () => {
    switch (subNav) {
      case 'dashboard': return 'TheStockTimes.online — Admin Dashboard';
      case 'articles': return 'Articles List';
      case 'articles-new': return 'Author New Article';
      case 'articles-edit': return 'Edit Article';
      case 'ads': return 'TheStockTimes.online Monetization & Ads Engine';
      case 'popup-notifications': return 'Popup Notification Banner';
      case 'rules': return 'TheStockTimes.online Financial Rules & Rates Engine';
      case 'catalogs': return 'Product Catalogs (Cards & Mutual Funds)';
      case 'categories': return 'Categories Management';
      case 'tags': return 'Tags & Topics';
      case 'authors': return 'Research Authors Roster';
      case 'trending': return 'Trending Articles Pinned';
      case 'featured': return 'Lead Featured Stories';
      case 'analytics': return 'Readership Analytics';
      case 'comments': return 'Reader Comments Moderation';
      case 'settings': return 'TheStockTimes.online System Settings';
      default: return 'TheStockTimes.online Admin';
    }
  };

  const renderSubView = () => {
    switch (subNav) {
      case 'dashboard':
        return <AdminDashboard onNavigateSub={handleNavSelect} />;

      case 'ai-engine':
        return (
          <AdminAiEngine 
            onNavigateToEditor={(art) => {
              setEditingArticle(art);
              setSubNav('articles-edit');
            }} 
          />
        );

      case 'articles':
      case 'articles-drafts':
      case 'articles-scheduled':
      case 'trending':
      case 'featured':
        return (
          <AdminArticles 
            onNavigateSub={handleNavSelect}
            onEditArticle={handleEditArticle}
          />
        );

      case 'articles-new':
        return (
          <AdminArticleEditor 
            initialArticle={null} 
            onBack={() => setSubNav('articles')}
            onSaved={() => setSubNav('articles')}
          />
        );

      case 'articles-edit':
        return (
          <AdminArticleEditor 
            initialArticle={editingArticle} 
            onBack={() => setSubNav('articles')}
            onSaved={() => setSubNav('articles')}
          />
        );

      case 'subscribers':
        return <AdminSubscribers />;

      case 'ads':
        return <AdminAds />;

      case 'popup-notifications':
        return <AdminPopupNotifications />;

      case 'rules':
        return <AdminFinancialRules />;

      case 'catalogs':
        return <AdminComparisonCatalogs />;

      case 'categories':
      case 'tags':
        return <AdminCategories />;

      case 'authors':
        return <AdminAuthors />;

      case 'analytics':
        return <AdminAnalytics />;

      case 'comments':
        return <AdminComments />;

      case 'legal':
        return <AdminLegal />;

      case 'settings':
        return <AdminSettings />;

      default:
        return <AdminDashboard onNavigateSub={handleNavSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeNav={subNav}
        onNavSelect={handleNavSelect}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Admin Workspace Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        
        {/* Header Bar */}
        <AdminHeader
          pageTitle={getPageTitle()}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          onQuickAction={handleQuickAction}
          onLogout={handleLogout}
          onGlobalSearch={(q) => {
            console.log('Admin search:', q);
          }}
        />

        {/* Dynamic Inner View Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {renderSubView()}
        </main>

      </div>

    </div>
  );
};
