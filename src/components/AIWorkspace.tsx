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
  studentName = "Siswa Kelas XI-12",
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
    planner: "Buat jadwal persiapan ujian kelulusan mata pelajaran Biologi selama 1 minggu penuh untuk siswa XI-12.",
    quiz: "Buat kuis pilihan ganda berisi 3 soal materi Termodinamika (Siklus Carnot) SMA Kelas XI-12 beserta pembahasannya.",
    summary: "Rangkum materi Sosiologi tentang Konflik Sosial dan bentuk-bentuk integrasi masyarakat.",
    reflection: "Ini refleksi belajar saya hari ini: 'Saya masih bingung membedakan antara gaya gesek kinetik dan statis saat mengerjakan soal beban miring.' Tolong evaluasi.",
    chatbot: "Apa perbedaan antara pembelahan sel Mitosis dan Meiosis? Jelaskan perbedaannya dalam bentuk tabel.",
  };

  const getFrontendMockResponse = (prompt: string, tab: string): string => {
    const lower = prompt.toLowerCase().trim();
    
    // 1. Math / Calculation queries
    if (
      lower.includes("hitung") || 
      (lower.includes("berapa") && /\d+/.test(lower)) || 
      lower.includes("matematika") || 
      lower.includes("aljabar") ||
      lower.includes("integral") ||
      lower.includes("persamaan") ||
      lower.includes("+") || 
      lower.includes("-") || 
      (lower.includes("x") && /\d+/.test(lower)) || 
      (lower.includes("/") && /\d+/.test(lower))
    ) {
      const numbers = lower.match(/\d+/g) || [];
      const num1 = numbers[0] ? parseInt(numbers[0], 10) : 12;
      const num2 = numbers[1] ? parseInt(numbers[1], 10) : 5;
      
      let op = "Penjumlahan";
      let symbol = "+";
      let result = num1 + num2;
      
      if (lower.includes("kali") || lower.includes("x") || lower.includes("*")) {
        op = "Perkalian";
        symbol = "×";
        result = num1 * num2;
      } else if (lower.includes("kurang") || lower.includes("-")) {
        op = "Pengurangan";
        symbol = "-";
        result = num1 - num2;
      } else if (lower.includes("bagi") || lower.includes("/")) {
        op = "Pembagian";
        symbol = "/";
        result = num2 !== 0 ? Math.round((num1 / num2) * 100) / 100 : 0;
      }
      
      return `### 🧮 Solusi Pembahasan Matematika / Berhitung Mandiri
      
**Materi: Operasi ${op} Aljabar SMA**
*Disusun secara dinamis oleh Asisten Akademis AI SMAN 1 Nagreg*

#### Langkah-Langkah Penyelesaian Soal Anda:
1.  **Identifikasi Nilai Parameter:**
    *   Suku pertama ($a$) = $${num1}$$
    *   Suku kedua ($b$) = $${num2}$$
2.  **Formulasi Persamaan:**
    $$S(x) = a ${symbol} b$$
    $$S(x) = ${num1} ${symbol} ${num2}$$
3.  **Hasil Perhitungan Akhir:**
    $$\\mathbf{Hasil = ${result}}$$

#### 💡 Teori Tambahan Pendalaman Karakter:
*   **Sifat Komutatif:** Operasi penjumlahan dan perkalian memenuhi hukum komutatif, yaitu $a ${symbol} b = b ${symbol} a$. Namun tidak berlaku untuk pengurangan dan pembagian.
*   **Sifat Asosiatif:** Pengelompokan hitungan $(a ${symbol} b) ${symbol} c = a ${symbol} (b ${symbol} c)$ memudahkan pencarian nilai suku polinomial majemuk.
*   **Aplikasi Realistis:** Konsep ini sering digunakan untuk menghitung matriks transformasi linier atau menghitung kelajuan rata-rata gerak lurus beraturan di Fisika.

Apakah Anda membutuhkan contoh soal latihan turunan atau limit dengan angka-angka di atas? Ketik pertanyaan Anda untuk melanjutkan!`;
    }

    // 2. Quiz-specific queries or explicitly requested kuis
    if (tab === "quiz" || lower.includes("quiz") || lower.includes("kuis") || lower.includes("soal")) {
      return `### 📝 Kuis Evaluasi Mandiri: Termodinamika & Fisika SMA
      
**Materi: Siklus Carnot & Hukum Termodinamika**
*Disusun oleh Asisten Pendidikan AI SMAN 1 Nagreg*

1. **Soal 1 (Pilihan Ganda):**
   Sebuah mesin Carnot bekerja pada suhu tinggi $800\\text{ K}$ dan suhu rendah $400\\text{ K}$. Efisiensi maksimum yang dapat dihasilkan oleh mesin tersebut sebesar...
   - A. 25%
   - B. 40%
   - C. 50% (Kunci Jawaban)
   - D. 60%
   
   *Pembahasan:* Efisiensi Carnot dialokasikan dengan rumus $\\eta = 1 - \\frac{T_c}{T_h}$.
   $$\\eta = 1 - \\frac{400}{800} = 1 - 0,5 = 0,5 \\text{ atau } 50\\%$$

2. **Soal 2 (Pilihan Ganda):**
   Suatu sistem gas menerima kalor sebesar $3000\\text{ Joule}$ dan melakukan usaha luar sebesar $1200\\text{ Joule}$. Perubahan energi dalam sistem gas tersebut adalah...
   - A. 1800 J (Kunci Jawaban)
   - B. 2400 J
   - C. 3000 J
   - D. 4200 J
   
   *Pembahasan:* Hukum I Termodinamika menyatakan $\\Delta U = Q - W$.
   $$\\Delta U = 3000\\text{ J} - 1200\\text{ J} = 1800\\text{ Joule}$$

3. **Soal 3 (Esai Singkat):**
   Jelaskan mengapa mesin kalor nyata tidak pernah bisa mencapai efisiensi 100% berdasarkan Hukum II Termodinamika!
   *Kunci Jawaban:* Berdasarkan rumusan Kelvin-Planck pada Hukum II Termodinamika, tidak mungkin membuat suatu mesin yang menyerap kalor dari reservoir panas dan mengubah seluruh kalor tersebut menjadi usaha murni tanpa membuang sebagian kalor ke reservoir dingin. Oleh karena itu, efisiensi selalu kurang dari 100%.`;
    }

    // 3. Planner queries
    if (tab === "planner" || lower.includes("plan") || lower.includes("jadwal") || lower.includes("rencana")) {
      return `### 📅 AI Study Planner: Agenda Belajar Mandiri Personal (XI-12)
      
*Rencana Belajar Terstruktur Penjajakan Ujian Nasional - SMAN 1 Nagreg*

*   **Senin - Hari 1: Pendalaman Sel & Organel (Biologi) [60 Menit]**
    *   *Fokus:* Mengulas perbedaan sel prokariotik dan eukariotik beserta fungsi organel mitokondria, ribosom, dan badan golgi.
    *   *Sesi Latihan:* Menggambar struktur membran sel ganda dan memahami transpor aktif/pasif.
*   **Selasa - Hari 2: Pembelahan Sel Mitosis & Meiosis (Biologi) [90 Menit]**
    *   *Fokus:* Menghafal urutan fase pembelahan (Profase, Metafase, Anafase, Telofase).
    *   *Tips Pintar:* Buat mnemonic singkat untuk mengingat tahapan meiosis (I & II).
*   **Rabu - Hari 3: Ulasan Kimia & Struktur Atom [60 Menit]**
    *   *Fokus:* Sifat periodik unsur dan konfigurasi elektron modern.
*   **Kamis - Hari 4: Latihan Soal Evaluasi Mandiri [120 Menit]**
    *   *Fokus:* Mengerjakan soal pilihan ganda bab pembelahan sel dan sistem transpor. Catat poin-poin tebal yang masih salah.
*   **Jumat - Hari 5: Konsolidasi & Refleksi Guru [45 Menit]**
    *   *Fokus:* Mereview rangkuman harian di portofolio digital dan mendiskusikan bagian sulit dengan teman piket kelompok belajar.`;
    }

    // 4. Biology / Genetics
    if (
      lower.includes("biologi") || 
      lower.includes("sel") || 
      lower.includes("organel") || 
      lower.includes("mitosis") || 
      lower.includes("meiosis") || 
      lower.includes("hewan") || 
      lower.includes("tumbuhan") || 
      lower.includes("kromosom") ||
      lower.includes("gamet")
    ) {
      return `### 🔬 Pembahasan Sel: Mitosis vs Meiosis (Tanya AI Guru)

Berikut adalah ringkasan perbedaan mendasar antara pembelahan sel **Mitosis** dan **Meiosis** dalam bentuk tabel perbandingan kurikulum SMA Kelas XI:

| Kriteria Perbedaan | Pembelahan Mitosis | Pembelahan Meiosis |
| :--- | :--- | :--- |
| **Lokasi Pembelahan** | Sel tubuh (somatis) | Sel kelamin (gamet) |
| **Jumlah Pembelahan** | 1 Kali pembelahan | 2 Kali pembelahan berturut-turut |
| **Jumlah Sel Anakan** | Menghasilkan 2 sel anakan | Menghasilkan 4 sel anakan |
| **Sifat Kromosom Anak**| Diploid ($2n$) - identik induk | Haploid ($n$) - variasi genetik |
| **Tujuan Utama** | Pertumbuhan, regenerasi sel rusak | Pembentukan sel telur & sperma |
| **Pindah Silang (*Crossing Over*)** | Tidak terjadi | Terjadi pada Profase I |

### Tahapan Fase Utama:
1.  **Profase:** Kromatin memadat menjadi kromosom, membran inti mulai lenyap.
2.  **Metafase:** Kromosom berjejer rapi di bidang pembelahan (ekuator).
3.  **Anafase:** Kromatid saudara berpisah dan tertarik ke kutub berlawanan.
4.  **Telofase:** Terbentuk membran inti baru, terjadi sitokinesis (pembelahan sitoplasma).

Semoga penjelasan tabel ini membantu pemahaman tugas akademismu!`;
    }

    // 5. Chemistry / Compounds
    if (
      lower.includes("kimia") || 
      lower.includes("atom") || 
      lower.includes("molekul") || 
      lower.includes("unsur") || 
      lower.includes("senyawa") || 
      lower.includes("asam") || 
      lower.includes("basa") || 
      lower.includes("reaksi") || 
      lower.includes("larutan") || 
      lower.includes("ph")
    ) {
      return `### 🧪 Pembahasan Kimia SMA: Struktur Atom & Sifat Reaksi Larutan
    
*Ulasan Materi Akademis oleh Asisten Pintar AI*

Kimia mempelajari komposisi, struktur, sifat, dan perubahan materi. Berikut adalah konsep fundamental yang relevan dengan pertanyaan Anda:

#### 1. Struktur Atom & Konfigurasi Elektron:
Atom terdiri dari inti atom (Proton yang bermuatan positif, Neutron yang netral) dikelilingi oleh Elektron (bermuatan negatif) pada lintasan kulit atom.
*   **Nomor Atom (Z):** Menunjukkan jumlah proton (atau elektron pada atom netral).
*   **Nomor Massa (A):** Jumlah Proton + Jumlah Neutron.
*   *Konfigurasi Bohr:* Pengisian elektron per kulit berdasarkan rumus $2n^2$ (Kulit K=2, L=8, M=18, dst).

#### 2. Pengukuran pH Asam dan Basa:
*   **Asam Kuat / Lemah:** Larutan dengan pH < 7. Mengubah kertas lakmus biru menjadi merah. Mengandung ion $\\text{H}^+$.
*   **Basa Kuat / Lemah:** Larutan dengan pH > 7. Mengubah kertas lakmus merah menjadi biru. Mengandung ion $\\text{OH}^-$.
*   **Netral:** Larutan dengan pH = 7 (seperti air murni pada suhu kamar).
*   *Rumus pH:* 
    $$\\text{pH} = -\\log[\\text{H}^+]$$
    $$\\text{pOH} = -\\log[\\text{OH}^-]$$
    $$\\text{pH} + \\text{pOH} = 14$$

#### 3. Persamaan Reaksi Kimia Sederhana:
Reaksi stoikiometri harus setara antara sisi reaktan (kiri) dengan produk (kanan) sesuai hukum kekekalan massa (Hukum Lavoisier):
$$\\text{CH}_4 + 2\\text{O}_2 \\rightarrow \\text{CO}_2 + 2\\text{H}_2\\text{O}$$

*Tips Kimia:* Hafalkan unsur-unsur golongan utama (IA sampai VIIIA) dengan bantuan singkatan jembatan keledai untuk mempermudah tebakan ikatan kovalen/ion.`;
    }

    // 6. Physics
    if (
      lower.includes("fisika") || 
      lower.includes("gaya") || 
      lower.includes("gravitasi") || 
      lower.includes("kecepatan") || 
      lower.includes("suhu") || 
      lower.includes("kalor") || 
      lower.includes("magnet") || 
      lower.includes("listrik") ||
      lower.includes("energi") ||
      lower.includes("termodinamika") ||
      lower.includes("hukum") ||
      lower.includes("hooke") ||
      tab === "assistant"
    ) {
      return `### ⚡ Pembahasan Fisika SMA: Hukum Alam, Gaya, & Energi
    
*Solusi Pembelajaran Interaktif Asisten WaliKelas*

Berdasarkan topik yang Anda tanyakan seputar dinamika atau energi, mari kita telaah formula dasar dan aplikasi penerapannya di kelas:

#### 1. Pembahasan Hukum Hooke & Elastisitas Pegas:
Jika gaya tarik diberikan pada pegas elastis, pertambahan panjang pegas tersebut akan sebanding dengan gaya penarik selama tidak melampaui batas elastisitas:
$$F = k \\cdot \\Delta x$$
*   $F$ = Gaya Penarik (Newton, N)
*   $k$ = Konstanta Pegas (N/m)
*   $\\Delta x$ = Selisih pertambahan panjang pegas (meter, m)

#### 2. Dinamika Hukum Newton tentang Gerak:
*   **Hukum I Newton (Inersia/Kelembaman):** $\\sum F = 0$. Benda diam cenderung tetap diam, benda bergerak lurus beraturan cenderung mempertahankan gerakannya.
*   **Hukum II Newton (Percepatan):** $\\sum F = m \\cdot a$. Percepatan berbanding lurus dengan resultan gaya dan berbanding terbalik dengan massa benda.
*   **Hukum III Newton (Aksi-Reaksi):** $F_{\\text{aksi}} = -F_{\\text{reaksi}}$. Setiap gaya aksi menimbulkan reaksi dengan arah berlawanan.

#### 3. Contoh Sesi Latihan Cepat:
Misal konstanta pegas adalah $k = 400\\text{ N/m}$. Jika ditarik dengan pertambahan panjang $\\Delta x = 0,05\\text{ m}$ ($5\\text{ cm}$), berapakah gaya yang dialami?
$$F = k \\cdot \\Delta x = 400 \\cdot 0,05 = 20\\text{ Newton}$$

*Tips Fisika:* Perhatikan konversi satuan ke Sistem Internasional (SI) seperti mengubah cm ke m, gram ke kg, sebelum memasukkan angka ke dalam rumus.`;
    }

    // 7. Reflection
    if (tab === "reflection" || lower.includes("refleksi") || lower.includes("reflection") || lower.includes("gaya gesek")) {
      return `### 🧠 Evaluasi Refleksi Jurnal Belajar Siswa
      
**Skor Apresiasi Keterbukaan Belajar: 92/100**
*Diulas oleh Konselor Pembelajaran AI SMAN 1 Nagreg*

**Masukan & Pembahasan Materi (Gaya Gesek Statis vs Kinetis):**
1.  **Gaya Gesek Statis ($f_s$):** Bekerja saat benda masih dalam keadaan *diam* hingga sesaat sebelum bergerak. Nilainya bervariasi dari nol hingga nilai maksimumnya ($f_{s\\text{ max}} = \\mu_s \\cdot N$).
2.  **Gaya Gesek Kinetis ($f_k$):** Bekerja saat benda sudah *bergerak*. Nilainya konstan ($f_k = \\mu_k \\cdot N$). Ingat bahwa $\\mu_s$ selalu lebih besar daripada $\\mu_k$.
3.  **Kasus Bidang Miring:**
    Gaya pendorong benda ke bawah bidang miring adalah gaya sejajar bidang:
    $$F_{\\text{turun}} = m \\cdot g \\cdot \\sin(\\theta)$$
    Sedangkan Gaya normal adalah:
    $$N = m \\cdot g \\cdot \\cos(\\theta)$$
    *   Jika $m \\cdot g \\cdot \\sin(\\theta) \\le f_{s\\text{ max}}$, benda tetap diam (gaya gesek yang bekerja sama dengan $m \\cdot g \\cdot \\sin(\\theta)$).
    *   Jika $m \\cdot g \\cdot \\sin(\\theta) > f_{s\\text{ max}}$, benda bergerak meluncur ke bawah (gaya gesek yang bekerja adalah gaya gesek kinetis $f_k$).

**Tips Pembelajaran Mandiri:**
Cobalah menggambar diagram gaya bebas (*free-body diagram*) terlebih dahulu sebelum menuliskan persamaan matematika. Visualisasi membantu mengidentifikasi sudut $\\theta$ dengan akurat!`;
    }

    // 8. Summary
    if (tab === "summary" || lower.includes("summary") || lower.includes("rangkum") || lower.includes("ringkas") || lower.includes("sosiologi")) {
      return `### 📖 AI Lesson Summary: Ringkasan Sosiologi SMA
      
**Topik: Konflik Sosial, Diferensiasi, dan Integrasi Masyarakat (Kurikulum Merdeka)**
*Dibuat oleh AI Asisten Akademik Kurikulum Nasional*

#### 1. Esensi Konflik Sosial
*   **Definisi:** Benturan kepentingan, nilai, atau tujuan antara dua pihak atau lebih untuk menyingkirkan pihak lawan.
*   **Faktor Pemicu:** Perbedaan individu, primordialisme berlebih, kesenjangan ekonomi, perubahan sosial yang terlalu cepat.
*   **Dampak Positif:** Memperkuat solidaritas internal kelompok (*in-group solidarity*), mendorong perubahan sosial konstruktif.

#### 2. Dinamika Integrasi Sosial
*   **Definisi:** Upaya menyatukan berbagai kelompok sosial yang terfragmentasi dalam satu kesatuan nasional yang utuh.
*   **Bentuk Integrasi:**
    *   *Integrasi Normatif:* Disatukan oleh norma sosial bersama (Contoh: Semboyan Bhinneka Tunggal Ika).
    *   *Integrasi Fungsional:* Terbentuk karena ketergantungan fungsi kerja antarkelompok.
    *   *Integrasi Koersif:* Terbentuk karena paksaan atau kekuasaan penguasa hukum.

#### 3. Tips Mengerjakan Esai Ujian
Fokus pada contoh sosiologis konkret di lingkungan sekitar (seperti konflik gotong royong warga, integrasi rukun tetangga, dll.) untuk mendapatkan skor analisis maksimum dari guru pemeriksa.`;
    }

    // 9. Free-form Dynamic Text Generator for other inputs
    const words = prompt.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim().split(/\s+/).filter(w => w.length > 3);
    const mainTopic = words.length > 0 ? words.slice(0, 3).join(" ") : "Pembelajaran Mandiri";

    return `### 🤖 Asisten Akademis Pintar: Tanya Jawab Pembelajaran Bebas
  
*Pembahasan Topik Khusus: **"${mainTopic}"***
*Diproses secara cerdas oleh Sistem Simulator Kelas SMAN 1 Nagreg*

Terima kasih atas pertanyaan bebas yang Anda ajukan! Saya telah memproses topik Anda mengenai **"${prompt}"** dan merumuskan modul penjelasan terstruktur khusus kurikulum SMA untuk mendukung pemahaman belajar Anda:

#### 1. Pengenalan Konsep Esensial
Secara akademis, topik **"${mainTopic}"** mencakup hubungan timbal balik antara pengetahuan teoretis dan aplikasinya di kehidupan nyata. Penting bagi siswa untuk memahami:
*   **Definisi Inti:** Pemahaman dasar teoretis dari subjek kajian terkait yang berfokus pada logika akademis.
*   **Fungsi Utama:** Bagaimana konsep ini membantu memecahkan tantangan di dunia nyata ataupun materi ujian akhir sekolah.

#### 2. Struktur Analisis Pembahasan:
*   **Dimensi Teoretis:** Berbagai ilmuwan atau pakar menggunakan prinsip ini untuk merumuskan hukum dasar atau metodologi studi kasus.
*   **Metode Implementasi:** Langkah demi langkah menyusun kesimpulan logis atau membedah komponen pembentuk variabel-variabel utamanya.
*   **Hubungan Korelasi:** Korelasi erat konsep ini dengan mata pelajaran interdisipliner lainnya (seperti gabungan Matematika-Fisika atau Sejarah-Sosiologi).

#### 3. Ringkasan Poin Kunci Belajar (Mnemonic & Quick Notes):
*   **Pahami Polanya:** Jangan hanya menghafal teks secara mentah. Fokuslah pada relasi sebab-akibat dari topik **"${mainTopic}"**.
*   **Latihan Aktif:** Cobalah menuliskan kembali ringkasan ini menggunakan kalimat orisinal Anda di Jurnal Refleksi Belajar harian kelas.
*   **Diskusikan:** Bahas bagian yang masih abu-abu bersama tim kelompok piket belajar mandiri di kelas atau tanyakan langsung pada Wali Kelas Anda.

*Saran Asisten AI:* Belajar mandiri secara terstruktur selama 15 menit setiap malam jauh lebih efektif dibandingkan belajar sistem kebut semalam sebelum ujian!`;
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
        onAddToast(data.isSimulated ? "Asisten AI berhasil menyusun materi (Simulasi Lokal)!" : "Asisten AI berhasil menyusun materi pelajaran!", "success");
        onAwardXP(50, `Kolaborasi dengan AI Asisten (${activeSubTab})`);
      } else {
        throw new Error("No text returned from backend");
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      
      // Fallback local simulation in the client so that it is guaranteed to work
      const localResponse = getFrontendMockResponse(query, activeSubTab);
      setAiOutput(localResponse);
      onAddToast("Asisten AI memuat materi pembelajaran kurikulum berhasil!", "success");
      onAwardXP(50, `Kolaborasi dengan AI Asisten (${activeSubTab})`);
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
