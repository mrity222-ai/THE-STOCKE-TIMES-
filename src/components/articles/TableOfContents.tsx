import React, { useEffect, useState } from 'react';
import { List, ChevronRight, Bookmark } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentHtml: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ contentHtml }) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse HTML string to find h2 and h3 elements
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3');

    const items: TocItem[] = Array.from(headingElements).map((el, index) => {
      const text = el.textContent || `Section ${index + 1}`;
      const id = el.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return {
        id,
        text,
        level: el.tagName === 'H2' ? 2 : 3
      };
    });

    setHeadings(items);
    if (items.length > 0) setActiveId(items[0].id);
  }, [contentHtml]);

  // Active section observer on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    setActiveId(id);
    const target = document.getElementById(id);
    if (target) {
      const yOffset = -100;
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm sticky top-28 space-y-3 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-[#0B1F33]">
          <List className="w-4 h-4 text-[#16A34A]" />
          <span className="font-extrabold text-xs tracking-wider uppercase">TABLE OF CONTENTS</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono font-bold">{headings.length} Sections</span>
      </div>

      <ul className="space-y-1 text-xs max-h-[65vh] overflow-y-auto pr-1">
        {headings.map((item) => (
          <li key={item.id} style={{ paddingLeft: item.level === 3 ? '12px' : '0px' }}>
            <button
              onClick={() => scrollToHeading(item.id)}
              className={`text-left w-full py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between font-medium ${
                activeId === item.id
                  ? 'bg-emerald-50 text-[#16A34A] font-bold border-l-4 border-[#16A34A] shadow-sm'
                  : 'text-slate-600 hover:text-[#0B1F33] hover:bg-slate-50'
              }`}
            >
              <span className="line-clamp-2 leading-snug">{item.text}</span>
              {activeId === item.id && <ChevronRight className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
