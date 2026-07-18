import React, { useState } from "react";
import { Student, Achievement, Violation } from "../types";
import { Search, User, ShieldAlert, Award, FileText, Heart, MapPin, Phone, CreditCard, ChevronRight, Filter, AlertCircle, Sparkles, SlidersHorizontal } from "lucide-react";

interface StudentDatabaseProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  currentRole: string;
}

export const StudentDatabase: React.FC<StudentDatabaseProps> = ({
  students,
  onUpdateStudents,
  onAddToast,
  currentRole,
}) => {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"Semua" | "Laki-laki" | "Perempuan">("Semua");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [activeTab, setActiveTab] = useState<"profile" | "counseling" | "card">("profile");

  // Counseling form edits
  const [editCounseling, setEditCounseling] = useState("");
  const [editMedical, setEditMedical] = useState("");

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
    const matchesGender = genderFilter === "Semua" || s.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const handleSaveLogs = () => {
    if (!selectedStudent) return;
    const updated = students.map((s) => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          counselingNotes: editCounseling || s.counselingNotes,
          medicalNotes: editMedical || s.medicalNotes,
        };
      }
      return s;
    });
    onUpdateStudents(updated);
    onAddToast(`Berhasil menyimpan log konsultasi ${selectedStudent.name}`, "success");
  };

  // Trigger counseling edit state when student changes
  React.useEffect(() => {
    if (selectedStudent) {
      setEditCounseling(selectedStudent.counselingNotes);
      setEditMedical(selectedStudent.medicalNotes);
    }
  }, [selectedStudentId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student List & Search Pane */}
      <div className="lg:col-span-1 sleek-card rounded-3xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl px-3.5 py-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full bg-transparent border-none text-xs text-slate-700 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
            placeholder="Cari nama atau NIS siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/30 dark:border-slate-800/30">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Gender
          </span>
          <div className="flex gap-1.5">
            {["Semua", "Laki-laki", "Perempuan"].map((gender) => (
              <button
                key={gender}
                onClick={() => setGenderFilter(gender as any)}
                className={`text-[10px] font-bold py-1 px-3 rounded-xl transition-all duration-200 ${
                  genderFilter === gender
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "bg-slate-100/60 dark:bg-slate-950/60 text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Student Grid */}
        <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
          {filteredStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.01] ${
                selectedStudentId === student.id
                  ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-blue-500/30 dark:border-blue-500/30 shadow-sm font-medium"
                  : "bg-slate-50/30 dark:bg-slate-950/30 border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-850/50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">
                    {student.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium mt-0.5">
                    NIS {student.nis} • Level {student.level}
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedStudentId === student.id ? "text-blue-600 dark:text-blue-400 translate-x-1" : "text-slate-300"}`} />
            </button>
          ))}
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">
              Siswa tidak ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* Student Details and Cards */}
      <div className="lg:col-span-2 sleek-card rounded-3xl shadow-sm overflow-hidden">
        {selectedStudent ? (
          <div>
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 text-white relative border-b border-blue-500/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-xl rounded-full" />
              <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/40 shadow-md"
                />
                <div className="text-center sm:text-left">
                  <h2 className="text-base font-bold flex items-center justify-center sm:justify-start gap-1.5">
                    {selectedStudent.name}
                    {selectedStudent.badges.includes("Class Captain") && (
                      <span className="bg-amber-400 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Ketua Kelas
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-blue-100">
                    NIS: {selectedStudent.nis} • NISN: {selectedStudent.nisn}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2 justify-center sm:justify-start">
                    {selectedStudent.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="bg-white/15 text-white text-[9px] font-semibold py-0.5 px-2 rounded-full"
                      >
                        🏅 {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sub-tabs selection */}
              <div className="flex gap-4 mt-6 border-t border-white/10 pt-4 text-xs font-medium">
                {[
                  { id: "profile", label: "Profil Lengkap", icon: User },
                  { id: "counseling", label: "Catatan Wali Kelas", icon: FileText },
                  { id: "card", label: "Kartu Pelajar QR", icon: CreditCard },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1 pb-1 border-b-2 transition-all ${
                        activeTab === tab.id
                          ? "border-white text-white font-semibold"
                          : "border-transparent text-blue-100 hover:text-white"
                      }`}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Tab Body */}
            <div className="p-6">
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {/* Left Column: Personal info */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identitas Diri</h3>
                    <div className="flex flex-col gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{selectedStudent.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{selectedStudent.phone}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 p-3 rounded-xl">
                        <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] text-rose-800 dark:text-rose-300">Riwayat Medis</strong>
                          <span className="text-[11px]">{selectedStudent.medicalNotes}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Parent Info */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Orang Tua / Wali</h3>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex flex-col gap-2">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Nama Ayah / Ibu</span>
                        <strong className="text-slate-700 dark:text-slate-200">
                          {selectedStudent.parentInfo.fatherName} / {selectedStudent.parentInfo.motherName}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Pekerjaan Wali</span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {selectedStudent.parentInfo.fatherOccupation}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Nomor HP Kontak</span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {selectedStudent.parentInfo.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Wide Section: Achievements / Violations */}
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {/* Achievements */}
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-3">
                        <Award className="w-4 h-4" /> Prestasi Akademis/Seni
                      </h4>
                      {selectedStudent.achievements.length > 0 ? (
                        <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto">
                          {selectedStudent.achievements.map((ach) => (
                            <div key={ach.id} className="text-xs bg-emerald-50/50 dark:bg-emerald-950/10 p-2.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30">
                              <div className="font-semibold text-emerald-800 dark:text-emerald-300">{ach.title}</div>
                              <div className="text-[10px] text-slate-400">{ach.date} • {ach.description}</div>
                              <span className="inline-block mt-1 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-full">+{ach.xpValue} XP</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Belum ada catatan prestasi terdaftar semester ini.</span>
                      )}
                    </div>

                    {/* Violations */}
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-3">
                        <ShieldAlert className="w-4 h-4" /> Catatan Pelanggaran
                      </h4>
                      {selectedStudent.violations.length > 0 ? (
                        <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto">
                          {selectedStudent.violations.map((v) => (
                            <div key={v.id} className="text-xs bg-rose-50/50 dark:bg-rose-950/10 p-2.5 rounded-lg border border-rose-100/50 dark:border-rose-900/30">
                              <div className="font-semibold text-rose-800 dark:text-rose-300">{v.title}</div>
                              <div className="text-[10px] text-slate-400">{v.date} • {v.description}</div>
                              <span className="inline-block mt-1 text-[9px] font-bold bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-1.5 py-0.5 rounded-full">-{v.pointDeduction} Poin</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Siswa teladan, tidak ada catatan pelanggaran terdeteksi.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Counseling and Wali Kelas log */}
              {activeTab === "counseling" && (
                <div className="flex flex-col gap-4 animate-fade-in text-xs">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Hanya Wali Kelas yang dapat mengubah atau menginput jurnal bimbingan dan catatan kesehatan resmi siswa.</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Catatan Bimbingan / Konseling Wali Kelas:</label>
                    <textarea
                      disabled={currentRole !== "Homeroom Teacher" && currentRole !== "Administrator"}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans min-h-[100px] text-slate-700 dark:text-slate-100"
                      value={editCounseling}
                      onChange={(e) => setEditCounseling(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Catatan Alergi / Kesehatan Medis:</label>
                    <input
                      type="text"
                      disabled={currentRole !== "Homeroom Teacher" && currentRole !== "Administrator"}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans text-slate-700 dark:text-slate-100"
                      value={editMedical}
                      onChange={(e) => setEditMedical(e.target.value)}
                    />
                  </div>

                  {(currentRole === "Homeroom Teacher" || currentRole === "Administrator") && (
                    <button
                      onClick={handleSaveLogs}
                      className="self-end px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all flex items-center gap-1"
                    >
                      Simpan Catatan
                    </button>
                  )}
                </div>
              )}

              {/* Dynamic QR ID student card */}
              {activeTab === "card" && (
                <div className="flex flex-col items-center justify-center py-4 animate-fade-in">
                  <div className="w-[340px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 relative">
                    {/* Card Head background */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-20 p-4 text-white flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">KARTU DIGITAL PELAJAR</span>
                        <span className="text-xs font-semibold block">SMAN 1 BANDUNG</span>
                      </div>
                      <span className="text-[9px] border border-white/40 px-2 py-0.5 rounded-full bg-white/10">XI-12</span>
                    </div>

                    {/* Card Content details */}
                    <div className="p-4 flex gap-4">
                      {/* Photo */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <img
                          src={selectedStudent.photoUrl}
                          alt={selectedStudent.name}
                          className="w-20 h-24 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shadow"
                        />
                        <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                          LVL {selectedStudent.level}
                        </span>
                      </div>

                      {/* Info & SVG Vector Barcode/QR */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">{selectedStudent.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">NIS: {selectedStudent.nis}</span>
                          <span className="text-[10px] text-slate-400 block">NISN: {selectedStudent.nisn}</span>
                        </div>

                        {/* Vector QR code emulation representing an actual check-in QR scanner */}
                        <div className="flex items-center gap-2 mt-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-lg">
                          <svg className="w-10 h-10 shrink-0 text-slate-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 15h6v6H3v-6zm2 2v2h2v-2H5zm10-2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm-2-2h2v2h-2v-2zm2-2v-2h2v2h-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                          </svg>
                          <div className="min-w-0 text-[8px] text-slate-400 dark:text-slate-500 leading-tight">
                            <span>Scan QR ini di terminal absensi kelas harian</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer strip */}
                    <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 text-center text-[9px] text-slate-400 border-t border-slate-100 dark:border-slate-800 font-mono">
                      Wali Kelas: Pak Muhtolib
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            Pilih siswa di daftar samping untuk melihat informasi profil lengkap.
          </div>
        )}
      </div>
    </div>
  );
};
