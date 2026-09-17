---
design_md_version: "3.0"
project: "Resumix AI"
description: "Enterprise Recruitment Intelligence & Next-Gen ATS — Single Source of Truth Design System (Anti-Slop Edition)"
style: "Enterprise Slate-Navy / Ultra-Minimalist Data-Dense Professional Dashboard"
antislop_dials:
  energy: 1
  rhythm: 1
  motion: 1
colors:
  brand:
    accent: "#1D4ED8"
    accent_hover: "#1E40AF"
    accent_soft: "#DBEAFE"
  ink:
    default: "#0F172A"
    muted: "#1E293B"
    subtle: "#475569"
    faint: "#94A3B8"
    inverse: "#FFFFFF"
    brand: "#1D4ED8"
  surface:
    canvas: "#F1F5F9"
    sunken: "#E2E8F0"
    base: "#FFFFFF"
    raised: "#FFFFFF"
    hover: "#F8FAFC"
    active: "#EFF6FF"
    overlay: "#FFFFFF"
    border: "#E2E8F0"
    border_strong: "#CBD5E1"
    border_subtle: "#F1F5F9"
  semantic:
    success: "#15803D"
    success_soft: "#DCFCE7"
    warning: "#B45309"
    warning_soft: "#FEF3C7"
    danger: "#B91C1C"
    danger_soft: "#FEE2E2"
    info: "#1D4ED8"
    info_soft: "#DBEAFE"
typography:
  font_family_ui: "Inter, -apple-system, 'Segoe UI', sans-serif"
  font_family_mono: "'JetBrains Mono', 'Fira Code', monospace"
  scale:
    display: { size: "32px", weight: 700, line_height: "40px", tracking: "-0.02em" }
    h1: { size: "24px", weight: 700, line_height: "32px", tracking: "-0.01em" }
    h2: { size: "18px", weight: 600, line_height: "26px" }
    h3: { size: "15px", weight: 600, line_height: "22px" }
    body: { size: "14px", weight: 400, line_height: "21px" }
    caption: { size: "12px", weight: 500, line_height: "16px", tracking: "0.02em" }
    metric: { size: "28px", weight: 700, line_height: "34px", tracking: "-0.01em" }
layout:
  base_unit: "4px"
  spacing_scale: [4, 8, 12, 16, 20, 24, 32, 48, 64]
  max_width: "1440px"
  sidebar_width: "264px"
  grid: "12-column, 24px gutter"
radii:
  sm: "6px"
  md: "10px"
  lg: "14px"
  pill: "999px"
elevation:
  e0_flat: "none"
  e1_card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.08)"
  e2_hover: "0 2px 4px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(29, 78, 216, 0.10)"
  e3_dropdown: "0 8px 16px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.06)"
  e4_modal: "0 16px 40px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.08)"
  focus_ring: "0 0 0 3px rgba(29, 78, 216, 0.30)"
motion:
  duration_fast: "120ms"
  duration_base: "200ms"
  duration_slow: "320ms"
  easing: "cubic-bezier(0.22, 1, 0.36, 1)"
  hover_lift: "translateY(-1px)"
---

## 1. Overview & Single Source of Truth

Resumix AI `DESIGN.md` v3.0 adalah **Single Source of Truth (SSOT)** resmi untuk seluruh pengembangan antarmuka (UI/UX) di `apps/web` berstandar **Anti-Slop**. Dokumen ini menggabungkan aturan desain visual dengan filter kualitatif anti-slop.

### Anti-Slop Liveliness Dials
- **ENERGY: 1** (Quiet, Restrained Enterprise Aesthetics, No Over-Decorated Accent Blurs).
- **RHYTHM: 1** (Structured Grid, Data-Dense Enterprise Layout, Purposeful Content Density).
- **MOTION: 1** (Fast 120-200ms Micro-Interactions, No Endless Looping Animations/Pulses).

### Prinsip Utama v3.0 (Anti-Slop Standards)
1. **DILARANG GLASSMORPHISM (R-10)**: Tidak boleh menggunakan `backdrop-blur`, efek kaca buram semi-transparan, atau surface melayang tanpa latar padat.
2. **DILARANG GRADIEN & ORBS (R-01)**: Tidak boleh menggunakan `bg-gradient-*`, `linear-gradient`, teks bertingkat warna, atau efek radial orb. Seluruh permukaan menggunakan warna padat (*solid colors*) atau *soft background tint*.
3. **BORDER UNIFIED (R-11)**: Seluruh kartu, container, dan panel menggunakan garis pembatas padat 1px yang presisi (`border border-slate-200` atau `border border-border`).
4. **DILARANG AKSEN ORNAMEN DEKORATIF (R-31)**: Dilarang menambahkan aksen 3 titik vertikal (`3 vertical dots`) atau ornamen visual buatan pada header kartu/section. Header hanya memuat judul fungsional, sub-judul, atau aksi yang nyata.
5. **DILARANG ANIMASI PULSE BERULANG (R-19)**: Dilarang menggunakan `animate-pulse` pada status badge atau indikator statis. Indikator status menggunakan titik padat 6px solid (`w-1.5 h-1.5 rounded-full shrink-0`). `animate-pulse` hanya diperbolehkan jika ada proses pengunggahan/parsing PDF yang sedang berlangsung secara real-time.
6. **MINIMALIST PILL BADGES + SOLID INDICATOR DOT (R-09)**: Badge status menggunakan latar Slate-100 neutral sunken (`bg-slate-100`), border 1px solid berwarna indikator status, dan titik indikator 6px solid.

---

## 2. Color Palette & Surface Tokens

| Peran | Token | Hex / Class | Penggunaan |
|:---|:---|:---:|:---|
| Teks utama | `ink.default` | `#0F172A` | Judul utama, nama kandidat, metrik kuantitatif |
| Teks sekunder | `ink.subtle` | `#475569` | Caption, metadata, label field |
| Teks aksen | `ink.brand` | `#1D4ED8` | Link, tab terpilih, skor aksen |
| Kanvas app | `surface.canvas` | `#F1F5F9` | Latar belakang utama dashboard (`Slate-100`) |
| Permukaan sunken | `surface.sunken` | `#E2E8F0` / `bg-slate-100` | Header tabel, latar badge, filter bar |
| Kartu KPI / Job | `surface.soft` | `bg-white` / `bg-slate-50/80` | Latar belakang kartu KPI dan Job Available |
| Kartu aktif | `surface.active_ring` | `bg-blue-50/60 border-blue-500 ring-1 ring-blue-500` | Highlight kartu posisi pekerjaan terpilih |
| Border standar | `surface.border` | `#E2E8F0` / `border-slate-200` | Pembatas section / table row / card border |

---

## 3. Typography & Numeric Precision

- **Font UI**: Inter / system-ui untuk seluruh teks UI.
- **Font Numeric / Metrics (R-17, C-5)**: Monospaced tabular numerals (`tabular-nums font-mono font-extrabold`) wajib digunakan pada:
  - Angka Job-Fit Score (`85%`, `92.5/100`).
  - Total bobot formula scoring (`Total Weight Accumulation: 100%`).
  - Angka metrik jumlah pelamar (`applications_count`).
  - Durasi pengalaman kerja (`total_experience_months`).

---

## 4. Components Specification

### A. Minimalist Pill Badge & Indicator Dots (`StatusBadge`)
- **Container**: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider uppercase border bg-slate-100`.
- **Borders & Tones**:
  - `ok` / `hired` / `processed`: `text-emerald-900 border-emerald-500` (Dot: `bg-emerald-600`).
  - `warn` / `screening` / `needs_review`: `text-amber-900 border-amber-500` (Dot: `bg-amber-600`).
  - `danger` / `rejected` / `failed`: `text-rose-900 border-rose-500` (Dot: `bg-rose-600`).
  - `accent` / `processing`: `text-blue-900 border-blue-500` (Dot: `bg-blue-600`).
  - `neutral` / `applied`: `text-slate-800 border-slate-300` (Dot: `bg-slate-400`).
- **Indicator Dot**: Solid 6px dot (`w-1.5 h-1.5 rounded-full shrink-0`) di sisi kiri teks. **Tanpa `animate-pulse`** kecuali pada status `processing` aktif saat unggah file.

### B. Job-Fit Score Badges
- **Format**: `bg-slate-100 border text-caption font-bold tabular-nums font-mono px-2.5 py-1 rounded-full`.
- **Indikator Border**:
  - Score >= 80: `text-emerald-950 border-emerald-500`.
  - Score >= 60: `text-amber-950 border-amber-500`.
  - Score < 60: `text-rose-950 border-rose-500`.

### C. KPI & Job Available Cards
- **Border Solid Presisi**: Seluruh kartu menggunakan border solid 1px seragam (`border-slate-200`).
- **Tanpa 3 Vertical Dots**: Header kartu hanya berisi judul fungsional, label deskriptif, atau tombol aksi nyata.
- **Latar Soft Tint**: Latar kartu `bg-white` atau `bg-slate-50/80`.
- **Kartu Aktif**: Kartu terpilih memakai ring border aksen `border-blue-500 bg-blue-50/60 ring-1 ring-blue-500`.

### D. Settings & Range Input Fields (`RangeField`)
- Wadah slider menggunakan `bg-slate-50/80 border border-slate-200 rounded-xl p-4`.
- Header label memuat nama variabel kriteria dan badge persentase `bg-slate-100 text-blue-900 border border-blue-500 font-mono font-extrabold`.
- Slider track & thumb menggunakan `accent-blue-600 h-2 bg-slate-200 rounded-lg` padat tanpa gradien.

---

## 5. Integration Governance with AGENTS.md

Dokumen `DESIGN.md` ini diikat secara langsung dalam `AGENTS.md` pada bagian **MUST RULES** dan **DO NOT RULES**:

1. **MUST RULE**:
   - `MUST follow DESIGN.md v3.0 as the single source of truth for all UI component styling, colors, and layout in apps/web.`
2. **DO NOT RULE**:
   - `DO NOT use gradients, linear-gradients, backdrop-blur, or glassmorphism in any UI component.`
   - `DO NOT add decorative repetitive ornaments (e.g. 3 vertical dots) or endless pulsing animations.`
   - `DO NOT hardcode ad-hoc colors or create un-unified card borders outside DESIGN.md tokens.`

---

## 6. Delivery Gate Verification Checklist

Setiap perubahan antarmuka UI wajib memenuhi checklist berikut sebelum dirilis (Delivery Gate PASS/FAIL):

- [ ] Palette diturunkan murni dari `DESIGN.md` v3.0 tanpa gradien default AI (R-01, R-29).
- [ ] UI bebas dari aksen ornamen 3 titik vertikal dekoratif (R-31).
- [ ] UI bebas dari `animate-pulse` berulang pada status badge/indikator statis (R-19).
- [ ] Angka skor dan metrik kuantitatif menggunakan `tabular-nums font-mono` (R-17, C-5).
- [ ] Komponen interaktif memiliki fungsi nyata tanpa dummy placeholder (C-2, R-26).
- [ ] State loading, empty, dan error terdefinisikan dengan jelas (C-4, R-27).
