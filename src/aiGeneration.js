import { bankSoal } from './bankSoal';

export const generateQuestions = async (topic, level) => {
    // Simulasi loading AI sementara
    return new Promise((resolve) => {
        setTimeout(() => {
            let questions = bankSoal[topic] || bankSoal["Bilangan"];
            
            // Mengacak urutan soal (Fisher-Yates / random sort) dan ambil 10 soal
            const shuffled = [...questions].sort(() => 0.5 - Math.random());
            const selected10 = shuffled.slice(0, 10);
            
            resolve(selected10);
        }, 1000); // delay 1 detik agar UI loading terkesan natural
    });
};
