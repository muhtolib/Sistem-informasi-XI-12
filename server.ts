import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";
import {
  initialStudents,
  initialSchedules,
  initialCashTransactions,
  initialMeetingNotes,
  initialAnnouncements,
  initialAgendas
} from "./src/data/mockData";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not configured or is placeholder. AI queries will use fallback responses.");
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Failed to initialize GoogleGenAI client:", err);
      return null;
    }
  }
  return aiClient;
}

// REST API endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Processing API proxy
app.post("/api/ai/generate", async (req, res) => {
  const { prompt, systemInstruction } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Elegant fallback simulator for Indonesian educational content when no API Key is available
    console.log("No API Key detected, returning intelligent local simulation for prompt:", prompt.substring(0, 100));
    const fallbackText = getMockAIResponse(prompt, systemInstruction);
    return res.json({ text: fallbackText, isSimulated: true });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "Anda adalah asisten AI kurikulum SMA Indonesia yang ramah dan cerdas.",
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    // Return mock response as a soft fallback to keep user experience seamless, along with error warning
    const fallbackText = getMockAIResponse(prompt, systemInstruction);
    res.json({
      text: `[Pemberitahuan: Menggunakan respons cadangan lokal karena gangguan koneksi API. Error: ${error.message}]\n\n${fallbackText}`,
      isSimulated: true,
      error: error.message
    });
  }
});

// A robust rules-based generator for educational mock responses (in elegant Bahasa Indonesia)
function getMockAIResponse(prompt: string, systemInstruction?: string): string {
  const lowerPrompt = prompt.toLowerCase().trim();
  
  // 1. Math / Calculation queries
  if (
    lowerPrompt.includes("hitung") || 
    (lowerPrompt.includes("berapa") && /\d+/.test(lowerPrompt)) || 
    lowerPrompt.includes("matematika") || 
    lowerPrompt.includes("aljabar") ||
    lowerPrompt.includes("integral") ||
    lowerPrompt.includes("persamaan") ||
    lowerPrompt.includes("+") || 
    lowerPrompt.includes("-") || 
    (lowerPrompt.includes("x") && /\d+/.test(lowerPrompt)) || 
    (lowerPrompt.includes("/") && /\d+/.test(lowerPrompt))
  ) {
    const numbers = lowerPrompt.match(/\d+/g) || [];
    const num1 = numbers[0] ? parseInt(numbers[0], 10) : 12;
    const num2 = numbers[1] ? parseInt(numbers[1], 10) : 5;
    
    let op = "Penjumlahan";
    let symbol = "+";
    let result = num1 + num2;
    
    if (lowerPrompt.includes("kali") || lowerPrompt.includes("x") || lowerPrompt.includes("*")) {
      op = "Perkalian";
      symbol = "×";
      result = num1 * num2;
    } else if (lowerPrompt.includes("kurang") || lowerPrompt.includes("-")) {
      op = "Pengurangan";
      symbol = "-";
      result = num1 - num2;
    } else if (lowerPrompt.includes("bagi") || lowerPrompt.includes("/")) {
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
  if (lowerPrompt.includes("quiz") || lowerPrompt.includes("kuis") || lowerPrompt.includes("soal")) {
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
  if (lowerPrompt.includes("plan") || lowerPrompt.includes("jadwal") || lowerPrompt.includes("rencana")) {
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
    lowerPrompt.includes("biologi") || 
    lowerPrompt.includes("sel") || 
    lowerPrompt.includes("organel") || 
    lowerPrompt.includes("mitosis") || 
    lowerPrompt.includes("meiosis") || 
    lowerPrompt.includes("hewan") || 
    lowerPrompt.includes("tumbuhan") || 
    lowerPrompt.includes("kromosom") ||
    lowerPrompt.includes("gamet")
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
    lowerPrompt.includes("kimia") || 
    lowerPrompt.includes("atom") || 
    lowerPrompt.includes("molekul") || 
    lowerPrompt.includes("unsur") || 
    lowerPrompt.includes("senyawa") || 
    lowerPrompt.includes("asam") || 
    lowerPrompt.includes("basa") || 
    lowerPrompt.includes("reaksi") || 
    lowerPrompt.includes("larutan") || 
    lowerPrompt.includes("ph")
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
    lowerPrompt.includes("fisika") || 
    lowerPrompt.includes("gaya") || 
    lowerPrompt.includes("gravitasi") || 
    lowerPrompt.includes("kecepatan") || 
    lowerPrompt.includes("suhu") || 
    lowerPrompt.includes("kalor") || 
    lowerPrompt.includes("magnet") || 
    lowerPrompt.includes("listrik") ||
    lowerPrompt.includes("energi") ||
    lowerPrompt.includes("termodinamika") ||
    lowerPrompt.includes("hukum") ||
    lowerPrompt.includes("hooke") ||
    lowerPrompt.includes("homework") ||
    lowerPrompt.includes("tugas") ||
    lowerPrompt.includes("bantu")
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
  if (lowerPrompt.includes("refleksi") || lowerPrompt.includes("reflection") || lowerPrompt.includes("gaya gesek")) {
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
  if (lowerPrompt.includes("summary") || lowerPrompt.includes("rangkum") || lowerPrompt.includes("ringkas") || lowerPrompt.includes("sosiologi")) {
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
}

// Start building full-stack Server configuration
async function startServer() {
  // Centralized real-time state source of truth
  const state = {
    students: initialStudents,
    attendance: [] as any[],
    permissions: [
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
    ] as any[],
    cash: initialCashTransactions,
    meetingNotes: initialMeetingNotes,
    schedules: initialSchedules,
    announcements: initialAnnouncements,
    agendas: initialAgendas
  };

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Setup WebSocket Server for online real-time sync with noServer mode
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const pathname = request.url ? request.url.split("?")[0] : "";
    if (pathname === "/api/ws-sync" || pathname === "/api/ws-sync/") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", (ws) => {
    console.log("Client connected to real-time sync server on /api/ws-sync");

    // Send the current centralized state immediately on connection
    ws.send(JSON.stringify({
      type: "init",
      payload: state
    }));

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "update_state") {
          const { key, payload } = data;
          if (key && Array.isArray(payload) && key in state) {
            // Update the server's in-memory source of truth
            (state as any)[key] = payload;
            console.log(`State updated for key: ${key}, broadcasting to other clients...`);

            // Broadcast the update to all OTHER connected clients
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: "update_state",
                  key,
                  payload
                }));
              }
            });
          }
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected from real-time sync server");
    });
  });
}

startServer();
