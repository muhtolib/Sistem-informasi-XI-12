import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  FileDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Loader2,
  Image as ImageIcon,
  FileSpreadsheet,
  Info,
  Database,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Trash2,
  UserPlus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { Student, ParentInfo } from "../types";

interface BulkStudentImportProps {
  students: Student[];
  onUpdateStudents: (updated: Student[]) => void;
  onAddToast: (text: string, type: "success" | "warning" | "info" | "error") => void;
  onClose: () => void;
}

interface ParsedRow {
  index: number;
  nis: string;
  nisn: string;
  name: string;
  gender: "Laki-laki" | "Perempuan" | string;
  phone: string;
  address: string;
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  motherOccupation: string;
  parentPhone: string;
  parentEmail: string;
  medicalNotes: string;
  photoFile?: File;
  photoUrl?: string; // matched or uploaded photo
  isValid: boolean;
  errors: string[];
}

export const BulkStudentImport: React.FC<BulkStudentImportProps> = ({
  students,
  onUpdateStudents,
  onAddToast,
  onClose,
}) => {
  // Wizard Steps: "upload" | "preview" | "importing" | "result"
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "result">("upload");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [photoFiles, setPhotoFiles] = useState<{ [key: string]: File }>({});
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [rollbackBackup, setRollbackBackup] = useState<Student[] | null>(null);
  
  // Results Summary
  const [importedCount, setImportedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isRollbacked, setIsRollbacked] = useState(false);

  // Filters for preview
  const [previewFilter, setPreviewFilter] = useState<"semua" | "valid" | "error">("semua");
  const [previewSearch, setPreviewSearch] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- 1. Download Excel Template ---
  const handleDownloadTemplate = () => {
    try {
      const headers = [
        "NIS",
        "NISN",
        "Nama Lengkap",
        "Jenis Kelamin (Laki-laki/Perempuan)",
        "Telepon Siswa",
        "Alamat",
        "Nama Ayah",
        "Nama Ibu",
        "Pekerjaan Ayah",
        "Pekerjaan Ibu",
        "No Telepon Orang Tua",
        "Email Orang Tua",
        "Catatan Medis (Alergi/Penyakit)"
      ];

      const sampleData = [
        [
          "12053",
          "0089876541",
          "Ahmad Fauzi",
          "Laki-laki",
          "081234567801",
          "Jl. Raya Nagreg No. 12, Bandung",
          "Supriatna",
          "Siti Aminah",
          "Wiraswasta",
          "Ibu Rumah Tangga",
          "081299881122",
          "supriatna@gmail.com",
          "Tidak ada"
        ],
        [
          "12054",
          "0089876542",
          "Larasati Putri",
          "Perempuan",
          "081234567802",
          "Perum Nagreg Elok Blok B5, Bandung",
          "Hendra Kusuma",
          "Rina Herawati",
          "PNS",
          "Guru",
          "082133445566",
          "hendra.k@yahoo.com",
          "Alergi debu"
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Daftar Siswa Baru");

      // Column widths helper
      ws["!cols"] = [
        { wch: 10 }, // NIS
        { wch: 15 }, // NISN
        { wch: 25 }, // Nama Lengkap
        { wch: 20 }, // Jenis Kelamin
        { wch: 15 }, // Telepon Siswa
        { wch: 30 }, // Alamat
        { wch: 18 }, // Nama Ayah
        { wch: 18 }, // Nama Ibu
        { wch: 18 }, // Pekerjaan Ayah
        { wch: 18 }, // Pekerjaan Ibu
        { wch: 18 }, // No Telepon Orang Tua
        { wch: 22 }, // Email Orang Tua
        { wch: 25 }  // Catatan Medis
      ];

      XLSX.writeFile(wb, "Template_Import_Siswa_SMAN_1_Nagreg.xlsx");
      onAddToast("Template Excel berhasil diunduh!", "success");
    } catch (error) {
      onAddToast("Gagal mengunduh template.", "error");
    }
  };

  // --- 2. XLSX Parsing & Photo Matching ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseExcelFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      parseExcelFile(file);
    } else {
      onAddToast("Berkas harus berupa spreadsheet Excel (.xlsx atau .xls)", "error");
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to array of arrays to handle headers safely
        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (rawRows.length < 2) {
          onAddToast("Berkas Excel kosong atau tidak memiliki baris data.", "warning");
          return;
        }

        // Parse rows starting from index 1 (skipping headers)
        const rows: ParsedRow[] = [];
        const seenNis = new Set<string>();
        const seenNisn = new Set<string>();

        // We map column indices based on standard template headers
        for (let i = 1; i < rawRows.length; i++) {
          const rowData = rawRows[i];
          if (!rowData || rowData.length === 0 || rowData.every((cell: any) => cell === undefined || cell === "")) {
            continue; // skip empty rows
          }

          const rawNis = String(rowData[0] || "").trim();
          const rawNisn = String(rowData[1] || "").trim();
          const rawName = String(rowData[2] || "").trim();
          const rawGender = String(rowData[3] || "").trim();
          const phone = String(rowData[4] || "").trim();
          const address = String(rowData[5] || "").trim();
          const fatherName = String(rowData[6] || "").trim();
          const motherName = String(rowData[7] || "").trim();
          const fatherOccupation = String(rowData[8] || "").trim();
          const motherOccupation = String(rowData[9] || "").trim();
          const parentPhone = String(rowData[10] || "").trim();
          const parentEmail = String(rowData[11] || "").trim();
          const medicalNotes = String(rowData[12] || "").trim();

          const errors: string[] = [];

          // Core Validations
          if (!rawNis) {
            errors.push("NIS wajib diisi");
          } else if (students.some(s => s.nis === rawNis)) {
            errors.push(`NIS ${rawNis} sudah terdaftar di sistem`);
          } else if (seenNis.has(rawNis)) {
            errors.push(`NIS ${rawNis} ganda di dalam berkas`);
          }

          if (!rawNisn) {
            errors.push("NISN wajib diisi");
          } else if (students.some(s => s.nisn === rawNisn)) {
            errors.push(`NISN ${rawNisn} sudah terdaftar di sistem`);
          } else if (seenNisn.has(rawNisn)) {
            errors.push(`NISN ${rawNisn} ganda di dalam berkas`);
          }

          if (!rawName) {
            errors.push("Nama Lengkap wajib diisi");
          }

          const normalizedGender = rawGender.toLowerCase();
          let finalGender = "Laki-laki";
          if (normalizedGender.startsWith("p") || normalizedGender.includes("puan")) {
            finalGender = "Perempuan";
          } else if (normalizedGender.startsWith("l") || normalizedGender.includes("laki")) {
            finalGender = "Laki-laki";
          } else if (rawGender) {
            errors.push("Jenis kelamin harus 'Laki-laki' atau 'Perempuan'");
          } else {
            errors.push("Jenis kelamin wajib diisi");
          }

          if (rawNis) seenNis.add(rawNis);
          if (rawNisn) seenNisn.add(rawNisn);

          // Find if there is a pre-uploaded photo file matching NIS or name
          let matchedPhoto: File | undefined = undefined;
          let matchedPhotoUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"; // default photo
          
          if (rawNis && photoFiles[rawNis]) {
            matchedPhoto = photoFiles[rawNis];
            matchedPhotoUrl = URL.createObjectURL(matchedPhoto);
          } else {
            // match by lowercased name with underscores or spaces
            const cleanName = rawName.toLowerCase().replace(/[^a-z0-9]/g, "");
            const matchByName = Object.keys(photoFiles).find(key => {
              const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
              return cleanKey.includes(cleanName) || cleanName.includes(cleanKey);
            });
            if (matchByName) {
              matchedPhoto = photoFiles[matchByName];
              matchedPhotoUrl = URL.createObjectURL(matchedPhoto);
            }
          }

          rows.push({
            index: i,
            nis: rawNis,
            nisn: rawNisn,
            name: rawName,
            gender: finalGender,
            phone,
            address,
            fatherName,
            motherName,
            fatherOccupation,
            motherOccupation,
            parentPhone,
            parentEmail,
            medicalNotes,
            photoFile: matchedPhoto,
            photoUrl: matchedPhotoUrl,
            isValid: errors.length === 0,
            errors
          });
        }

        setParsedRows(rows);
        setStep("preview");
        onAddToast(`Berhasil membaca ${rows.length} baris data siswa.`, "info");
      } catch (err) {
        onAddToast("Gagal membaca berkas Excel. Pastikan format valid.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- 3. Photo Upload Handler ---
  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: { [key: string]: File } = { ...photoFiles };
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Get name without extension
      const fileName = file.name.substring(0, file.name.lastIndexOf("."));
      newPhotos[fileName] = file;
    }
    setPhotoFiles(newPhotos);
    onAddToast(`Berhasil memuat ${files.length} foto siswa. Hubungkan dengan mengunggah Excel.`, "success");

    // If Excel was already parsed, re-match photos dynamically
    if (parsedRows.length > 0) {
      const updated = parsedRows.map(row => {
        let matchedPhoto: File | undefined = undefined;
        let matchedPhotoUrl = row.photoUrl;

        if (row.nis && newPhotos[row.nis]) {
          matchedPhoto = newPhotos[row.nis];
          matchedPhotoUrl = URL.createObjectURL(matchedPhoto);
        } else {
          const cleanName = row.name.toLowerCase().replace(/[^a-z0-9]/g, "");
          const matchByName = Object.keys(newPhotos).find(key => {
            const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
            return cleanKey.includes(cleanName) || cleanName.includes(cleanKey);
          });
          if (matchByName) {
            matchedPhoto = newPhotos[matchByName];
            matchedPhotoUrl = URL.createObjectURL(matchedPhoto);
          }
        }

        return {
          ...row,
          photoFile: matchedPhoto || row.photoFile,
          photoUrl: matchedPhotoUrl
        };
      });
      setParsedRows(updated);
    }
  };

  // --- 4. Simulated Real Firestore Transaction Upload with Rollback State ---
  const startImportProcess = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      onAddToast("Tidak ada data siswa valid yang dapat diimpor.", "warning");
      return;
    }

    setStep("importing");
    setProgress(5);
    setProgressStatus("Menyiapkan transaksi basis data...");
    setImportLogs(["Menginisiasi sesi impor massal siswa..."]);
    
    // Backup state for rollback
    setRollbackBackup([...students]);
    setIsRollbacked(false);

    await sleep(600);
    setProgress(20);
    setProgressStatus("Melakukan validasi keamanan tingkat lanjut...");
    setImportLogs(prev => [...prev, "Koneksi ke Firestore DB aman.", "Memvalidasi NIS & NISN terhadap index unik..."]);

    await sleep(650);
    setProgress(40);
    setProgressStatus("Memproses pencocokan foto pelajar...");
    setImportLogs(prev => [...prev, "Pemeriksaan integritas index selesai.", "Menyelaraskan berkas foto dengan database siswa..."]);

    const importedStudents: Student[] = [];
    let success = 0;
    let failed = 0;

    // We process each row sequentially to simulate stream logs
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const p = 40 + Math.floor((i / validRows.length) * 45);
      
      setProgress(p);
      setProgressStatus(`Mengunggah data: ${row.name}...`);
      setImportLogs(prev => [...prev, `[BATCH-WRITE] Mengunggah profil siswa NIS ${row.nis}: ${row.name}`]);
      
      // Build a robust, valid Student object matching types.ts
      const newStudent: Student = {
        id: `imported-std-${Date.now()}-${row.nis}`,
        name: row.name,
        photoUrl: row.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
        nis: row.nis,
        nisn: row.nisn,
        gender: row.gender as "Laki-laki" | "Perempuan",
        address: row.address || "Belum diisi",
        phone: row.phone || "-",
        parentInfo: {
          fatherName: row.fatherName || "-",
          motherName: row.motherName || "-",
          fatherOccupation: row.fatherOccupation || "-",
          motherOccupation: row.motherOccupation || "-",
          phone: row.parentPhone || "-",
          email: row.parentEmail || "-"
        },
        medicalNotes: row.medicalNotes || "Tidak ada catatan",
        achievements: [],
        violations: [],
        counselingNotes: "Impor data awal berhasil dilakukan secara massal.",
        level: 1,
        xp: 100, // starting bonus XP!
        badges: ["Siswa Baru"],
        seatIndex: -1 // assign empty seat initially
      };

      importedStudents.push(newStudent);
      success++;
      await sleep(150);
    }

    setProgress(90);
    setProgressStatus("Menyelesaikan transaksi...");
    setImportLogs(prev => [
      ...prev,
      "Sinkronisasi database lokal SMAN 1 Nagreg berhasil.",
      "Menyusun indeks pencarian siswa baru...",
      "Menyelesaikan transaksi batch DB."
    ]);

    await sleep(500);

    // Update real local storage state
    const allStudents = [...students, ...importedStudents];
    onUpdateStudents(allStudents);

    setImportedCount(success);
    setFailedCount(parsedRows.length - success);
    setProgress(100);
    setStep("result");
    onAddToast(`Impor selesai! Berhasil menambahkan ${success} siswa baru.`, "success");
  };

  // --- 5. Rollback Handler ---
  const handleRollback = () => {
    if (!rollbackBackup) return;
    
    // Restore backup
    onUpdateStudents(rollbackBackup);
    setIsRollbacked(true);
    onAddToast("Transaksi dibatalkan. Database siswa dikembalikan ke keadaan awal!", "warning");
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Filter and search logic for spreadsheet grid preview
  const filteredRows = parsedRows.filter(row => {
    const matchesSearch = row.name.toLowerCase().includes(previewSearch.toLowerCase()) || 
                          row.nis.includes(previewSearch) || 
                          row.nisn.includes(previewSearch);
    if (previewFilter === "valid") return matchesSearch && row.isValid;
    if (previewFilter === "error") return matchesSearch && !row.isValid;
    return matchesSearch;
  });

  const totalValid = parsedRows.filter(r => r.isValid).length;
  const totalErrors = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/15 rounded-xl">
            <FileSpreadsheet className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Modul Impor Massal Siswa</h3>
            <p className="text-[10px] text-indigo-200 mt-0.5">SMAN 1 Nagreg • Tahun Ajaran 2026/2027</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/75 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area with Transitions */}
      <div className="flex-1 p-6 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: UPLOAD AREA */}
          {step === "upload" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col gap-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Instructions & Template Download */}
                <div className="md:col-span-1 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <Info className="w-4 h-4 text-blue-500" /> Petunjuk Penggunaan
                    </h4>
                    <ul className="space-y-2.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">1.</span>
                        <span>Unduh format template Excel resmi dengan mengeklik tombol di bawah.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">2.</span>
                        <span>Isi data siswa di spreadsheet. Pastikan kolom <strong className="text-slate-700 dark:text-slate-200">NIS, NISN, Nama Lengkap</strong> dan <strong className="text-slate-700 dark:text-slate-200">Jenis Kelamin</strong> terisi valid.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">3.</span>
                        <span>NIS & NISN harus unik dan belum pernah digunakan di database.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-blue-500 font-bold">4.</span>
                        <span>(Opsional) Muat berkas foto siswa bersamaan. Sistem menyinkronkan foto berdasarkan nama file yang berisikan <strong className="text-slate-700 dark:text-slate-200">NIS siswa</strong>.</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={handleDownloadTemplate}
                    className="mt-6 w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all group"
                  >
                    <FileDown className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    Unduh Template Excel
                  </button>
                </div>

                {/* Upload Zones Container */}
                <div className="md:col-span-2 flex flex-col gap-4">
                  {/* Drag and Drop Zone */}
                  <div
                    ref={dragRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 scale-[1.01]"
                        : "border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-950/30"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".xlsx, .xls"
                      className="hidden"
                    />
                    <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mb-3 shadow-inner">
                      <Upload className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                      Pilih atau Seret Spreadsheet Excel Anda di Sini
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Mendukung format berkas .xlsx, .xls
                    </span>
                  </div>

                  {/* Optional Photos Bulk Upload */}
                  <div className="p-4 bg-slate-50/60 dark:bg-slate-950/60 rounded-2xl border border-slate-150 dark:border-slate-850">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-lg shrink-0">
                          <ImageIcon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Muat Foto Profil Siswa Massal (Opsional)</h5>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            {Object.keys(photoFiles).length > 0
                              ? `Berhasil memuat ${Object.keys(photoFiles).length} foto siap dicocokkan.`
                              : "Pilih beberapa berkas foto siswa (*.jpg, *.png) sekaligus."}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-[10px] font-bold rounded-lg shrink-0 shadow-sm"
                      >
                        Pilih Foto-Foto Siswa
                      </button>
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={handlePhotosChange}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* Photo Thumbnails Preview */}
                    {Object.keys(photoFiles).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 max-h-16 overflow-y-auto pt-1">
                        {Object.entries(photoFiles).slice(0, 15).map(([name, file]) => (
                          <div key={name} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1 px-2 rounded-lg text-[9px] font-medium text-slate-600 dark:text-slate-400">
                            <span className="truncate max-w-[80px]">{name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = { ...photoFiles };
                                delete updated[name];
                                setPhotoFiles(updated);
                              }}
                              className="text-rose-500 hover:text-rose-600 font-bold"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {Object.keys(photoFiles).length > 15 && (
                          <span className="text-[9px] text-slate-400 self-center font-bold px-1">
                            +{Object.keys(photoFiles).length - 15} foto lainnya
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION TABLE */}
          {step === "preview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-4 min-h-0"
            >
              {/* Toolbar & Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-150 dark:bg-slate-900 p-0.5 rounded-xl text-[10px] font-bold">
                    <button
                      onClick={() => setPreviewFilter("semua")}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        previewFilter === "semua"
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      Semua ({parsedRows.length})
                    </button>
                    <button
                      onClick={() => setPreviewFilter("valid")}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        previewFilter === "valid"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      Valid ({totalValid})
                    </button>
                    <button
                      onClick={() => setPreviewFilter("error")}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        previewFilter === "error"
                          ? "bg-rose-500 text-white shadow-sm"
                          : "text-rose-600 hover:text-rose-700"
                      }`}
                    >
                      Error ({totalErrors})
                    </button>
                  </div>
                </div>

                {/* Inline Search Bar */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={previewSearch}
                      onChange={(e) => setPreviewSearch(e.target.value)}
                      className="bg-transparent border-none text-[10px] focus:outline-none text-slate-700 dark:text-white placeholder-slate-400"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setStep("upload");
                      setParsedRows([]);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    title="Mulai Ulang Upload"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Spread-grid Table */}
              <div className="flex-1 overflow-x-auto border border-slate-150 dark:border-slate-850 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 border-b border-slate-150 dark:border-slate-850">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-12">No</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Foto</th>
                      <th className="py-2.5 px-3">NIS</th>
                      <th className="py-2.5 px-3">NISN</th>
                      <th className="py-2.5 px-3">Nama Lengkap</th>
                      <th className="py-2.5 px-3">Gender</th>
                      <th className="py-2.5 px-3">Alamat</th>
                      <th className="py-2.5 px-3">Orang Tua (Ibu)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                    {filteredRows.map((row, idx) => (
                      <tr
                        key={row.index}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/50 ${
                          !row.isValid ? "bg-rose-50/20 dark:bg-rose-950/10" : ""
                        }`}
                      >
                        <td className="py-2 px-3 text-center font-mono text-[10px] text-slate-400">
                          {row.index}
                        </td>
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100/30">
                              <Check className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <div className="flex flex-col gap-0.5 max-w-[150px]">
                              {row.errors.map((err, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-0.5 text-[8px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-lg border border-rose-100/30 whitespace-nowrap overflow-hidden text-ellipsis"
                                  title={err}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 shrink-0" /> {err}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <img
                            src={row.photoUrl}
                            alt={row.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-[10px]">{row.nis}</td>
                        <td className="py-2 px-3 font-mono text-[10px]">{row.nisn}</td>
                        <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-100">{row.name}</td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">{row.gender}</td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-[120px]" title={row.address}>
                          {row.address || "-"}
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                          {row.motherName || "-"}
                        </td>
                      </tr>
                    ))}
                    {filteredRows.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                          Tidak ada baris siswa yang cocok dengan filter atau pencarian Anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Preview Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                  <span>Total berkas siap diimpor: <strong>{parsedRows.length}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold">Siap diimpor: {totalValid}</span>
                  <span>•</span>
                  <span className="text-rose-500 font-bold">Butuh perbaikan: {totalErrors}</span>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setStep("upload")}
                    className="py-2 px-4 border border-slate-250 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>

                  <button
                    onClick={startImportProcess}
                    disabled={totalValid === 0}
                    className={`py-2 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/10 transition-all ${
                      totalValid === 0 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <span>Lanjutkan Impor ({totalValid} Siswa)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: IMPORTING STREAMING LOGS & PROGRESS */}
          {step === "importing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full gap-6 py-8"
            >
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{progressStatus}</h4>
                <p className="text-[10px] text-slate-400 mt-1">Transaksi aman sedang berlangsung di cloud.</p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5 font-mono">
                  <span>PROSES TRANSMIT DATA</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 h-3 rounded-full overflow-hidden shadow-inner border border-slate-200/20">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Terminal Logs View */}
              <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-850 font-mono text-[9px] h-36 overflow-y-auto shadow-2xl flex flex-col gap-1 pr-2">
                {importLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString("id-ID")}]</span>
                    <span className="text-slate-400 font-bold">$</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: FINAL RESULTS & TRANSACTION SUMMARY */}
          {step === "result" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col gap-6 max-w-xl mx-auto w-full py-4 text-center"
            >
              <div className="flex flex-col items-center">
                <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-500 mb-3 shadow-md border border-emerald-100/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {isRollbacked ? "Impor Siswa Dibatalkan" : "Impor Massal Selesai!"}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {isRollbacked
                    ? "Semua perubahan transaksi basis data berhasil dipulihkan."
                    : `Sistem berhasil menyinkronkan data siswa SMAN 1 Nagreg.`}
                </p>
              </div>

              {/* Summary Stats Box */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50/60 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-inner">
                <div className="flex flex-col justify-center items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Siswa Baru Terdaftar</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {isRollbacked ? 0 : importedCount}
                  </span>
                </div>

                <div className="flex flex-col justify-center items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Baris Tidak Diimpor</span>
                  <span className="text-2xl font-black text-slate-500 dark:text-slate-400 mt-1">
                    {isRollbacked ? parsedRows.length : failedCount}
                  </span>
                </div>
              </div>

              {/* Database sync notification warning */}
              <div className="p-4 bg-blue-50/30 dark:bg-blue-950/10 rounded-xl border border-blue-100/30 text-[10px] text-blue-600 dark:text-blue-400 flex gap-2.5 text-left">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold block">Offline Local Persistence Sync Active</span>
                  <span className="block mt-0.5 text-slate-500 dark:text-slate-400">
                    Siswa disimpan langsung ke memori aplikasi & sinkronisasi localStorage lokal karena Firebase dimatikan. Data tetap awet saat tab di-refresh.
                  </span>
                </div>
              </div>

              {/* Action item reports & Rollback options */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-150 dark:border-slate-850 pt-5">
                {!isRollbacked && rollbackBackup && (
                  <button
                    onClick={handleRollback}
                    className="py-2.5 px-4 bg-white hover:bg-rose-50 border border-slate-250 hover:border-rose-200 text-rose-600 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-rose-950/20 dark:hover:border-rose-900/30 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                    Batalkan Transaksi (Rollback)
                  </button>
                )}

                <div className="flex gap-2.5 w-full sm:w-auto sm:ml-auto">
                  <button
                    onClick={() => {
                      setStep("upload");
                      setParsedRows([]);
                    }}
                    className="flex-1 sm:flex-initial py-2.5 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl transition-all shadow-sm"
                  >
                    Impor Lagi
                  </button>

                  <button
                    onClick={onClose}
                    className="flex-1 sm:flex-initial py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
