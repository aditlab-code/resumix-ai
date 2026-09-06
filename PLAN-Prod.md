# 🚀 Live Production Planning: Resumix AI

Dokumen perencanaan dan panduan eksekusi **Live Production Deployment** untuk platform **Resumix AI RAG Pipeline**. Memuat 2 Opsi Arsitektur: **Opsi A (Managed Cloud Free-Tier 100% Gratis)** dan **Opsi B (Private VPS Biznet GIO - Performa Tinggi & Instant)**.

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

*(Dokumentasi Opsi Gratis Opsi A dapat ditinjau lengkap pada versi sebelumnya: Vercel + Supabase + Upstash + Hugging Face Spaces + Render).*
