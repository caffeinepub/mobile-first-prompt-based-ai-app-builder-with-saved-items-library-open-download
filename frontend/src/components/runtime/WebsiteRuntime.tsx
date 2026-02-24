import React, { useState } from 'react';
import { Globe, ChevronRight } from 'lucide-react';

interface WebsitePage {
  title: string;
  content: string;
  sections?: Array<{ heading: string; body: string }>;
}

interface WebsiteData {
  title?: string;
  description?: string;
  pages?: WebsitePage[];
  theme?: string;
}

interface WebsiteRuntimeProps {
  data?: WebsiteData;
}

export default function WebsiteRuntime({ data }: WebsiteRuntimeProps) {
  const pages = data?.pages || [
    { title: 'Home', content: data?.description || 'Welcome to this website.' },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const activePage = pages[activeIndex];

  return (
    <div className="flex flex-col min-h-[480px] bg-muted/20">
      {/* Browser Chrome */}
      <div className="bg-white border-b border-border px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
          <Globe className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {data?.title?.toLowerCase().replace(/\s+/g, '-') || 'my-website'}.app
          </span>
        </div>
      </div>

      {/* Site Header */}
      <div className="bg-[var(--primary)] text-white px-6 py-4">
        <h1 className="font-display text-lg font-bold">{data?.title || 'My Website'}</h1>
        {data?.description && (
          <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{data.description}</p>
        )}
      </div>

      {/* Navigation Tabs */}
      {pages.length > 1 && (
        <div className="bg-white border-b border-border px-4 flex gap-0 overflow-x-auto">
          {pages.map((page, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                activeIndex === i
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {page.title}
            </button>
          ))}
        </div>
      )}

      {/* Page Content */}
      <div className="flex-1 bg-white p-6 overflow-y-auto">
        {activePage?.sections?.length ? (
          <div className="space-y-6 max-w-2xl">
            {activePage.sections.map((section, i) => (
              <div key={i}>
                <h2 className="font-display text-base font-bold text-foreground mb-2 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-[var(--accent)]" />
                  {section.heading}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6">{section.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">{activePage?.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{activePage?.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}
