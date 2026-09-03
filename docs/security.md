# Security & Privacy Guidelines

## 1. Perlindungan PII (Personally Identifiable Information)

- CV mengandung data pribadi sensitif (nama, email, nomor telepon, alamat, riwayat pendidikan).
- **Private Storage**: Semua berkas PDF tersimpan di bucket Supabase Storage yang bersifat `PRIVATE`.
- **Signed URL**: Akses file dari UI HR wajib menggunakan Temporary Signed URL dengan masa berlaku maksimal **300 detik** (`SIGNED_URL_TTL_SECONDS`).

---

## 2. Redaksi Logging & Telemetri

Dilarang keras mencetak informasi berikut ke console log production:
- Isi teks CV mentah (`raw_text`)
- Alamat email & nomor telepon kandidat
- Direct Signed URL
- API Key / Secrets

---

## 3. Demografis & Anti-Bias Rules

Sistem scoring dilarang menggunakan variabel demografis berikut:
- Foto / Wajah
- Usia / Tanggal lahir
- Jenis Kelamin / Gender
- Agama & Etnis/Suku
- Status Pernikahan & Informasi Kesehatan
