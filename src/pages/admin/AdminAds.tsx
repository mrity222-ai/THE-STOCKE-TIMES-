import React, { useState } from 'react';
import { AdService, PlacementSetting } from '../../services/adService';
import { AdUnit, AdSenseConfig, HouseAd, AdFrequencyRules, AdPriority, AdLifecycleStatus } from '../../types/ads';
import { 
  DollarSign, 
  Settings, 
  BarChart3, 
  Layers, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Globe, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  X,
  Sliders,
  Calendar,
  Eye,
  MousePointer,
  Link,
  Target,
  FileText
} from 'lucide-react';

export const AdminAds: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'placements' | 'house' | 'units' | 'adsense' | 'analytics' | 'rules'>('house');
  
  const [rules, setRules] = useState<AdFrequencyRules>(AdService.getRules());
  const [placements, setPlacements] = useState<PlacementSetting[]>(AdService.getPlacementsConfig());
  const [adsense, setAdsense] = useState<AdSenseConfig>(AdService.getAdSenseConfig());
  const [units, setUnits] = useState<AdUnit[]>(AdService.getAdUnits());
  const [houseAds, setHouseAds] = useState<HouseAd[]>(AdService.getHouseAds());
  const analytics = AdService.getAnalytics();

  const [toastMsg, setToastMsg] = useState('');
  const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);
  const [editingHouseAd, setEditingHouseAd] = useState<Partial<HouseAd> | null>(null);

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Partial<AdUnit> | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveRules = (newRules: AdFrequencyRules) => {
    setRules(newRules);
    AdService.saveRules(newRules);
    showToast('Ad Frequency & Master Settings updated.');
  };

  const handleTogglePlacement = (index: number) => {
    const updated = [...placements];
    updated[index].enabled = !updated[index].enabled;
    setPlacements(updated);
    AdService.savePlacementsConfig(updated);
    showToast(`${updated[index].label} set to ${updated[index].enabled ? 'ENABLED' : 'DISABLED'}.`);
  };

  const handleChangeNetwork = (index: number, network: any) => {
    const updated = [...placements];
    updated[index].network = network;
    setPlacements(updated);
    AdService.savePlacementsConfig(updated);
    showToast(`Network for ${updated[index].label} set to ${network}.`);
  };

  const handleSaveAdSense = (e: React.FormEvent) => {
    e.preventDefault();
    AdService.saveAdSenseConfig(adsense);
    showToast('Google AdSense configuration saved.');
  };

  const handleSaveHouseAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHouseAd || !editingHouseAd.name || !editingHouseAd.headline) return;

    const fullAd: HouseAd = {
      id: editingHouseAd.id || 'house-' + Date.now(),
      name: editingHouseAd.name || 'Campaign Ad',
      headline: editingHouseAd.headline || '',
      description: editingHouseAd.description || '',
      desktopImage: editingHouseAd.desktopImage || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
      mobileImage: editingHouseAd.mobileImage || editingHouseAd.desktopImage || '',
      altText: editingHouseAd.altText || editingHouseAd.headline,
      ctaText: editingHouseAd.ctaText || 'Explore Now →',
      destinationUrl: editingHouseAd.destinationUrl || '/',
      targetWindow: editingHouseAd.targetWindow || '_blank',
      placement: editingHouseAd.placement || 'homepage_mid',
      deviceTargeting: editingHouseAd.deviceTargeting || 'all',
      startDate: editingHouseAd.startDate || new Date().toISOString().split('T')[0],
      endDate: editingHouseAd.endDate || '',
      priority: editingHouseAd.priority || 'high',
      rotationWeight: Number(editingHouseAd.rotationWeight) || 100,
      maxImpressions: editingHouseAd.maxImpressions ? Number(editingHouseAd.maxImpressions) : undefined,
      maxClicks: editingHouseAd.maxClicks ? Number(editingHouseAd.maxClicks) : undefined,
      utmSource: editingHouseAd.utmSource || 'thestocetimes',
      utmMedium: editingHouseAd.utmMedium || 'banner_ad',
      utmCampaign: editingHouseAd.utmCampaign || 'promo',
      impressions: editingHouseAd.impressions || 0,
      clicks: editingHouseAd.clicks || 0,
      ctr: editingHouseAd.ctr || 0,
      status: (editingHouseAd.status as AdLifecycleStatus) || 'active',
      internalNotes: editingHouseAd.internalNotes || '',
      createdAt: editingHouseAd.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: editingHouseAd.headline,
      targetUrl: editingHouseAd.destinationUrl,
      imageUrl: editingHouseAd.desktopImage
    };

    AdService.saveHouseAd(fullAd);
    setHouseAds(AdService.getHouseAds());
    setIsHouseModalOpen(false);
    showToast('Campaign Ad saved successfully.');
  };

  const handleDeleteHouseAd = (id: string) => {
    if (window.confirm('Delete this Campaign Ad?')) {
      const updated = houseAds.filter(a => a.id !== id);
      localStorage.setItem('finance_pulse_house_ads_v1', JSON.stringify(updated));
      setHouseAds(updated);
      showToast('Campaign Ad deleted.');
    }
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit || !editingUnit.name) return;
    AdService.saveAdUnit(editingUnit as any);
    setUnits(AdService.getAdUnits());
    setIsUnitModalOpen(false);
    showToast('Ad Unit saved successfully.');
  };

  const handleDeleteUnit = (id: string) => {
    if (window.confirm('Delete this ad unit?')) {
      AdService.deleteAdUnit(id);
      setUnits(AdService.getAdUnits());
      showToast('Ad Unit deleted.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 font-serif">
            <DollarSign className="w-5 h-5 text-emerald-600" /> Advertising & AdSense Campaign Manager
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage AdSense units, custom house campaigns, placement rules, device targeting, and tracking analytics.</p>
        </div>

        {/* Master Switch */}
        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xs">
          <span className="text-xs font-bold">Master Monetization:</span>
          <button
            onClick={() => handleSaveRules({ ...rules, globalAdsMasterSwitch: !rules.globalAdsMasterSwitch })}
            className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
              rules.globalAdsMasterSwitch ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
            }`}
          >
            {rules.globalAdsMasterSwitch ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs gap-1 text-xs font-bold">
        <button onClick={() => setActiveTab('house')} className={`px-4 py-2 rounded-xl ${activeTab === 'house' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>House & Direct Campaigns ({houseAds.length})</button>
        <button onClick={() => setActiveTab('placements')} className={`px-4 py-2 rounded-xl ${activeTab === 'placements' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Ad Locations ({placements.length})</button>
        <button onClick={() => setActiveTab('units')} className={`px-4 py-2 rounded-xl ${activeTab === 'units' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Ad Units ({units.length})</button>
        <button onClick={() => setActiveTab('adsense')} className={`px-4 py-2 rounded-xl ${activeTab === 'adsense' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Google AdSense</button>
        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-xl ${activeTab === 'analytics' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Analytics & CTR</button>
        <button onClick={() => setActiveTab('rules')} className={`px-4 py-2 rounded-xl ${activeTab === 'rules' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Density Rules</button>
      </div>

      {/* 1. HOUSE & DIRECT CAMPAIGNS TAB */}
      {activeTab === 'house' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm font-serif">House & Direct Ad Campaigns</h3>
              <p className="text-xs text-slate-500">Configure headlines, desktop/mobile images, destination links, priority, and UTM tracking.</p>
            </div>
            <button
              onClick={() => {
                setEditingHouseAd({
                  name: '',
                  headline: '',
                  description: '',
                  desktopImage: '',
                  mobileImage: '',
                  altText: '',
                  ctaText: 'Explore Now →',
                  destinationUrl: '/',
                  targetWindow: '_blank',
                  placement: 'homepage_mid',
                  deviceTargeting: 'all',
                  priority: 'high',
                  rotationWeight: 100,
                  status: 'active',
                  utmSource: 'thestocetimes',
                  utmMedium: 'banner_ad',
                  utmCampaign: 'promo_campaign'
                });
                setIsHouseModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create New Ad Campaign
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-300 uppercase font-bold font-sans">
                  <tr>
                    <th className="p-3.5">Ad Name / Headline</th>
                    <th className="p-3.5">Placement</th>
                    <th className="p-3.5">Target & Window</th>
                    <th className="p-3.5">Priority / Weight</th>
                    <th className="p-3.5">Impressions / Clicks</th>
                    <th className="p-3.5">CTR %</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {houseAds.map((ad) => (
                    <tr key={ad.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-slate-900 text-sm">{ad.name || ad.title}</div>
                        <span className="text-xs text-slate-500 font-serif block">{ad.headline || ad.description}</span>
                        {ad.destinationUrl && (
                          <span className="text-[10px] text-emerald-600 font-mono block truncate max-w-xs">{ad.destinationUrl}</span>
                        )}
                      </td>

                      <td className="p-3.5 font-sans font-bold">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs">
                          {ad.placement}
                        </span>
                      </td>

                      <td className="p-3.5 font-sans">
                        <div className="uppercase text-xs font-bold text-slate-700">{ad.deviceTargeting || 'all'}</div>
                        <span className="text-[10px] text-slate-400 font-mono">Window: {ad.targetWindow || '_blank'}</span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          ad.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ad.priority || 'high'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">Weight: {ad.rotationWeight || 100}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900">{ad.impressions || 4850} views</span>
                        <span className="text-slate-400 block text-[10px]">{ad.clicks || 215} clicks</span>
                      </td>

                      <td className="p-3.5 font-bold text-emerald-600">
                        {ad.ctr || 4.43}%
                      </td>

                      <td className="p-3.5 font-sans">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase ${
                          ad.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ad.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-sans space-x-2">
                        <button
                          onClick={() => { setEditingHouseAd({ ...ad }); setIsHouseModalOpen(true); }}
                          className="text-slate-700 hover:text-emerald-600 font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHouseAd(ad.id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. AD LOCATIONS TAB */}
      {activeTab === 'placements' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-serif">Ad Placement Location Manager</h3>
              <p className="text-xs text-slate-500">Enable, disable, or switch ad networks for every single location on the website.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
              {placements.filter(p => p.enabled).length} / {placements.length} Placements Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-300 uppercase font-bold">
                <tr>
                  <th className="p-3.5">Placement Location</th>
                  <th className="p-3.5">Page Group</th>
                  <th className="p-3.5">Network</th>
                  <th className="p-3.5">Device</th>
                  <th className="p-3.5 text-right">Status (ON/OFF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {placements.map((p, idx) => (
                  <tr key={p.placementKey} className={p.enabled ? 'bg-white' : 'bg-slate-50 opacity-60'}>
                    <td className="p-3.5 font-bold text-slate-900 font-sans">
                      <div>{p.label}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{p.placementKey}</span>
                    </td>
                    <td className="p-3.5 font-sans font-bold">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs">
                        {p.pageGroup}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={p.network}
                        onChange={(e) => handleChangeNetwork(idx, e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl p-1.5 text-xs font-sans font-bold text-slate-800"
                      >
                        <option value="google-adsense">Google AdSense</option>
                        <option value="house">House Ad</option>
                        <option value="direct">Direct Advertiser</option>
                      </select>
                    </td>
                    <td className="p-3.5 uppercase text-xs font-bold text-slate-500">{p.device}</td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={() => handleTogglePlacement(idx)}
                        className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-colors cursor-pointer ${
                          p.enabled 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {p.enabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. AD UNITS TAB */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingUnit({ name: '', type: 'responsive', network: 'google-adsense', slotId: '', placement: 'article_top', targetDevice: 'all', status: 'active' });
                setIsUnitModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Ad Unit
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-300 uppercase font-bold font-sans">
                <tr>
                  <th className="p-3.5">Ad Unit Name</th>
                  <th className="p-3.5">Network</th>
                  <th className="p-3.5">Placement</th>
                  <th className="p-3.5">Slot ID</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {units.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3.5 font-bold text-slate-900 font-sans">{u.name}</td>
                    <td className="p-3.5"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-xs">{u.network}</span></td>
                    <td className="p-3.5 text-xs font-sans">{u.placement}</td>
                    <td className="p-3.5 text-slate-500">{u.slotId || 'Auto'}</td>
                    <td className="p-3.5"><span className={`px-2 py-0.5 rounded font-bold text-xs ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{u.status}</span></td>
                    <td className="p-3.5 text-right font-sans space-x-2">
                      <button onClick={() => { setEditingUnit({ ...u }); setIsUnitModalOpen(true); }} className="text-slate-700 hover:text-emerald-600 font-bold">Edit</button>
                      <button onClick={() => handleDeleteUnit(u.id)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ADSENSE CONFIG TAB */}
      {activeTab === 'adsense' && (
        <form onSubmit={handleSaveAdSense} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 max-w-2xl font-sans">
          <h3 className="font-extrabold text-slate-900 text-base border-b pb-3 flex items-center gap-2 font-serif">
            <Globe className="w-5 h-5 text-emerald-600" /> Google AdSense Technical Configuration
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Publisher ID *</label>
              <input
                type="text"
                required
                value={adsense.publisherId}
                onChange={(e) => setAdsense({ ...adsense, publisherId: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs"
                placeholder="ca-pub-1234567890123456"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">Auto Ads Control</span>
                <span className="text-xs text-slate-500">Allow Google AI to place ads in relevant positions without layout shifts.</span>
              </div>
              <input
                type="checkbox"
                checked={adsense.autoAdsEnabled}
                onChange={(e) => setAdsense({ ...adsense, autoAdsEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">AdSense Head Verification Script Snippet</label>
              <textarea
                rows={3}
                value={adsense.verificationCode}
                onChange={(e) => setAdsense({ ...adsense, verificationCode: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs"
              />
            </div>
          </div>

          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs cursor-pointer">
            Save AdSense Config
          </button>
        </form>
      )}

      {/* 5. AD ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 font-sans">
          <h3 className="font-extrabold text-slate-900 text-base border-b pb-3 font-serif">Ad Performance Analytics & CTR Tracking</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-300 uppercase font-bold">
                <tr>
                  <th className="p-3.5">Placement Location</th>
                  <th className="p-3.5">Impressions</th>
                  <th className="p-3.5">Clicks</th>
                  <th className="p-3.5">CTR %</th>
                  <th className="p-3.5">Est. Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {analytics.map((a, idx) => (
                  <tr key={idx}>
                    <td className="p-3.5 font-bold text-slate-900 font-sans">{a.placement}</td>
                    <td className="p-3.5">{a.impressions.toLocaleString()}</td>
                    <td className="p-3.5">{a.clicks.toLocaleString()}</td>
                    <td className="p-3.5 text-emerald-600 font-bold">{a.ctrPct}%</td>
                    <td className="p-3.5 text-emerald-600 font-extrabold">₹{a.estimatedEarnings.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. RULES TAB */}
      {activeTab === 'rules' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 max-w-2xl text-xs font-sans">
          <h3 className="font-extrabold text-slate-900 text-base border-b pb-3 flex items-center gap-2 font-serif">
            <Sliders className="w-5 h-5 text-emerald-600" /> Ad Density & Layout Shift Prevention Rules
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">Max Ads Per Article</span>
              <input type="number" min="1" max="10" value={rules.maxAdsPerArticle} onChange={(e) => handleSaveRules({ ...rules, maxAdsPerArticle: Number(e.target.value) })} className="w-20 p-2 rounded-xl border border-slate-300 text-center font-mono font-bold" />
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">Min Content Word Distance</span>
              <input type="number" min="100" max="2000" step="100" value={rules.minContentWordDistance} onChange={(e) => handleSaveRules({ ...rules, minContentWordDistance: Number(e.target.value) })} className="w-24 p-2 rounded-xl border border-slate-300 text-center font-mono font-bold" />
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">Max Mobile Ads Limit</span>
              <input type="number" min="1" max="5" value={rules.maxMobileAds} onChange={(e) => handleSaveRules({ ...rules, maxMobileAds: Number(e.target.value) })} className="w-20 p-2 rounded-xl border border-slate-300 text-center font-mono font-bold" />
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE HOUSE AD EDIT / CREATE MODAL */}
      {isHouseModalOpen && editingHouseAd && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 text-xs my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3.5">
              <h3 className="font-extrabold text-slate-900 text-lg font-serif">
                {editingHouseAd.id ? 'Edit Campaign Ad' : 'Create New Campaign Ad'}
              </h3>
              <button onClick={() => setIsHouseModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHouseAd} className="space-y-6">
              
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-4 border-b pb-5">
                <span className="text-xs font-extrabold uppercase text-[#155EEF] tracking-wider block font-mono">1. BASIC INFORMATION</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Ad Name (Internal Admin ID) *</label>
                    <input type="text" required value={editingHouseAd.name || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans" placeholder="e.g. SIP Calculator Hero Campaign" />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Ad Headline (Main Heading) *</label>
                    <input type="text" required value={editingHouseAd.headline || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, headline: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans" placeholder="e.g. Free SIP Wealth Calculator" />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Short Description</label>
                  <textarea rows={2} value={editingHouseAd.description || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, description: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans" placeholder="Brief promotional message text..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Desktop Banner Image URL *</label>
                    <input type="url" required value={editingHouseAd.desktopImage || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, desktopImage: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" placeholder="https://..." />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Mobile Banner Image URL (Optional)</label>
                    <input type="url" value={editingHouseAd.mobileImage || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, mobileImage: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" placeholder="https://..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Alt Text (SEO & Accessibility)</label>
                    <input type="text" value={editingHouseAd.altText || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, altText: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans" placeholder="Banner image description" />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">CTA Button Text *</label>
                    <input type="text" required value={editingHouseAd.ctaText || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, ctaText: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans" placeholder="Explore Now →" />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Open Link In</label>
                    <select value={editingHouseAd.targetWindow || '_blank'} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, targetWindow: e.target.value as any })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans font-bold">
                      <option value="_blank">New Tab (_blank)</option>
                      <option value="_self">Same Tab (_self)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Destination Target URL *</label>
                  <input type="text" required value={editingHouseAd.destinationUrl || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, destinationUrl: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" placeholder="/financial-tools/sip-calculator or https://..." />
                </div>
              </div>

              {/* SECTION 2: DISPLAY SETTINGS */}
              <div className="space-y-4 border-b pb-5">
                <span className="text-xs font-extrabold uppercase text-[#16A34A] tracking-wider block font-mono">2. DISPLAY SETTINGS & TARGETING</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Ad Placement *</label>
                    <select value={editingHouseAd.placement || 'homepage_mid'} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, placement: e.target.value as any })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans font-bold">
                      <option value="homepage_mid">Homepage Mid Feed</option>
                      <option value="homepage-sidebar">Homepage Sidebar</option>
                      <option value="article_top">Article Reader Top</option>
                      <option value="article_mid">Article In-Content Mid</option>
                      <option value="article_bottom">Article Reader Bottom</option>
                      <option value="article_sidebar">Article Sticky Sidebar</option>
                      <option value="global_top">Global Top Header</option>
                      <option value="footer_global">Global Pre-Footer</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Device Targeting</label>
                    <select value={editingHouseAd.deviceTargeting || 'all'} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, deviceTargeting: e.target.value as any })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans font-bold">
                      <option value="all">All Devices</option>
                      <option value="desktop">Desktop Only</option>
                      <option value="mobile">Mobile Only</option>
                      <option value="tablet">Tablet Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Display Priority</label>
                    <select value={editingHouseAd.priority || 'high'} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, priority: e.target.value as any })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans font-bold">
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Start Date</label>
                    <input type="date" value={editingHouseAd.startDate || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, startDate: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">End Date (Optional)</label>
                    <input type="date" value={editingHouseAd.endDate || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, endDate: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Rotation Weight (1-100)</label>
                    <input type="number" min="1" max="100" value={editingHouseAd.rotationWeight || 100} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, rotationWeight: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-center" />
                  </div>
                </div>
              </div>

              {/* SECTION 3: TRACKING & MANAGEMENT */}
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase text-purple-600 tracking-wider block font-mono">3. TRACKING & STATUS</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">UTM Source</label>
                    <input type="text" value={editingHouseAd.utmSource || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, utmSource: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" placeholder="thestocetimes" />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">UTM Medium</label>
                    <input type="text" value={editingHouseAd.utmMedium || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, utmMedium: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" placeholder="banner_ad" />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">UTM Campaign</label>
                    <input type="text" value={editingHouseAd.utmCampaign || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, utmCampaign: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs" placeholder="sip_calculator_promo" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Status Lifecycle *</label>
                    <select value={editingHouseAd.status || 'active'} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, status: e.target.value as any })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans font-bold">
                      <option value="active font-bold">Active</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="paused">Paused</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Internal Notes (Admin Only)</label>
                    <input type="text" value={editingHouseAd.internalNotes || ''} onChange={(e) => setEditingHouseAd({ ...editingHouseAd, internalNotes: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-sans text-xs" placeholder="Private notes for team..." />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsHouseModalOpen(false)} className="px-5 py-2.5 rounded-xl border font-bold hover:bg-slate-50 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-xs cursor-pointer">
                  Save Campaign Ad
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* AD UNIT MODAL */}
      {isUnitModalOpen && editingUnit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 text-xs font-sans">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base font-serif">Ad Unit Configuration</h3>
              <button onClick={() => setIsUnitModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-3">
              <div><label className="font-bold block mb-1">Unit Name *</label><input type="text" required value={editingUnit.name || ''} onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300" /></div>
              <div><label className="font-bold block mb-1">Ad Slot ID</label><input type="text" value={editingUnit.slotId || ''} onChange={(e) => setEditingUnit({ ...editingUnit, slotId: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-300 font-mono" /></div>
              <div className="flex justify-end gap-2 pt-2 border-t"><button type="button" onClick={() => setIsUnitModalOpen(false)} className="px-4 py-2 rounded-xl border font-bold">Cancel</button><button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold cursor-pointer">Save Unit</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
