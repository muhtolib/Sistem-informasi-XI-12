import React, { useState } from "react";
import { Student, CashTransaction, MeetingNote } from "../types";
import { LayoutGrid, ClipboardList, Wallet, ScrollText, Users, Plus, Save, BookOpen, AlertCircle, FileText } from "lucide-react";
import { cleaningDutySchedule, classRules } from "../data/mockData";

interface ClassroomAdminProps {
  students: Student[];
  cashTransactions: CashTransaction[];
  onUpdateCash: (updated: CashTransaction[]) => void;
  meetingNotes: MeetingNote[];
  onUpdateNotes: (updated: MeetingNote[]) => void;
  onUpdateStudents: (updated: Student[]) => void;
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  currentRole: string;
}

export const ClassroomAdmin: React.FC<ClassroomAdminProps> = ({
  students,
  cashTransactions,
  onUpdateCash,
  meetingNotes,
  onUpdateNotes,
  onUpdateStudents,
  onAddToast,
  currentRole,
}) => {
  const [activeTab, setActiveTab] = useState<"seats" | "piket" | "cash" | "notes">("seats");

  // Seat Swap state
  const [seatSwapIndex, setSeatSwapIndex] = useState<number | null>(null);

  // Cash Form state
  const [cashDesc, setCashDesc] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashType, setCashType] = useState<"Debit" | "Kredit">("Debit");
  const [cashCat, setCashCat] = useState<any>("Iuran Harian");
  const [cashStudentId, setCashStudentId] = useState("");

  // Meeting notes Form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteAttendees, setNoteAttendees] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteActions, setNoteActions] = useState("");

  // Interactive seat layout: 12 seats total (represented as a grid of 3 rows x 4 cols of desks)
  const seatGridSize = 12;

  const handleSeatClick = (index: number) => {
    if (currentRole !== "Homeroom Teacher" && currentRole !== "Administrator") {
      onAddToast("Hanya Wali Kelas yang dapat mengubah formasi tempat duduk.", "warning");
      return;
    }

    if (seatSwapIndex === null) {
      setSeatSwapIndex(index);
      onAddToast("Pilih kursi lain untuk melakukan pertukaran tempat duduk siswa.", "info");
    } else {
      // Perform swap of seats
      const updated = [...students];
      const studentA = updated.find((s) => s.seatIndex === seatSwapIndex);
      const studentB = updated.find((s) => s.seatIndex === index);

      if (studentA) studentA.seatIndex = index;
      if (studentB) studentB.seatIndex = seatSwapIndex;

      onUpdateStudents(updated);
      onAddToast("Denah tempat duduk kelas berhasil diperbarui!", "success");
      setSeatSwapIndex(null);
    }
  };

  const handleAddTransaction = () => {
    if (!cashDesc.trim() || !cashAmount) {
      onAddToast("Deskripsi dan nominal transaksi kas harus diisi.", "warning");
      return;
    }

    const student = students.find((s) => s.id === cashStudentId);
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      studentId: cashStudentId || undefined,
      studentName: student?.name || undefined,
      description: cashDesc,
      amount: parseInt(cashAmount),
      type: cashType,
      category: cashCat,
    };

    onUpdateCash([newTx, ...cashTransactions]);
    onAddToast("Transaksi kas kelas berhasil dicatatkan!", "success");

    // Reset Form
    setCashDesc("");
    setCashAmount("");
    setCashStudentId("");
  };

  const handleAddMeetingNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      onAddToast("Judul rapat dan notula pembahasan rapat wajib diisi.", "warning");
      return;
    }

    const newNote: MeetingNote = {
      id: `note-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      title: noteTitle,
      attendees: noteAttendees.split(",").map((a) => a.trim()).filter(Boolean),
      content: noteContent,
      actionItems: noteActions.split("\n").map((a) => a.trim()).filter(Boolean),
    };

    onUpdateNotes([newNote, ...meetingNotes]);
    onAddToast("Notula rapat koordinasi berhasil disimpan!", "success");

    // Reset Form
    setNoteTitle("");
    setNoteAttendees("");
    setNoteContent("");
    setNoteActions("");
  };

  // Compute cash calculations
  const totalIn = cashTransactions.filter((t) => t.type === "Debit").reduce((acc, curr) => acc + curr.amount, 0);
  const totalOut = cashTransactions.filter((t) => t.type === "Kredit").reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIn - totalOut;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Tab Selectors */}
      <div className="lg:col-span-1 flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2">
          Administrasi Wali Kelas
        </h3>
        {[
          { id: "seats", label: "Denah Tempat Duduk", icon: LayoutGrid },
          { id: "piket", label: "Regu Piket & Tata Tertib", icon: ClipboardList },
          { id: "cash", label: "Kas Ledger Kelas", icon: Wallet },
          { id: "notes", label: "Notula Rapat Wali", icon: ScrollText },
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

      {/* Main Tab Container */}
      <div className="lg:col-span-3">
        {/* Render Seat Layout Planner */}
        {activeTab === "seats" && (
          <div className="sleek-card rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" /> Formasi Meja Belajar Siswa
              </h3>
              <p className="text-xs text-slate-400">Klik satu meja, lalu klik meja lainnya untuk melakukan pertukaran duduk.</p>
            </div>

            {/* Teacher Board Representation */}
            <div className="w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
              Papan Tulis Utama (Depan Kelas)
            </div>

            {/* Desk Layout Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {Array.from({ length: seatGridSize }).map((_, seatIdx) => {
                const currentStudent = students.find((s) => s.seatIndex === seatIdx);
                const isSelectedForSwap = seatSwapIndex === seatIdx;

                return (
                  <button
                    key={seatIdx}
                    onClick={() => handleSeatClick(seatIdx)}
                    className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center min-h-[90px] relative ${
                      isSelectedForSwap
                        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-400 ring-2 ring-amber-400/40"
                        : currentStudent
                        ? "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                        : "bg-slate-50 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="absolute top-1.5 left-2 text-[8px] font-bold text-slate-400 font-mono">
                      Meja {seatIdx + 1}
                    </span>
                    {currentStudent ? (
                      <div className="flex flex-col items-center gap-1.5 w-full">
                        <img
                          src={currentStudent.photoUrl}
                          alt={currentStudent.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 block truncate w-full">
                          {currentStudent.name.split(" ")[0]} {currentStudent.name.split(" ")[1] || ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-400">Kursi Kosong</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Render Piket & Rules */}
        {activeTab === "piket" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Duty piket schedule */}
            <div className="sleek-card rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Jadwal Piket Kebersihan Harian</h3>
              <div className="flex flex-col gap-3">
                {cleaningDutySchedule.map((duty, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <div>
                      <strong className="text-xs text-blue-600 dark:text-blue-400 block">{duty.day}</strong>
                      <span className="text-[10px] text-slate-500 block mt-1">Siswa Bertanggung Jawab:</span>
                      <div className="flex flex-col mt-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {duty.students.map((student, sIdx) => (
                          <span key={sIdx}>🧹 {student}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules list */}
            <div className="sleek-card rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Kesepakatan Tata Tertib Kelas XI-12</h3>
              <div className="flex flex-col gap-3">
                {classRules.map((rule) => (
                  <div key={rule.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded mb-1.5">
                      {rule.category}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">&quot;{rule.text}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Render Cash Book Ledger */}
        {activeTab === "cash" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Financial summaries panel */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-lg rounded-full" />
                <span className="text-[10px] uppercase font-bold opacity-75">Saldo Kas Saat Ini</span>
                <h3 className="text-2xl font-bold mt-1">Rp {balance.toLocaleString("id-ID")}</h3>
                <span className="text-[9px] block opacity-75 mt-2">Dikelola oleh Bendahara Kelas XI-12</span>
              </div>

              {/* Cash Ledger Input Form */}
              {(currentRole === "Homeroom Teacher" || currentRole === "Administrator" || currentRole === "Teacher") && (
                <div className="sleek-card rounded-3xl p-4 shadow-sm flex flex-col gap-3 text-xs">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">Catat Transaksi Baru</h4>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-400">Deskripsi Transaksi:</label>
                    <input
                      type="text"
                      className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
                      placeholder="e.g. Iuran kas mingguan"
                      value={cashDesc}
                      onChange={(e) => setCashDesc(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-slate-400">Nominal Rp:</label>
                    <input
                      type="number"
                      className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
                      placeholder="e.g. 20000"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCashType("Debit")}
                      className={`py-2 text-center font-bold rounded-lg ${
                        cashType === "Debit"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-50 dark:bg-slate-950 text-slate-500"
                      }`}
                    >
                      Pemasukan
                    </button>
                    <button
                      onClick={() => setCashType("Kredit")}
                      className={`py-2 text-center font-bold rounded-lg ${
                        cashType === "Kredit"
                          ? "bg-rose-600 text-white"
                          : "bg-slate-50 dark:bg-slate-950 text-slate-500"
                      }`}
                    >
                      Pengeluaran
                    </button>
                  </div>

                  <button
                    onClick={handleAddTransaction}
                    className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors mt-2"
                  >
                    Simpan Transaksi
                  </button>
                </div>
              )}
            </div>

            {/* Ledger Transactions list */}
            <div className="md:col-span-2 sleek-card rounded-3xl shadow-sm overflow-hidden flex flex-col max-h-[460px]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Buku Kas Jurnal Kelas</span>
              </div>
              <div className="overflow-y-auto flex-1">
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {cashTransactions.map((tx) => (
                    <div key={tx.id} className="p-3.5 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <div>
                        <strong className="text-slate-700 dark:text-slate-200 block font-semibold">{tx.description}</strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{tx.date} • {tx.category}</span>
                        {tx.studentName && <span className="text-[10px] text-blue-500 font-medium">Siswa: {tx.studentName}</span>}
                      </div>
                      <span className={`font-bold ${tx.type === "Debit" ? "text-emerald-600" : "text-rose-600"}`}>
                        {tx.type === "Debit" ? "+" : "-"} Rp {tx.amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Render Meeting Notes (Notula Rapat) */}
        {activeTab === "notes" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Form builder */}
            {(currentRole === "Homeroom Teacher" || currentRole === "Administrator") && (
              <div className="md:col-span-1 sleek-card rounded-3xl shadow-sm text-xs flex flex-col gap-3 p-5">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">Tulis Notula Rapat Baru</h4>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Agenda / Topik Rapat:</label>
                  <input
                    type="text"
                    className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
                    placeholder="e.g. Persiapan HUT RI"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Peserta Rapat (Koma sebagai pemisah):</label>
                  <input
                    type="text"
                    className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300"
                    placeholder="Wali Kelas, Ketua Kelas, Sekretaris..."
                    value={noteAttendees}
                    onChange={(e) => setNoteAttendees(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Notula Pembahasan:</label>
                  <textarea
                    className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300 min-h-[70px] resize-none"
                    placeholder="Hasil rapat tertulis..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-slate-400">Action Items (Satu baris satu poin):</label>
                  <textarea
                    className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border focus:outline-none text-slate-700 dark:text-slate-300 min-h-[60px] resize-none"
                    placeholder="Beli bendera..."
                    value={noteActions}
                    onChange={(e) => setNoteActions(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleAddMeetingNote}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Simpan Notula Rapat
                </button>
              </div>
            )}

            {/* List of past notes */}
            <div className={`md:col-span-2 flex flex-col gap-4 overflow-y-auto max-h-[500px]`}>
              {meetingNotes.map((note) => (
                <div key={note.id} className="sleek-card rounded-3xl p-5 shadow-sm text-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">{note.date}</span>
                    <span className="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-[8px]">
                      Notula Rapat Resmi
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{note.title}</h4>
                    <span className="text-slate-400 text-[10px] mt-0.5 block">Hadir: {note.attendees.join(", ")}</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                    &quot;{note.content}&quot;
                  </p>

                  {note.actionItems.length > 0 && (
                    <div>
                      <strong className="text-slate-500 font-semibold block mb-1">Rencana Tindak Lanjut:</strong>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                        {note.actionItems.map((item, idx) => (
                          <li key={idx} className="font-medium">✔️ {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
