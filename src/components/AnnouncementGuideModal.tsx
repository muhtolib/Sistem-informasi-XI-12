import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Megaphone,
  Calendar,
  User,
  Plus,
  Trash2,
  Info,
  ShieldAlert,
  Save,
  Sparkles,
  Edit2
} from "lucide-react";
import { AnnouncementItem } from "../types";

interface AnnouncementGuideModalProps {
  announcements: AnnouncementItem[];
  onUpdateAnnouncements: (updated: AnnouncementItem[]) => void;
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  onClose: () => void;
  currentRole: string;
}

export const AnnouncementGuideModal: React.FC<AnnouncementGuideModalProps> = ({
  announcements,
  onUpdateAnnouncements,
  onAddToast,
  onClose,
  currentRole,
}) => {
  const [activeTab, setActiveTab] = useState<"guide" | "editor">("guide");
  
  // Form fields for adding/editing an announcement
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [author, setAuthor] = useState("");

  const handleSaveItem = () => {
    if (!title || !date || !author) {
      onAddToast("Mohon lengkapi seluruh field pengumuman!", "warning");
      return;
    }

    if (editingId) {
      // Edit existing
      const updated = announcements.map(ann => {
        if (ann.id === editingId) {
          return { ...ann, title, date, author };
        }
        return ann;
      });
      onUpdateAnnouncements(updated);
      onAddToast(`Berhasil memperbarui pengumuman "${title}"!`, "success");
      setEditingId(null);
    } else {
      // Add new
      const newItem: AnnouncementItem = {
        id: `ann-${Date.now()}`,
        title,
        date,
        author
      };
      onUpdateAnnouncements([newItem, ...announcements]); // latest first
      onAddToast(`Berhasil menerbitkan pengumuman baru!`, "success");
    }

    // Reset form
    setTitle("");
    setDate("");
    setAuthor("");
  };

  const handleDeleteItem = (id: string) => {
    const updated = announcements.filter(ann => ann.id !== id);
    onUpdateAnnouncements(updated);
    onAddToast("Pengumuman berhasil dihapus.", "info");
  };

  const startEdit = (ann: AnnouncementItem) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setDate(ann.date);
    setAuthor(ann.author);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setAuthor("");
  };

  const isAuthorized = currentRole === "Homeroom Teacher" || currentRole === "Administrator";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-250 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Megaphone className="w-5 h-5 text-emerald-100 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Panduan & Manajemen Pengumuman Terkini</h3>
              <p className="text-[10px] text-emerald-100 mt-0.5">Diseminasi Informasi Akademik Kelas XI-12 SMAN 1 Nagreg</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/85 hover:text-white hover:bg-white/15 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inner Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-3 bg-slate-50/50 dark:bg-slate-950/20">
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-4 py-2.5 text-xs font-bold transition-all relative ${
              activeTab === "guide"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Cara Mengubah Pengumuman
            {activeTab === "guide" && (
              <motion.div
                layoutId="activeAnnTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("editor")}
            className={`px-4 py-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === "editor"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Ubah Pengumuman Langsung
            {activeTab === "editor" && (
              <motion.div
                layoutId="activeAnnTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400"
              />
            )}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === "guide" ? (
              <motion.div
                key="guide"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                {/* Intro Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 flex gap-3 text-left">
                  <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Sistem Pengumuman Papan Informasi Kelas</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Papan pengumuman adalah rujukan utama siswa kelas XI-12 dalam memantau tugas penting, koordinasi agenda, maupun imbauan resmi wali kelas. Agar informasi tetap akurat, perubahan konten dibatasi hanya untuk akun <strong className="text-slate-700 dark:text-slate-300">Wali Kelas</strong> atau <strong className="text-slate-700 dark:text-slate-300">Administrator</strong>.
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Langkah-Langkah Mengubah/Menambah Pengumuman:</h4>

                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900">
                      1
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Akses Dasbor Utama Portal</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Papan "Pengumuman Terkini" berada di sebelah kanan dasbor utama portal akademis Anda.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900">
                      2
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Gunakan Tab "Ubah Pengumuman Langsung"</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Klik tab <strong className="text-slate-700 dark:text-slate-300">"Ubah Pengumuman Langsung"</strong> di atas. Jika Anda berwenang, Anda dapat mengisi judul pengumuman, tanggal terbit, dan nama pembuat pengumuman (misalnya nama Guru BK, Wali Kelas, atau Guru Mapel).
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900">
                      3
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Publikasikan Seketika</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Klik tombol simpan atau tambah untuk memperbarui pengumuman. Siswa akan langsung melihat pengumuman tersebut di beranda utama mereka seketika setelah diperbarui.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/30 text-[10px] text-amber-600 dark:text-amber-400 flex gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Verifikasi Hak Akses:</strong> Peran aktif Anda adalah <strong>{currentRole}</strong>. {isAuthorized ? "Anda memiliki hak akses penuh untuk mengubah papan informasi." : "Anda hanya diizinkan melihat panduan ini."}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5 flex flex-col"
              >
                {!isAuthorized ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-150 dark:border-slate-850 p-6">
                    <ShieldAlert className="w-10 h-10 text-rose-500 mb-2.5" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Akses Ditolak</h4>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                      Anda terdaftar sebagai <strong>{currentRole}</strong>. Hanya <strong>Wali Kelas / Administrator</strong> yang dapat mengubah atau menerbitkan pengumuman resmi kelas harian.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Announcement Editor Form */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        {editingId ? "Edit Detail Pengumuman" : "Buat Pengumuman Baru"}
                      </span>

                      <div className="grid grid-cols-1 gap-3">
                        {/* Title */}
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Isi Pengumuman</label>
                          <input
                            type="text"
                            placeholder="Contoh: Rapat Wali Siswa Pembagian Raport Smt Ganjil"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Date */}
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Tanggal Terbit</label>
                            <input
                              type="text"
                              placeholder="Contoh: 18 Juli"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>

                          {/* Author */}
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Penerbit Pengumuman</label>
                            <input
                              type="text"
                              placeholder="Contoh: Wali Kelas / Guru Fisika"
                              value={author}
                              onChange={(e) => setAuthor(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end gap-2 pt-1.5">
                        {editingId && (
                          <button
                            onClick={cancelEdit}
                            className="py-1.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 text-slate-500 dark:text-slate-400 font-bold text-[10px] rounded-lg"
                          >
                            Batal
                          </button>
                        )}
                        <button
                          onClick={handleSaveItem}
                          className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1.5 shadow"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {editingId ? "Simpan Perubahan" : "Terbitkan"}
                        </button>
                      </div>
                    </div>

                    {/* Interactive list */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {announcements.map(ann => (
                        <div
                          key={ann.id}
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                        >
                          <div className="min-w-0">
                            <strong className="text-slate-800 dark:text-slate-200 block">{ann.title}</strong>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 shrink-0" /> Oleh: {ann.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 shrink-0" /> {ann.date}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => startEdit(ann)}
                              className="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(ann.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {announcements.length === 0 && (
                        <div className="py-8 text-center text-slate-400 font-medium">
                          Belum ada pengumuman kelas saat ini.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Selesai & Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
