import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  Info,
  ShieldAlert,
  Save,
  Sparkles,
  Edit2
} from "lucide-react";
import { AgendaItem } from "../types";

interface AgendaGuideModalProps {
  agendas: AgendaItem[];
  onUpdateAgendas: (updated: AgendaItem[]) => void;
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  onClose: () => void;
  currentRole: string;
}

export const AgendaGuideModal: React.FC<AgendaGuideModalProps> = ({
  agendas,
  onUpdateAgendas,
  onAddToast,
  onClose,
  currentRole,
}) => {
  const [activeTab, setActiveTab] = useState<"guide" | "editor">("guide");
  
  // Form fields for adding/editing an agenda item
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [daysLeft, setDaysLeft] = useState("");

  const handleSaveItem = () => {
    if (!name || !date || !daysLeft) {
      onAddToast("Mohon lengkapi seluruh field agenda!", "warning");
      return;
    }

    if (editingId) {
      // Edit existing
      const updated = agendas.map(agd => {
        if (agd.id === editingId) {
          return { ...agd, name, date, daysLeft };
        }
        return agd;
      });
      onUpdateAgendas(updated);
      onAddToast(`Berhasil memperbarui agenda "${name}"!`, "success");
      setEditingId(null);
    } else {
      // Add new
      const newItem: AgendaItem = {
        id: `agd-${Date.now()}`,
        name,
        date,
        daysLeft
      };
      onUpdateAgendas([...agendas, newItem]);
      onAddToast(`Berhasil menambahkan agenda baru!`, "success");
    }

    // Reset form
    setName("");
    setDate("");
    setDaysLeft("");
  };

  const handleDeleteItem = (id: string) => {
    const updated = agendas.filter(agd => agd.id !== id);
    onUpdateAgendas(updated);
    onAddToast("Agenda kelas berhasil dihapus.", "info");
  };

  const startEdit = (agd: AgendaItem) => {
    setEditingId(agd.id);
    setName(agd.name);
    setDate(agd.date);
    setDaysLeft(agd.daysLeft);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setDate("");
    setDaysLeft("");
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
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Calendar className="w-5 h-5 text-amber-100 animate-bounce-slow" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Panduan & Manajemen Agenda Kelas</h3>
              <p className="text-[10px] text-amber-100 mt-0.5">Pantau dan Atur Agenda Mendatang Kelas XI-12 SMAN 1 Nagreg</p>
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
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Cara Mengubah Agenda
            {activeTab === "guide" && (
              <motion.div
                layoutId="activeAgdTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-400"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("editor")}
            className={`px-4 py-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === "editor"
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Ubah Agenda Langsung
            {activeTab === "editor" && (
              <motion.div
                layoutId="activeAgdTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-400"
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
                  <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Papan Kalender & Agenda Masa Depan Kelas</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Sistem Agenda Kelas Mendatang mencatat UTS, UAS, kegiatan kebersihan akbar, hingga perayaan hari besar nasional. Supaya agenda tetap kredibel dan tidak tumpang tindih, pengelolaan penuh hanya diserahkan kepada <strong className="text-slate-700 dark:text-slate-300">Wali Kelas</strong> atau <strong className="text-slate-700 dark:text-slate-300">Administrator</strong>.
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Langkah-Langkah Mengubah/Menambah Agenda Kelas:</h4>

                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900">
                      1
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Buka Beranda Portal Kelas</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Modul Agenda Kelas Mendatang terintegrasi langsung pada bagian bawah dasbor utama portal akademis.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900">
                      2
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Pilih Menu "Ubah Agenda Langsung"</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Klik tab <strong className="text-slate-700 dark:text-slate-300">"Ubah Agenda Langsung"</strong> pada jendela pop-up ini. Wali Kelas/Admin dapat memasukkan nama kegiatan, tanggal pelaksanaan, serta keterangan hitungan hari mundur.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900">
                      3
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Publikasikan Seketika</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Klik tombol Simpan untuk merilis agenda. Siswa akan langsung melihat perubahan sisa hari hitungan mundur di beranda utama untuk memudahkan bersiap diri.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/30 text-[10px] text-amber-600 dark:text-amber-400 flex gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Verifikasi Hak Akses:</strong> Peran aktif Anda adalah <strong>{currentRole}</strong>. {isAuthorized ? "Anda berwenang mengedit kalender agenda." : "Akses edit dinonaktifkan untuk peran Anda."}
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
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Akses Terbatas</h4>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                      Anda terdaftar sebagai <strong>{currentRole}</strong>. Hanya <strong>Wali Kelas / Administrator</strong> yang diperbolehkan memodifikasi rencana kalender agenda kelas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Agenda Quick Form */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {editingId ? "Edit Detail Agenda" : "Buat Rencana Agenda Baru"}
                      </span>

                      <div className="grid grid-cols-1 gap-3">
                        {/* Name */}
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Nama Agenda / Kegiatan</label>
                          <input
                            type="text"
                            placeholder="Contoh: UTS Semester Ganjil"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Date */}
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Tanggal Kegiatan</label>
                            <input
                              type="text"
                              placeholder="Contoh: 15 Sept"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>

                          {/* Days Left text */}
                          <div>
                            <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Keterangan Hari Mundur</label>
                            <input
                              type="text"
                              placeholder="Contoh: 58 hari lagi"
                              value={daysLeft}
                              onChange={(e) => setDaysLeft(e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
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
                          className="py-1.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1.5 shadow"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {editingId ? "Simpan Perubahan" : "Tambahkan"}
                        </button>
                      </div>
                    </div>

                    {/* Interactive List */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {agendas.map(agd => (
                        <div
                          key={agd.id}
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                        >
                          <div className="min-w-0">
                            <strong className="text-slate-800 dark:text-slate-200 block">{agd.name}</strong>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 shrink-0" /> Tanggal: {agd.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0" /> Keterangan: {agd.daysLeft}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => startEdit(agd)}
                              className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(agd.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {agendas.length === 0 && (
                        <div className="py-8 text-center text-slate-400 font-medium">
                          Belum ada agenda kelas saat ini.
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
