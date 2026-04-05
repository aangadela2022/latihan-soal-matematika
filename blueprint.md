Blueprint Aplikasi Numerasi (MVP)

Nama (sementara): Numerasi Cerdas

🎯 1. Tujuan Aplikasi

Membantu peserta didik:

Memahami konsep matematika dalam konteks nyata
Meningkatkan kemampuan dari dasar → aplikasi → analisis
Berlatih soal numerasi berbasis kehidupan sehari-hari
Meningkatkan hasil AKM / kompetensi minimum
👥 2. Target Pengguna
👨‍🎓 Siswa (SD/SMP/SMA – fleksibel level)
👩‍🏫 Guru (monitor & evaluasi)
🏫 Sekolah (dashboard hasil)
🧩 3. Fitur Utama (MVP)
A. 🎯 Latihan Soal Berbasis Konteks

Soal dikategorikan berdasarkan:

📚 Konten:
Bilangan
Aljabar
Geometri
Data & Ketidakpastian
🧠 Level:
Level 1 → Konsep (dasar)
Level 2 → Aplikasi
Level 3 → Analisis (HOTS)

Contoh soal:

“Diskon 25% dari harga Rp80.000, berapa yang harus dibayar?”

B. 🧠 Mode Belajar Bertahap (Adaptive Learning)

Sistem menyesuaikan soal:

Jika benar → naik level
Jika salah → turun + remedial
C. 🔄 Mode Problem-Based Learning (Mini Case)

Fitur khusus:

Contoh:

“Kamu punya uang Rp50.000 untuk 3 hari. Buat strategi pengeluaran.”

Output:

Jawaban terbuka
Dinilai berdasarkan logika & langkah
D. 📊 Dashboard Perkembangan Siswa

Menampilkan:

Level numerasi
Kategori:
🔴 Di bawah minimum
🟡 Minimum
🟢 Di atas minimum
E. 🧑‍🏫 Dashboard Guru

Guru bisa:

Melihat performa kelas
Mengelompokkan siswa:
Remedial
Sedang
Mahir
Memberi tugas khusus
F. 🧪 Bank Soal AKM-style

Soal:

Pilihan ganda
Uraian
Studi kasus
Interpretasi data (grafik/tabel)
G. 🎮 Gamifikasi (Motivasi)
XP (poin)
Badge:
“Ahli Diskon”
“Master Data”
Leveling
🏗️ 4. Struktur Modul Aplikasi
📦 Modul Siswa
Login/Register
Pilih topik
Kerjakan soal
Lihat hasil
Riwayat latihan
📦 Modul Guru
Buat kelas
Assign soal
Lihat analytics
Download laporan
📦 Modul Admin (opsional MVP ringan)
Kelola bank soal
Kelola user
🧠 5. Struktur Pembelajaran (Core Logic)
Alur Belajar:
Pre-test (deteksi level)
Latihan sesuai level
Feedback langsung:
Pembahasan
Cara berpikir
Evaluasi berkala
🗂️ 6. Struktur Data (Sederhana)
User
id
nama
role (siswa/guru)
level
Soal
id
konten (bilangan, dll)
level (1–3)
tipe (PG, uraian, studi kasus)
konteks (kehidupan nyata)
Jawaban
user_id
soal_id
skor
waktu
🧪 7. Contoh Flow Pengguna
👨‍🎓 Siswa
Login
Pilih “Latihan Harian”
Dapat soal sesuai level
Jawab
Lihat pembahasan
Naik level
👩‍🏫 Guru
Login
Pilih kelas
Lihat:
40% siswa di bawah minimum
Assign:
Soal remedial khusus
🛠️ 8. Teknologi (Rekomendasi MVP)
Frontend:
React / Next.js
Mobile: React Native / Flutter
Backend:
Node.js / Firebase
Database:
localhost