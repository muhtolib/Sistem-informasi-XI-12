import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Calendar,
  Clock,
  User,
  BookOpen,
  HelpCircle,
  Plus,
  Trash2,
  Check,
  Info,
  ChevronRight,
  ShieldAlert,
  Save,
  Sparkles,
  Edit2
} from "lucide-react";
import { ScheduleItem } from "../types";

interface ScheduleGuideModalProps {
  schedules: ScheduleItem[];
  onUpdateSchedules: (updated: ScheduleItem[]) => void;
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  onClose: () => void;
  currentRole: string;
}

export const ScheduleGuideModal: React.FC<ScheduleGuideModalProps> = ({
  schedules,
  onUpdateSchedules,
  onAddToast,
  onClose,
  currentRole,
}) => {
  const [activeTab, setActiveTab] = useState<"guide" | "editor">("guide");
  
  // Resolve current day of week in Indonesian, default to Senin if weekend
  const getIndonesianDay = () => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const currentDay = days[new Date().getDay()];
    if (currentDay === "Minggu" || currentDay === "Sabtu") {
      return "Senin"; // Default to Monday on weekends for demo
    }
    return currentDay;
  };

  const [selectedDay, setSelectedDay] = useState<string>(getIndonesianDay());
  
  // Form fields for adding/editing a schedule item
  const [editingId, setEditingId] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");

  const daysList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  const filteredSchedules = schedules.filter(sch => sch.day === selectedDay);

  const handleSaveItem = () => {
    if (!time || !subject || !teacher) {
      onAddToast("Mohon lengkapi seluruh field jadwal!", "warning");
      return;
    }

    if (editingId) {
      // Edit existing
      const updated = schedules.map(sch => {
        if (sch.id === editingId) {
          return { ...sch, time, subject, teacher };
        }
        return sch;
      });
      onUpdateSchedules(updated);
      onAddToast(`Berhasil memperbarui jadwal ${subject}!`, "success");
      setEditingId(null);
    } else {
      // Add new
      const newItem: ScheduleItem = {
        id: `sch-${Date.now()}`,
        day: selectedDay as any,
        time,
        subject,
        teacher
      };
      onUpdateSchedules([...schedules, newItem]);
      onAddToast(`Berhasil menambahkan jadwal ${subject}!`, "success");
    }

    // Reset form
    setTime("");
    setSubject("");
    setTeacher("");
  };

  const handleDeleteItem = (id: string) => {
    const updated = schedules.filter(sch => sch.id !== id);
    onUpdateSchedules(updated);
    onAddToast("Jadwal pelajaran berhasil dihapus.", "info");
  };

  const startEdit = (sch: ScheduleItem) => {
    setEditingId(sch.id);
    setTime(sch.time);
    setSubject(sch.subject);
    setTeacher(sch.teacher);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTime("");
    setSubject("");
    setTeacher("");
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
        <div className="bg-gradient-to-r from-blue-600 via-indigo-650 to-indigo-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Calendar className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Panduan & Manajemen Jadwal Kelas</h3>
              <p className="text-[10px] text-indigo-200 mt-0.5">Konfigurasi Pembelajaran Kelas XI-12 SMAN 1 Nagreg</p>
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
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Cara Mengubah Jadwal
            {activeTab === "guide" && (
              <motion.div
                layoutId="activeScheduleTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("editor")}
            className={`px-4 py-2.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === "editor"
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Ubah Jadwal Langsung
            {activeTab === "editor" && (
              <motion.div
                layoutId="activeScheduleTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
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
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Sistem Jadwal Pembelajaran Terintegrasi</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Jadwal kelas XI-12 disinkronkan secara real-time dengan dasbor utama portal akademik SMAN 1 Nagreg. Perubahan jadwal hanya dapat dilakukan oleh akun dengan hak akses <strong className="text-slate-700 dark:text-slate-300">Wali Kelas</strong> atau <strong className="text-slate-700 dark:text-slate-300">Administrator</strong> untuk mencegah manipulasi data siswa.
                    </p>
                  </div>
                </div>

                {/* Step Steps */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Langkah-Langkah Mengubah Jadwal:</h4>

                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
                      1
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Buka Tab "Portal Akademik"</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Navigasikan menu utama Anda ke bagian Portal Akademik kelas XI-12 SMAN 1 Nagreg di panel samping atau atas.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
                      2
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Klik "Ubah Jadwal Langsung" pada Modul Ini</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Anda dapat mengeklik tab <strong className="text-slate-700 dark:text-slate-300">"Ubah Jadwal Langsung"</strong> di atas. Jika Anda berstatus Wali Kelas atau Admin, Anda dapat menambahkan pelajaran baru, memperbarui guru pengampu, mengedit jam pelajaran, atau menghapus mata pelajaran hari ini.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
                      3
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">Simpan ke Sinkronisasi Database</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Klik ikon simpan pada baris jadwal yang diubah. Perubahan akan langsung tercermin di dasbor utama seketika demi menunjang ketepatan waktu belajar mengajar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info block */}
                <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/30 text-[10px] text-amber-600 dark:text-amber-400 flex gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Keamanan Hak Akses:</strong> Akun Anda saat ini adalah <strong>{currentRole}</strong>. {isAuthorized ? "Anda diizinkan mengedit jadwal ini." : "Anda hanya dapat melihat panduan karena Anda masuk sebagai Siswa."}
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
                {/* Day selector tabs */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850">
                  {daysList.map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDay(day);
                        cancelEdit();
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all ${
                        selectedDay === day
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {day} {getIndonesianDay() === day && <span className="text-[8px] bg-blue-500 text-white font-extrabold px-1 rounded ml-1 uppercase">Hari Ini</span>}
                    </button>
                  ))}
                </div>

                {/* Authorization Guard Message */}
                {!isAuthorized ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-150 dark:border-slate-850 p-6">
                    <ShieldAlert className="w-10 h-10 text-rose-500 mb-2.5" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Akses Terbatas</h4>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-sm">
                      Anda terdaftar sebagai <strong>{currentRole}</strong>. Hanya <strong>Wali Kelas / Administrator</strong> yang dapat memodifikasi jadwal pelajaran resmi harian.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Schedule Quick Form */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        {editingId ? "Edit Jadwal Pelajaran" : "Tambah Jadwal Pelajaran Baru"}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Time */}
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Jam Pelajaran</label>
                          <input
                            type="text"
                            placeholder="Contoh: 07:00 - 08:30"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Subject */}
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Mata Pelajaran</label>
                          <input
                            type="text"
                            placeholder="Contoh: Matematika"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Teacher */}
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Guru Pengampu</label>
                          <input
                            type="text"
                            placeholder="Contoh: Drs. Sutarman"
                            value={teacher}
                            onChange={(e) => setTeacher(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
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
                          className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg flex items-center gap-1.5 shadow"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {editingId ? "Simpan Perubahan" : "Tambahkan"}
                        </button>
                      </div>
                    </div>

                    {/* Interactive List for selectedDay */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {filteredSchedules.map(sch => (
                        <div
                          key={sch.id}
                          className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                        >
                          <div className="min-w-0">
                            <strong className="text-slate-800 dark:text-slate-200 block">{sch.subject}</strong>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 shrink-0" /> {sch.teacher}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 shrink-0" /> {sch.time}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => startEdit(sch)}
                              className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(sch.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {filteredSchedules.length === 0 && (
                        <div className="py-8 text-center text-slate-400 font-medium">
                          Belum ada jadwal pelajaran untuk hari {selectedDay}.
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
