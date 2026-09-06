---
design_md_version: "2.0"
project: "Resumix AI"
description: "Enterprise Recruitment Intelligence & Next-Gen ATS — Single Source of Truth Design System"
style: "Enterprise Slate-Navy / Data-Dense Professional Dashboard"
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
  hover_lift: "translateY(-2px) scale(1.01)"
---

## 1. Overview & Single Source of Truth

Resumix AI `DESIGN.md` v2.0 adalah **Single Source of Truth (SSOT)** resmi untuk seluruh pengembangan antarmuka (UI/UX) di `apps/web`. Setiap agen AI dan developer wajib mematuhi panduan di dokumen ini tanpa deviasi.

### Prinsip Utama v2.0
1. **DILARANG GLASSMORPHISM**: Tidak boleh menggunakan `backdrop-blur`, efek kaca buram semi-transparan, atau efek melayang tanpa latar padat.
2. **DILARANG GRADIEN**: Tidak boleh menggunakan `bg-gradient-*`, `linear-gradient`, atau teks/latar bertingkat warna. Seluruh permukaan dan komponen menggunakan warna padat (*solid colors*) atau *soft background tint*.
3. **BORDER UNIFIED**: Seluruh kartu, container, dan panel menggunakan garis pembatas padat yang presisi (`border border-slate-200` atau `border border-border`).
4. **AKSEN 3 VERTICAL DOTS**: Judul kartu KPI, kartu posisi pekerjaan (*Job Available*), dan section header menggunakan aksen 3 titik vertikal (`flex flex-col gap-0.5` dengan 3 `w-1 h-1 rounded-full bg-blue-600`).
5. **MINIMALIST PILL BADGES + INDICATOR DOT**: Badge status dan tag skill menggunakan latar Slate-100 neutral sunken (`bg-slate-100` / `var(--surface-sunken)`), border 1px solid berwarna indikator status, dan titik indikator 6px solid di sebelah kiri.

---

## 2. Color Palette & Surface Tokens

| Peran | Token | Hex / Class | Penggunaan |
|:---|:---|:---:|:---|
| Teks utama | `ink.default` | `#0F172A` | Judul utama, nama kandidat, metrik |
| Teks sekunder | `ink.subtle` | `#475569` | Caption, metadata, label field |
| Teks aksen | `ink.brand` | `#1D4ED8` | Link, tab terpilih, skor aksen |
| Kanvas app | `surface.canvas` | `#F1F5F9` | Latar belakang utama dashboard (`Slate-100`) |
| Permukaan sunken | `surface.sunken` | `#E2E8F0` / `bg-slate-100` | Header tabel, latar badge, filter bar |
| Kartu KPI / Job | `surface.soft` | `bg-slate-50/80` | Latar belakang kartu KPI dan Job Available |
| Kartu aktif | `surface.active_ring` | `bg-blue-50/60 border-blue-500 ring-1 ring-blue-500` | Highlight kartu posisi pekerjaan terpilih |
| Border standar | `surface.border` | `#E2E8F0` / `border-slate-200` | Pembatas section / table row / card border |

---

## 3. Typography & Numeric Precision

- **Font UI**: Inter / system-ui untuk seluruh teks UI.
- **Font Numeric / Metrics**: Monospaced tabular numerals (`tabular-nums font-mono font-extrabold`) wajib digunakan pada:
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
- **Indicator Dot**: Solid 6px dot (`w-1.5 h-1.5 rounded-full shrink-0`) di sisi kiri teks. Tambahkan `animate-pulse` khusus untuk status aktif/dalam proses (`processing`, `queued`, `needs_review`).

### B. Job-Fit Score Badges
- **Format**: `bg-slate-100 border text-caption font-bold tabular-nums font-mono px-2.5 py-1 rounded-full`.
- **Indikator Border**:
  - Score >= 80: `text-emerald-950 border-emerald-500`.
  - Score >= 60: `text-amber-950 border-amber-500`.
  - Score < 60: `text-rose-950 border-rose-500`.

### C. KPI & Job Available Cards
- **Tanpa Border Kiri Tebal**: Seluruh kartu menggunakan border solid 1px seragam (`border-slate-200`).
- **3 Vertical Dots**: Header kartu memuat 3 titik vertikal (`flex flex-col gap-0.5` dengan 3 `w-1 h-1 rounded-full bg-blue-600` / `bg-slate-400`).
- **Latar Soft Tint**: Latar kartu `bg-slate-50/80` (atau `bg-blue-50/50`, `bg-amber-50/50` untuk varian KPI).
- **Kartu Aktif**: Kartu yang sedang dipilih memakai ring border aksen `border-blue-500 bg-blue-50/60 ring-1 ring-blue-500`.

### D. Settings & Range Input Fields (`RangeField`)
- Wadah slider menggunakan `bg-slate-50/80 border border-slate-200 rounded-xl p-4`.
- Header label memiliki aksen 3 vertical dots dan badge persentase `bg-slate-100 text-blue-900 border border-blue-500 font-mono font-extrabold`.
- Slider track & thumb menggunakan `accent-blue-600 h-2 bg-slate-200 rounded-lg` padat tanpa gradien.

---

## 5. Integration Governance with AGENTS.md

Dokumen `DESIGN.md` ini diikat secara langsung dalam `AGENTS.md` pada bagian **MUST RULES** dan **DO NOT RULES**:

1. **MUST RULE**:
   - `MUST follow DESIGN.md v2.0 as the single source of truth for all UI component styling, colors, and layout in apps/web.`
2. **DO NOT RULE**:
   - `DO NOT use gradients, linear-gradients, backdrop-blur, or glassmorphism in any UI component.`
   - `DO NOT hardcode ad-hoc colors or create un-unified card borders outside DESIGN.md tokens.`

---

## 6. Do's and Don'ts Checklist

- **Do** gunakan `bg-slate-100` dengan border solid 1px dan indicator dot 6px untuk semua status badge.
- **Do** sertakan 3 titik vertikal (`3 vertical dots`) pada header kartu KPI, kartu lowongan, dan section title.
- **Do** gunakan `tabular-nums font-mono` untuk seluruh angka skor dan metrik kuantitatif.
- **Don't** menggunakan `bg-gradient-*` atau `linear-gradient` pada tombol, kartu, badge, atau background.
- **Don't** menggunakan `backdrop-blur` atau efek glassmorphism semi-transparan.
- **Don't** menggunakan border tebal di sebelah kiri kartu (diganti dengan aksen 3 titik vertikal di header).
