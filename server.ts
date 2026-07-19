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
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("quiz") || lowerPrompt.includes("kuis") || lowerPrompt.includes("soal")) {
    return `### 📝 Kuis Evaluasi Mandiri: Fisika SMA - Dinamika Gerak

**Topik: Hukum Newton tentang Gerak**
*Dibuat otomatis oleh Asisten AI WaliKelas*

1. **Soal 1 (Pilihan Ganda):**
   Sebuah balok bermassa 5 kg diletakkan pada bidang datar yang licin. Jika balok ditarik dengan gaya horizontal sebesar 15 N, berapakah percepatan yang dialami balok tersebut?
   - A. 2 m/s²
   - B. 3 m/s² (Kunci Jawaban)
   - C. 4 m/s²
   - D. 5 m/s²
   
   *Pembahasan:* Menggunakan Hukum II Newton, F = m × a. Maka, a = F / m = 15 N / 5 kg = 3 m/s².

2. **Soal 2 (Pilihan Ganda):**
   Gaya gesek yang bekerja pada benda dalam keadaan diam dan sesaat sebelum bergerak disebut sebagai...
   - A. Gaya gesek kinetis
   - B. Gaya gesek statis maksimum (Kunci Jawaban)
   - C. Gaya sentripetal
   - D. Gaya normal

3. **Soal 3 (Esai Singkat):**
   Jelaskan fenomena kelembaman (inersia) berdasarkan Hukum I Newton dalam kehidupan sehari-hari!
   *Contoh Jawaban:* Ketika kita naik bus dan bus tiba-tiba direm, tubuh kita akan terdorong ke depan karena cenderung mempertahankan keadaan geraknya yang semula.`;
  }

  if (lowerPrompt.includes("plan") || lowerPrompt.includes("jadwal") || lowerPrompt.includes("rencana")) {
    return `### 📅 AI Study Planner: Persiapan Ujian Tengah Semester (UTS) SMA

Berikut adalah rencana belajar 5 hari terstruktur untuk mata pelajaran **Matematika Wajib (Fungsi Komposisi & Invers)** dan **Fisika (Gelombang Mekanik)**:

*   **Hari 1: Pemahaman Konsep Dasar (Durasi: 90 Menit)**
    *   *Matematika (45m):* Membaca kembali teori fungsi komposisi (f ∘ g)(x) dan mengerjakan 3 contoh soal dasar.
    *   *Fisika (45m):* Memahami sifat-sifat gelombang mekanik (refleksi, refraksi, difraksi, interferensi).
*   **Hari 2: Latihan Soal Sedang (Durasi: 120 Menit)**
    *   *Matematika (60m):* Berlatih mencari fungsi invers f⁻¹(x) dan invers dari fungsi komposisi (f ∘ g)⁻¹(x).
    *   *Fisika (60m):* Menggunakan rumus kecepatan rambat v = λ × f dan v = s / t pada contoh kasus gelombang tali.
*   **Hari 3: Analisis Kesalahan & Pemecahan Masalah (Durasi: 90 Menit)**
    *   *Sesi Gabungan:* Mereview soal-soal latihan dari hari sebelumnya yang salah. Buat catatan ringkas rumus penting pada kartu memo kecil (flashcard).
*   **Hari 4: Simulasi Kuis Mandiri (Durasi: 120 Menit)**
    *   Mengerjakan simulasi ujian mandiri dengan durasi waktu ketat tanpa melihat catatan.
*   **Hari 5: Relaksasi & Review Akhir (Durasi: 60 Menit)**
    *   Review cepat rumus-rumus utama, istirahat yang cukup sebelum ujian, hindari begadang malam hari.`;
  }

  if (lowerPrompt.includes("homework") || lowerPrompt.includes("tugas") || lowerPrompt.includes("bantu")) {
    return `### 💡 AI Homework Assistant: Solusi Pembahasan Tugas Fisika

**Pertanyaan/Materi:** Pembahasan Konsep Elastisitas dan Hukum Hooke.

**Pembahasan Langkah demi Langkah:**

1.  **Analisis Konsep Dasar:**
    Hukum Hooke menyatakan bahwa pertambahan panjang suatu benda elastis sebanding dengan gaya yang diberikan padanya, sejauh tidak melampaui batas elastisitasnya.
    *Rumus Utama:*
    $$F = k \\cdot \\Delta x$$
    Di mana:
    *   $F$ = Gaya yang bekerja (Newton, N)
    *   $k$ = Konstanta pegas (N/m)
    *   $\\Delta x$ = Pertambahan panjang pegas (meter, m)

2.  **Contoh Penerapan Kasus:**
    Jika sebuah pegas memiliki konstanta $k = 200\\text{ N/m}$ ditarik dengan gaya $F = 10\\text{ N}$, berapakah pertambahan panjangnya?
    
    *Langkah Hitung:*
    $$\\Delta x = \\frac{F}{k} = \\frac{10}{200} = 0,05\\text{ meter } (5\\text{ cm})$$

3.  **Tips Belajar Tambahan:**
    Ingatlah untuk selalu menyamakan satuan unit ke Standar Internasional (SI) sebelum melakukan perhitungan (misalnya mengubah centimeter menjadi meter terlebih dahulu).`;
  }

  if (lowerPrompt.includes("summary") || lowerPrompt.includes("ringkas") || lowerPrompt.includes("rangkum")) {
    return `### 📖 AI Lesson Summary: Rangkuman Materi Sosiologi

**Tema: Konflik Sosial dan Integrasi Masyarakat (Kelas XI)**

*   **Poin Utama Konflik Sosial:**
    1.  *Definisi:* Konflik sosial adalah proses sosial antara dua orang atau lebih di mana salah satu pihak berusaha menyingkirkan pihak lain dengan menghancurkan atau membuatnya tidak berdaya.
    2.  *Faktor Penyebab:* Perbedaan antarindividu, perbedaan kebudayaan, perbedaan kepentingan, dan perubahan sosial yang cepat.
    3.  *Dampak:* Solidaritas kelompok internal meningkat (in-group solidarity), kerusakan harta benda, keretakan hubungan, dan perubahan kepribadian individu.
    
*   **Poin Utama Integrasi Sosial:**
    1.  *Definisi:* Proses penyesuaian unsur-unsur yang berbeda dalam masyarakat sehingga menjadi satu kesatuan yang utuh.
    2.  *Bentuk Integrasi:* Integrasi normatif (berdasarkan norma), fungsional (berdasarkan fungsi kerja), dan koersif (berdasarkan kekuasaan).
    
*   **Tips Ujian:** Bedakan secara jelas antara konflik konstruktif (membangun solusi) dan konflik destruktif (merusak tatanan).`;
  }

  return `### 🤖 Asisten AI WaliKelas SMA

Halo! Saya adalah asisten kecerdasan buatan kelas Anda. Saya siap membantu mengelola tugas harian, merancang rencana belajar personal, membuat simulasi kuis interaktif, merangkum materi pelajaran, serta menjawab pertanyaan akademis lainnya.

Silakan pilih fitur asisten AI di panel samping atau ajukan pertanyaan spesifik Anda seputar kurikulum SMA di kolom obrolan ini!`;
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

  // Setup WebSocket Server for online real-time sync
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Client connected to real-time sync server");

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
