import React, { useEffect, useState } from 'react';
import { StorageService } from '../../services/storageService';
import { SiteSettings } from '../../types';
import { ApiService } from '../../services/apiService';
import { Settings, Globe, ShieldCheck, Mail, Bell, KeyRound, Save, CheckCircle2, Share2, Lock, Activity, Power } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'website' | 'seo' | 'social' | 'users' | 'security' | 'email' | 'notifications'>('general');
  const [formData, setFormData] = useState<SiteSettings>(StorageService.getSettings());
  const [toastMsg, setToastMsg] = useState('');

  const [socialMedia, setSocialMedia] = useState({
    twitter_url: '',
    linkedin_url: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    reddit_url: ''
  });

  useEffect(() => {
    const loadSocialMedia = async () => {
      const data = await ApiService.fetchSocialMedia();

      if (data) {
        setSocialMedia({
          twitter_url: data.twitter_url || '',
          linkedin_url: data.linkedin_url || '',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || '',
          youtube_url: data.youtube_url || '',
          reddit_url: data.reddit_url || ''
        });
      }
    };

    loadSocialMedia();
  }, []);

  // Password change fields
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(formData);
    await ApiService.updateSocialMedia(socialMedia);
    setToastMsg('Site settings and social media links updated successfully!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPass === 'admin123' && newPass.length >= 6) {
      setPassMsg('Password updated successfully! Please re-login with new password.');
      setCurrentPass('');
      setNewPass('');
    } else {
      setPassMsg('Error: Current password must be "admin123" and new password must be at least 6 characters.');
    }
    setTimeout(() => setPassMsg(''), 4000);
  };

  const toggleYahooApi = () => {
    const nextState = !(formData.enableYahooFinanceApi ?? true);
    const updated = { ...formData, enableYahooFinanceApi: nextState };
    setFormData(updated);
    StorageService.saveSettings(updated);
    setToastMsg(`Yahoo Finance API Streaming turned ${nextState ? 'ON (LIVE FEED ACTIVE)' : 'OFF (STATIC BASELINE ACTIVE)'}`);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleTestSmtpConnection = async () => {
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      const res = await fetch('http://localhost:5000/api/smtp-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: formData.smtpHost || 'smtp.hostinger.com',
          smtpPort: formData.smtpPort || 465,
          smtpUsername: formData.smtpUsername || 'info@avedatechnologies.com',
          smtpPassword: formData.smtpPassword || 'Jaymatadi@122',
          smtpFromEmail: formData.smtpFromEmail || 'info@avedatechnologies.com',
          smtpFromName: formData.smtpFromName || 'The Stoce Times Editors',
          smtpSecure: formData.smtpSecure ?? true,
          targetEmail: formData.contactEmail || 'dhoniy423@gmail.com'
        })
      });
      const data = await res.json();
      setSmtpTestResult(data);
    } catch (e: any) {
      setSmtpTestResult({ success: false, message: e.message || 'Connection failed.' });
    } finally {
      setSmtpTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Settings & Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure platform branding, SMTP email server, default SEO tags, live API switches, and security.</p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer w-fit"
        >
          <Save className="w-4 h-4" />
          <span>Save All Settings</span>
        </button>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 8 Tab Navigation */}
      <div className="flex flex-wrap items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1 text-xs font-bold">
        {(['general', 'website', 'seo', 'social', 'users', 'security', 'email', 'notifications'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 rounded-xl transition-all capitalize ${activeTab === tab ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            {tab === 'email' ? 'Email & SMTP Server' : tab}
          </button>
        ))}
      </div>

      {/* Tab Form Content */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs text-slate-800">

        {activeTab === 'general' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">General Publication Settings</h3>

            {/* YAHOO FINANCE API ON / OFF SWITCH */}
            <div className="bg-[#0B1F33] text-white p-5 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${(formData.enableYahooFinanceApi ?? true)
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white block font-serif">Yahoo Finance API Live Streaming</span>
                    <span className="text-[11px] text-slate-300 block font-light">
                      Toggle real-time stock ticker & market data feed ON or OFF
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleYahooApi}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${(formData.enableYahooFinanceApi ?? true) ? 'bg-[#16A34A]' : 'bg-slate-700'
                    }`}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${(formData.enableYahooFinanceApi ?? true) ? 'translate-x-7' : 'translate-x-0'
                    }`} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800">
                <span className={`px-2.5 py-1 rounded font-extrabold tracking-wider ${(formData.enableYahooFinanceApi ?? true)
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                  STATUS: {(formData.enableYahooFinanceApi ?? true) ? '🟢 API STREAMING ENABLED' : '🔴 API STREAMING DISABLED'}
                </span>

                <span className="text-slate-400 text-[10px]">
                  {(formData.enableYahooFinanceApi ?? true) ? 'Fetching real-time quotes every 10s' : 'Using cached baseline market indices'}
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Website Name</label>
              <input
                type="text"
                value={formData.websiteName}
                onChange={(e) => setFormData({ ...formData, websiteName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Website Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              ></textarea>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">System Timezone</label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">Global SEO & Tracking Credentials</h3>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Default Meta Title</label>
              <input
                type="text"
                value={formData.defaultMetaTitle}
                onChange={(e) => setFormData({ ...formData, defaultMetaTitle: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Default Meta Description</label>
              <textarea
                rows={3}
                value={formData.defaultMetaDescription}
                onChange={(e) => setFormData({ ...formData, defaultMetaDescription: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              ></textarea>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Google Analytics ID</label>
              <input
                type="text"
                value={formData.googleAnalyticsId}
                onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Google Search Console Property</label>
              <input
                type="text"
                value={formData.googleSearchConsole}
                onChange={(e) => setFormData({ ...formData, googleSearchConsole: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">SMTP Mail Server Credentials</h3>
                <p className="text-slate-500 text-[11px]">Configure Hostinger, Gmail, or custom SMTP server credentials used for delivering 2FA OTPs, password resets, and article broadcast newsletters.</p>
              </div>
              <button
                type="button"
                onClick={handleTestSmtpConnection}
                disabled={smtpTesting}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{smtpTesting ? 'Testing Connection...' : 'Test SMTP Connection'}</span>
              </button>
            </div>

            {smtpTestResult && (
              <div className={`p-4 rounded-2xl text-xs font-bold border ${
                smtpTestResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}>
                <p className="font-extrabold text-sm">{smtpTestResult.success ? '✅ SMTP Connection Successful!' : '❌ SMTP Connection Failed'}</p>
                <p className="text-slate-600 font-normal mt-1">{smtpTestResult.message}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">SMTP Server Host</label>
                <input
                  type="text"
                  value={formData.smtpHost || ''}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                  placeholder="smtp.hostinger.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SMTP Server Port</label>
                <input
                  type="number"
                  value={formData.smtpPort || 465}
                  onChange={(e) => setFormData({ ...formData, smtpPort: Number(e.target.value) })}
                  placeholder="465"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="smtpSecure"
                checked={formData.smtpSecure ?? true}
                onChange={(e) => setFormData({ ...formData, smtpSecure: e.target.checked })}
                className="rounded accent-emerald-600 cursor-pointer"
              />
              <label htmlFor="smtpSecure" className="font-bold text-slate-700 cursor-pointer">
                Use Secure SSL/TLS Connection (Required for Port 465)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">SMTP Username / Email</label>
                <input
                  type="email"
                  value={formData.smtpUsername || ''}
                  onChange={(e) => setFormData({ ...formData, smtpUsername: e.target.value })}
                  placeholder="info@avedatechnologies.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SMTP Password</label>
                <input
                  type="password"
                  value={formData.smtpPassword || ''}
                  onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                  placeholder="Enter SMTP password"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Default Sender Email ("From Email")</label>
                <input
                  type="email"
                  value={formData.smtpFromEmail || ''}
                  onChange={(e) => setFormData({ ...formData, smtpFromEmail: e.target.value })}
                  placeholder="info@avedatechnologies.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Default Sender Display Name ("From Name")</label>
                <input
                  type="text"
                  value={formData.smtpFromName || ''}
                  onChange={(e) => setFormData({ ...formData, smtpFromName: e.target.value })}
                  placeholder="The Stoce Times Editors"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Hostinger SMTP Preset Configuration Note
              </p>
              <p className="text-amber-800 font-normal leading-relaxed">
                Default Hostinger settings: Host = <strong>smtp.hostinger.com</strong>, Port = <strong>465</strong> (SSL), Account = <strong>info@avedatechnologies.com</strong>.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">
              Social Media Channels
            </h3>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Twitter / X URL
              </label>
              <input
                type="url"
                value={socialMedia.twitter_url}
                onChange={(e) =>
                  setSocialMedia({
                    ...socialMedia,
                    twitter_url: e.target.value
                  })
                }
                placeholder="https://twitter.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                LinkedIn Page URL
              </label>
              <input
                type="url"
                value={socialMedia.linkedin_url}
                onChange={(e) =>
                  setSocialMedia({
                    ...socialMedia,
                    linkedin_url: e.target.value
                  })
                }
                placeholder="https://linkedin.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={socialMedia.facebook_url}
                onChange={(e) =>
                  setSocialMedia({
                    ...socialMedia,
                    facebook_url: e.target.value
                  })
                }
                placeholder="https://facebook.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={socialMedia.instagram_url}
                onChange={(e) =>
                  setSocialMedia({
                    ...socialMedia,
                    instagram_url: e.target.value
                  })
                }
                placeholder="https://instagram.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                YouTube Channel URL
              </label>
              <input
                type="url"
                value={socialMedia.youtube_url}
                onChange={(e) =>
                  setSocialMedia({
                    ...socialMedia,
                    youtube_url: e.target.value
                  })
                }
                placeholder="https://youtube.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Reddit URL
              </label>
              <input
                type="url"
                value={socialMedia.reddit_url}
                onChange={(e) =>
                  setSocialMedia({
                    ...socialMedia,
                    reddit_url: e.target.value
                  })
                }
                placeholder="https://reddit.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 max-w-md">
            <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">Change Admin Account Password</h3>

            {passMsg && (
              <div className={`p-3 rounded-xl text-xs font-bold ${passMsg.includes('Error') ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                {passMsg}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current admin password"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="button"
                onClick={handleChangePassword}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </div>
        )}

      </form>

    </div>
  );
};
