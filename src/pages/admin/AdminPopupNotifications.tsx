import React, { useState } from 'react';
import { BellRing, ExternalLink, ImagePlus, Save, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { PopupNotificationSettings } from '../../types';
import { StorageService } from '../../services/storageService';
import { optimizeImageFile } from '../../utils/imageUpload';

export const AdminPopupNotifications: React.FC = () => {
  const [settings, setSettings] = useState<PopupNotificationSettings>(() => StorageService.getPopupNotificationSettings());
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const updateField = <K extends keyof PopupNotificationSettings>(key: K, value: PopupNotificationSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setUploading(true);
    try {
      const optimized = await optimizeImageFile(file, {
        maxWidth: 1200,
        maxHeight: 900,
        quality: 0.78,
        outputType: 'image/webp'
      });
      updateField('imageUrl', optimized.dataUrl);
      showToast(`Popup banner uploaded (${optimized.sizeLabel}).`);
    } catch (error) {
      alert('Image upload failed. Please try another image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    StorageService.setPopupNotificationSettings(settings);
    showToast('Popup notification saved. Frontend will use the latest banner.');
  };

  return (
    <div className="space-y-6 font-sans">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 text-sm font-semibold">
          {toastMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B1F33] tracking-tight font-serif flex items-center gap-2.5">
            <BellRing className="w-7 h-7 text-[#16A34A]" />
            <span>Popup Notification Banner</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-light">
            Website open hone ke baad popup banner, image, text aur clickable link yahin se manage hoga.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-[#16A34A] hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Popup</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <section className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#0B1F33]">Popup Status</h2>
              <p className="text-xs text-slate-500 mt-1">ON hone par visitor ko configured delay ke baad popup dikhega.</p>
            </div>
            <button
              onClick={() => updateField('enabled', !settings.enabled)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                settings.enabled
                  ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {settings.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              <span>{settings.enabled ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Popup Heading</span>
              <input
                value={settings.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
                placeholder="Market update title"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Show Delay (seconds)</span>
              <input
                type="number"
                min={1}
                max={120}
                value={settings.delaySeconds}
                onChange={(e) => updateField('delaySeconds', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
              />
            </label>
          </div>

          <label className="space-y-1.5 block">
            <span className="text-xs font-bold text-slate-700">Popup Message</span>
            <textarea
              value={settings.message}
              onChange={(e) => updateField('message', e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
              placeholder="Popup me dikhne wala message..."
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Clickable Link URL</span>
              <input
                value={settings.linkUrl}
                onChange={(e) => updateField('linkUrl', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
                placeholder="https://example.com"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700">Link Label</span>
              <input
                value={settings.linkLabel}
                onChange={(e) => updateField('linkLabel', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
                placeholder="Open Update"
              />
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700">Popup Banner Image</span>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer text-center">
                <ImagePlus className="w-8 h-8 text-[#155EEF]" />
                <span className="text-sm font-extrabold text-[#0B1F33]">
                  {uploading ? 'Uploading image...' : 'Upload banner from local computer'}
                </span>
                <span className="text-xs text-slate-500">JPG, PNG, WEBP supported. Image optimized automatically.</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                />
              </label>
            </div>
            {settings.imageUrl && (
              <button
                onClick={() => updateField('imageUrl', '')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove image</span>
              </button>
            )}
          </div>
        </section>

        <aside className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-[#0B1F33]">Live Preview</h2>
            <p className="text-xs text-slate-500 mt-1">Yahi popup frontend par 10 seconds ke baad show hoga.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden bg-white">
            {settings.imageUrl ? (
              <img src={settings.imageUrl} alt={settings.title || 'Popup preview'} className="w-full max-h-72 object-cover bg-slate-100" />
            ) : (
              <div className="h-44 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                No banner image uploaded
              </div>
            )}
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-extrabold text-[#0B1F33] font-serif leading-tight">
                {settings.title || 'Popup heading'}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {settings.message || 'Popup message preview will appear here.'}
              </p>
              {settings.linkUrl && (
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#155EEF]">
                  <span>{settings.linkLabel || 'Open Link'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
