## Posisi frontend dalam proyek

Untuk portofolio AI engineering, frontend **bukan sekadar pemanis**. Ia memperlihatkan integrasi end-to-end:

```text
HR User
  → Frontend dashboard
  → Node.js API
  → Storage + Database
  → Queue/Worker
  → FastAPI AI Service
  → LLM/OCR/Embedding
  → Hasil parsing + skor + ranking kembali ke UI
```

Dengan frontend, Anda dapat mendemokan hal-hal berikut:

- Upload CV dan pemantauan status parsing secara real-time.
- Hasil ekstraksi LLM yang dapat diverifikasi manusia.
- Perbandingan kandidat dengan lowongan tertentu.
- Penjelasan komponen `job_fit_score`, bukan sekadar angka 0–100.
- Perubahan status rekrutmen: `Applied → Screening → Interview → Hired/Rejected`.
- Pencarian, filter, sort, dan ranking kandidat.
- Pengelolaan lowongan kerja dan requirement skill.

Workflow ATS umumnya memang membutuhkan status kandidat yang jelas serta tindakan lanjutan untuk tiap tahap seleksi; status yang terlalu banyak justru membuat proses sulit dikelola. [hartford](https://www.hartford.edu/about/offices-divisions/human-resources-development/_files/employment-hiring-forms/users-guide-pa1.pdf)

## Urutan pengerjaan terbaik

Jangan memulai dari halaman dashboard yang kompleks. Buat frontend secara bertahap setelah API utama sudah jelas.

| Tahap | Fokus                   | Hasil                                                |
|-------|-------------------------|------------------------------------------------------|
| 1     | Wireframe dan user flow | Struktur layar, navigasi, dan proses HR              |
| 2     | Backend contract        | Endpoint, request/response, status proses            |
| 3     | Frontend MVP            | Upload, daftar lowongan, kandidat, detail kandidat   |
| 4     | UX refinement           | Loading, error, empty state, review hasil AI         |
| 5     | Dashboard lanjutan      | Analytics, bulk action, kanban, interview scheduling |

Urutan ideal untuk proyek Anda:

1. Selesaikan migration database dan endpoint CRUD lowongan.
2. Selesaikan endpoint upload CV dan status proses.
3. Selesaikan FastAPI extraction dengan output JSON tervalidasi.
4. Selesaikan scoring dan endpoint ranking.
5. Baru buat frontend yang memanggil endpoint nyata.
6. Setelah alur stabil, rapikan UI, responsivitas, dan desain sistem.

Dengan begitu, Anda tidak akan menghabiskan waktu membuat dashboard indah yang ternyata harus dirombak karena bentuk data hasil ekstraksi atau alur proses backend berubah.

## Rekomendasi stack frontend

Untuk stack Anda—Node.js, FastAPI, PostgreSQL, dan kebutuhan dashboard internal HR—saya menyarankan:

| Kebutuhan          | Rekomendasi           | Alasan                                                               |
|--------------------|-----------------------|----------------------------------------------------------------------|
| Framework          | Next.js + TypeScript  | Routing, rendering fleksibel, ekosistem besar, mudah untuk dashboard |
| UI component       | shadcn/ui + Radix UI  | Fleksibel, tidak terlalu “template-like”, mudah disesuaikan          |
| Styling            | Tailwind CSS          | Cepat untuk membangun dashboard konsisten                            |
| Server state       | TanStack Query        | Caching, refetch, loading/error state untuk API                      |
| Form               | React Hook Form + Zod | Validasi form lowongan dan upload yang kuat                          |
| Tabel kandidat     | TanStack Table        | Filter, sorting, pagination, column visibility                       |
| State lokal        | Zustand bila perlu    | Cocok untuk filter UI, panel detail, dan preferensi tabel            |
| Visualisasi        | Recharts              | Cukup untuk statistik rekrutmen sederhana                            |
| Ikon               | Lucide React          | Ringan dan konsisten                                                 |
| Diagram portofolio | Mermaid di README     | Menjelaskan arsitektur tanpa bergantung pada gambar                  |

Jika Anda ingin lebih sederhana, gunakan React + Vite + TypeScript. Namun, untuk proyek ATS yang ingin dijadikan portofolio full-stack, Next.js lebih kuat dari sisi struktur, autentikasi, dashboard, dan deployment.

Struktur folder frontend yang rapi:

```text
frontend/
├── app/
│   ├── dashboard/
│   ├── jobs/
│   │   ├── page.tsx
│   │   └── [jobId]/
│   │       ├── page.tsx
│   │       └── candidates/
│   ├── candidates/
│   │   └── [candidateId]/
│   ├── applications/
│   │   └── [applicationId]/
│   ├── settings/
│   └── login/
├── components/
│   ├── layout/
│   ├── jobs/
│   ├── candidates/
│   ├── applications/
│   ├── scoring/
│   └── ui/
├── lib/
│   ├── api-client.ts
│   ├── query-client.ts
│   ├── validators/
│   └── utils.ts
├── hooks/
├── types/
└── middleware.ts
```

## Layar MVP yang wajib

Untuk MVP, cukup buat 6 layar inti berikut. Jangan langsung membuat fitur chat, kalender, email automation, atau dashboard analytics berat.

### 1. Dashboard

Fungsi utama: memberi HR ringkasan kondisi rekrutmen.

Komponen:

- Jumlah lowongan aktif.
- Jumlah aplikasi masuk hari ini/minggu ini.
- Jumlah CV dalam status `processing`.
- Jumlah kandidat yang memerlukan review manual.
- Kandidat terbaik berdasarkan lowongan aktif.
- Ringkasan funnel: `Applied`, `Screening`, `Interview`, `Hired`, `Rejected`.

Contoh ringkas:

```text
[ Lowongan Aktif: 5 ] [ Kandidat Baru: 24 ] [ Perlu Review: 3 ]

Pipeline Rekrutmen
Applied (42) → Screening (18) → Interview (7) → Hired (1)

Lowongan yang perlu perhatian
- Backend Engineer: 17 kandidat baru
- Data Analyst: 3 CV gagal diproses
```

### 2. Daftar lowongan

Fungsi utama: HR melihat dan mengelola posisi yang sedang dibuka.

Kolom yang relevan:

| Kolom                    | Isi                        |
|--------------------------|----------------------------|
| Posisi                   | Backend Engineer           |
| Status                   | Open / Closed / Draft      |
| Minimum pengalaman       | 24 bulan                   |
| Skill wajib              | Python, PostgreSQL, Docker |
| Jumlah pelamar           | 42                         |
| Kandidat memenuhi syarat | 13                         |
| Dibuat                   | Tanggal pembuatan          |
| Aksi                     | Lihat, edit, tutup         |

CTA utama: **Buat Lowongan**.

Form lowongan sebaiknya meminta:

- Judul pekerjaan.
- Deskripsi pekerjaan.
- Skill wajib.
- Skill tambahan/preferred.
- Minimum pengalaman.
- Lokasi atau mode kerja, bila relevan.
- Status lowongan.
- Bobot scoring opsional.

Untuk usability form, kelompokkan field yang terkait, jelaskan required/optional dengan jelas, gunakan satu kolom pada form kompleks, dan tampilkan error yang spesifik dekat dengan input yang bermasalah. [nngroup](https://www.nngroup.com/articles/web-form-design/)

### 3. Detail lowongan dan ranking kandidat

Ini adalah layar paling penting dalam ATS Anda.

Struktur yang disarankan:

```text
Backend Engineer
Status: Open
Minimum experience: 24 months
Mandatory skills: Python, PostgreSQL, Docker

[Overview] [Candidates] [Requirements] [Settings]

Filter:
[Status] [Minimum Score] [Skills] [Experience] [Processing Status]

--------------------------------------------------------------
Candidate        Score   Skills Match    Experience   Status
--------------------------------------------------------------
Adit TriFour     87.4    3/3             36 months    Screening
Budi Santoso     79.2    2/3             48 months    Applied
Citra Dewi       72.8    3/3             18 months    Review
--------------------------------------------------------------
```

Fitur minimum:

- Sorting berdasarkan skor, pengalaman, atau tanggal lamaran.
- Filter status aplikasi.
- Filter minimum job fit score.
- Filter skill wajib yang terpenuhi/belum terpenuhi.
- Tombol melihat detail kandidat.
- Aksi cepat untuk mengubah status.
- Pagination server-side untuk skalabilitas.

Fokus UX-nya adalah memudahkan recruiter menilai kandidat di satu alur, tanpa bolak-balik antarhalaman dan tanpa mencari informasi penting terlalu lama. Riset desain ATS juga merekomendasikan agar informasi screening kandidat tersedia dalam satu view dengan scrolling minimal, karena screening merupakan use case utama recruiter. 

### 4. Halaman upload CV

Halaman ini dapat dipakai oleh HR atau kandidat, tergantung skenario produk Anda.

Elemen penting:

- Pilih lowongan tujuan.
- Area drag-and-drop PDF.
- Tampilkan nama file, ukuran, dan validasi format.
- Progress upload.
- Status proses extraction: `Uploading`, `Queued`, `Parsing PDF`, `OCR in progress`, `Extracting profile`, `Scoring`, `Completed`, atau `Failed`.
- Pesan error yang spesifik dan tindakan lanjutan.

Contoh status:

```text
CV_Adit_TriFour.pdf
✓ Upload berhasil
✓ Teks berhasil diekstrak
◌ AI sedang mengidentifikasi skill dan pengalaman
◌ Menghitung kecocokan terhadap lowongan
```

Status feedback sangat penting pada proses asynchronous seperti upload, OCR, dan pemanggilan LLM. Pisahkan indikator progres proses, validasi input, dan notifikasi hasil agar pengguna tahu apa yang sedang terjadi serta apa tindakan yang diperlukan. [nngroup](https://www.nngroup.com/articles/indicators-validations-notifications/)

### 5. Detail kandidat dan review hasil AI

Halaman ini adalah nilai jual utama aplikasi Anda. Jangan hanya menampilkan hasil parsing sebagai raw JSON.

Gunakan layout dua panel:

```text
┌───────────────────────────┬─────────────────────────────────┐
│ Candidate Profile         │ Original CV                      │
│                           │                                 │
│ Adit TriFour              │ PDF Viewer                      │
│ Email / Phone             │                                 │
│ 36 months experience      │                                 │
│                           │                                 │
│ Skills                    │                                 │
│ Python, SQL, Node.js      │                                 │
│ PostgreSQL, Docker        │                                 │
│                           │                                 │
│ Work Experience           │                                 │
│ ...                       │                                 │
└───────────────────────────┴─────────────────────────────────┘
```

Tambahkan bagian berikut:

- Informasi dasar kandidat.
- Skill hasil ekstraksi.
- Riwayat pengalaman.
- Riwayat pendidikan.
- PDF preview melalui signed URL.
- Tombol `Edit hasil ekstraksi`.
- Label warning, misalnya: “Tanggal pengalaman tidak lengkap” atau “OCR digunakan; hasil perlu diverifikasi.”
- Riwayat dokumen jika kandidat pernah mengunggah CV baru.
- Timeline status aplikasi dan catatan recruiter.

Jangan hanya mengandalkan hasil AI untuk menjadi sumber kebenaran. HR harus dapat mengoreksi hasil parsing. Koreksi itu kelak sangat berguna sebagai data evaluasi akurasi sistem atau dataset fine-tuning.

### 6. Penjelasan job-fit score

Skor perlu transparan agar HR tidak merasa AI adalah “black box”.

Contoh tampilan:

```text
Job Fit Score: 84.4 / 100
Status: Strong match

Breakdown
Semantic relevance       82%   × 45%
Mandatory skills         75%   × 30%
Experience match        100%   × 20%
Preferred skills         60%   × 5%

Matched skills
✓ Python
✓ PostgreSQL
✓ Docker

Missing or unclear
! Kubernetes
```

Hindari label seperti “pasti layak diterima” atau “tidak cocok”. Gunakan istilah yang lebih aman:

- Strong match.
- Potential match.
- Needs review.
- Missing mandatory criteria.
- Insufficient data.

Dengan begitu, sistem membantu HR melakukan screening, tetapi tidak menggantikan keputusan manusia.

## Design system dan UX rules

Buat design system sederhana sejak awal agar tampilan konsisten.

### Warna status

| Status         | Warna            | Makna                           |
|----------------|------------------|---------------------------------|
| `Uploaded`     | Abu-abu          | File berhasil diterima          |
| `Queued`       | Biru muda        | Menunggu proses                 |
| `Processing`   | Biru             | AI/OCR sedang bekerja           |
| `Processed`    | Hijau            | Berhasil diproses               |
| `Needs review` | Oranye           | Hasil ambigu/perlu verifikasi   |
| `Failed`       | Merah            | Gagal diproses                  |
| `Rejected`     | Merah tua/netral | Keputusan workflow, bukan error |
| `Hired`        | Hijau tua        | Kandidat diterima               |

Jangan hanya mengandalkan warna. Tambahkan label teks dan ikon supaya tetap dapat dipahami pengguna dengan gangguan penglihatan warna.

### Prinsip UX utama

- Utamakan **kecepatan screening**, bukan dekorasi visual.
- Tampilkan informasi kandidat terpenting lebih dahulu: skor, skill wajib, pengalaman, status, dan dokumen.
- Pastikan tindakan utama pada setiap layar jelas, misalnya `Review candidate`, `Move to interview`, atau `Upload CV`.
- Gunakan tabel untuk membandingkan banyak kandidat dan detail panel untuk meninjau satu kandidat.
- Buat empty state yang jelas, misalnya “Belum ada pelamar pada lowongan ini. Unggah CV atau bagikan tautan lamaran.”
- Buat error state yang dapat ditindaklanjuti, misalnya “CV tidak dapat diproses karena file terenkripsi. Unggah PDF tanpa password.”
- Jangan gunakan modal berlebihan; detail kandidat lebih nyaman pada route/halaman tersendiri.
- Pastikan UI keyboard-friendly dan memiliki kontras yang cukup.
- Buat desktop-first karena pengguna utama adalah HR/recruiter yang umumnya meninjau banyak kandidat melalui laptop/desktop; mobile dapat menjadi responsif untuk monitoring, bukan workflow screening utama.

Prinsip mengurangi cognitive load juga relevan untuk dashboard ATS karena recruiter harus melakukan tindakan berulang dengan cepat. 

## Bentuk deliverable UI/UX

Saya menyarankan Anda membuat tiga lapisan artefak:

1. **User flow**
   - HR membuat lowongan.
   - HR/kandidat unggah CV.
   - Sistem memproses dokumen.
   - HR meninjau hasil ekstraksi.
   - Sistem menampilkan ranking.
   - HR memindahkan kandidat pada tahap pipeline.

2. **Wireframe low-fidelity**
   - Bisa memakai Figma, Excalidraw, atau bahkan Mermaid.
   - Fokus pada layout, hirarki informasi, dan alur.
   - Jangan fokus warna, font, atau animasi lebih dahulu.

3. **High-fidelity UI**
   - Dibangun langsung dengan Next.js + Tailwind + shadcn/ui.
   - Komponen reusable: `StatusBadge`, `ScoreBreakdown`, `CandidateTable`, `SkillChip`, `ProcessingTimeline`, `ResumeViewer`.
   - Gunakan data mock yang bentuknya sama dengan respons API nyata.

Contoh komponen reusable:

```text
components/
├── candidate-card.tsx
├── candidate-table.tsx
├── candidate-profile.tsx
├── cv-upload-dropzone.tsx
├── extraction-review-form.tsx
├── job-fit-score.tsx
├── score-breakdown.tsx
├── skill-match-badge.tsx
├── application-status-badge.tsx
├── processing-status-timeline.tsx
└── resume-preview.tsx
```

## Penambahan fase pada planning

Tambahkan fase khusus setelah integrasi backend dan AI, sebelum deployment final.

### Phase 3.5 — Frontend dan UX HR Dashboard

1. Membuat design system dasar:
   - Tipografi.
   - Warna status.
   - Button, input, dialog, badge, table, pagination, loading skeleton.
   - Empty state, error state, dan permission state.

2. Membuat halaman inti:
   - Dashboard.
   - Daftar dan detail lowongan.
   - Upload CV.
   - Daftar kandidat per lowongan.
   - Detail kandidat dan preview CV.
   - Review/edit hasil ekstraksi AI.
   - Penjelasan job-fit score.

3. Menghubungkan frontend ke API:
   - Upload `multipart/form-data`.
   - Polling atau WebSocket/SSE untuk status parsing.
   - TanStack Query untuk cache dan invalidasi data.
   - Validasi form dengan Zod.
   - Penanganan loading, error, retry, dan empty state.

4. Melakukan uji UX:
   - Minta 2–3 pengguna mencoba skenario: buat lowongan, unggah CV, cari kandidat terbaik, lalu ubah status kandidat.
   - Catat titik pengguna bingung, waktu menyelesaikan tugas, dan error yang sering muncul.
   - Iterasikan desain berdasarkan hasil pengujian.

5. Mendokumentasikan frontend:
   - Screenshot halaman inti.
   - User flow.
   - Penjelasan keputusan UX.
   - Video demo singkat 2–4 menit.

## Rekomendasi akhir

Bangun frontend **sekalian**, tetapi dengan pendekatan MVP dan dilakukan setelah kontrak API inti stabil. Untuk proyek ini, layar paling bernilai bukan landing page, melainkan:

1. Ranking kandidat per lowongan.
2. Detail kandidat dengan CV asli dan hasil parsing yang dapat dikoreksi.
3. Penjelasan skor kecocokan.
4. Workflow status rekrutmen.
5. Upload CV dengan progres proses yang jelas.

Kombinasi tersebut akan membuat proyek Anda terlihat sebagai produk ATS yang benar-benar operasional, bukan hanya demo PDF-to-JSON. 