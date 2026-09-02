import React, { useState } from 'react';
import { StorageService } from '../../services/storageService';
import { MediaItem } from '../../types';
import { X, Upload, Search, Copy, Check, Trash2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (url: string, alt?: string) => void;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({ isOpen, onClose, onSelectImage }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(StorageService.getMediaItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Image Form
  const [newImageName, setNewImageName] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  if (!isOpen) return null;

  const refreshMedia = () => {
    setMediaItems(StorageService.getMediaItems());
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this image from Media Library?')) {
      StorageService.deleteMediaItem(id);
      refreshMedia();
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImageName && newImageUrl) {
      StorageService.addMediaItem({
        name: newImageName,
        url: newImageUrl,
        altText: newImageName
      });
      refreshMedia();
      setNewImageName('');
      setNewImageUrl('');
      setShowUploadForm(false);
    }
  };

  const filteredItems = mediaItems.filter(item => {
    const q = searchQuery.toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || (item.altText && item.altText.toLowerCase().includes(q));
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ImageIcon className="w-5 h-5 text-emerald-400" />
            <span>Media Library & Image Manager</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 text-xs">
          
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl shadow transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{showUploadForm ? 'Cancel Upload' : 'Upload New Image'}</span>
          </button>

        </div>

        {/* Upload Form Accordion */}
        {showUploadForm && (
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-200 space-y-3 text-xs shrink-0">
            <div className="flex items-center gap-3">
              <label className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl cursor-pointer flex items-center gap-2 shadow-xs transition-colors">
                <Upload className="w-4 h-4" />
                <span>📷 Upload Multiple Images from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      let processed = 0;
                      Array.from(files).forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          if (dataUrl) {
                            StorageService.addMediaItem({
                              name: file.name,
                              url: dataUrl,
                              altText: file.name
                            });
                            processed++;
                            if (processed === files.length) {
                              refreshMedia();
                              setShowUploadForm(false);
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }}
                />
              </label>
              <span className="text-slate-500 font-bold text-xs">Select 1 or multiple images at once</span>
            </div>

            <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Image Name / Alt text..."
                value={newImageName}
                onChange={(e) => setNewImageName(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
              />
              <input
                type="text"
                required
                placeholder="Image URL (https://...)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl"
              >
                Add URL to Library
              </button>
            </form>
          </div>
        )}

        {/* Image Grid Gallery */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <p className="font-semibold text-sm">No media items found in library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map((media) => (
                <div
                  key={media.id}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img
                      src={media.url}
                      alt={media.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Select Trigger Overlay if called from editor */}
                    {onSelectImage && (
                      <button
                        onClick={() => {
                          onSelectImage(media.url, media.name);
                          onClose();
                        }}
                        className="absolute inset-0 bg-slate-900/70 text-white font-bold text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Select Image
                      </button>
                    )}
                  </div>

                  <div className="p-3 space-y-2 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 truncate" title={media.name}>{media.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono block">{media.dimensions || '1200x800'} • {media.size || 'Web'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <button
                        onClick={() => handleCopyUrl(media.id, media.url)}
                        className="text-slate-600 hover:text-emerald-600 font-bold flex items-center gap-1"
                        title="Copy Image URL"
                      >
                        {copiedId === media.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === media.id ? 'Copied!' : 'Copy URL'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(media.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>{mediaItems.length} images stored in library</span>
          <button onClick={onClose} className="bg-slate-900 text-white font-bold px-4 py-1.5 rounded-xl">
            Close Media Library
          </button>
        </div>

      </div>
    </div>
  );
};
