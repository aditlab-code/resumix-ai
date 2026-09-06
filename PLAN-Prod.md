# 🚀 Live Production Planning: Resumix AI

Dokumen perencanaan dan panduan eksekusi **Live Production Deployment** untuk platform **Resumix AI RAG Pipeline**. Memuat 2 Opsi Arsitektur: **Opsi A (Managed Cloud Free-Tier 100% Gratis)** dan **Opsi B (Private VPS Biznet GIO - Performa Tinggi & Instant)**.

---

## 📌 Status Progress Deployment Saat Ini (Checkpoint)

- [x] **1. Frontend (`apps/web`)**: ✅ **LIVE & GREEN (100% SUKSES)**
  - Domain Vercel: `https://resumix-ai-web-q1e9.vercel.app/`
  - Perbaikan TypeScript Build (Implicit `any` & `@cv-ats/contracts` path mapping) sudah terverifikasi.
  - Subdomain kustom yang ditargetkan kelak: `resumix.pradityawicaksono.com`.
- [x] **2. Storage (`Cloudflare R2`)**: ✅ **TERKONFIGURASI**
  - Bucket: `resumix-cv-bucket` (Private Access, 10GB Free, $0 Egress).
  - Credentials & S3 Endpoint (`https://e90fa646d35177b22219f9a246ff6f95.r2.cloudflarestorage.com`) tersimpan aman di `.env`.
- [x] **3. Queue (`Upstash Redis`)**: ✅ **TERKONFIGURASI**
  - Shared Instance Host: `real-macaw-187505.upstash.io`
  - Co-existence policy: Standard Prefix `rag_cv` dipasang untuk mengisolasi queue RAG Pipeline dari key `lectura` (`bull:*`) yang sudah ada.
- [x] **4. GitHub Repository Sync**: ✅ **TERHUBUNG**
  - URL Repo: `https://github.com/aditwicaksonodinus/resumix-ai.git` (Branch `main` & `dev`).
- [ ] **5. AI Microservice (`apps/ai-service`)**: ⏳ **NEXT STEP**
  - Siap di-deploy ke Render / Hugging Face / VPS Biznet GIO ketika verifikasi kartu/sinyal siap.
  - Dockerfile & Environment Variables (`LLM_API_KEY`, `LLM_PROVIDER`, `LLM_MODEL`, `PORT`) sudah siap.
- [ ] **6. Core API (`apps/api`) & Worker**: ⏳ **PENDING AI SERVICE**
  - Menunggu URL AI Service publik untuk dipasang ke `AI_SERVICE_URL`.

---


## 📊 1. Perbandingan Opsi Deployment

| Fitur / Parameter      | ☁️ Opsi A: Managed Cloud Free-Tier                   | 💻 Opsi B: Private VPS Biznet GIO (Recommended)                                        |
|:-----------------------|:-----------------------------------------------------|:---------------------------------------------------------------------------------------|
| **Estimasi Biaya**     | **Rp 0 / bulan** (100% Gratis)                       | **~Rp 100.000 - Rp 150.000 / bulan**                                                   |
| **Performa & Latensi** | Latensi antar-layanan (SG, US, EU)                   | **Sangat Cepat & Instant** (Internal Docker Latency `< 1ms`, Datacenter Jakarta/Bogor) |
| **Cold-Start Latency** | **Ada Cold-Start (~25–35s)** di Render API jika idle | **BEBAS Cold-Start** (Server selalu *standby* 24/7)                                    |
| **Kompleksitas Setup** | Butuh konfigurasi 5 platform terpisah                | **1-Command Deployment** via Docker Compose                                            |
| **Batasan Kuota**      | Supabase DB 500MB, Upstash 10k req/day               | **Bebas Batasan** (Tergantung disk VPS 50GB+)                                          |

---

## 💻 OPSI B: Private VPS Biznet GIO (Rekomendasi Performa Tinggi)

### 🏢 1. Spesifikasi Biznet GIO yang Disarankan
- **Produk**: Biznet GIO **NEO Lite** / **NEO Virtual Compute**
- **Spesifikasi**:
  - **CPU**: 2 vCPU
  - **RAM**: 4 GB *(Cukup untuk menampung Docker Postgres pgvector, Redis, Core API, Worker, Next.js UI, & Python AI Service PyTorch)*
  - **Storage**: 50 GB SSD / NVMe
  - **OS**: Ubuntu 22.04 LTS / 24.04 LTS
  - **Public IP**: Included (Static Public IP)

---

### 📐 2. Topologi Arsitektur VPS Biznet GIO

```mermaid
graph TD
    Client[Browser / User HR UI] -->|HTTPS Port 443| Caddy[Caddy Reverse Proxy + Auto SSL Let's Encrypt]
    
    subgraph Biznet GIO Private VPS (Ubuntu 22.04 LTS)
        Caddy -->|Proxy /| Web[Next.js Frontend: Port 3000]
        Caddy -->|Proxy /api| API[Node.js Core API: Port 3001]
        
        API -->|Loopback| DB[(PostgreSQL 16 + pgvector)]
        API -->|Loopback| Redis[(Redis 7 Queue)]
        
        Worker[BullMQ Background Worker] -->|Consume Queue| Redis
        Worker -->|FastAPI Call| AIService[Python AI Microservice: Port 8000]
        Worker -->|Save Extraction & Embeddings| DB
    end

    AIService -->|LLM Parse| Groq[Groq API: llama-3.1-8b-instant]
```

---

### 🛠️ 3. Langkah Setup & Deployment di VPS Biznet GIO

#### Step 1: Akses VPS & Install Docker Engine
Setelah membuat instance di Biznet GIO Portal, SSH ke VPS Anda:
```bash
ssh root@<IP_PUBLIC_BIZNET_GIO>
```
Jalankan script instalasi Docker & Docker Compose:
```bash
apt update && apt upgrade -y
apt install -y curl git ufw

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verifikasi Docker & Compose
docker --version
docker compose version
```

#### Step 2: Clone Repository & Konfigurasi `.env`
```bash
cd /opt
git clone https://github.com/username/Architecture-RAG-pipeline.git resumix-ai
cd resumix-ai

# Buat file .env produksi
cp .env.example .env
```
Edit file `.env` untuk Production:
```env
NODE_ENV=production
API_PORT=3001
API_URL=https://your-domain.com/api
AI_SERVICE_URL=http://ai-service:8000
DATABASE_URL=postgresql://postgres:SuperSecretPassword123@postgres:5432/cv_ats_db
REDIS_URL=redis://redis:6379
LLM_PROVIDER=groq
LLM_API_KEY=gsk_your_groq_api_key_here
JWT_SECRET=super-secret-jwt-key-production-change-me
```

#### Step 3: Jalankan System via Docker Compose
```bash
docker compose up -d --build
```
Periksa status kontainer:
```bash
docker compose ps
```

#### Step 4: Setup Caddy Reverse Proxy (HTTPS / SSL Otomatis)
Install Caddy Server di Ubuntu:
```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```
Buat file konfigurasi `/etc/caddy/Caddyfile`:
```caddy
your-domain.com {
    # Forward API requests ke Core API
    handle /api/* {
        reverse_proxy localhost:3001
    }

    # Forward request lainnya ke Next.js Web UI
    handle {
        reverse_proxy localhost:3000
    }
}
```
Reload Caddy:
```bash
systemctl reload caddy
```
*Caddy akan secara otomatis mengambil dan memperbarui Sertifikat SSL HTTPS dari Let's Encrypt secara gratis!*

---

### 🛡️ 4. Backup Database Otomatis (Cron Job)
Buat script backup PostgreSQL otomatis di `/opt/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
docker exec -t ats_postgres pg_dump -U postgres cv_ats_db | gzip > $BACKUP_DIR/cv_ats_db_$DATE.sql.gz
find $BACKUP_DIR -type f -mtime +7
find $BACKUP_DIR -type f -mtime +7 -name "*.sql.gz" -delete
```
Jalankan chmod dan pasang di crontab harian:
```bash
chmod +x /opt/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -
```

---

## ☁️ OPSI A: Managed Cloud Free-Tier Split (100% FREE / Rp 0 per bulan)

### 🧩 1. Pemetaan Layanan Free Tier

| Service / Komponen | Stack | Platform | Limit & Spesifikasi Free Tier |
| :--- | :--- | :--- | :--- |
| **Frontend** (`apps/web`) | Next.js 14 | **Vercel** (Hobby Plan) | Edge Network, Unlimited GitHub CI/CD, SSL Otomatis. |
| **Core API** (`apps/api`) | Node.js / Express | **Koyeb** / **Render.com** | 512MB RAM, Free Web Service. |
| **Queue Worker** (`apps/api/src/worker`) | BullMQ Worker | **Koyeb** / **Render.com** | Background Worker Process. |
| **AI Microservice** (`apps/ai-service`) | FastAPI (Python) | **Hugging Face Spaces** / **Koyeb** | Docker/FastAPI container (16GB RAM CPU gratis di HF Spaces). |
| **Database** (`database`) | PostgreSQL 15+ + `pgvector` | **Supabase** | 500MB DB, `pgvector` extension pre-installed. |
| **Queue Database** | Redis | **Upstash Redis** (Serverless) | 10.000 req/day, SSL Enabled. |
| **Storage CV** | Private Object Storage | **Cloudflare R2** | 10GB Storage gratis + **Zero Egress Fees** (Bebas Biaya Transfer). |
| **LLM Provider** | Llama 3 / Mixtral | **Groq Cloud API** | Free Tier Rate Limit tinggi. |

---

### 🔐 2. Catatan Khusus Upstash Redis (Shared Instance / Lectura Co-existence)

> ⚠️ **PENTING**: Instance Upstash Redis (`real-macaw-187505.upstash.io`) saat ini **sudah digunakan** oleh proyek lain (`lectura`) yang menyimpan key BullMQ default:
> - `bull:generation-queue:meta`
> - `bull:ingestion-queue:1`
> - `bull:ingestion-queue:events`
> - `bull:ingestion-queue:failed`
> - `bull:ingestion-queue:id`
> - `bull:ingestion-queue:meta`
> - `bull:quiz-generation-queue:meta`

#### Policy Berdampingan (Co-existence Rule):
1. **Key `lectura` TETAP DISIMPAN** dan **TIDAK BOLEH DIHAPUS**.
2. Proyek RAG Pipeline ini **WAJIB menggunakan `prefix` khusus** pada konfigurasi BullMQ `apps/api`:
   ```typescript
   // Konfigurasi Queue di apps/api
   export const cvQueue = new Queue('cv-parsing-queue', {
     connection: {
       host: process.env.REDIS_HOST, // real-macaw-187505.upstash.io
       port: 6379,
       password: process.env.REDIS_PASSWORD,
       tls: {},
     },
     prefix: 'rag_cv', // Awalan unik agar terisolasi dari 'bull:*' milik lectura
   });
   ```
3. Key RAG Pipeline di Redis akan otomatis berformat `rag_cv:cv-parsing-queue:...` sehingga 100% aman dan tidak saling mengganggu.

---

### 📦 3. Konfigurasi Cloudflare R2 (Private Storage)

1. Buat Bucket Baru di Dashboard Cloudflare: `resumix-cv-bucket` (Set sebagai **Private**).
2. Buat API Token S3-compatible di Cloudflare R2 dengan izin `Admin Read & Write`.
3. Pasang Environment Variables di Core API (`apps/api`):
   ```env
   R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   R2_ACCESS_KEY_ID=your_access_key_id
   R2_SECRET_ACCESS_KEY=your_secret_access_key
   R2_BUCKET_NAME=resumix-cv-bucket
   ```
4. Akses berkas PDF CV di UI/UX wajib menggunakan **Presigned URL** (`@aws-sdk/s3-request-presigner`) dengan `expiresIn: 900` (15 menit).

