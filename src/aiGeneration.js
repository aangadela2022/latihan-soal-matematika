import { genAI } from './aiConfig';
import { bankSoal } from './bankSoal';

export const generateQuestions = async (topic, level) => {
    // Tentukan tingkat berdasarkan level user (1: SD, 2: SMP, 3+: SMA)
    let levelStr = "SD";
    if (level === 2) levelStr = "SMP";
    if (level >= 3) levelStr = "SMA";

    // TKA selalu menggunakan level SMA/SMK
    const isTKA = topic === "TKA";
    if (isTKA) levelStr = "SMA/SMK";

    try {
        if (!genAI) {
            throw new Error("Gemini AI belum diinisialisasi. API key mungkin kosong di LocalStorage.");
        }

        // Gunakan model generasi (disarankan gemini-1.5-flash untuk respon cepat JSON)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Daftar sub-topik TKA untuk memastikan variasi antar sesi
        const tkaSubTopics = [
            "Persamaan dan Pertidaksamaan Kuadrat", "Fungsi dan Komposisi Fungsi", 
            "Logaritma dan Eksponen", "Trigonometri", "Matriks dan Determinan",
            "Barisan dan Deret", "Program Linear", "Statistika dan Peluang",
            "Limit dan Turunan Fungsi", "Integral"
        ];
        // Acak 3 sub-topik untuk sesi ini agar soal bervariasi tiap sesi
        const shuffledSubTopics = [...tkaSubTopics].sort(() => 0.5 - Math.random()).slice(0, 3);
        const tkaSubTopicHint = isTKA ? `\nFokus variasi sub-topik sesi ini: ${shuffledSubTopics.join(", ")} (gunakan sub-topik TKA yang lain juga untuk melengkapi 10 soal).` : "";

const prompt = isTKA
? `Anda adalah pakar pembuat soal TKA (Tes Kemampuan Akademik) Matematika tingkat SMA/SMK yang sangat handal.
Sajikan persis 10 soal pilihan ganda TKA Matematika tingkat SMA/SMK yang menantang.
Panduan WAJIB:
1. Soal WAJIB mencakup beragam sub-topik matematika SMA/SMK: fungsi, logaritma, trigonometri, matriks, barisan & deret, program linear, statistika, peluang, limit, turunan, dan integral.
2. WAJIB: Ke-10 soal harus mencakup SUB-TOPIK yang BERBEDA-BEDA (tidak boleh lebih dari 2 soal dengan sub-topik yang sama). Gunakan timestamp acak dalam angka soal agar tiap generasi berbeda.${tkaSubTopicHint}
3. Tingkat kesulitan setara TKA SMA/SMK: C3 (Mengaplikasikan) dan C4 (Menganalisis). Soal harus menantang dan memerlukan analisis logis, bukan sekadar hafalan rumus.
4. Karakteristik khusus model soal TKA yang WAJIB dimasukkan (variasikan ke dalam 10 soal ini):
   - Model 1 (Program Linear): Soal optimasi keuntungan maksimum (seperti beras jenis I & II) dengan kendala modal/kapasitas, atau menentukan daerah penyelesaian (I, II, III, IV, V) dari sistem pertidaksamaan linear yang diwakili oleh deskripsi koordinat dan garis batas.
   - Model 2 (Limit Tak Hingga): Limit aljabar tak hingga dengan bentuk irasional seperti lim x->inf (sqrt(ax^2+bx+c) - (dx+e)) atau lim x->inf (sqrt(ax^2+bx+c) - sqrt(px^2+qx+r)).
   - Model 3 (Fungsi Komposisi): Menghitung nilai f(k) jika diketahui fungsi g(x) dan (f o g)(x).
   - Model 4 (Barisan & Deret / Eksponen): Permasalahan pertumbuhan populasi bakteri yang membelah secara eksponensial (misal membelah menjadi dua setiap selang waktu tertentu) yang dikombinasikan dengan tingkat kematian periodik (misal tiap beberapa hari 1/4 jumlah bakteri mati).
   - Model 5 (Geometri & Trigonometri): 
     * Masalah pemotongan sudut-sudut bangun datar (seperti lembaran tripleks persegi panjang yang dipotong persegi kecil di keempat ujungnya untuk dijadikan kotak).
     * Masalah tangga bersandar di dinding / pohon dengan kemiringan/sudut elevasi tertentu.
     * Perbandingan sisi/sudut trapesium atau segitiga.
     * Perbandingan trigonometri (sin, cos, tan) pada sudut tumpul (Kuadran II, misal jika cos x bernilai negatif, tentukan sin x).
   - Model 6 (Statistika Kelompok & Tabel Pernyataan): Evaluasi data (rata-rata/median/modus) dari tabel frekuensi atau diagram batang, atau menyajikan tabel berisi 3 pernyataan matematika/data dan meminta siswa mengevaluasi kebenaran masing-masing pernyataan tersebut (format Benar/Salah ditulis di dalam deskripsi pertanyaan).
   - Model 7 (Fungsi Kuadrat): Menganalisis karakteristik grafik fungsi kuadrat f(x) = ax^2 + bx + c (misalnya ke arah mana grafik terbuka, apakah memotong garis y tertentu, kuadran mana saja yang dilewati).
5. Setiap soal punya 4 opsi jawaban (indeks 0, 1, 2, 3). Keempat opsi harus BERBEDA SATU SAMA LAIN dan masuk akal (bukan jebakan yang terlalu mudah ditebak).
6. Berikan pembahasan langkah demi langkah yang jelas, logis, dan edukatif dalam bahasa Indonesia.
7. Kembalikan HANYA berwujud array JSON murni tanpa awalan/akhiran text maupun markdown "json". Struktur JSON:
[
  {
    "pertanyaan": "teks soal...",
    "opsi": ["a", "b", "c", "d"],
    "jawabanBenarIndex": 0,
    "pembahasan": "penjelasan langkah demi langkah...",
    "konteks": "nama sub-topik matematika (misal: Limit Tak Hingga / Program Linear)"
  }
]`
: `Anda adalah seorang ahli pembuat soal matematika yang brilian.
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
