import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline,
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Table as TableIcon, 
  Sparkles, 
  Eye, 
  FileCode,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  MoreHorizontal,
  ChevronDown,
  Code2,
  FileText,
  Check,
  Upload
} from 'lucide-react';
import { StorageService } from '../../services/storageService';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  onOpenMediaPicker?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, onOpenMediaPicker }) => {
  // viewMode: 'source' (code only), 'preview' (render only), 'split' (side by side)
  const [viewMode, setViewMode] = useState<'source' | 'preview' | 'split'>('split');
  // formatMode: 'html' (raw HTML editing) vs 'word' (visual WYSIWYG editing)
  const [formatMode, setFormatMode] = useState<'html' | 'word'>('html');
  const [paragraphType, setParagraphType] = useState<string>('Paragraph');
  const [activeHeading, setActiveHeading] = useState<'h1' | 'h2' | 'h3' | null>('h2');
  const [toastMsg, setToastMsg] = useState<string>('');

  // Real-time Image Upload % Progress Indicator State
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');

  // Drag and Drop File Upload State
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const editableRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Drag and Drop Handlers for Article Editor Canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (imageFiles.length === 1) {
        const syntheticEvent = { target: { files: [imageFiles[0]] } } as any;
        handleSingleImageUploadWithProgress(syntheticEvent);
      } else if (imageFiles.length > 1) {
        const syntheticEvent = { target: { files: imageFiles } } as any;
        handleBulkImageUpload(syntheticEvent);
      }
    }
  };

  // Sync contentEditable div when value changes externally or when switching modes
  useEffect(() => {
    if (editableRef.current && editableRef.current.innerHTML !== value) {
      editableRef.current.innerHTML = value || '<p>Write detailed financial research and analysis here...</p>';
    }
  }, [value, formatMode, viewMode]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  // Helper to insert snippet in raw HTML textarea
  const insertSnippet = (before: string, after: string = '', defaultText: string = 'Sample text') => {
    const textarea = textareaRef.current || (document.getElementById('rich-editor-textarea') as HTMLTextAreaElement);
    
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const selectedText = value.substring(start, end) || defaultText;
      
      const replacement = before + selectedText + after;
      const newValue = value.substring(0, start) + replacement + value.substring(end);
      
      onChange(newValue);
    } else {
      // Fallback append
      onChange(value + `\n${before}${defaultText}${after}\n`);
    }
  };

  // Execute browser formatting command in Word / WYSIWYG mode
  const execWordCommand = (command: string, valueArg: string | undefined = undefined) => {
    if (formatMode === 'word' && editableRef.current) {
      editableRef.current.focus();
      document.execCommand(command, false, valueArg);
      onChange(editableRef.current.innerHTML);
    }
  };

  // Heading Handlers
  const handleInsertH1 = () => {
    setActiveHeading('h1');
    if (formatMode === 'word') {
      execWordCommand('formatBlock', '<h1>');
    } else {
      insertSnippet('<h1>', '</h1>', 'Main Heading Title');
    }
    showToast('Applied Heading 1 (H1)');
  };

  const handleInsertH2 = () => {
    setActiveHeading('h2');
    if (formatMode === 'word') {
      execWordCommand('formatBlock', '<h2>');
    } else {
      insertSnippet('<h2>', '</h2>', 'Section Heading');
    }
    showToast('Applied Heading 2 (H2)');
  };

  const handleInsertH3 = () => {
    setActiveHeading('h3');
    if (formatMode === 'word') {
      execWordCommand('formatBlock', '<h3>');
    } else {
      insertSnippet('<h3>', '</h3>', 'Sub-heading Title');
    }
    showToast('Applied Heading 3 (H3)');
  };

  const handleInsertBold = () => {
    if (formatMode === 'word') {
      execWordCommand('bold');
    } else {
      insertSnippet('<strong>', '</strong>', 'Bold text');
    }
    showToast('Bold formatting applied');
  };

  const handleInsertItalic = () => {
    if (formatMode === 'word') {
      execWordCommand('italic');
    } else {
      insertSnippet('<em>', '</em>', 'Italic text');
    }
    showToast('Italic formatting applied');
  };

  const handleInsertUnderline = () => {
    if (formatMode === 'word') {
      execWordCommand('underline');
    } else {
      insertSnippet('<u>', '</u>', 'Underlined text');
    }
    showToast('Underline applied');
  };

  const handleInsertUl = () => {
    if (formatMode === 'word') {
      execWordCommand('insertUnorderedList');
    } else {
      insertSnippet('<ul>\n  <li>', '</li>\n  <li>Point 2</li>\n</ul>', 'Point 1');
    }
    showToast('Unordered Bullet List added');
  };

  const handleInsertOl = () => {
    if (formatMode === 'word') {
      execWordCommand('insertOrderedList');
    } else {
      insertSnippet('<ol>\n  <li>', '</li>\n  <li>Step 2</li>\n</ol>', 'Step 1');
    }
    showToast('Ordered Numbered List added');
  };

  const handleInsertBlockquote = () => {
    if (formatMode === 'word') {
      execWordCommand('formatBlock', '<blockquote>');
    } else {
      insertSnippet('<blockquote>\n  "', '" — Financial Strategist\n</blockquote>', 'Important financial insight or quote text');
    }
    showToast('Blockquote added');
  };

  const handleInsertLink = () => {
    const url = prompt('Enter Destination Web URL:', 'https://thestocetimes.com');
    if (url) {
      if (formatMode === 'word') {
        execWordCommand('createLink', url);
      } else {
        insertSnippet(`<a href="${url}" target="_blank" rel="noreferrer">`, '</a>', 'Clickable Link Text');
      }
      showToast('Hyperlink inserted');
    }
  };

  const handleInsertImage = () => {
    if (onOpenMediaPicker) {
      onOpenMediaPicker();
    } else {
      const url = prompt('Enter Image URL:', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80');
      const caption = prompt('Enter Image Caption:', 'Stock market trends graph');
      if (url) {
        const snippet = `\n<figure class="my-4">\n  <img src="${url}" alt="${caption || 'Article chart'}" class="rounded-2xl w-full object-cover" />\n  <figcaption class="text-xs text-center text-slate-500 mt-2">${caption || ''}</figcaption>\n</figure>\n`;
        insertSnippet(snippet, '', '');
        showToast('Image figure inserted');
      }
    }
  };

  // Direct In-Article Image Upload with Real-time % Progress Indicator
  const handleSingleImageUploadWithProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadProgress(0);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    // Smooth progress simulation for fast local reads
    let currentPercent = 10;
    const progressInterval = setInterval(() => {
      currentPercent += Math.floor(Math.random() * 25) + 15;
      if (currentPercent >= 95) {
        currentPercent = 95;
        clearInterval(progressInterval);
      }
      setUploadProgress((prev) => (prev !== null && prev < currentPercent ? currentPercent : prev));
    }, 120);

    reader.onload = (event) => {
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          StorageService.addMediaItem({
            name: file.name,
            url: dataUrl,
            altText: file.name
          });

          const snippet = `\n<figure class="my-4">\n  <img src="${dataUrl}" alt="${file.name}" class="rounded-2xl w-full object-cover shadow-sm border border-slate-200" />\n  <figcaption class="text-xs text-center text-slate-500 mt-2 font-medium">${file.name}</figcaption>\n</figure>\n`;
          insertSnippet(snippet, '', '');
          showToast(`Image "${file.name}" uploaded 100% & inserted!`);
        }
        setUploadProgress(null);
        setUploadFileName('');
      }, 400);
    };

    reader.readAsDataURL(file);
  };

  const handleBulkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const imagesHtml: string[] = [];
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
            imagesHtml.push(`
<figure class="my-4">
  <img src="${dataUrl}" alt="${file.name}" class="rounded-2xl w-full object-cover shadow-sm border border-slate-200" />
  <figcaption class="text-xs text-center text-slate-500 mt-2 font-medium">${file.name}</figcaption>
</figure>`);
            processed++;

            if (processed === files.length) {
              const fullSnippet = `\n<div class="space-y-4 my-6">\n${imagesHtml.join('\n')}\n</div>\n`;
              insertSnippet(fullSnippet, '', '');
              showToast(`${files.length} images uploaded & inserted into article!`);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `\n<div class="overflow-x-auto my-4">\n<table class="w-full text-xs text-left border-collapse border border-slate-200">
  <thead class="bg-slate-100 font-bold text-slate-800">
    <tr>
      <th class="p-2 border border-slate-200">Asset Class / Metric</th>
      <th class="p-2 border border-slate-200">Current Yield</th>
      <th class="p-2 border border-slate-200">Benchmark Return</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border border-slate-200">Fixed Deposit (FD)</td>
      <td class="p-2 border border-slate-200">7.50%</td>
      <td class="p-2 border border-slate-200">7.75%</td>
    </tr>
    <tr>
      <td class="p-2 border border-slate-200">Nifty 50 Index Fund</td>
      <td class="p-2 border border-slate-200">14.20%</td>
      <td class="p-2 border border-slate-200">15.10%</td>
    </tr>
  </tbody>
</table>\n</div>\n`;
    insertSnippet(tableHtml, '', '');
    showToast('Data Table inserted');
  };

  const handleInsertHighlightBox = () => {
    const boxHtml = `\n<div class="bg-emerald-50/80 border-l-4 border-[#16A34A] p-4 my-4 rounded-r-2xl shadow-sm">
  <h4 class="font-extrabold text-[#0B1F33] text-sm flex items-center gap-1.5 font-serif">
    💡 Executive Takeaway
  </h4>
  <p class="text-xs text-slate-700 mt-1 font-medium leading-relaxed">
    Write key financial summary point or investment decision insight here.
  </p>
</div>\n`;
    insertSnippet(boxHtml, '', '');
    showToast('Highlight Takeaway Box inserted');
  };

  const handleParagraphChange = (type: string) => {
    setParagraphType(type);
    if (type === 'Heading 1') handleInsertH1();
    else if (type === 'Heading 2') handleInsertH2();
    else if (type === 'Heading 3') handleInsertH3();
    else if (formatMode === 'word') execWordCommand('formatBlock', '<p>');
  };

  // Handle live typing inside contentEditable Word Mode
  const handleEditableInput = () => {
    if (editableRef.current) {
      onChange(editableRef.current.innerHTML);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="space-y-2 font-sans relative"
    >
      {/* DRAG & DROP OVERLAY TARGET */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-emerald-950/90 backdrop-blur-xs border-2 border-dashed border-emerald-400 rounded-3xl flex flex-col items-center justify-center text-white p-6 animate-in fade-in space-y-3 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-bounce">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold font-serif text-white">Drop Images Here to Upload & Place</h3>
          <p className="text-xs text-emerald-300 font-mono">Images will automatically upload with % progress bar and place into article!</p>
        </div>
      )}
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute -top-8 right-0 bg-[#0B1F33] text-emerald-400 text-xs font-bold px-3 py-1 rounded-lg shadow-md animate-in fade-in flex items-center gap-1.5 border border-emerald-800 z-50">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Canvas Top Outer Title */}
      <div className="flex items-center justify-between px-1">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 font-sans">
          ARTICLE CONTENT CANVAS <span className="text-rose-500">*</span>
        </label>
      </div>

      {/* Main Container Card */}
      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        
        {/* ==========================================
            TOP TOOLBAR (Matching User Screenshot)
           ========================================== */}
        <div className="bg-slate-50/90 border-b border-slate-200 p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
          
          {/* LEFT GROUP: Formatting Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={handleInsertH1}
              className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeHeading === 'h1' ? 'text-slate-900 bg-slate-200' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Heading 1 (H1)"
            >
              H1
            </button>
            <button
              type="button"
              onClick={handleInsertH2}
              className={`px-2 py-1 rounded-lg font-extrabold transition-all cursor-pointer ${
                activeHeading === 'h2' ? 'text-[#16A34A] bg-emerald-50 font-black' : 'text-slate-600 hover:text-[#16A34A]'
              }`}
              title="Heading 2 (H2)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={handleInsertH2}
              className="px-1.5 py-1 rounded-lg text-slate-400 font-medium hover:text-slate-700 cursor-pointer"
              title="Heading 2 Sub"
            >
              H2
            </button>
            <button
              type="button"
              onClick={handleInsertH3}
              className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeHeading === 'h3' ? 'text-slate-900 bg-slate-200' : 'text-slate-800 hover:bg-slate-100'
              }`}
              title="Heading 3 (H3)"
            >
              H3
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1"></div>

            <button
              type="button"
              onClick={handleInsertBold}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 font-serif font-extrabold text-sm transition-all cursor-pointer"
              title="Bold Text"
            >
              B
            </button>
            <button
              type="button"
              onClick={handleInsertItalic}
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 font-serif italic text-sm transition-all cursor-pointer"
              title="Italic Text"
            >
              I
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1"></div>

            <button
              type="button"
              onClick={handleInsertUl}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              title="Unordered List (ul)"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleInsertOl}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              title="Ordered List (ol)"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleInsertBlockquote}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-all cursor-pointer font-serif font-black"
              title="Quote Block (blockquote)"
            >
              <Quote className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-slate-300 mx-1"></div>

            <button
              type="button"
              onClick={handleInsertLink}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
              title="Insert Hyperlink"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleInsertImage}
              className="px-2.5 py-1 rounded-lg text-[#16A34A] hover:bg-emerald-50 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Insert Single Image from Media Library"
            >
              <ImageIcon className="w-4 h-4 text-[#16A34A]" />
              <span>Image</span>
            </button>

            <label
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Upload Single Image directly with Real-Time % Progress Indicator"
            >
              <Upload className="w-4 h-4 text-white" />
              <span>📷 Upload Image (%)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSingleImageUploadWithProgress}
              />
            </label>

            <label
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#16A34A] hover:bg-emerald-100 font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border border-[#16A34A]/40 shadow-xs"
              title="Upload & Insert Multiple Images from Device Gallery at Once"
            >
              <Upload className="w-4 h-4 text-[#16A34A]" />
              <span>+ Bulk Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleBulkImageUpload}
              />
            </label>

            <button
              type="button"
              onClick={handleInsertTable}
              className="px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-200 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="Insert Table"
            >
              <TableIcon className="w-4 h-4 text-slate-600" />
              <span>Table</span>
            </button>

            <button
              type="button"
              onClick={handleInsertHighlightBox}
              className="px-3 py-1 rounded-full bg-emerald-50/90 text-[#16A34A] border border-[#16A34A]/40 font-extrabold flex items-center gap-1.5 shadow-sm hover:bg-emerald-100 transition-all cursor-pointer ml-1"
              title="Insert Executive Takeaway Callout Box"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A] fill-[#16A34A]" />
              <span>Highlight Box</span>
            </button>
          </div>

          {/* RIGHT GROUP: View Toggle Segment & Format Mode Tabs */}
          <div className="flex items-center gap-3">
            
            {/* View Mode Toggle Controls */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold font-sans">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'source' ? 'split' : 'source')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'source' || viewMode === 'split' 
                    ? 'bg-white text-slate-900 shadow-sm font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-slate-600" />
                <span>Source Code</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'preview' ? 'split' : 'preview')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'preview' || viewMode === 'split'
                    ? 'bg-white text-[#16A34A] shadow-sm font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Live Render Preview</span>
              </button>
            </div>

            {/* FORMAT MODE TABS (HTML vs Word) */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-100 font-bold text-xs">
              <button
                type="button"
                onClick={() => {
                  setFormatMode('html');
                  showToast('Switched to HTML Source Mode');
                }}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  formatMode === 'html'
                    ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>HTML</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormatMode('word');
                  showToast('Switched to MS Word WYSIWYG Mode');
                }}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  formatMode === 'word'
                    ? 'bg-blue-50 text-[#155EEF] border border-blue-200 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="font-serif italic font-extrabold text-[#155EEF]">W</span>
                <span>Word</span>
              </button>
            </div>

          </div>

        </div>

        {/* REAL-TIME UPLOAD PROGRESS INDICATOR CARD (%) */}
        {uploadProgress !== null && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-emerald-500/50 shadow-xl space-y-2 animate-in fade-in my-3 font-sans">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>Uploading Image: <code className="text-emerald-300 font-mono">{uploadFileName}</code></span>
              </span>
              <span className="font-mono text-emerald-400 font-extrabold text-sm">{uploadProgress}%</span>
            </div>

            {/* Dynamic Progress Bar Bar */}
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-150 shadow-sm"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>{uploadProgress === 100 ? '✅ Upload 100% Complete! Inserting into article...' : 'Reading image file data...'}</span>
              <span className="text-emerald-400 font-bold">{uploadProgress}% / 100%</span>
            </div>
          </div>
        )}


        {/* ==========================================
            CANVAS EDITOR BODY (Dual View / Split View)
           ========================================== */}
        <div className={`grid grid-cols-1 ${viewMode === 'split' ? 'md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200' : ''}`}>
          
          {/* LEFT PANEL: Source Code HTML Editor Textarea */}
          {(viewMode === 'source' || viewMode === 'split') && (
            <div className="p-4 bg-white flex flex-col">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>HTML CODE EDITOR</span>
                <span className="text-slate-400 font-normal">Editing Raw Tags</span>
              </div>
              <textarea
                ref={textareaRef}
                id="rich-editor-textarea"
                rows={16}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="<h2>Introduction</h2>..."
                className="w-full h-full min-h-[360px] font-mono text-xs text-slate-800 leading-relaxed focus:outline-none resize-none bg-transparent"
              />
            </div>
          )}

          {/* RIGHT PANEL: Live Render Preview / Word Interactive Canvas */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex flex-col bg-white">
              
              {/* Mini Rich Text Formatting Toolbar */}
              <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-2 text-xs text-slate-700 select-none">
                
                {/* Paragraph Dropdown */}
                <div className="relative inline-block">
                  <select 
                    value={paragraphType} 
                    onChange={(e) => handleParagraphChange(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer pr-6 appearance-none shadow-sm"
                  >
                    <option value="Paragraph">Paragraph</option>
                    <option value="Heading 1">Heading 1</option>
                    <option value="Heading 2">Heading 2</option>
                    <option value="Heading 3">Heading 3</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                </div>

                <div className="w-px h-4 bg-slate-300 mx-1"></div>

                <button 
                  type="button" 
                  onClick={handleInsertBold}
                  className="p-1.5 rounded-lg hover:bg-slate-200 font-bold transition-all cursor-pointer" 
                  title="Bold"
                >
                  <span className="font-extrabold">B</span>
                </button>

                <button 
                  type="button" 
                  onClick={handleInsertItalic}
                  className="p-1.5 rounded-lg hover:bg-slate-200 italic transition-all cursor-pointer" 
                  title="Italic"
                >
                  <span className="font-serif italic font-bold">I</span>
                </button>

                <button 
                  type="button" 
                  onClick={handleInsertUnderline}
                  className="p-1.5 rounded-lg hover:bg-slate-200 underline transition-all cursor-pointer" 
                  title="Underline"
                >
                  <span className="underline font-bold">U</span>
                </button>

                <div className="w-px h-4 bg-slate-300 mx-1"></div>

                <button 
                  type="button" 
                  onClick={() => execWordCommand('justifyLeft')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer" 
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => execWordCommand('justifyCenter')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer" 
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => execWordCommand('justifyRight')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer" 
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => execWordCommand('justifyFull')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer" 
                  title="Justify"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>

                <span className="text-[10px] font-mono text-[#155EEF] font-bold ml-auto bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {formatMode === 'word' ? '✏️ EDITABLE WORD MODE' : '👁️ LIVE PREVIEW'}
                </span>
              </div>

              {/* Rendered HTML Output View (Editable in Word Mode) */}
              <div className="p-6 min-h-[360px] max-h-[500px] overflow-y-auto article-body font-sans text-slate-900 leading-relaxed">
                {formatMode === 'word' ? (
                  <div
                    ref={editableRef}
                    contentEditable={true}
                    onInput={handleEditableInput}
                    className="focus:outline-none min-h-[300px]"
                  />
                ) : (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: value || '<p class="text-slate-400 italic">Write detailed financial research and analysis here...</p>' 
                    }} 
                  />
                )}
              </div>

            </div>
          )}

        </div>

        {/* ==========================================
            FOOTER STATUS BAR
           ========================================== */}
        <div className="bg-slate-50/90 border-t border-slate-200 px-4 py-2.5 text-[11px] text-slate-500 font-mono flex items-center justify-between select-none">
          <span>Clean SEO HTML Output • {value.length} characters</span>
          <span className="hidden sm:inline">Supports H2, H3, Tables, Images, Lists, Quotes</span>
        </div>

      </div>
    </div>
  );
};
