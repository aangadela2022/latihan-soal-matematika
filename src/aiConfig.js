import { GoogleGenerativeAI } from "@google/generative-ai";

export let genAI = null;

export const initAI = () => {
    const storedKey = localStorage.getItem("geminiApiKey");
    if (!storedKey) return false;

    try {
        genAI = new GoogleGenerativeAI(storedKey);
        return true;
    } catch (e) {
        console.error("Gagal inisialisasi Gemini AI", e);
        return false;
    }
};

export const saveGeminiKey = (apiKey) => {
    localStorage.setItem("geminiApiKey", apiKey);
    return initAI();
};
