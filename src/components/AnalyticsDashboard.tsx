import React from "react";
import { Student } from "../types";
import { TrendingUp, Award, ShieldAlert, BarChart2, Lightbulb, PieChart } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsDashboardProps {
  students: Student[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ students }) => {
  // Mock data for weekly attendance line chart
  const weeklyAttendanceData = [
    { name: "Mgu 1", SMAN1: 94, KelasKhas: 97, Target: 95 },
    { name: "Mgu 2", SMAN1: 95, KelasKhas: 98, Target: 95 },
    { name: "Mgu 3", SMAN1: 93, KelasKhas: 95, Target: 95 },
    { name: "Mgu 4", SMAN1: 96, KelasKhas: 99, Target: 95 },
    { name: "Mgu 5", SMAN1: 95, KelasKhas: 97, Target: 95 },
  ];

  // Map student achievements vs violations counts for bar chart
  const characterData = students.map((s) => ({
    name: s.name.split(" ")[0],
    Prestasi: s.achievements.length,
    Pelanggaran: s.violations.length,
  }));

  // Academic trend actual vs prediction line data
  const predictionData = [
    { name: "Tugas 1", Aktual: 85, Prediksi: 85 },
    { name: "Tugas 2", Aktual: 88, Prediksi: 87 },
    { name: "Kuis 1", Aktual: 83, Prediksi: 84 },
    { name: "Tugas 3", Aktual: 91, Prediksi: 89 },
    { name: "UTS", Aktual: 88, Prediksi: 88 },
    { name: "UAS (Prediksi)", Prediksi: 93 }, // Future prediction based on high study plans
  ];

  // Calculations
  const totalAchievements = students.reduce((acc, curr) => acc + curr.achievements.length, 0);
  const totalViolations = students.reduce((acc, curr) => acc + curr.violations.length, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Upper Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Rasio Kehadiran", value: "97.2%", desc: "+1.2% dari rata-rata sekolah", icon: TrendingUp, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
          { label: "Total Prestasi Siswa", value: totalAchievements, desc: "Sumbangsih emas/perak OSN & Seni", icon: Award, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" },
          { label: "Poin Pelanggaran", value: totalViolations, desc: "Aduan terlambat & bolos berkurang", icon: ShieldAlert, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="sleek-card rounded-3xl p-5 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-transform duration-200">
              <div className="text-xs">
                <span className="text-slate-400 font-semibold block">{item.label}</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1 block">{item.value}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
              </div>
              <div className={`p-3 rounded-xl ${item.color}`}>
                <Icon className="w-5 h-5 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Weekly Attendance LineChart */}
        <div className="sleek-card rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perbandingan Tren Kehadiran (%)</h3>
            <p className="text-[11px] text-slate-400">Rasio kelas XII MIPA 1 dibandingkan dengan rata-rata SMAN 1 Bandung.</p>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" domain={[90, 100]} />
                <Tooltip />
                <Legend fontSize={10} />
                <Line type="monotone" dataKey="KelasKhas" stroke="#2563EB" strokeWidth={2.5} name="XII MIPA 1" />
                <Line type="monotone" dataKey="SMAN1" stroke="#94a3b8" strokeDasharray="5 5" name="Rata-rata SMAN 1" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Character Achievements vs Violations BarChart */}
        <div className="sleek-card rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statistik Karakter Individu</h3>
            <p className="text-[11px] text-slate-400">Total prestasi vs tindakan disiplin per-siswa semester ganjil.</p>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={characterData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Prestasi" fill="#22C55E" radius={[4, 4, 0, 0]} name="Prestasi" />
                <Bar dataKey="Pelanggaran" fill="#EF4444" radius={[4, 4, 0, 0]} name="Pelanggaran" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Academic Predictor AreaChart */}
        <div className="sleek-card rounded-3xl p-5 shadow-sm flex flex-col gap-4 md:col-span-2">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prediktor Pembelajaran & Nilai Akhir (AI Engine)</h3>
            <p className="text-[11px] text-slate-400">Rata-rata kumulatif tugas kelas digabungkan dengan tren rencana belajar AI untuk memproyeksikan nilai kelulusan UAS.</p>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" domain={[70, 100]} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Aktual" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" name="Nilai Aktual Kelas" />
                <Area type="monotone" dataKey="Prediksi" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPred)" name="AI Prediksi UAS" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-blue-800 dark:text-blue-300">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Rekomendasi Strategi Wali Kelas:</strong>
              <span>
                Berdasarkan grafik prediktor AI, nilai siswa diproyeksikan meningkat sebesar <b>+5%</b> pada saat UAS dikarenakan tingginya frekuensi pengerjaan modul mandiri dan study planner yang diakses siswa. Disarankan tetap melanjutkan pengawasan regu belajar mandiri mingguan.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
