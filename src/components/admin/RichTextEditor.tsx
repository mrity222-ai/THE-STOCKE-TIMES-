import React, { useEffect, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Code2,
  Eye,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Table as TableIcon,
  Type,
  Underline,
  Undo2,
  Upload
} from 'lucide-react';
import { optimizeImageFile } from '../../utils/imageUpload';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

type EditorMode = 'compose' | 'html' | 'preview';

const emptyContent = '<p>Write detailed financial research and analysis here...</p>';

const escapeHtml = (input: string) =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const imageFigureHtml = (url: string, altText: string, caption?: string) => `\n<figure class="my-5 text-center">
  <img src="${url}" alt="${escapeHtml(altText)}" class="w-full rounded-2xl border border-slate-200 object-cover shadow-sm" />
  ${
    caption
      ? `<figcaption class="mt-2 text-xs italic text-slate-500">${escapeHtml(caption)}</figcaption>`
      : ''
  }
</figure>\n`;

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [mode, setMode] = useState<EditorMode>('compose');
  const [toastMsg, setToastMsg] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastEmittedHtmlRef = useRef(value || '');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(''), 2200);
  };

  useEffect(() => {
    if (mode !== 'compose' || !editorRef.current) return;

    const nextValue = value || emptyContent;
    if (value !== lastEmittedHtmlRef.current && editorRef.current.innerHTML !== nextValue) {
      editorRef.current.innerHTML = nextValue;
      lastEmittedHtmlRef.current = value || '';
    }
  }, [mode, value]);

  useEffect(() => {
    if (mode === 'compose' && editorRef.current && editorRef.current.innerHTML !== (value || emptyContent)) {
      editorRef.current.innerHTML = value || emptyContent;
    }
  }, [mode, value]);

  const emitEditorHtml = () => {
    const html = editorRef.current?.innerHTML || '';
    lastEmittedHtmlRef.current = html;
    onChange(html);
  };

  const setHtmlValue = (html: string) => {
    lastEmittedHtmlRef.current = html;
    onChange(html);
  };

  const focusEditor = () => {
    if (mode !== 'compose') {
      setMode('compose');
      window.setTimeout(() => editorRef.current?.focus(), 0);
      return;
    }
    editorRef.current?.focus();
  };

  const runCommand = (command: string, commandValue?: string) => {
    focusEditor();
    window.setTimeout(() => {
      document.execCommand(command, false, commandValue);
      emitEditorHtml();
    }, 0);
  };

  const insertHtml = (html: string) => {
    if (mode === 'compose' && editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      const hasEditorSelection =
        !!selection?.rangeCount && !!selection.anchorNode && editorRef.current.contains(selection.anchorNode);

      if (hasEditorSelection) {
        document.execCommand('insertHTML', false, html);
      } else {
        editorRef.current.insertAdjacentHTML('beforeend', html);
      }
      emitEditorHtml();
      return;
    }

    setHtmlValue(`${value || ''}${html}`);
  };

  const handleBlock = (tagName: 'p' | 'h1' | 'h2' | 'h3') => {
    runCommand('formatBlock', tagName);
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter destination URL:', 'https://');
    if (!url) return;

    const selectedText = window.getSelection()?.toString();
    if (!selectedText) {
      insertHtml(`<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Link text</a>`);
      showToast('Link inserted');
      return;
    }

    runCommand('createLink', url);
    showToast('Link inserted');
  };

  const handleImageFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!imageFiles.length) return;

    setUploadFileName(imageFiles.length === 1 ? imageFiles[0].name : `${imageFiles.length} images`);
    setUploadProgress(8);

    try {
      const snippets: string[] = [];
      for (let index = 0; index < imageFiles.length; index += 1) {
        const file = imageFiles[index];
        const baseProgress = Math.round((index / imageFiles.length) * 100);
        const fileShare = 100 / imageFiles.length;
        const optimized = await optimizeImageFile(file, {
          maxWidth: 1280,
          maxHeight: 1280,
          quality: 0.76,
          onProgress: (fileProgress) => {
            setUploadProgress(Math.min(99, Math.round(baseProgress + (fileProgress / 100) * fileShare)));
          }
        });
        const dataUrl = optimized.dataUrl;
        setUploadProgress(Math.min(99, Math.round(baseProgress + fileShare)));

        snippets.push(imageFigureHtml(dataUrl, file.name, file.name.replace(/\.[^/.]+$/, '')));
      }

      setUploadProgress(100);
      insertHtml(snippets.join('\n'));
      window.setTimeout(() => {
        setUploadProgress(null);
        setUploadFileName('');
      }, 450);
      showToast(`${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} inserted`);
    } catch (error) {
      console.error('Image upload failed:', error);
      setUploadProgress(null);
      setUploadFileName('');
      showToast('Image upload failed. Try a smaller image.');
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      void handleImageFiles(files);
    }
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    if (event.dataTransfer.files?.length) {
      void handleImageFiles(event.dataTransfer.files);
    }
  };

  const handleInsertTable = () => {
    insertHtml(`\n<div class="overflow-x-auto my-5">
  <table class="w-full border-collapse text-left text-sm">
    <thead>
      <tr>
        <th class="border border-slate-200 bg-slate-50 p-2">Metric</th>
        <th class="border border-slate-200 bg-slate-50 p-2">Value</th>
        <th class="border border-slate-200 bg-slate-50 p-2">Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-200 p-2">Example</td>
        <td class="border border-slate-200 p-2">0.00%</td>
        <td class="border border-slate-200 p-2">Write details here</td>
      </tr>
    </tbody>
  </table>
</div>\n`);
    showToast('Table inserted');
  };

  const handleInsertQuote = () => {
    insertHtml('\n<blockquote><p>Write an important quote or market insight here.</p></blockquote>\n');
    showToast('Quote inserted');
  };

  const handleInsertDivider = () => {
    insertHtml('\n<hr />\n');
    showToast('Divider inserted');
  };

  const toolbarButtonClass =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-transparent px-2 text-xs font-bold text-slate-700 transition hover:border-slate-200 hover:bg-slate-100';

  return (
    <div
      className="relative space-y-2 font-sans"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDraggingOver(false);
      }}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-950/90 p-6 text-white">
          <Upload className="mb-3 h-8 w-8 text-emerald-300" />
          <p className="text-sm font-extrabold">Drop images to insert into article</p>
          <p className="text-xs text-emerald-200">Single or multiple images are supported.</p>
        </div>
      )}

      {toastMsg && (
        <div className="absolute -top-8 right-0 z-50 flex items-center gap-1.5 rounded-lg border border-emerald-800 bg-slate-950 px-3 py-1 text-xs font-bold text-emerald-300 shadow-md">
          <Check className="h-3.5 w-3.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/90 p-2.5">
          <div className="flex flex-wrap items-center gap-1">
            <button type="button" onClick={() => handleBlock('p')} className={toolbarButtonClass} title="Paragraph">
              <Type className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => handleBlock('h1')} className={toolbarButtonClass} title="Heading 1">
              H1
            </button>
            <button type="button" onClick={() => handleBlock('h2')} className={toolbarButtonClass} title="Heading 2">
              H2
            </button>
            <button type="button" onClick={() => handleBlock('h3')} className={toolbarButtonClass} title="Heading 3">
              H3
            </button>

            <div className="mx-1 h-5 w-px bg-slate-300" />

            <button type="button" onClick={() => runCommand('bold')} className={toolbarButtonClass} title="Bold">
              <Bold className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => runCommand('italic')} className={toolbarButtonClass} title="Italic">
              <Italic className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => runCommand('underline')} className={toolbarButtonClass} title="Underline">
              <Underline className="h-4 w-4" />
            </button>

            <div className="mx-1 h-5 w-px bg-slate-300" />

            <button type="button" onClick={() => runCommand('insertUnorderedList')} className={toolbarButtonClass} title="Bulleted list">
              <List className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => runCommand('insertOrderedList')} className={toolbarButtonClass} title="Numbered list">
              <ListOrdered className="h-4 w-4" />
            </button>
            <button type="button" onClick={handleInsertQuote} className={toolbarButtonClass} title="Quote">
              <Quote className="h-4 w-4" />
            </button>

            <div className="mx-1 h-5 w-px bg-slate-300" />

            <button type="button" onClick={() => runCommand('justifyLeft')} className={toolbarButtonClass} title="Align left">
              <AlignLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => runCommand('justifyCenter')} className={toolbarButtonClass} title="Align center">
              <AlignCenter className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => runCommand('justifyRight')} className={toolbarButtonClass} title="Align right">
              <AlignRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => runCommand('justifyFull')} className={toolbarButtonClass} title="Justify">
              <AlignJustify className="h-4 w-4" />
            </button>

            <div className="mx-1 h-5 w-px bg-slate-300" />

            <button type="button" onClick={handleInsertLink} className={toolbarButtonClass} title="Insert link">
              <LinkIcon className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className={toolbarButtonClass} title="Insert image from computer">
              <ImageIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-extrabold text-white transition hover:bg-emerald-500"
              title="Upload one or multiple images from local computer"
            >
              <Upload className="h-4 w-4" />
              Upload from Computer
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
            <button type="button" onClick={handleInsertTable} className={toolbarButtonClass} title="Insert table">
              <TableIcon className="h-4 w-4" />
            </button>
            <button type="button" onClick={handleInsertDivider} className={toolbarButtonClass} title="Divider">
              <Minus className="h-4 w-4" />
            </button>

            <div className="mx-1 h-5 w-px bg-slate-300" />

            <button type="button" onClick={() => runCommand('undo')} className={toolbarButtonClass} title="Undo">
              <Undo2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => runCommand('redo')} className={toolbarButtonClass} title="Redo">
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('compose')}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 ${
                mode === 'compose' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              Compose
            </button>
            <button
              type="button"
              onClick={() => setMode('html')}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 ${
                mode === 'html' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              HTML
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 ${
                mode === 'preview' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>
        </div>

        {uploadProgress !== null && (
          <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>{uploadFileName}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {mode === 'compose' && (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emitEditorHtml}
            onBlur={emitEditorHtml}
            className="article-body min-h-[520px] w-full overflow-y-auto bg-white p-6 text-slate-900 outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
          />
        )}

        {mode === 'html' && (
          <textarea
            ref={textareaRef}
            rows={22}
            value={value}
            onChange={(event) => setHtmlValue(event.target.value)}
            className="min-h-[520px] w-full resize-y bg-slate-950 p-5 font-mono text-xs leading-relaxed text-emerald-100 outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            placeholder="<h2>Introduction</h2>"
          />
        )}

        {mode === 'preview' && (
          <div
            className="article-body min-h-[520px] bg-white p-6 text-slate-900"
            dangerouslySetInnerHTML={{ __html: value || emptyContent }}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-mono text-slate-500">
          <span>{value.length} characters</span>
          <span>Compose, HTML, preview, tables, links and local computer image upload</span>
        </div>
      </div>
    </div>
  );
};
