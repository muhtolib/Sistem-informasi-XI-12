export interface ParentInfo {
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  motherOccupation: string;
  phone: string;
  email: string;
}

export interface Achievement {
  id: string;
  title: string;
  category: "Akademik" | "Non-Akademik" | "Sosial";
  date: string;
  description: string;
  xpValue: number;
}

export interface Violation {
  id: string;
  title: string;
  category: "Ringan" | "Sedang" | "Berat";
  date: string;
  description: string;
  pointDeduction: number;
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  type: "Gambar" | "Video" | "PDF" | "Proyek" | "Jurnal";
  url: string;
  description: string;
  date: string;
  likes: number;
}

export interface Student {
  id: string;
  name: string;
  photoUrl: string;
  nis: string;
  nisn: string;
  gender: "Laki-laki" | "Perempuan";
  address: string;
  phone: string;
  parentInfo: ParentInfo;
  medicalNotes: string;
  achievements: Achievement[];
  violations: Violation[];
  counselingNotes: string;
  level: number;
  xp: number;
  badges: string[];
  seatIndex: number; // For seat layout (0-39)
}

export interface ScheduleItem {
  id: string;
  day: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat";
  time: string;
  subject: string;
  teacher: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  status: "Hadir" | "Sakit" | "Izin" | "Alpa" | "Terlambat";
  notes?: string;
  time?: string;
}

export interface PermissionForm {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  dateStart: string;
  dateEnd: string;
  type: "Sakit" | "Izin";
  reason: string;
  attachmentUrl?: string;
  status: "Diproses" | "Disetujui" | "Ditolak";
}

export interface CashTransaction {
  id: string;
  date: string;
  studentId?: string;
  studentName?: string;
  description: string;
  amount: number;
  type: "Debit" | "Kredit"; // Debit = incoming, Kredit = outgoing
  category: "Iuran Harian" | "Alat Tulis" | "Sosial" | "Kegiatan" | "Lainnya";
}

export interface MeetingNote {
  id: string;
  date: string;
  title: string;
  attendees: string[];
  content: string;
  actionItems: string[];
}

export interface LessonMaterial {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  type: "PDF" | "Video" | "Slide";
  url: string;
  duration?: string;
  description: string;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  description: string;
  xpReward: number;
  submissionsCount: number;
}

export interface GradeItem {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  homeworkScore: number;
  quizScore: number;
  examScore: number;
  reflectionScore: number;
}

export interface DiscussionThread {
  id: string;
  title: string;
  author: string;
  authorRole: "Wali Kelas" | "Siswa" | "Orang Tua";
  content: string;
  date: string;
  replies: {
    id: string;
    author: string;
    role: string;
    content: string;
    date: string;
  }[];
}

export interface PollingItem {
  id: string;
  question: string;
  options: {
    text: string;
    votes: number;
  }[];
  totalVotes: number;
  userVotedIndex?: number;
  dateCreated: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  subject: string;
  pages: number;
  coverUrl: string;
  bookmarked?: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: "Surat Edaran" | "Format Surat" | "Arsip Kelas";
  date: string;
  fileSize: string;
}
