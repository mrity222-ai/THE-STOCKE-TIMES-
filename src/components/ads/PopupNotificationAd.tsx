import React, { useEffect, useMemo, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { StorageService } from '../../services/storageService';
import { PopupNotificationSettings } from '../../types';

export const PopupNotificationAd: React.FC = () => {
  const [settings, setSettings] = useState<PopupNotificationSettings>(() => StorageService.getPopupNotificationSettings());
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    StorageService.fetchPopupNotificationSettings().then((freshSettings) => {
      if (isMounted) setSettings(freshSettings);
    });

    const handleUpdate = () => {
      setSettings(StorageService.getPopupNotificationSettings());
      setVisible(false);
      setClosed(false);
    };

    window.addEventListener('popup-notification-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('popup-notification-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const hasContent = useMemo(() => {
    return Boolean(settings.title.trim() || settings.message.trim() || settings.imageUrl.trim());
  }, [settings]);

  useEffect(() => {
    if (!settings.enabled || !hasContent || closed) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, Math.max(1, settings.delaySeconds || 10) * 1000);

    return () => window.clearTimeout(timer);
  }, [settings, hasContent, closed]);

  if (!visible || !settings.enabled || !hasContent) return null;

  const openLink = () => {
    if (settings.linkUrl) {
      window.open(settings.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const content = (
    <div
      role={settings.linkUrl ? 'link' : undefined}
      tabIndex={settings.linkUrl ? 0 : undefined}
      onClick={openLink}
      onKeyDown={(event) => {
        if (settings.linkUrl && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          openLink();
        }
      }}
      className={`bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 ${
        settings.linkUrl ? 'cursor-pointer' : ''
      }`}
    >
      <div className="relative">
        {settings.imageUrl && (
          <img
            src={settings.imageUrl}
            alt={settings.title || 'The Stock Times notification'}
            className="w-full max-h-[58vh] object-cover bg-slate-100"
          />
        )}
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setClosed(true);
            setVisible(false);
          }}
          className="absolute right-3 top-3 w-9 h-9 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
          aria-label="Close popup notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {(settings.title || settings.message || settings.linkLabel) && (
        <div className="p-5 space-y-2.5">
          {settings.title && (
            <h2 className="text-xl font-extrabold text-[#0B1F33] leading-tight font-serif">
              {settings.title}
            </h2>
          )}
          {settings.message && (
            <p className="text-sm text-slate-600 leading-relaxed">
              {settings.message}
            </p>
          )}
          {settings.linkUrl && (
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#155EEF]">
              <span>{settings.linkLabel || 'Open Link'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/55 backdrop-blur-sm px-4 py-6 flex items-center justify-center">
      {content}
    </div>
  );
};
