import React, { useState } from "react";
import { Student, AttendanceRecord, PermissionForm } from "../types";
import { Calendar, CheckCircle2, AlertTriangle, HelpCircle, FileSpreadsheet, Scan, FileInput, BarChart2, Check, X, ShieldCheck, Download, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AttendanceManagerProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onUpdateRecords: (updated: AttendanceRecord[]) => void;
  permissionForms: PermissionForm[];
  onUpdatePermissions: (updated: PermissionForm[]) => void;
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  currentRole: string;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({
  students,
  attendanceRecords,
  onUpdateRecords,
  permissionForms,
  onUpdatePermissions,
  onAddToast,
  currentRole,
}) => {
  const [activeMode, setActiveMode] = useState<"manual" | "qr" | "permissions" | "stats">("manual");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [qrSelectedStudentId, setQrSelectedStudentId] = useState(students[0]?.id || "");

  // Simulated scan state
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");

  // Get records for the selected date
  const getDailyRecords = () => {
    return students.map((student) => {
      const found = attendanceRecords.find((r) => r.date === selectedDate && r.studentId === student.id);
      return {
        studentId: student.id,
        name: student.name,
        nis: student.nis,
        gender: student.gender,
        status: found ? found.status : "Hadir",
        notes: found ? found.notes : "",
        time: found ? found.time : "",
      };
    });
  };

  const handleStatusChange = (studentId: string, status: "Hadir" | "Sakit" | "Izin" | "Alpa" | "Terlambat") => {
    const timeNow = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    
    // Check if record already exists
    const exists = attendanceRecords.some((r) => r.date === selectedDate && r.studentId === studentId);
    let updated: AttendanceRecord[] = [];

    if (exists) {
      updated = attendanceRecords.map((r) => {
        if (r.date === selectedDate && r.studentId === studentId) {
          return { ...r, status, time: timeNow };
        }
        return r;
      });
    } else {
      const student = students.find((s) => s.id === studentId);
      updated = [
        ...attendanceRecords,
        {
          id: `att-${Date.now()}-${studentId}`,
          date: selectedDate,
          studentId,
          studentName: student?.name || "",
          status,
          time: timeNow,
        },
      ];
    }
    onUpdateRecords(updated);
  };

  const handleSimulateQRScan = () => {
    if (!qrSelectedStudentId) return;
    setScanStatus("idle");
    const target = students.find((s) => s.id === qrSelectedStudentId);

    // Stagger simulation to represent camera processing
    setTimeout(() => {
      const timeNow = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      handleStatusChange(qrSelectedStudentId, "Hadir");
      setScanStatus("success");
      onAddToast(`Absensi QR berhasil! ${target?.name} tercatat HADIR pukul ${timeNow} WIB`, "success");
    }, 800);
  };

  const handleApprovePermission = (form: PermissionForm, isApproved: boolean) => {
    const updatedPermissions = permissionForms.map((p) => {
      if (p.id === form.id) {
        return { ...p, status: isApproved ? ("Disetujui" as const) : ("Ditolak" as const) };
      }
      return p;
    });
    onUpdatePermissions(updatedPermissions);

    if (isApproved) {
      // Automatically register absent status into Attendance log
      const timeNow = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const statusToApply = form.type === "Sakit" ? "Sakit" : "Izin";
      
      const exists = attendanceRecords.some((r) => r.date === form.dateStart && r.studentId === form.studentId);
      let updatedAtt: AttendanceRecord[] = [];

      if (exists) {
        updatedAtt = attendanceRecords.map((r) => {
          if (r.date === form.dateStart && r.studentId === form.studentId) {
            return { ...r, status: statusToApply, notes: form.reason };
          }
          return r;
        });
      } else {
        updatedAtt = [
          ...attendanceRecords,
          {
            id: `att-${Date.now()}`,
            date: form.dateStart,
            studentId: form.studentId,
            studentName: form.studentName,
            status: statusToApply,
            notes: form.reason,
            time: timeNow,
          },
        ];
      }
      onUpdateRecords(updatedAtt);
      onAddToast(`Izin ${form.studentName} disetujui & otomatis masuk jurnal harian!`, "success");
    } else {
      onAddToast(`Permohonan izin ${form.studentName} ditolak.`, "warning");
    }
  };

  // Monthly aggregated statistics for Chart
  const getStatsData = () => {
    return [
      { name: "Minggu 1", Hadir: 38, Sakit: 1, Izin: 1, Alpa: 0 },
      { name: "Minggu 2", Hadir: 39, Sakit: 0, Izin: 1, Alpa: 0 },
      { name: "Minggu 3", Hadir: 37, Sakit: 2, Izin: 0, Alpa: 1 },
      { name: "Minggu 4", Hadir: 40, Sakit: 0, Izin: 0, Alpa: 0 },
    ];
  };

  const dailyRecords = getDailyRecords();

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Headers and Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sleek-card p-4 rounded-3xl shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "manual", label: "Absensi Manual", icon: FileSpreadsheet },
            { id: "qr", label: "Terminal QR Scan", icon: Scan },
            { id: "permissions", label: "Surat Izin Orang Tua", icon: FileInput },
            { id: "stats", label: "Analisis & Laporan", icon: BarChart2 },
          ].map((mode) => {
            const ModeIcon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id as any)}
                className={`flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-2xl transition-all duration-200 ${
                  activeMode === mode.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100/60 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                }`}
              >
                <ModeIcon className="w-4 h-4 shrink-0" />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Date Selector input */}
        <div className="flex items-center gap-2.5 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/40 dark:border-slate-800/40 py-2 px-3.5 rounded-2xl">
          <Calendar className="w-4 h-4 text-blue-500 animate-pulse" />
          <input
            type="date"
            className="bg-transparent text-xs text-slate-700 dark:text-slate-100 font-bold focus:outline-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Mode Render: Manual Attendance Sheet */}
      {activeMode === "manual" && (
        <div className="sleek-card rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Jurnal Jemaah Kelas Harian</h3>
              <p className="text-[11px] text-slate-400">Pilih status absensi harian untuk masing-masing siswa di bawah.</p>
            </div>
            <button
              onClick={() => onAddToast("Berhasil mendownload format excel laporan presensi harian!", "success")}
              className="text-xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-xl transition-all shadow"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 font-semibold uppercase bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="p-3.5 pl-6">Siswa</th>
                  <th className="p-3.5">NIS</th>
                  <th className="p-3.5 text-center">Status Kehadiran</th>
                  <th className="p-3.5">Tercatat Jam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dailyRecords.map((rec) => (
                  <tr key={rec.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 pl-6 font-semibold text-slate-800 dark:text-slate-200">
                      {rec.name}
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">{rec.nis}</td>
                    <td className="p-3.5">
                      <div className="flex justify-center gap-1">
                        {[
                          { id: "Hadir", label: "Hadir", color: "bg-emerald-500 hover:bg-emerald-600" },
                          { id: "Sakit", label: "Sakit", color: "bg-amber-500 hover:bg-amber-600" },
                          { id: "Izin", label: "Izin", color: "bg-blue-500 hover:bg-blue-600" },
                          { id: "Alpa", label: "Alpa", color: "bg-rose-500 hover:bg-rose-600" },
                          { id: "Terlambat", label: "Terlambat", color: "bg-indigo-500 hover:bg-indigo-600" },
                        ].map((btn) => {
                          const isSel = rec.status === btn.id;
                          return (
                            <button
                              key={btn.id}
                              disabled={currentRole !== "Homeroom Teacher" && currentRole !== "Teacher" && currentRole !== "Administrator"}
                              onClick={() => handleStatusChange(rec.studentId, btn.id as any)}
                              className={`py-1 px-3 rounded-full text-[10px] font-bold transition-all ${
                                isSel
                                  ? `${btn.color} text-white shadow-sm`
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200"
                              }`}
                            >
                              {btn.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[10px]">
                      {rec.time ? `${rec.time} WIB` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode Render: QR Absensi Terminal */}
      {activeMode === "qr" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Scanner view */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-xl">
            {/* Pulsing camera lines */}
            <div className="absolute inset-4 border border-dashed border-blue-500/30 rounded-xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-2xl flex items-center justify-center animate-pulse">
              <Scan className="w-10 h-10 text-blue-500" />
            </div>

            <div className="mt-28 text-center relative z-10 flex flex-col gap-1">
              <h3 className="text-sm font-semibold">Simulasi Scanner Presensi QR</h3>
              <p className="text-[10px] text-slate-400">Arahkan kartu pelajar digital siswa ke kamera kelas untuk merekam absensi.</p>
            </div>

            {scanStatus === "success" && (
              <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in p-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
                <span className="text-sm font-bold text-emerald-200 mt-4">KARTU BERHASIL DISCAN</span>
                <span className="text-xs text-slate-300 text-center mt-1">Siswa telah terdaftar hadir otomatis di log harian.</span>
                <button
                  onClick={() => setScanStatus("idle")}
                  className="mt-6 text-xs bg-emerald-600 hover:bg-emerald-700 py-1.5 px-4 rounded-xl font-bold transition-all"
                >
                  Scan Kartu Selanjutnya
                </button>
              </div>
            )}
          </div>

          {/* Trigger controller */}
          <div className="sleek-card rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Simulasi Scanner Kelas
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Karena berada di preview demo, silakan pilih nama siswa di bawah yang memegang Kartu Pelajar Digital lalu klik <b>Simulasikan Scan</b>. Ini merepresentasikan siswa melakukan tapping barcode kartu fisik di pagi hari.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Pilih Siswa yang Melakukan Scan:</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs p-3 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
                  value={qrSelectedStudentId}
                  onChange={(e) => setQrSelectedStudentId(e.target.value)}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (NIS {s.nis})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSimulateQRScan}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
              Simulasikan Scan Kartu QR
            </button>
          </div>
        </div>
      )}

      {/* Mode Render: Permission Form Approvals */}
      {activeMode === "permissions" && (
        <div className="sleek-card rounded-3xl shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Persetujuan Formulir Absensi Orang Tua</h3>
          <p className="text-xs text-slate-400 mb-4">Orang tua siswa dapat mengajukan surat digital jika anak berhalangan hadir. Wali kelas menyetujui di panel ini.</p>

          <div className="flex flex-col gap-3">
            {permissionForms.map((form) => {
              const typeColors = form.type === "Sakit" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-blue-100 text-blue-800 border-blue-200";
              const isPending = form.status === "Diproses";
              return (
                <div key={form.id} className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full border ${typeColors}`}>
                        {form.type}
                      </span>
                    </div>
                    <div className="text-xs">
                      <strong className="text-slate-800 dark:text-slate-100 block">{form.studentName}</strong>
                      <span className="text-slate-400 block mt-0.5">Diajukan oleh: Orang Tua ({form.parentName})</span>
                      <span className="text-slate-400 block">Tanggal Izin: {form.dateStart} s/d {form.dateEnd}</span>
                      <p className="mt-1.5 text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        &quot;{form.reason}&quot;
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isPending ? (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApprovePermission(form, false)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-all"
                          title="Tolak Surat"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApprovePermission(form, true)}
                          className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded-lg shadow transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Setujui Izin
                        </button>
                      </div>
                    ) : (
                      <span className={`text-[11px] font-bold py-1 px-3 rounded-lg flex items-center gap-1 ${
                        form.status === "Disetujui"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900"
                          : "bg-slate-50 text-slate-400 dark:bg-slate-950 dark:text-slate-500 border border-slate-100 dark:border-slate-800"
                      }`}>
                        {form.status === "Disetujui" ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                        {form.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {permissionForms.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                Tidak ada pengajuan surat izin pending dari orang tua minggu ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode Render: Stats charts */}
      {activeMode === "stats" && (
        <div className="sleek-card rounded-3xl p-6 flex flex-col gap-6 animate-fade-in shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Tren Tingkat Presensi Bulanan</h3>
            <p className="text-xs text-slate-400">Analisis rasio kehadiran siswa XI-12 semester ganjil.</p>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getStatsData()}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="Hadir" fill="#22C55E" radius={[4, 4, 0, 0]} name="Kehadiran Siswa" />
                <Bar dataKey="Sakit" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Sakit" />
                <Bar dataKey="Izin" fill="#2563EB" radius={[4, 4, 0, 0]} name="Izin" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
            {[
              { label: "Rasio Hadir Kelas", value: "96.5%", desc: "Batas kelulusan 90%", color: "text-emerald-500" },
              { label: "Total Sakit", value: "3 Hari", desc: "Sakit terverifikasi", color: "text-amber-500" },
              { label: "Total Izin", value: "2 Hari", desc: "Keperluan keluarga", color: "text-blue-500" },
              { label: "Tanpa Keterangan", value: "1 Hari", desc: "Tindakan BK rutin", color: "text-rose-500" },
            ].map((stat, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">{stat.label}</span>
                <span className={`text-lg font-bold block mt-1 ${stat.color}`}>{stat.value}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">{stat.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
