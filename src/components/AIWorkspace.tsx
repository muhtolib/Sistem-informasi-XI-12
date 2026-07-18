import React, { useState } from "react";
import { Sparkles, BrainCircuit, CalendarRange, ListMusic, BookOpen, PenTool, MessageSquare, Send, ArrowRight, Save, Award, Brain, RefreshCw } from "lucide-react";

interface AIWorkspaceProps {
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  onAwardXP: (amount: number, reason: string) => void;
  studentName?: string;
}

export const AIWorkspace: React.FC<AIWorkspaceProps> = ({
  onAddToast,
  onAwardXP,
  studentName = "Siswa Kelas XII",
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"assistant" | "planner" | "quiz" | "summary" | "reflection" | "chatbot">("chatbot");
  const [inputText, setInputText] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [savedItems, setSavedItems] = useState<{ id: string; title: string; type: string; content: string }[]>([]);

  // Pre-configured suggestions to trigger realistic SMA questions
  const suggestions = {
    assistant: "Bantu jelaskan bagaimana cara kerja Hukum Hooke pada pegas serta rumus elastisitasnya secara lengkap.",
    planner: "Buat jadwal persiapan ujian kelulusan mata pelajaran Biologi selama 1 minggu penuh untuk siswa XII MIPA.",
    quiz: "Buat kuis pilihan ganda berisi 3 soal materi Termodinamika (Siklus Carnot) SMA Kelas 12 beserta pembahasannya.",
    summary: "Rangkum materi Sosiologi tentang Konflik Sosial dan bentuk-bentuk integrasi masyarakat.",
    reflection: "Ini refleksi belajar saya hari ini: 'Saya masih bingung membedakan antara gaya gesek kinetik dan statis saat mengerjakan soal beban miring.' Tolong evaluasi.",
    chatbot: "Apa perbedaan antara pembelahan sel Mitosis dan Meiosis? Jelaskan perbedaannya dalam bentuk tabel.",
  };

  const handleAIQuery = async (customPrompt?: string) => {
    const query = customPrompt || inputText;
    if (!query.trim()) {
      onAddToast("Silakan masukkan teks atau pertanyaan terlebih dahulu.", "warning");
      return;
    }

    setIsLoading(true);
    setAiOutput("");
    
    // Stagger loading messages for an amazing micro-interaction experience
    const steps = [
      "Mengambil konteks Kurikulum Nasional SMA...",
      "Menghubungkan dengan model AI Google Gemini...",
      "Memformulasikan penjelasan akademis...",
      "Menyusun respons Bahasa Indonesia yang terstruktur..."
    ];
    
    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      }
    }, 1500);

    try {
      let systemInstruction = "Anda adalah Asisten Akademis SMA di Indonesia yang bersertifikasi tinggi. Jawab dengan gaya pedagogis, memotivasi, dan ramah. Gunakan struktur Markdown yang bersih, poin-poin tebal, serta lampirkan pembagian sub-bab bila relevan.";
      
      if (activeSubTab === "planner") {
        systemInstruction = "Anda adalah AI Perancang Rencana Belajar SMA. Buat rancangan belajar harian yang terstruktur, padat, realistis, lengkap dengan estimasi alokasi waktu menit dan tips sukses ujian harian.";
      } else if (activeSubTab === "quiz") {
        systemInstruction = "Anda adalah Guru Pembuat Soal Kuis SMA. Hasilkan pertanyaan pilihan ganda atau esai yang edukatif, berbobot, lengkap dengan opsi A, B, C, D, petunjuk kunci jawaban, dan pembahasan rumus fisika/matematika yang detail.";
      } else if (activeSubTab === "reflection") {
        systemInstruction = "Anda adalah Konselor Refleksi Belajar. Analisis kendala belajar siswa, berikan saran pemecahan masalah psikologis atau materi, serta beri nilai apresiasi (skala 1-100) atas keterbukaan pemikiran siswa.";
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query, systemInstruction }),
      });

      const data = await res.json();
      clearInterval(interval);
      
      if (data.text) {
        setAiOutput(data.text);
        onAddToast("Asisten AI berhasil menyusun materi pelajaran!", "success");
        // Award XP on successful AI collaboration to engage gamification
        onAwardXP(50, `Kolaborasi dengan AI Asisten (${activeSubTab})`);
      } else {
        throw new Error("No text returned from backend");
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      onAddToast("Terjadi kesalahan koneksi AI. Mengaktifkan simulator lokal.", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItem = () => {
    if (!aiOutput) return;
    const newSaved = {
      id: "save-" + Date.now(),
      title: `Hasil AI ${activeSubTab === "quiz" ? "Kuis" : activeSubTab === "planner" ? "Rencana" : "Pembahasan"} (${new Date().toLocaleDateString("id-ID")})`,
      type: activeSubTab,
      content: aiOutput,
    };
    setSavedItems([newSaved, ...savedItems]);
    onAddToast("Hasil AI telah disimpan ke Portofolio Akademis Anda!", "success");
    onAwardXP(30, "Menyimpan materi AI ke catatan portofolio");
  };

  const subTabs = [
    { id: "chatbot", label: "Tanya AI Guru", icon: MessageSquare, desc: "Tanya jawab materi kurikulum SMA" },
    { id: "assistant", label: "Homework Helper", icon: BrainCircuit, desc: "Pembahasan soal & tugas terstruktur" },
    { id: "planner", label: "Study Planner", icon: CalendarRange, desc: "Jadwal belajar harian personal" },
    { id: "quiz", label: "AI Quiz Maker", icon: ListMusic, desc: "Pembuat latihan soal instan" },
    { id: "summary", label: "Materi Summary", icon: BookOpen, desc: "Rangkuman bab pelajaran ringkas" },
    { id: "reflection", label: "Refleksi Jurnal", icon: PenTool, desc: "Skor & masukan jurnal belajar" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Selector */}
      <div className="lg:col-span-1 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
          Peralatan Pintar AI
        </h3>
        {subTabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setAiOutput("");
                setInputText("");
              }}
              className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all text-left border hover:scale-[1.01] duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/20 font-medium"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/40 dark:border-slate-800/40"
              }`}
            >
              <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${isActive ? "text-white" : "text-blue-500"}`} />
              <div>
                <span className="text-sm font-medium block">{tab.label}</span>
                <span className={`text-[10px] block ${isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                  {tab.desc}
                </span>
              </div>
            </button>
          );
        })}

        {/* Saved AI Content List */}
        {savedItems.length > 0 && (
          <div className="mt-6 sleek-card rounded-2xl p-4 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5 text-emerald-500" />
              Tersimpan Harian ({savedItems.length})
            </h4>
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {savedItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSubTab(item.type as any);
                    setAiOutput(item.content);
                  }}
                  className="w-full text-left text-xs p-2 rounded bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 truncate border border-slate-100 dark:border-slate-800"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Interaction Area */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <div className="sleek-card rounded-3xl shadow-sm p-6 overflow-hidden relative">
          
          {/* Glowing gradient element to represent Gemini AI presence */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl pointer-events-none rounded-full" />

          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {subTabs.find((t) => t.id === activeSubTab)?.label}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Asisten digital cerdas untuk mendukung kebutuhan belajar kurikulum merdeka
                </p>
              </div>
            </div>

            {/* Quick Demo Selector */}
            <button
              onClick={() => setInputText(suggestions[activeSubTab])}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-1 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 transition-colors"
            >
              <Brain className="w-3.5 h-3.5 shrink-0" />
              Contoh Pertanyaan SMA
            </button>
          </div>

          {/* User Input Prompt area */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pertanyaan atau Topik Pembelajaran:
            </label>
            <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <textarea
                className="flex-1 bg-transparent border-none resize-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none min-h-[70px] max-h-[140px] px-2"
                placeholder={
                  activeSubTab === "reflection"
                    ? "Tuliskan pengalaman belajarmu hari ini, bagian mana yang menyenangkan atau membingungkan..."
                    : "Tuliskan materi atau pertanyaan secara detail di sini..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAIQuery();
                  }
                }}
              />
              <button
                disabled={isLoading}
                onClick={() => handleAIQuery()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white shadow-md hover:shadow-lg hover:shadow-blue-500/15 active:scale-95 transition-all shrink-0"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Output / Response box */}
          {(isLoading || aiOutput) && (
            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6">
              {isLoading ? (
                <div className="flex flex-col gap-3 py-4">
                  {/* Skeleton loaders */}
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-xs font-medium text-slate-500 animate-pulse">{loadingStep}</span>
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full animate-pulse" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-[90%] animate-pulse" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-[75%] animate-pulse" />
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      Hasil Analisis Google Gemini AI
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveItem}
                        className="text-xs flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Simpan Portofolio
                      </button>
                    </div>
                  </div>

                  {/* Markdown Simulated Viewer with clean spacing */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl max-h-[380px] overflow-y-auto">
                    <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 space-y-3">
                      {aiOutput.split("\n\n").map((para, pIdx) => {
                        if (para.startsWith("###")) {
                          return (
                            <h3 key={pIdx} className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-1 mt-3">
                              {para.replace("###", "").trim()}
                            </h3>
                          );
                        }
                        if (para.startsWith("**") && para.endsWith("**")) {
                          return (
                            <div key={pIdx} className="font-bold text-slate-800 dark:text-slate-200">
                              {para.replace(/\*\*/g, "").trim()}
                            </div>
                          );
                        }
                        if (para.startsWith("-") || para.startsWith("*")) {
                          return (
                            <ul key={pIdx} className="list-disc list-inside space-y-1.5">
                              {para.split("\n").map((line, lIdx) => (
                                <li key={lIdx} className="ml-2">
                                  {line.replace(/^[-*]\s*/, "").trim()}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        return <p key={pIdx} className="leading-relaxed">{para}</p>;
                      })}
                    </div>
                  </div>

                  {/* Gamification Indicator */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>Setiap aktivitas belajar AI yang Anda simpan akan memberikan Anda tambahan <b>+30 XP</b> untuk menaikkan peringkat level kelas!</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
