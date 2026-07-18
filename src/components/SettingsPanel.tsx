import React, { useState } from "react";
import { Save, ShieldAlert, Download, Upload, Moon, Sun, Globe, Landmark, ShieldCheck } from "lucide-react";

interface SettingsPanelProps {
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentRole: string;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onAddToast,
  onExportBackup,
  onImportBackup,
  currentRole,
}) => {
  const [schoolName, setSchoolName] = useState("SMAN 1 Bandung");
  const [npsn, setNpsn] = useState("20219430");
  const [classRoom, setClassRoom] = useState("XII MIPA 1");
  const [teacherName, setTeacherName] = useState("Ibu Hartati, M.Pd");
  const [nip, setNip] = useState("19780512 200501 2 003");

  const handleSaveSettings = () => {
    if (currentRole !== "Homeroom Teacher" && currentRole !== "Administrator") {
      onAddToast("Hanya administrator atau Wali Kelas yang diizinkan merubah profil sekolah.", "warning");
      return;
    }
    onAddToast("Pengaturan profil sekolah & Wali Kelas berhasil diperbarui!", "success");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-xs">
      {/* School identity settings */}
      <div className="sleek-card rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-blue-500" /> Profil Sekolah & Kelas SMA
          </h3>
          <p className="text-slate-400 mt-0.5">Atur nama instansi sekolah resmi dan kelas binaan Anda.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-slate-400">Nama Sekolah:</label>
          <input
            type="text"
            className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-slate-400">NPSN Resmi:</label>
          <input
            type="text"
            className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
            value={npsn}
            onChange={(e) => setNpsn(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-slate-400">Nama Kelas Binaan:</label>
          <input
            type="text"
            className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
            value={classRoom}
            onChange={(e) => setClassRoom(e.target.value)}
          />
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <Save className="w-4 h-4" /> Simpan Identitas Sekolah
        </button>
      </div>

      {/* Wali Kelas and System panel */}
      <div className="flex flex-col gap-6">
        {/* Wali Kelas Profil */}
        <div className="sleek-card rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-500" /> Profil Wali Kelas (Homeroom)
            </h3>
            <p className="text-slate-400 mt-0.5">Ubah nama pendidik dan NIP resmi Wali Kelas.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-400">Nama Lengkap & Gelar:</label>
            <input
              type="text"
              className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-400">NIP (Nomor Induk Pegawai):</label>
            <input
              type="text"
              className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Save className="w-4 h-4" /> Perbarui Profil Guru
          </button>
        </div>

        {/* Database backup restoration */}
        <div className="sleek-card rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Cadangan & Pemulihan (Backup/Restore)
            </h3>
            <p className="text-slate-400 mt-0.5">Ekspor semua database sekolah ke format berkas offline JSON.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
            <button
              onClick={onExportBackup}
              className="py-3 bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-all"
            >
              <Download className="w-4 h-4" /> Ekspor Backup JSON
            </button>

            <label className="py-3 bg-blue-50 text-blue-800 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-all cursor-pointer text-center">
              <Upload className="w-4 h-4" />
              <span>Pulihkan Jurnal</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={onImportBackup}
              />
            </label>
          </div>

          <div className="flex gap-2 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 items-start">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Memulihkan berkas JSON cadangan akan menimpa semua data aktif kelas yang ada saat ini di browser local storage Anda.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
