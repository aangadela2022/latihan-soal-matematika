import { genAI } from './aiConfig';

export const generateQuestions = async (topic, level) => {
    if (!genAI) throw new Error("Gemini API belum diinisialisasi");

    // Menyesuaikan kesulitan berdasarkan level numerasi siswa (1=Dasar/Remedial, 2=Aplikasi, 3=HOTS/Analisis)
    let difficulty = "Dasar (konsep sederhana)";
    if (level === 2) difficulty = "Menengah (banyak variabel, aplikasi di kehidupan)";
    if (level === 3) difficulty = "Sulit/HOTS (analisis kasus, membutuhkan beberapa tahap berpikir)";

    const prompt = `Anda adalah seorang ahli pendidikan matematika. Buatlah tepat 10 soal pilihan ganda untuk topik matematika: "${topic}".
Tingkat Kesulitan: ${difficulty}.
Konteks: Semua soal harus dihubungkan dengan situasi kehidupan nyata di Indonesia (misal: belanja, bangunan, tabungan, jadwal).

Anda harus mengembalikan hasilnya HANYA dalam format JSON valid berupa Array of objek. Jangan sertakan teks markdown \`\`\`json atau penjelasan tambahan apa pun, MURNI teks JSON.
Format objeknya wajib seperti ini:
[
  {
    "pertanyaan": "Soal cerita matematika dengan konteks...",
    "opsi": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
    "jawabanBenarIndex": 2, 
    "pembahasan": "Penjelasan langkah demi langkah mengapa opsi C yang benar",
    "konteks": "Judul konteks (misal: Diskon Belanja)"
  }
]`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { temperature: 0.7 }});
    
    try {
        const result = await model.generateContent(prompt);
        let textResult = result.response.text();
        
        // Membersihkan markdown bila ada secara tak sengaja
        textResult = textResult.trim();
        if (textResult.startsWith("```json")) {
           textResult = textResult.replace(/^```json/, "");
           textResult = textResult.replace(/```$/, "");
        }
        if (textResult.startsWith("```")) {
           textResult = textResult.replace(/^```/, "");
           textResult = textResult.replace(/```$/, "");
        }

        const questionsJson = JSON.parse(textResult);
        return questionsJson;
    } catch (error) {
        console.error("Gagal mendapatkan generasi dari Gemini:", error);
        throw error;
    }
};
