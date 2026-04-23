import { genAI } from './aiConfig';
import { bankSoal } from './bankSoal';

export const generateQuestions = async (topic, level) => {
    // Tentukan tingkat berdasarkan level user (1: SD, 2: SMP, 3+: SMA)
    let levelStr = "SD";
    if (level === 2) levelStr = "SMP";
    if (level >= 3) levelStr = "SMA";

    try {
        if (!genAI) {
            throw new Error("Gemini AI belum diinisialisasi. API key mungkin kosong di LocalStorage.");
        }

        // Gunakan model generasi (disarankan gemini-1.5-flash untuk respon cepat JSON)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `Anda adalah seorang ahli pembuat soal matematika yang brilian.
Sajikan persis 10 soal pilihan ganda matematika untuk topik "${topic}".
Panduan WAJIB:
1. Seluruh soal harus 100% berkonteks kehidupan sehari-hari yang realistis.
2. WAJIB: Konteks dari ke-10 soal HARUS 100% BERBEDA SATU SAMA LAIN (Soal 1 hingga 10 TIDAK BOLEH ada konteks/tema yang mirip). Gunakan 10 tema berbeda secara ekstrem (Misal: 1 tentang Olahraga, 1 tentang Pasar, 1 tentang Medis, 1 tentang Transportasi Udara, 1 tentang Pertanian, 1 tentang Teknologi, 1 tentang Arsitektur, dll).
3. Tingkat kognitif soal divariasikan antara C2 (Memahami), C3 (Mengaplikasikan), dan C4 (Menganalisis).
4. Target kesulitan siswa adalah tingkat ${levelStr}.
5. Setiap soal punya 4 opsi jawaban (indeks 0, 1, 2, 3). SANGAT PENTING: Pastikan ke-4 opsi jawaban memiliki nilai/angka/teks yang BERBEDA SATU SAMA LAIN. TIDAK BOLEH ada pilihan jawaban yang sama (duplikat) di dalam satu soal.
6. Berikan pembahasan detail dan rasional, jangan hanya memberi hasil akhir.
7. Kembalikan HANYA berwujud array JSON murni tanpa awalan/akhiran text maupun markdown "json". Struktur JSON:
[
  {
    "pertanyaan": "teks...",
    "opsi": ["a", "b", "c", "d"],
    "jawabanBenarIndex": 0,
    "pembahasan": "penjelasan...",
    "konteks": "konteks kegiatan manusia"
  }
]`;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Membersihkan potensi blok markdown ````json
        if (text.includes('\`\`\`json')) {
            text = text.split('\`\`\`json')[1].split('\`\`\`')[0];
        } else if (text.includes('\`\`\`')) {
            text = text.split('\`\`\`')[1].split('\`\`\`')[0];
        }

        const generatedQuestions = JSON.parse(text.trim());
        
        // Validasi struktur jika ada kesalahan output AI
        if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
            throw new Error("Format JSON invalid dari AI.");
        }

        return generatedQuestions;

    } catch (e) {
        console.warn("Gagal mendapatkan soal dari AI (bisa jadi kuota terlampaui / API invalid), menggunakan fallback lokal:", e);
        
        // Fallback jika API Key Error / Kuota Limit
        let questions = bankSoal[topic] || bankSoal["Bilangan"];
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 10);
    }
};
