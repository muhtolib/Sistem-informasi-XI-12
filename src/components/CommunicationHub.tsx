import React, { useState } from "react";
import { Student, DiscussionThread, PollingItem } from "../types";
import { MessageSquare, Vote, Mailbox, Send, Reply, User, Plus, CheckCircle, HelpCircle, Heart } from "lucide-react";
import { initialDiscussionThreads, initialPolls } from "../data/mockData";

interface CommunicationHubProps {
  students: Student[];
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  onAwardXP: (amount: number, reason: string) => void;
  currentRole: string;
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({
  students,
  onAddToast,
  onAwardXP,
  currentRole,
}) => {
  const [activeTab, setActiveTab] = useState<"discussion" | "polling" | "suggestions">("discussion");
  const [discussions, setDiscussions] = useState<DiscussionThread[]>(initialDiscussionThreads);
  const [polls, setPolls] = useState<PollingItem[]>(initialPolls);

  // Discussion forum reply inputs
  const [replyInputs, setReplyInputs] = useState<{ [threadId: string]: string }>({});
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");

  // Polling state
  const [pollVotedId, setPollVotedId] = useState<string | null>(null);

  // Suggestions state
  const [sugType, setSugType] = useState<"Saran" | "Aduan">("Saran");
  const [sugSubject, setSugSubject] = useState("");
  const [sugContent, setSugContent] = useState("");
  const [sugAnonymous, setSugAnonymous] = useState(false);
  const [savedSuggestions, setSavedSuggestions] = useState<{ id: string; type: string; subject: string; content: string; date: string }[]>([]);

  const handleSendReply = (threadId: string) => {
    const text = replyInputs[threadId];
    if (!text || !text.trim()) return;

    const updated = discussions.map((disc) => {
      if (disc.id === threadId) {
        return {
          ...disc,
          replies: [
            ...disc.replies,
            {
              id: `rep-${Date.now()}`,
              author: currentRole === "Homeroom Teacher" ? "Ibu Hartati, M.Pd" : "Siswa XII MIPA 1",
              role: currentRole,
              content: text,
              date: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            },
          ],
        };
      }
      return disc;
    });

    setDiscussions(updated);
    setReplyInputs({ ...replyInputs, [threadId]: "" });
    onAddToast("Balasan forum Anda berhasil dikirim!", "success");
    onAwardXP(15, "Partisipasi diskusi forum kelas");
  };

  const handleVotePoll = (pollId: string, optionIdx: number) => {
    const updated = polls.map((p) => {
      if (p.id === pollId) {
        const updatedOpts = p.options.map((opt, oIdx) => {
          if (oIdx === optionIdx) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });
        return {
          ...p,
          options: updatedOpts,
          totalVotes: p.totalVotes + 1,
          userVotedIndex: optionIdx,
        };
      }
      return p;
    });
    setPolls(updated);
    onAddToast("Terima kasih, suara polling Anda berhasil direkam!", "success");
    onAwardXP(10, "Berpartisipasi dalam jajak pendapat");
  };

  const handleCreateThread = () => {
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      onAddToast("Judul dan isi pembahasan forum wajib diisi.", "warning");
      return;
    }

    const newThread: DiscussionThread = {
      id: `disc-${Date.now()}`,
      title: newThreadTitle,
      author: currentRole === "Homeroom Teacher" ? "Ibu Hartati, M.Pd" : "Siswa XII MIPA 1",
      authorRole: currentRole === "Homeroom Teacher" ? "Wali Kelas" : "Siswa",
      content: newThreadContent,
      date: new Date().toLocaleDateString("id-ID") + " " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      replies: [],
    };

    setDiscussions([newThread, ...discussions]);
    setNewThreadTitle("");
    setNewThreadContent("");
    onAddToast("Topik diskusi forum baru berhasil diterbitkan!", "success");
    onAwardXP(20, "Membuat topik diskusi baru");
  };

  const handleSubmitSuggestion = () => {
    if (!sugSubject.trim() || !sugContent.trim()) {
      onAddToast("Subjek dan isi saran wajib diisi.", "warning");
      return;
    }

    const newSug = {
      id: `sug-${Date.now()}`,
      type: sugType,
      subject: sugSubject,
      content: sugContent,
      date: new Date().toLocaleDateString("id-ID"),
    };

    setSavedSuggestions([newSug, ...savedSuggestions]);
    setSugSubject("");
    setSugContent("");
    onAddToast("Kotak saran/aduan berhasil dikirim secara anonim ke Wali Kelas!", "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Side Selectors */}
      <div className="lg:col-span-1 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
          Komunikasi & Aspirasi
        </h3>
        {[
          { id: "discussion", label: "Forum Diskusi Kelas", icon: MessageSquare },
          { id: "polling", label: "Jajak Pendapat / Polling", icon: Vote },
          { id: "suggestions", label: "Kotak Saran Digital", icon: Mailbox },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left border hover:scale-[1.01] duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border-transparent font-medium"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200/40 dark:border-slate-800/40"
              }`}
            >
              <TabIcon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-blue-500"}`} />
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container Panels */}
      <div className="lg:col-span-3">
        {/* Discussion forums */}
        {activeTab === "discussion" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Create new thread Form */}
            <div className="md:col-span-1 sleek-card rounded-3xl p-5 shadow-sm text-xs flex flex-col gap-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Buat Diskusi Baru</h4>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400">Judul Pertanyaan:</label>
                <input
                  type="text"
                  className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
                  placeholder="e.g. Bingung rumus tekanan gas..."
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-400">Isi Pembahasan:</label>
                <textarea
                  className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300 min-h-[90px] resize-none"
                  placeholder="Tuliskan materi yang ingin ditanyakan kepada rekan kelas..."
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                />
              </div>

              <button
                onClick={handleCreateThread}
                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Kirim Topik Diskusi
              </button>
            </div>

            {/* List past threads */}
            <div className="md:col-span-2 flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
              {discussions.map((disc) => (
                <div key={disc.id} className="sleek-card rounded-3xl p-5 shadow-sm text-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                        {disc.author.substring(0, 2)}
                      </div>
                      <div>
                        <strong className="text-slate-800 dark:text-slate-100 block">{disc.author}</strong>
                        <span className="text-[9px] text-slate-400 block">{disc.authorRole} • {disc.date}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{disc.title}</h4>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{disc.content}</p>
                  </div>

                  {/* Replies sub-section */}
                  {disc.replies.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                      {disc.replies.map((rep) => (
                        <div key={rep.id} className="flex gap-2.5">
                          <div className="w-5 h-5 shrink-0 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 font-bold flex items-center justify-center text-[8px] uppercase mt-0.5">
                            {rep.author.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{rep.author} <span className="text-[9px] font-normal text-slate-400">({rep.role})</span></span>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5">{rep.content}</p>
                            <span className="text-[8px] text-slate-400 block mt-0.5">{rep.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input container */}
                  <div className="flex gap-2 items-center mt-1">
                    <input
                      type="text"
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg focus:outline-none"
                      placeholder="Tuliskan balasan Anda..."
                      value={replyInputs[disc.id] || ""}
                      onChange={(e) => setReplyInputs({ ...replyInputs, [disc.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendReply(disc.id);
                      }}
                    />
                    <button
                      onClick={() => handleSendReply(disc.id)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Polling list */}
        {activeTab === "polling" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {polls.map((poll) => {
              const hasVoted = poll.userVotedIndex !== undefined;

              return (
                <div key={poll.id} className="sleek-card rounded-3xl p-6 shadow-sm flex flex-col gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded uppercase tracking-wider">
                      Jajak Pendapat Kelas
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-2">{poll.question}</h3>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Dibuat tanggal: {poll.dateCreated} • Total Suara: {poll.totalVotes}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {poll.options.map((opt, oIdx) => {
                      const isVotedChoice = poll.userVotedIndex === oIdx;
                      const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

                      return (
                        <div key={oIdx} className="relative overflow-hidden rounded-xl border border-slate-150 dark:border-slate-800 p-3.5 flex items-center justify-between">
                          {/* Vote percentage bar background */}
                          {hasVoted && (
                            <div
                              className="absolute top-0 left-0 bottom-0 bg-blue-500/10 dark:bg-blue-500/5 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          )}

                          <div className="flex items-center gap-3 relative z-10">
                            {!hasVoted ? (
                              <button
                                onClick={() => handleVotePoll(poll.id, oIdx)}
                                className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-950"
                              />
                            ) : (
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isVotedChoice ? "bg-blue-600 text-white" : "border border-slate-200"}`}>
                                {isVotedChoice && <CheckCircle className="w-3.5 h-3.5" />}
                              </div>
                            )}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{opt.text}</span>
                          </div>

                          {hasVoted && (
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 relative z-10">
                              {percentage}% ({opt.votes} suara)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Suggestion / Complaint Box */}
        {activeTab === "suggestions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-xs">
            {/* Input suggestion */}
            <div className="sleek-card rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Mailbox className="w-4 h-4 text-blue-500" /> Jendela Aspirasi Siswa
                </h3>
                <p className="text-slate-400 mt-0.5">Sampaikan keluhan, aduan, atau ide gila untuk perbaikan kelas XII MIPA 1.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSugType("Saran")}
                  className={`py-2 text-center font-bold rounded-lg ${
                    sugType === "Saran"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-500"
                  }`}
                >
                  Saran / Ide
                </button>
                <button
                  onClick={() => setSugType("Aduan")}
                  className={`py-2 text-center font-bold rounded-lg ${
                    sugType === "Aduan"
                      ? "bg-rose-600 text-white"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-500"
                  }`}
                >
                  Aduan / Masalah
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-400">Subjek Aspirasi:</label>
                <input
                  type="text"
                  className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
                  placeholder="e.g. Masalah gorden rusak"
                  value={sugSubject}
                  onChange={(e) => setSugSubject(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-400">Isi Pesan:</label>
                <textarea
                  className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300 min-h-[100px] resize-none"
                  placeholder="Ceritakan sedetail mungkin..."
                  value={sugContent}
                  onChange={(e) => setSugContent(e.target.value)}
                />
              </div>

              <button
                onClick={handleSubmitSuggestion}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow"
              >
                Kirim Aspirasi Anonim
              </button>
            </div>

            {/* List Past anonymous entries */}
            <div className="sleek-card rounded-3xl p-5 shadow-sm flex flex-col gap-4">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Aspirasi Diterima Wali Kelas
              </h4>
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                {savedSuggestions.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-bold py-0.5 px-2 rounded-full border ${
                        s.type === "Saran" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {s.type}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{s.date}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 dark:text-slate-100 block font-semibold">{s.subject}</strong>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-950 p-2 rounded-lg italic">{s.content}</p>
                    </div>
                  </div>
                ))}
                {savedSuggestions.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    Belum ada aspirasi terdaftar dari sesi browser ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
