---
design_md_version: "1.0"
project: "Resumix AI"
description: "Enterprise Recruitment Intelligence & Next-Gen ATS — Dashboard Design System"
style: "Enterprise Dark Navy / Data-Dense Dashboard"
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

## 1. Overview

Resumix AI adalah dashboard HR **Enterprise Light Slate-Navy** yang harus terasa tepercaya, presisi, dan padat data (data-dense), tanpa terlihat "kosong" atau kaku seperti tabel spreadsheet. Masalah utama versi sebelumnya: seluruh permukaan (card, sidebar, tabel, header) memakai warna latar yang identik dan tanpa bayangan, sehingga mata tidak bisa membedakan mana elemen yang mengambang (interaktif) dan mana yang menjadi lantai statis — inilah sebab tampilan disebut **"terlalu flat"**.

Prinsip perbaikan: setiap permukaan memiliki *elevation level* yang jelas (0–4), transisi warna latar antar level terlihat jelas (Kanvas Slate-100 `#F1F5F9` memisahkan Card `#FFFFFF` dan Inset Header `#E2E8F0`), dan komponen interaktif wajib memberi respons visual (shadow lift, border highlight, warna accent tint `#EFF6FF` saat active/selected) saat *hover*/*focus*/*active*.

## 2. Colors

Palet dasar (Enterprise Obsidian, Slate-Navy Accent) diperkaya dengan 7 token permukaan (`surface.*`) dan 6 token teks (`ink.*`) serta semantik status (`success`/`warning`/`danger`/`info`) agar kartu, badge status lamaran, dan skor kecocokan punya kontras yang tajam dan dinamis.

| Peran            | Token              |    Hex    | Penggunaan                           |
|:-----------------|:-------------------|:---------:|:-------------------------------------|
| Teks utama       | `ink.default`      | `#0F172A` | Judul utama, nama kandidat, metrik   |
| Teks isi         | `ink.muted`        | `#1E293B` | Paragraf, deskripsi pekerjaan        |
| Teks sekunder    | `ink.subtle`       | `#475569` | Caption, metadata, label field       |
| Teks faint       | `ink.faint`        | `#94A3B8` | Text disabled, icon subtle           |
| Teks inverse     | `ink.inverse`      | `#FFFFFF` | Teks di atas surface gelap/tombol    |
| Teks aksen       | `ink.brand`        | `#1D4ED8` | Link, tab terpilih, skor aksen       |
| Kanvas app       | `surface.canvas`   | `#F1F5F9` | Latar belakang utama dashboard       |
| Permukaan sunken | `surface.sunken`   | `#E2E8F0` | Table header, filter bar, input fill |
| Kartu dasar      | `surface.base`     | `#FFFFFF` | Latar belakang card dasar            |
| Kartu terangkat  | `surface.raised`   | `#FFFFFF` | Card kandidat, floating panel        |
| State hover      | `surface.hover`    | `#F8FAFC` | Hover state pada card/tabel          |
| State terpilih   | `surface.active`   | `#EFF6FF` | Card/row aktif, tab terpilih         |
| Permukaan modal  | `surface.overlay`  | `#FFFFFF` | Modal dialog, drawer upload          |
| Border standar   | `surface.border`   | `#E2E8F0` | Pembatas section / table row         |
| Border tegas     | `surface.border_strong` | `#CBD5E1` | Pembatas card terpilih / input focus |

Aturan kunci: **jangan pernah** memakai warna latar yang sama untuk kanvas (`canvas`) dan kartu (`raised`) tanpa border atau shadow pembeda — kombinasi kanvas Slate-100 `#F1F5F9` dengan kartu putih `#FFFFFF` berbayangan `e1_card` memberi pemisah visual yang kokoh dan tidak flat.

## 3. Typography

Gunakan Inter untuk seluruh UI. Perbedaan bobot (weight) dan ukuran harus tegas antar level agar hierarki terasa, terutama untuk angka skor (`metric`) yang menjadi fokus visual utama di setiap kartu kandidat — gunakan ukuran `28px/700` khusus untuk skor, jangan disamakan dengan judul biasa. Label caption memakai `letter-spacing` positif tipis (`0.02em`) dan warna `ink.subtle` supaya terasa "mengambang" ringan di atas isi utama, bukan menyatu.

## 4. Layout

Grid 12 kolom dengan gutter 24px, sidebar tetap 264px. Skala spacing berbasis 4px (4/8/12/16/20/24/32/48/64) — jangan pakai nilai spacing acak di luar skala ini karena akan merusak ritme visual. Kartu kandidat, panel skor, dan tabel aplikasi harus memiliki padding internal minimal 16px agar konten tidak menempel ke tepi (salah satu ciri desain flat yang terasa sempit).

## 5. Elevation and Depth

Ini bagian inti untuk mengatasi kesan flat. Terapkan **4 level elevasi** yang konsisten di seluruh dashboard:

| Level | Nama     | Contoh Komponen                               | Shadow                              |
|:------|:---------|:----------------------------------------------|:------------------------------------|
| E1    | Card     | Kartu kandidat, panel KPI, sidebar item aktif | `elevation.e1_card`                 |
| E2    | Hover    | Card saat `:hover`, tombol primer saat hover  | `elevation.e2_hover` + `hover_lift` |
| E3    | Dropdown | Menu filter, tooltip skor breakdown, popover  | `elevation.e3_dropdown`             |
| E4    | Modal    | Dialog upload CV, drawer detail kandidat      | `elevation.e4_modal`                |

Aturan wajib:
- Setiap kartu (`surface.raised`) di atas kanvas (`surface.canvas`) **harus** memakai minimal `e1_card` — tidak boleh ada kartu tanpa shadow sama sekali.
- Saat *hover* pada elemen interaktif (card kandidat, row tabel yang bisa diklik, tombol), naikkan ke `e2_hover` disertai `hover_lift` (translateY -2px) dalam durasi `duration_base` (200ms) dengan `easing` yang sudah didefinisikan — ini memberi sinyal "bisa diklik" yang saat ini hilang.
- Table header dan filter bar memakai `surface.sunken` (bukan putih polos) supaya ada pembeda luminance dengan body tabel, meniru pendekatan *luminance-step elevation* alih-alih shadow di area padat data.
- Fokus keyboard (accessibility) wajib memakai `focus_ring` (ring biru 3px opacity 30%), bukan hanya outline default browser.

## 6. Shapes

Radius konsisten: `sm` (6px) untuk badge/chip status, `md` (10px) untuk card dan input, `lg` (14px) untuk modal dan panel besar, `pill` untuk avatar dan status dot. Hindari mencampur radius kecil dan besar dalam satu komponen yang sama (misalnya card dengan radius 14px tapi tombol di dalamnya radius 2px) — ini juga sumber kesan tidak rapi.

## 7. Components

- **KPI Card** (skor, jumlah kandidat): elevasi `e1_card`, radius `md`, padding 24px, angka metrik memakai warna `ink.default` dan label caption `ink.subtle` — beri sedikit gradasi tipis brand-tint (`brand.accent` 4–6% opacity) di background card skor tertinggi agar tidak semua kartu terlihat identik.
- **Candidate Row / Table**: baris memakai `surface.base`, header `surface.sunken`, hover row `surface.canvas` dengan transisi `duration_fast`. Skor kecocokan ditampilkan sebagai badge berwarna semantik (`success_soft`/`warning_soft`/`danger_soft`) berdasarkan ambang skor, bukan teks polos.
- **Status Badge** (`applied`, `screening`, `interview`, `hired`, `rejected`, `needs_review`): radius `pill`, latar `*_soft`, teks warna `*` solid, font `caption` weight 600.
- **Primary Button**: latar `brand.accent`, radius `md`, shadow `e1_card` saat rest, naik ke `e2_hover` + warna `accent_hover` saat hover, `focus_ring` saat fokus.
- **Modal / Drawer Upload CV**: latar `surface.overlay`, elevasi `e4_modal`, radius `lg`, backdrop gelap `rgba(15,23,42,0.4)` di belakangnya agar kedalaman terasa jelas terhadap dashboard di baliknya.
- **Sidebar**: latar `ink.default` (gelap, kontras dari canvas terang), item aktif memakai latar `brand.accent` dengan radius `md` dan sedikit inset shadow agar terasa "ditekan", bukan cuma teks bold.

## 8. Do's and Don'ts

- **Do** beri setiap permukaan yang mengambang (card, modal, dropdown) shadow sesuai level elevasinya — jangan ada elemen "melayang" tanpa bayangan.
- **Do** gunakan `surface.sunken` untuk area latar sekunder (header tabel, filter bar) agar ada kontras luminance dengan kartu di atasnya.
- **Do** animasikan transisi hover/focus (200ms, easing yang ditentukan) supaya interaktivitas terasa hidup, bukan statis.
- **Don't** menumpuk elevasi tinggi di semua tempat — modal dan dropdown harus terlihat berbeda beratnya dari card biasa; jangan pakai `e4_modal` untuk tooltip kecil.
- **Don't** memakai warna latar identik (`canvas` == `raised`) tanpa border/shadow pemisah — ini akar masalah "flat" yang harus dihindari di semua komponen baru.
- **Don't** menambah gradient atau dekorasi berlebihan di luar token `elevation`/`brand.accent` tint — tema tetap *enterprise*, bukan *playful*.
