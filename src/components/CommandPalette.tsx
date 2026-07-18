import React, { useState, useEffect, useRef } from "react";
import { Search, Command, ArrowRight } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
  features: { id: string; label: string; category: string; description: string }[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  features,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearchQuery("");
    }
  }, [isOpen]);

  const filtered = searchQuery
    ? features.filter(
        (f) =>
          f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : features;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-base"
            placeholder="Cari menu, fitur, atau administrasi... (Esc untuk menutup)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-400 shadow-inner">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[350px] overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <div className="flex flex-col gap-1">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors group"
                >
                  <div>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-0.5">
                      {item.category}
                    </span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100 block">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">
                      {item.description}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-400">
              Tidak ada hasil untuk &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Footer Guidance */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 font-mono">
          <span>Gunakan panah ↑↓ untuk navigasi, Enter untuk memilih</span>
          <span>WaliKelas SMA v1.0</span>
        </div>
      </div>
    </div>
  );
};
