import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Settings,
  Sparkles,
  MessageSquare,
  BookOpen,
  PieChart,
  Moon,
  Sun,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  CloudSun,
  Clock,
  Calendar,
  Compass,
  Trophy,
  Landmark,
  ShieldAlert,
  FolderDot,
  Volume2,
  Lock,
  LogOut,
  Command,
  Heart,
  ChevronDown
} from "lucide-react";

// Import types
import {
  Student,
  AttendanceRecord,
  PermissionForm,
  CashTransaction,
  MeetingNote
} from "./types";

// Import mock data as initial states
import {
  initialStudents,
  initialSchedules,
  initialCashTransactions,
  initialMeetingNotes,
  initialDocuments,
  classRules
} from "./data/mockData";

// Import sub-components
import { Toast, ToastMessage } from "./components/Toast";
import { CommandPalette } from "./components/CommandPalette";
import { AIWorkspace } from "./components/AIWorkspace";
import { StudentDatabase } from "./components/StudentDatabase";
import { AttendanceManager } from "./components/AttendanceManager";
import { ClassroomAdmin } from "./components/ClassroomAdmin";
import { AcademicPortal } from "./components/AcademicPortal";
import { CommunicationHub } from "./components/CommunicationHub";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { DigitalLibrary } from "./components/DigitalLibrary";
import { SettingsPanel } from "./components/SettingsPanel";

export default function App() {
  // --- Persistent Storage State ---
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("sma_students");
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem("sma_attendance");
    return saved ? JSON.parse(saved) : [];
  });

  const [permissionForms, setPermissionForms] = useState<PermissionForm[]>(() => {
    const saved = localStorage.getItem("sma_permissions");
    if (saved) return JSON.parse(saved);
    // Seed standard parent permission forms for demo
    return [
      {
        id: "p-form-1",
        studentId: "std-3",
        studentName: "Bagus Setiawan",
        parentName: "Agus Setiawan",
        dateStart: new Date().toISOString().split("T")[0],
        dateEnd: new Date().toISOString().split("T")[0],
        type: "Izin",
        reason: "Menghadiri upacara pernikahan kakak kandung di luar kota",
        status: "Diproses"
      }
    ];
  });

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem("sma_cash");
    return saved ? JSON.parse(saved) : initialCashTransactions;
  });

  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>(() => {
    const saved = localStorage.getItem("sma_meeting_notes");
    return saved ? JSON.parse(saved) : initialMeetingNotes;
  });

  // Save states to localstorage for Offline local PWA capability
  useEffect(() => {
    localStorage.setItem("sma_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("sma_attendance", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem("sma_permissions", JSON.stringify(permissionForms));
  }, [permissionForms]);

  useEffect(() => {
    localStorage.setItem("sma_cash", JSON.stringify(cashTransactions));
  }, [cashTransactions]);

  useEffect(() => {
    localStorage.setItem("sma_meeting_notes", JSON.stringify(meetingNotes));
  }, [meetingNotes]);

  // --- UI/UX & Navigation States ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("sma_theme");
    return savedTheme === "dark";
  });
  const [currentRole, setCurrentRole] = useState<"Administrator" | "Homeroom Teacher" | "Teacher" | "Student" | "Parent">("Homeroom Teacher");
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // --- Toast Notifications State ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: "success" | "warning" | "info" | "error" = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Command Palette State ---
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Theme Controller ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("sma_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("sma_theme", "light");
    }
  }, [isDarkMode]);

  // --- Real-time Digital Clock Hook ---
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Backup & Restore Controls ---
  const handleExportBackup = () => {
    const backupData = {
      students,
      attendanceRecords,
      permissionForms,
      cashTransactions,
      meetingNotes,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WaliKelas_SMA_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    addToast("Database kelas berhasil diekspor ke berkas JSON!", "success");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.attendanceRecords) setAttendanceRecords(parsed.attendanceRecords);
        if (parsed.permissionForms) setPermissionForms(parsed.permissionForms);
        if (parsed.cashTransactions) setCashTransactions(parsed.cashTransactions);
        if (parsed.meetingNotes) setMeetingNotes(parsed.meetingNotes);

        addToast("Database berhasil dipulihkan dari berkas cadangan harian!", "success");
      } catch (err) {
        addToast("Gagal memulihkan cadangan. Berkas tidak valid.", "error");
      }
    };
    reader.readAsText(file);
  };

  // --- Gamification Reward Hook ---
  const handleAwardXP = (amount: number, reason: string) => {
    // Reward Aditya Pratama (First student as representative session)
    const updated = students.map((s, idx) => {
      if (idx === 0) {
        const newXP = s.xp + amount;
        // Level up algorithm (every 1000 XP)
        const nextLevel = Math.floor(newXP / 1000) + 1;
        const leveledUp = nextLevel > s.level;

        if (leveledUp) {
          addToast(`🎉 CONGRATS! Level Up! Anda sekarang mencapai Level ${nextLevel}!`, "success");
        }
        return {
          ...s,
          xp: newXP,
          level: nextLevel,
        };
      }
      return s;
    });
    setStudents(updated);
  };

  // --- Menu Database for Command Palette Search ---
  const featuresList = [
    { id: "dashboard", label: "Dashboard Utama", category: "Navigasi", description: "Ringkasan kelas, jadwal belajar harian, dan jam digital" },
    { id: "students", label: "Database Siswa", category: "Siswa", description: "Profil lengkap, NIS/NISN, data orang tua, dan kartu pelajar QR" },
    { id: "attendance", label: "Presensi Harian", category: "Administrasi", description: "Absensi manual, scan QR, dan surat izin sakit harian" },
    { id: "admin", label: "Administrasi Wali Kelas", category: "Administrasi", description: "Tata tertib, regu piket, kas kelas, dan denah kursi" },
    { id: "academic", label: "KBM & Akademik", category: "Akademik", description: "Bahan ajar, modul PDF, unggah jawaban tugas, dan raport kelas" },
    { id: "ai", label: "AI Asisten Akademik", category: "AI Pintar", description: "Homework helper, quiz generator, summary materi Kemendikbud" },
    { id: "comm", label: "Pusat Komunikasi", category: "Aspirasi", description: "Forum diskusi siswa, jajak pendapat, dan aduan wali" },
    { id: "library", label: "Rak Perpustakaan", category: "Akademik", description: "E-book referensi, bookmark modul sosiologi/fisika" },
    { id: "analytics", label: "Analisis & Prediksi", category: "Statistik", description: "Tren grafis kehadiran, prediktor kelulusan ujian semester" },
    { id: "settings", label: "Pengaturan Profil", category: "Sistem", description: "Sunting identitas sekolah SMAN 1 dan backup restore data" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* 1. Left Collapsible Sidebar */}
      <aside
        className={`${
          isSidebarCollapsed ? "w-20" : "w-64"
        } shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-r border-slate-200/40 dark:border-slate-800/40 transition-all duration-300 hidden md:flex flex-col justify-between sticky top-0 h-screen z-30`}
      >
        <div className="flex flex-col gap-6 p-4">
          {/* Brand Logo */}
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                <Compass className="w-5 h-5 animate-spin-slow" />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <span className="text-sm font-bold tracking-tight block gradient-text">WaliKelas</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider block">SMA N 1 Nagreg</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links Grouped by Segment */}
          <nav className="flex flex-col gap-1 mt-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "students", label: "Database Siswa", icon: Users },
              { id: "attendance", label: "Presensi Harian", icon: FileSpreadsheet },
              { id: "admin", label: "Administrasi Wali", icon: Landmark },
              { id: "academic", label: "Akademik & Raport", icon: Trophy },
              { id: "ai", label: "Asisten AI", icon: Sparkles, badge: "PINTAR" },
              { id: "comm", label: "Pusat Komunikasi", icon: MessageSquare },
              { id: "library", label: "Rak Perpus", icon: BookOpen },
              { id: "analytics", label: "Grafis Analisis", icon: PieChart },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 hover:scale-[1.01] ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-medium"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isSidebarCollapsed && <span className="text-xs font-semibold">{nav.label}</span>}
                  </div>
                  {!isSidebarCollapsed && nav.badge && (
                    <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-extrabold text-[8px] py-0.5 px-2 rounded-full uppercase tracking-wider scale-90 shadow-sm shadow-amber-500/10">
                      {nav.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Offline status indicator */}
        {!isSidebarCollapsed && (
          <div className="m-4 p-3 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-[10px]">
              <span className="font-semibold text-slate-500 dark:text-slate-400 block">System Offline Ready</span>
              <span className="text-slate-400 dark:text-slate-500 block mt-0.5">Semua data disimpan lokal</span>
            </div>
          </div>
        )}
      </aside>

      {/* 2. Main content container */}
      <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Top bar header */}
        <header className="sticky top-0 bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200/30 dark:border-slate-900/30 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 md:hidden hover:bg-slate-50">
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100 capitalize">
              {activeTab === "dashboard" ? "Jendela Wali Kelas" : activeTab.replace("-", " ")}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Command shortcut button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 text-xs text-slate-400 px-3.5 py-1.5 rounded-2xl hover:border-slate-300 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Cari cepat...</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-lg border border-slate-200/50">Ctrl K</span>
            </button>

            {/* Notification alert center */}
            <button
              onClick={() => addToast("Belum ada notifikasi mendesak baru hari ini.", "info")}
              className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Bell className="w-4.5 h-4.5" />
            </button>

            {/* Light/Dark Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Roles selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 py-1 px-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shadow-sm">
                  {currentRole.substring(0, 2)}
                </div>
                <div className="text-left hidden lg:block">
                  <span className="text-[9px] font-semibold text-slate-400 block">Aktif Akun</span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 block">{currentRole}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-150 dark:border-slate-800 z-50 overflow-hidden text-xs">
                  <span className="px-3.5 py-2 text-[10px] uppercase font-bold text-slate-400 block bg-slate-50 dark:bg-slate-950">Switch Hak Akses</span>
                  {["Administrator", "Homeroom Teacher", "Teacher", "Student", "Parent"].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setCurrentRole(role as any);
                        setShowRoleMenu(false);
                        addToast(`Beralih hak akses sebagai ${role}`, "info");
                      }}
                      className="w-full text-left py-2.5 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. Main Dashboard Tab routing content */}
        <main className="flex-1 py-6">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left wide section */}
              <div className="md:col-span-2 flex flex-col gap-6">
                
                {/* Weather widget and Clock */}
                <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 rounded-3xl text-white relative overflow-hidden shadow-xl border border-blue-500/20 shadow-blue-500/10">
                  {/* Decorative blur rings */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 blur-2xl rounded-full" />
                  <div className="absolute bottom-0 left-12 w-32 h-32 bg-white/5 blur-xl rounded-full" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Wali Kelas XI-12</span>
                      <h2 className="text-xl font-bold mt-1">Selamat Datang Kembali, Pak Muhtolib!</h2>
                      <p className="text-xs text-blue-100 mt-1">Sistem manajemen siap mengawasi 8 siswa terdaftar hari ini.</p>
                    </div>

                    {/* Clock and Weather */}
                    <div className="flex items-center gap-6 shrink-0 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                      <div className="text-center">
                        <Clock className="w-5 h-5 mx-auto opacity-80 mb-1" />
                        <span className="text-base font-bold block font-mono">
                          {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-[8px] uppercase tracking-wider block opacity-75">WIB</span>
                      </div>
                      <div className="w-px h-10 bg-white/20" />
                      <div className="text-center">
                        <CloudSun className="w-5 h-5 mx-auto text-amber-300 mb-1" />
                        <span className="text-xs font-bold block">24°C</span>
                        <span className="text-[8px] uppercase tracking-wider block opacity-75">Nagreg</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Today's Schedule and duty piket widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Schedule */}
                  <div className="sleek-card p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Jadwal Kelas Hari Ini</h3>
                    <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
                      {initialSchedules.slice(0, 3).map((sch) => (
                        <div key={sch.id} className="p-3 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl flex justify-between items-center text-xs hover:scale-[1.01] transition-transform">
                          <div>
                            <strong className="text-slate-800 dark:text-slate-200 block">{sch.subject}</strong>
                            <span className="text-slate-400 text-[10px] block mt-0.5">Pengampu: {sch.teacher}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-100/30">{sch.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gamified class status */}
                  <div className="sleek-card p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level Rata-rata Kelas</h3>
                      <div className="flex items-end gap-2.5 mt-3">
                        <Trophy className="w-8 h-8 text-amber-500 animate-bounce-slow" />
                        <div>
                          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">LVL 4</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Akumulasi prestasi belajar</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs">
                      <div className="flex justify-between font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                        <span>XP Kelas Ganjil</span>
                        <span>4.500 / 6.000 XP</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full w-[75%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right panel side column */}
              <div className="md:col-span-1 flex flex-col gap-6">
                {/* Bulletins / Announcements */}
                <div className="sleek-card p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pengumuman Terkini</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { title: "Koordinasi Lomba HUT RI-81", date: "15 Juli", author: "Wali Kelas" },
                      { title: "Batas Akhir Kumpul Tugas Fisika", date: "22 Juli", author: "Ibu Hartati" },
                      { title: "Sosialisasi Jurnal Refleksi Mandiri", date: "10 Juli", author: "Guru BK" },
                    ].map((bull, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl text-xs hover:scale-[1.01] transition-transform">
                        <strong className="text-slate-800 dark:text-slate-200 block">{bull.title}</strong>
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                          <span>Oleh: {bull.author}</span>
                          <span>{bull.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming events calendar strip */}
                <div className="sleek-card p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Agenda Kelas Mendatang</h3>
                  <div className="flex flex-col gap-3 text-xs">
                    {[
                      { name: "UTS Semester Ganjil", date: "15 Sept", daysLeft: "58 hari lagi" },
                      { name: "Dekorasi Kelas Merdeka", date: "14 Agst", daysLeft: "26 hari lagi" },
                    ].map((evt, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/40 dark:border-slate-850/40 rounded-2xl hover:scale-[1.01] transition-transform">
                        <div>
                          <strong className="text-slate-700 dark:text-slate-200 block">{evt.name}</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Tanggal: {evt.date}</span>
                        </div>
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-100/30">
                          {evt.daysLeft}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Render Students Directory */}
          {activeTab === "students" && (
            <StudentDatabase
              students={students}
              onUpdateStudents={setStudents}
              onAddToast={addToast}
              currentRole={currentRole}
            />
          )}

          {/* Render Attendance Sheet */}
          {activeTab === "attendance" && (
            <AttendanceManager
              students={students}
              attendanceRecords={attendanceRecords}
              onUpdateRecords={setAttendanceRecords}
              permissionForms={permissionForms}
              onUpdatePermissions={setPermissionForms}
              onAddToast={addToast}
              currentRole={currentRole}
            />
          )}

          {/* Render Classroom Administration */}
          {activeTab === "admin" && (
            <ClassroomAdmin
              students={students}
              cashTransactions={cashTransactions}
              onUpdateCash={setCashTransactions}
              meetingNotes={meetingNotes}
              onUpdateNotes={setMeetingNotes}
              onUpdateStudents={setStudents}
              onAddToast={addToast}
              currentRole={currentRole}
            />
          )}

          {/* Render Academics Portal */}
          {activeTab === "academic" && (
            <AcademicPortal
              students={students}
              onUpdateStudents={setStudents}
              onAddToast={addToast}
              onAwardXP={handleAwardXP}
              currentRole={currentRole}
            />
          )}

          {/* Render AI Assistant */}
          {activeTab === "ai" && (
            <AIWorkspace
              onAddToast={addToast}
              onAwardXP={handleAwardXP}
            />
          )}

          {/* Render Communication Hub */}
          {activeTab === "comm" && (
            <CommunicationHub
              students={students}
              onAddToast={addToast}
              onAwardXP={handleAwardXP}
              currentRole={currentRole}
            />
          )}

          {/* Render Rak Perpustakaan */}
          {activeTab === "library" && (
            <DigitalLibrary
              onAddToast={addToast}
              onAwardXP={handleAwardXP}
            />
          )}

          {/* Render Analytics Dashboard */}
          {activeTab === "analytics" && (
            <AnalyticsDashboard
              students={students}
            />
          )}

          {/* Render System Settings */}
          {activeTab === "settings" && (
            <SettingsPanel
              onAddToast={addToast}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              currentRole={currentRole}
            />
          )}
        </main>
      </div>

      {/* Dynamic Command Palette Overlay */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        features={featuresList}
      />

      {/* Floating Micro interaction toasts overlay */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
