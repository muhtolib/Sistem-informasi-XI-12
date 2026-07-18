import {
  Student,
  ScheduleItem,
  AttendanceRecord,
  PermissionForm,
  CashTransaction,
  MeetingNote,
  LessonMaterial,
  HomeworkAssignment,
  GradeItem,
  DiscussionThread,
  PollingItem,
  LibraryBook,
  DocumentItem
} from "../types";

// Helper for generating NIS/NISN
export const initialStudents: Student[] = [
  {
    id: "std-1",
    name: "Aditya Pratama Putra",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    nis: "12045",
    nisn: "0083214561",
    gender: "Laki-laki",
    address: "Jl. Merdeka No. 45, Bandung, Jawa Barat",
    phone: "0812-3456-7890",
    parentInfo: {
      fatherName: "Bambang Pratama",
      motherName: "Siti Rahmawati",
      fatherOccupation: "Wiraswasta",
      motherOccupation: "Ibu Rumah Tangga",
      phone: "0812-9988-7766",
      email: "bambang.p@gmail.com"
    },
    medicalNotes: "Alergi kacang tanah",
    achievements: [
      { id: "ach-1", title: "Juara 1 OSN Fisika Tingkat Kota", category: "Akademik", date: "2026-03-12", description: "Meraih medali emas OSN bidang Fisika se-Kota Bandung", xpValue: 500 }
    ],
    violations: [],
    counselingNotes: "Siswa sangat bersemangat belajar Fisika, aktif di kelas.",
    level: 5,
    xp: 2450,
    badges: ["Scientist", "Perfect Attendance", "Class Captain"],
    seatIndex: 2 // Baris 1, Meja 2
  },
  {
    id: "std-2",
    name: "Citra Lestari Wulandari",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    nis: "12046",
    nisn: "0084511223",
    gender: "Perempuan",
    address: "Perum Kelapa Gading Blok C4, Bandung",
    phone: "0821-4455-6677",
    parentInfo: {
      fatherName: "Hendra Wulandari",
      motherName: "Dewi Lestari",
      fatherOccupation: "Pegawai Negeri Sipil",
      motherOccupation: "Guru SMAN 1",
      phone: "0821-3322-1100",
      email: "hendra.wul@yahoo.com"
    },
    medicalNotes: "Asma ringan, membawa inhaler pribadi",
    achievements: [
      { id: "ach-2", title: "Juara 2 Lomba Pidato Bahasa Inggris", category: "Non-Akademik", date: "2026-05-20", description: "Juara 2 pidato bahasa inggris tingkat provinsi Jawa Barat", xpValue: 400 }
    ],
    violations: [],
    counselingNotes: "Memiliki public speaking yang sangat bagus.",
    level: 4,
    xp: 1800,
    badges: ["Orator", "Perfect Attendance"],
    seatIndex: 3 // Baris 1, Meja 3
  },
  {
    id: "std-3",
    name: "Bagus Setiawan",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    nis: "12047",
    nisn: "0081239988",
    gender: "Laki-laki",
    address: "Gg. Bakti No. 12, Kel. Dago, Bandung",
    phone: "0857-1122-3344",
    parentInfo: {
      fatherName: "Agus Setiawan",
      motherName: "Yanti Purwanti",
      fatherOccupation: "Karyawan Swasta",
      motherOccupation: "Pedagang Kuliner",
      phone: "0857-4455-6622",
      email: "agus.setiawan@gmail.com"
    },
    medicalNotes: "Tidak ada",
    achievements: [],
    violations: [
      { id: "viol-1", title: "Terlambat Masuk Sekolah", category: "Ringan", date: "2026-06-02", description: "Terlambat masuk sekolah tanpa keterangan selama 15 menit", pointDeduction: 10 }
    ],
    counselingNotes: "Perlu bimbingan disiplin waktu di pagi hari.",
    level: 3,
    xp: 1100,
    badges: ["Friendly"],
    seatIndex: 4 // Baris 2, Meja 1
  },
  {
    id: "std-4",
    name: "Dian Sastrowardoyo",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    nis: "12048",
    nisn: "0089876543",
    gender: "Perempuan",
    address: "Jl. Dago Asri V No. 10, Bandung",
    phone: "0813-8877-6655",
    parentInfo: {
      fatherName: "Rudi Sastrowardoyo",
      motherName: "Siti Hartati",
      fatherOccupation: "Dosen ITB",
      motherOccupation: "Wiraswasta",
      phone: "0813-7766-5544",
      email: "rudi.sastro@itb.ac.id"
    },
    medicalNotes: "Miopi (-3.0), harus selalu duduk di baris depan",
    achievements: [
      { id: "ach-3", title: "Juara 1 Lomba Karya Tulis Ilmiah SMA", category: "Akademik", date: "2026-02-15", description: "Juara Karya Ilmiah Remaja (KIR) tingkat nasional", xpValue: 600 }
    ],
    violations: [],
    counselingNotes: "Kemampuan analisis tulisan sangat tajam.",
    level: 5,
    xp: 2900,
    badges: ["Gold Scholar", "Super Writer", "Organizer"],
    seatIndex: 1 // Baris 1, Meja 1 (Depan)
  },
  {
    id: "std-5",
    name: "Eko Wahyudi Kusuma",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    nis: "12049",
    nisn: "0087123490",
    gender: "Laki-laki",
    address: "Jl. Dipati Ukur No. 110, Bandung",
    phone: "0811-2233-4455",
    parentInfo: {
      fatherName: "Kusuma Wahyudi",
      motherName: "Ida Ayu",
      fatherOccupation: "Dokter Umum",
      motherOccupation: "Apoteker",
      phone: "0811-9988-7700",
      email: "dr.kusuma@klinik.com"
    },
    medicalNotes: "Tidak ada",
    achievements: [
      { id: "ach-4", title: "Medali Perunggu Kejurnas Karate", category: "Non-Akademik", date: "2026-04-10", description: "Kejuaraan nasional karate kategori junior putra", xpValue: 350 }
    ],
    violations: [],
    counselingNotes: "Fisik tangguh, sangat sportif dalam kegiatan olahraga kelas.",
    level: 4,
    xp: 1950,
    badges: ["Fighter", "Healthy Heart"],
    seatIndex: 8 // Baris 2, Meja 4
  },
  {
    id: "std-6",
    name: "Fitri Handayani",
    photoUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=150",
    nis: "12050",
    nisn: "0089012345",
    gender: "Perempuan",
    address: "Perum Buah Batu Indah Blok E2 No. 5, Bandung",
    phone: "0822-7788-9900",
    parentInfo: {
      fatherName: "Surahmat Handayani",
      motherName: "Sri Wahyuni",
      fatherOccupation: "Arsitek",
      motherOccupation: "Desainer Grafis",
      phone: "0822-6655-4433",
      email: "surahmat.arch@gmail.com"
    },
    medicalNotes: "Tidak ada",
    achievements: [
      { id: "ach-5", title: "Juara Harapan 1 Poster Edukasi Lingkungan", category: "Non-Akademik", date: "2026-06-18", description: "Lomba desain poster tingkat Jabodetabek & Jabar", xpValue: 200 }
    ],
    violations: [],
    counselingNotes: "Sangat kreatif, berbakat di seni lukis dan desain.",
    level: 3,
    xp: 1350,
    badges: ["Artist", "Friendly"],
    seatIndex: 6 // Baris 2, Meja 2
  },
  {
    id: "std-7",
    name: "Guntur Wibowo",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
    nis: "12051",
    nisn: "0086789012",
    gender: "Laki-laki",
    address: "Jl. Cihampelas No. 120, Bandung",
    phone: "0852-1111-2222",
    parentInfo: {
      fatherName: "Ahmad Wibowo",
      motherName: "Halimah Wibowo",
      fatherOccupation: "TNI AD",
      motherOccupation: "Ibu Rumah Tangga",
      phone: "0852-3333-4444",
      email: "ahmad.wib@mil.id"
    },
    medicalNotes: "Tidak ada",
    achievements: [],
    violations: [
      { id: "viol-2", title: "Membolos Jam Pelajaran Akhir", category: "Berat", date: "2026-05-15", description: "Meninggalkan lingkungan sekolah sebelum lonceng keluar tanpa izin", pointDeduction: 50 }
    ],
    counselingNotes: "Telah dipanggil bersama orang tua untuk pembinaan disiplin. Menunjukkan niat berubah.",
    level: 2,
    xp: 750,
    badges: ["Underdog"],
    seatIndex: 9 // Baris 3, Meja 1
  },
  {
    id: "std-8",
    name: "Hesti Purwanti",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=150",
    nis: "12052",
    nisn: "0082345678",
    gender: "Perempuan",
    address: "Jl. Antapani Raya No. 15, Bandung",
    phone: "0819-3334-4455",
    parentInfo: {
      fatherName: "Dadang Purwanto",
      motherName: "Eli Marlina",
      fatherOccupation: "Karyawan BUMN (KAI)",
      motherOccupation: "Perawat",
      phone: "0819-5555-6666",
      email: "dadang.pur@bumn.com"
    },
    medicalNotes: "Alergi debu berat",
    achievements: [],
    violations: [],
    counselingNotes: "Anak yang pendiam, rajin mencatat pelajaran secara sistematis.",
    level: 4,
    xp: 1650,
    badges: ["Star Student"],
    seatIndex: 7 // Baris 2, Meja 3
  }
];

export const initialSchedules: ScheduleItem[] = [
  // Senin
  { id: "sch-1", day: "Senin", time: "07:00 - 07:45", subject: "Upacara Bendera", teacher: "Wali Kelas" },
  { id: "sch-2", day: "Senin", time: "07:45 - 09:15", subject: "Matematika Peminatan", teacher: "Drs. Mulyono" },
  { id: "sch-3", day: "Senin", time: "09:30 - 11:00", subject: "Fisika", teacher: "Ibu Hartati, M.Pd" },
  { id: "sch-4", day: "Senin", time: "11:00 - 12:30", subject: "Bahasa Indonesia", teacher: "Bpk. Sutarman" },
  // Selasa
  { id: "sch-5", day: "Selasa", time: "07:00 - 08:30", subject: "Kimia", teacher: "Ibu Lilis Martini" },
  { id: "sch-6", day: "Selasa", time: "08:30 - 10:00", subject: "Biologi", teacher: "Bpk. Dr. Junaedi" },
  { id: "sch-7", day: "Selasa", time: "10:15 - 11:45", subject: "Sejarah Indonesia", teacher: "Ibu Sri Rezeki" },
  // Rabu
  { id: "sch-8", day: "Rabu", time: "07:00 - 08:30", subject: "Pendidikan Agama", teacher: "Ustadz H. Syarif" },
  { id: "sch-9", day: "Rabu", time: "08:30 - 10:00", subject: "Bahasa Inggris", teacher: "Miss Jenny Lee" },
  { id: "sch-10", day: "Rabu", time: "10:15 - 11:45", subject: "PPKn", teacher: "Bpk. Bambang, S.H" },
  // Kamis
  { id: "sch-11", day: "Kamis", time: "07:00 - 08:30", subject: "Fisika (Praktikum)", teacher: "Ibu Hartati, M.Pd" },
  { id: "sch-12", day: "Kamis", time: "08:30 - 10:00", subject: "Matematika Wajib", teacher: "Ibu Endang, S.Pd" },
  { id: "sch-13", day: "Kamis", time: "10:15 - 11:45", subject: "Seni Budaya", teacher: "Bpk. Cecep (Seniman)" },
  // Jumat
  { id: "sch-14", day: "Jumat", time: "07:00 - 08:00", subject: "Senam Pagi & Kebersihan", teacher: "Seluruh Wali" },
  { id: "sch-15", day: "Jumat", time: "08:00 - 09:30", subject: "Pendidikan Jasmani", teacher: "Bpk. Gatot Adi" },
  { id: "sch-16", day: "Jumat", time: "09:45 - 11:15", subject: "Bimbingan Konseling", teacher: "Ibu Rina (Guru BK)" }
];

export const cleaningDutySchedule = [
  { day: "Senin", students: ["Aditya Pratama Putra", "Citra Lestari Wulandari"] },
  { day: "Selasa", students: ["Bagus Setiawan", "Dian Sastrowardoyo"] },
  { day: "Rabu", students: ["Eko Wahyudi Kusuma", "Fitri Handayani"] },
  { day: "Kamis", students: ["Guntur Wibowo", "Hesti Purwanti"] },
  { day: "Jumat", students: ["Aditya Pratama Putra", "Bagus Setiawan", "Guntur Wibowo"] }
];

export const classRules = [
  { id: "rule-1", text: "Hadir di ruang kelas paling lambat pukul 06.50 WIB sebelum bel berbunyi.", category: "Disiplin" },
  { id: "rule-2", text: "Memakai seragam sekolah yang lengkap dan rapi sesuai ketentuan hari.", category: "Seragam" },
  { id: "rule-3", text: "Menjaga kebersihan dan ketertiban meja pribadi serta berpartisipasi dalam regu piket harian.", category: "Kebersihan" },
  { id: "rule-4", text: "Mengaktifkan mode senyap (silent) ponsel dan menyimpannya di tas selama KBM berlangsung kecuali diinstruksikan guru.", category: "Fokus Belajar" },
  { id: "rule-5", text: "Menghormati guru, staf sekolah, serta bertutur kata sopan kepada seluruh teman sekelas.", category: "Sopan Santun" }
];

export const initialCashTransactions: CashTransaction[] = [
  { id: "tx-1", date: "2026-07-01", description: "Saldo Awal Kas Kelas XI-12", amount: 250000, type: "Debit", category: "Lainnya" },
  { id: "tx-2", date: "2026-07-05", studentId: "std-1", studentName: "Aditya Pratama Putra", description: "Iuran Bulanan Juli (Aditya)", amount: 20000, type: "Debit", category: "Iuran Harian" },
  { id: "tx-3", date: "2026-07-05", studentId: "std-2", studentName: "Citra Lestari Wulandari", description: "Iuran Bulanan Juli (Citra)", amount: 20000, type: "Debit", category: "Iuran Harian" },
  { id: "tx-4", date: "2026-07-05", studentId: "std-4", studentName: "Dian Sastrowardoyo", description: "Iuran Bulanan Juli (Dian)", amount: 20000, type: "Debit", category: "Iuran Harian" },
  { id: "tx-5", date: "2026-07-10", description: "Pembelian Sapu Baru & Penghapus Papan", amount: 45000, type: "Kredit", category: "Alat Tulis" },
  { id: "tx-6", date: "2026-07-12", description: "Sumbangan Sosial untuk keluarga sakit (Bagus)", amount: 50000, type: "Kredit", category: "Sosial" },
  { id: "tx-7", date: "2026-07-14", studentId: "std-5", studentName: "Eko Wahyudi Kusuma", description: "Iuran Bulanan Juli (Eko)", amount: 20000, type: "Debit", category: "Iuran Harian" }
];

export const initialMeetingNotes: MeetingNote[] = [
  {
    id: "note-1",
    date: "2026-07-10",
    title: "Rapat Koordinasi Wali Kelas dengan Pengurus Kelas XI-12",
    attendees: ["Pak Muhtolib (Wali Kelas)", "Aditya Pratama (Ketua Kelas)", "Citra Lestari (Sekretaris)", "Dian Sastro (Bendahara)"],
    content: "Membahas tentang persiapan dekorasi kelas menyambut HUT RI ke-81, perbaikan gorden kelas yang robek, serta rencana kas mingguan untuk dana cadangan sosial siswa.",
    actionItems: [
      "Beli bendera plastik kecil dan kertas krep merah putih (PJ: Aditya, deadline 25 Juli).",
      "Menjahit ulang gorden kelas yang kendur (PJ: Citra & orang tua, deadline 30 Juli).",
      "Sosialisasi iuran kas wajib mingguan sebesar Rp 5.000 kepada siswa (PJ: Dian Sastro)."
    ]
  }
];

export const initialLessonMaterials: LessonMaterial[] = [
  { id: "mat-1", title: "Modul Lengkap Termodinamika & Hukum Gas Ideal", subject: "Fisika", classLevel: "XI-12", type: "PDF", url: "#", description: "Modul pengantar konsep termodinamika kelas XI mencakup diagram P-V, siklus Carnot, dan efisiensi mesin." },
  { id: "mat-2", title: "Video Pembelajaran: Turunan Fungsi Trigonometri", subject: "Matematika", classLevel: "XI-12", type: "Video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", duration: "12 Menit", description: "Video beranimasi menarik menjelaskan penurunan rumus turunan sin, cos, tan secara komprehensif." },
  { id: "mat-3", title: "Slide Presentasi Sifat Koligatif Larutan", subject: "Kimia", classLevel: "XI-12", type: "Slide", url: "#", description: "Slide presentasi ringkas mengenai penurunan tekanan uap, kenaikan titik didih, penurunan titik beku, dan tekanan osmosis." }
];

export const initialHomeworkAssignments: HomeworkAssignment[] = [
  { id: "hw-1", title: "Latihan Soal Siklus Carnot & Hukum 2 Termodinamika", subject: "Fisika", dueDate: "2026-07-22", description: "Kerjakan 5 soal latihan esai di lembar double folio. Gambarkan diagram P-V untuk setiap siklus.", xpReward: 150, submissionsCount: 6 },
  { id: "hw-2", title: "Tugas Mandiri: Aplikasi Turunan dalam Kehidupan Sehari-hari", subject: "Matematika", dueDate: "2026-07-25", description: "Buatlah 1 studi kasus optimasi luas atau volume menggunakan turunan pertama.", xpReward: 200, submissionsCount: 4 }
];

export const initialGrades: GradeItem[] = [
  { id: "grd-1", studentId: "std-1", studentName: "Aditya Pratama Putra", subject: "Fisika", homeworkScore: 92, quizScore: 88, examScore: 90, reflectionScore: 95 },
  { id: "grd-2", studentId: "std-2", studentName: "Citra Lestari Wulandari", subject: "Fisika", homeworkScore: 85, quizScore: 92, examScore: 88, reflectionScore: 90 },
  { id: "grd-3", studentId: "std-3", studentName: "Bagus Setiawan", subject: "Fisika", homeworkScore: 70, quizScore: 74, examScore: 72, reflectionScore: 80 },
  { id: "grd-4", studentId: "std-4", studentName: "Dian Sastrowardoyo", subject: "Fisika", homeworkScore: 98, quizScore: 95, examScore: 96, reflectionScore: 100 },
  { id: "grd-5", studentId: "std-5", studentName: "Eko Wahyudi Kusuma", subject: "Fisika", homeworkScore: 80, quizScore: 82, examScore: 85, reflectionScore: 85 }
];

export const initialDiscussionThreads: DiscussionThread[] = [
  {
    id: "disc-1",
    title: "Tanya Jawab: Apakah Mesin Carnot 100% Efisien Mungkin?",
    author: "Aditya Pratama Putra",
    authorRole: "Siswa",
    content: "Halo teman-teman dan Ibu Guru. Saya sedang membaca tentang siklus Carnot. Dikatakan bahwa efisiensi Carnot adalah batas maksimum, tapi kenapa tetap tidak bisa mencapai 100% efisiensi secara teoritis? Bukankah itu mesin ideal?",
    date: "2026-07-16 19:30",
    replies: [
      { id: "rep-1", author: "Pak Muhtolib, M.Pd", role: "Wali Kelas", content: "Pertanyaan hebat, Aditya! Berdasarkan Hukum Kedua Termodinamika, kalor tidak dapat diubah seluruhnya menjadi usaha tanpa adanya kalor sisa yang dibuang ke reservoir dingin (Qc > 0). Jadi, untuk efisiensi 100%, suhu reservoir dingin haruslah 0 Kelvin (Nol Mutlak), yang mana secara praktis tidak mungkin dicapai berdasarkan Hukum Ketiga.", date: "2026-07-16 20:15" },
      { id: "rep-2", author: "Dian Sastrowardoyo", role: "Siswa", content: "Wah penjelasan Ibu jelas sekali! Jadi karena kita tidak bisa mencapai suhu 0 Kelvin, maka Qc selalu bernilai positif dan efisiensi selalu kurang dari 1.", date: "2026-07-17 08:00" }
    ]
  }
];

export const initialPolls: PollingItem[] = [
  {
    id: "poll-1",
    question: "Tujuan Kunjungan Industri / Study Tour Semester Ganjil?",
    options: [
      { text: "Pusat Penelitian Sains & Teknologi (Puspiptek) Serpong", votes: 18 },
      { text: "Museum Geologi & Observatorium Bosscha Lembang", votes: 24 },
      { text: "LIPI Oceanografi & Planetarium Jakarta", votes: 12 }
    ],
    totalVotes: 54,
    dateCreated: "2026-07-12"
  }
];

export const initialLibraryBooks: LibraryBook[] = [
  { id: "bk-1", title: "Fisika Universitas Jilid 2 (Sears & Zemansky)", author: "Hugh D. Young", subject: "Fisika", pages: 680, coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=150" },
  { id: "bk-2", title: "Kalkulus Edisi Kesembilan", author: "Dale Varberg", subject: "Matematika", pages: 720, coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=150" },
  { id: "bk-3", title: "Sosiologi: Memahami Masyarakat Kondisional", author: "Prof. Dr. Soerjono Soekanto", subject: "Sosiologi", pages: 410, coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=150" }
];

export const initialDocuments: DocumentItem[] = [
  { id: "doc-1", title: "Surat Edaran Persiapan HUT RI 81 Kelas XI-12.pdf", category: "Surat Edaran", date: "2026-07-15", fileSize: "1.2 MB" },
  { id: "doc-2", title: "Format Form Izin Sakit Siswa - SMAN 1 Bandung.docx", category: "Format Surat", date: "2026-07-02", fileSize: "45 KB" },
  { id: "doc-3", title: "Tata Tertib Siswa SMA Terupdate 2026.pdf", category: "Arsip Kelas", date: "2026-06-20", fileSize: "2.4 MB" }
];
