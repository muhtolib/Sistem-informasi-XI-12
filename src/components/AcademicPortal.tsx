import React, { useState } from "react";
import { Student, LessonMaterial, HomeworkAssignment, GradeItem } from "../types";
import { BookOpen, Video, HelpCircle, GraduationCap, ChevronRight, Download, Play, Trophy, Sparkles, Send, Star, Layers } from "lucide-react";
import { initialLessonMaterials, initialHomeworkAssignments, initialGrades } from "../data/mockData";

interface AcademicPortalProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  onAwardXP: (amount: number, reason: string) => void;
  currentRole: string;
}

export const AcademicPortal: React.FC<AcademicPortalProps> = ({
  students,
  onUpdateStudents,
  onAddToast,
  onAwardXP,
  currentRole,
}) => {
  const [activeTab, setActiveTab] = useState<"materials" | "homework" | "grades">("materials");
  const [materials, setMaterials] = useState<LessonMaterial[]>(initialLessonMaterials);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>(initialHomeworkAssignments);
  const [grades, setGrades] = useState<GradeItem[]>(initialGrades);

  // Homework answer state
  const [selectedHwId, setSelectedHwId] = useState<string>("");
  const [hwAnswerText, setHwAnswerText] = useState("");

  // Video modal view
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const handleHomeworkSubmit = () => {
    if (!selectedHwId || !hwAnswerText.trim()) {
      onAddToast("Silakan tulis atau unggah tautan jawaban terlebih dahulu.", "warning");
      return;
    }

    const hw = assignments.find((a) => a.id === selectedHwId);
    if (!hw) return;

    // Increment submission counter
    setAssignments(
      assignments.map((a) => {
        if (a.id === selectedHwId) {
          return { ...a, submissionsCount: a.submissionsCount + 1 };
        }
        return a;
      })
    );

    // Award XP to the active student session (let's assume standard first student for demo simulation)
    const activeStudent = students[0];
    if (activeStudent) {
      onAwardXP(hw.xpReward, `Menyelesaikan tugas: ${hw.title}`);
    }

    onAddToast(`Jawaban tugas "${hw.title}" berhasil diunggah! Anda mendapatkan +${hw.xpReward} XP!`, "success");
    setHwAnswerText("");
    setSelectedHwId("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
      {/* Selector Side Panel */}
      <div className="lg:col-span-1 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
          Kurikulum Akademik SMA
        </h3>
        {[
          { id: "materials", label: "Materi Pembelajaran", icon: BookOpen },
          { id: "homework", label: "Tugas Pekerjaan Rumah", icon: GraduationCap },
          { id: "grades", label: "Daftar Nilai / Raport", icon: Trophy },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-left border hover:scale-[1.01] duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/20 font-medium"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/40 dark:border-slate-800/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <TabIcon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-blue-500"}`} />
                <span className="text-xs font-semibold">{tab.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="lg:col-span-3">
        {/* Render Materials Library */}
        {activeTab === "materials" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="sleek-card rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="text-xs flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                        {mat.subject} • {mat.type}
                      </span>
                      {mat.duration && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          ⏱️ {mat.duration}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{mat.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">{mat.description}</p>
                  </div>

                  {mat.type === "Video" ? (
                    <button
                      onClick={() => setActiveVideoUrl(mat.url)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow"
                    >
                      <Play className="w-3.5 h-3.5 shrink-0" /> Putar Video Pembelajaran
                    </button>
                  ) : (
                    <button
                      onClick={() => onAddToast(`Mulai mendownload berkas "${mat.title}"`, "success")}
                      className="w-full py-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5 shrink-0" /> Unduh Dokumen Pendukung
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Video Modal Screen */}
            {activeVideoUrl && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl relative">
                  <button
                    onClick={() => setActiveVideoUrl(null)}
                    className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full z-10"
                  >
                    ✕
                  </button>
                  <div className="aspect-video w-full">
                    <iframe
                      className="w-full h-full"
                      src={activeVideoUrl}
                      title="Video Pembelajaran"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Render Homework assignments */}
        {activeTab === "homework" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* List Homework Panel */}
            <div className="md:col-span-2 flex flex-col gap-4">
              {assignments.map((hw) => (
                <div
                  key={hw.id}
                  className="sleek-card rounded-3xl p-5 shadow-sm flex flex-col gap-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                      {hw.subject} • Batas: {hw.dueDate}
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                      🪙 +{hw.xpReward} XP
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{hw.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{hw.description}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 mt-1.5">
                    <span className="text-[10px] text-slate-400">
                      Siswa Berhasil Mengumpulkan: {hw.submissionsCount} / {students.length}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedHwId(hw.id);
                        setHwAnswerText("");
                      }}
                      className="py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-all text-[11px]"
                    >
                      Kumpulkan Tugas
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Answer submission uploader */}
            <div className="md:col-span-1">
              {selectedHwId ? (
                <div className="sleek-card rounded-3xl p-5 shadow-sm text-xs flex flex-col gap-3.5 animate-fade-in">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">Upload Jawaban Anda</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Tugas: {assignments.find((a) => a.id === selectedHwId)?.title}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-slate-400">Isi / Tautan Link Berkas Jawaban:</label>
                    <textarea
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[140px] resize-none text-slate-700 dark:text-slate-300"
                      placeholder="Masukkan teks jawaban esai Anda atau salin tautan google drive berkas presentasi Anda..."
                      value={hwAnswerText}
                      onChange={(e) => setHwAnswerText(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedHwId("")}
                      className="flex-1 py-2 bg-slate-50 dark:bg-slate-950 border text-slate-500 font-semibold rounded-lg"
                    >
                      Batalkan
                    </button>
                    <button
                      onClick={handleHomeworkSubmit}
                      className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors shadow"
                    >
                      <Send className="w-3.5 h-3.5" /> Kirim Tugas
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-center text-slate-400">
                  <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span className="text-[11px] block leading-relaxed">
                    Pilih tombol <b>Kumpulkan Tugas</b> di sebelah kiri untuk mengunggah materi lembar tugas Anda.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Render Raport / gradebook table */}
        {activeTab === "grades" && (
          <div className="sleek-card rounded-3xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">Matriks Nilai Raport Akademik</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Nilai rata-rata semester ganjil mapel Fisika Terapan.</span>
              </div>
              <span className="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold text-[9px] uppercase tracking-wider py-1 px-3 rounded-full border border-blue-100">
                Semester Ganjil 2026
              </span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 font-bold uppercase bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="p-3 pl-6">Nama Siswa</th>
                    <th className="p-3 text-center">Tugas (30%)</th>
                    <th className="p-3 text-center">Kuis (20%)</th>
                    <th className="p-3 text-center">Ujian (40%)</th>
                    <th className="p-3 text-center">Refleksi (10%)</th>
                    <th className="p-3 text-center font-bold text-blue-600 dark:text-blue-400">Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {grades.map((g) => {
                    // Calculate weight avg
                    const finalAvg = Math.round(
                      g.homeworkScore * 0.3 + g.quizScore * 0.2 + g.examScore * 0.4 + g.reflectionScore * 0.1
                    );
                    const isExcellent = finalAvg >= 85;

                    return (
                      <tr key={g.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/10">
                        <td className="p-3.5 pl-6 font-semibold text-slate-800 dark:text-slate-200">{g.studentName}</td>
                        <td className="p-3.5 text-center font-mono">{g.homeworkScore}</td>
                        <td className="p-3.5 text-center font-mono">{g.quizScore}</td>
                        <td className="p-3.5 text-center font-mono">{g.examScore}</td>
                        <td className="p-3.5 text-center font-mono">{g.reflectionScore}</td>
                        <td className="p-3.5 text-center">
                          <span className={`font-mono font-bold px-2.5 py-1 rounded-full text-[11px] ${
                            isExcellent
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                          }`}>
                            {finalAvg}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
