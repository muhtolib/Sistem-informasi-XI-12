import React, { useState } from "react";
import { LibraryBook } from "../types";
import { initialLibraryBooks } from "../data/mockData";
import { Search, BookMarked, Bookmark, ChevronRight, BookOpen, ExternalLink, HelpCircle } from "lucide-react";

interface DigitalLibraryProps {
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  onAwardXP: (amount: number, reason: string) => void;
}

export const DigitalLibrary: React.FC<DigitalLibraryProps> = ({ onAddToast, onAwardXP }) => {
  const [books, setBooks] = useState<LibraryBook[]>(initialLibraryBooks);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("Semua");
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(initialLibraryBooks[0] || null);

  const toggleBookmark = (id: string) => {
    setBooks(
      books.map((b) => {
        if (b.id === id) {
          const newState = !b.bookmarked;
          onAddToast(newState ? `Buku "${b.title}" ditambahkan ke rak bookmark` : `Buku "${b.title}" dihapus dari bookmark`, "info");
          if (newState) {
            onAwardXP(10, `Menyimpan referensi buku: ${b.title}`);
          }
          return { ...b, bookmarked: newState };
        }
        return b;
      })
    );
  };

  const filtered = books.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === "Semua" || b.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Search and book grid */}
      <div className="lg:col-span-2 sleek-card rounded-3xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="bg-transparent text-xs text-slate-700 dark:text-slate-150 focus:outline-none w-full"
              placeholder="Cari judul buku atau penulis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-1">
            {["Semua", "Fisika", "Matematika", "Sosiologi"].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`text-[10px] font-bold py-1 px-3 rounded-lg transition-all ${
                  selectedSubject === subj
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[440px] overflow-y-auto pr-1">
          {filtered.map((book) => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className={`p-3.5 rounded-xl border flex gap-4 text-left transition-all cursor-pointer ${
                selectedBook?.id === book.id
                  ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-sm"
                  : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
              }`}
            >
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-14 h-20 rounded object-cover shadow border shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                    {book.subject}
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 mt-1.5 truncate">{book.title}</h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Penulis: {book.author}</span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-[9px] font-mono text-slate-400">{book.pages} Halaman</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(book.id);
                    }}
                    className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  >
                    {book.bookmarked ? <BookMarked className="w-3.5 h-3.5 text-blue-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Book reader detail preview */}
      <div className="lg:col-span-1 sleek-card rounded-3xl p-5 shadow-sm">
        {selectedBook ? (
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col items-center text-center p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
              <img
                src={selectedBook.coverUrl}
                alt={selectedBook.title}
                className="w-24 h-36 rounded shadow-lg object-cover mb-3"
              />
              <strong className="text-slate-800 dark:text-slate-100 font-bold block text-sm leading-snug">{selectedBook.title}</strong>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Karya {selectedBook.author}</span>
            </div>

            <div className="flex flex-col gap-2 leading-relaxed text-slate-600 dark:text-slate-300">
              <strong className="text-slate-700 dark:text-slate-200 block font-semibold">Sinopsis / Ringkasan Buku:</strong>
              <p className="text-[11px]">
                Buku referensi lengkap mata pelajaran {selectedBook.subject} kurikulum nasional SMA. Berisi soal latihan pembinaan olimpiade, pendalaman materi esai, serta panduan praktikum laboratorium terakreditasi Kemendikbud.
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => onAddToast(`Membuka pembaca digital untuk buku "${selectedBook.title}"`, "success")}
                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors shadow"
              >
                <BookOpen className="w-4 h-4" /> Baca Buku Online
              </button>
              <button
                onClick={() => onAddToast("Mengunduh modul PDF untuk dibaca offline", "success")}
                className="w-full py-2 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 font-semibold rounded-xl flex items-center justify-center gap-1 hover:bg-slate-100 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Ambil E-Book (PDF)
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            Pilih buku untuk melihat detail ulasan dan membacanya secara daring harian.
          </div>
        )}
      </div>
    </div>
  );
};
