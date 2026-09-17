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

Resumix AI `DESIGN.md` v3.0 is the official **Single Source of Truth (SSOT)** for all user interface (UI/UX) development in `apps/web`, enforcing **Anti-Slop** craftsmanship standards. This document binds visual design system tokens directly with anti-slop qualitative filters.

### Anti-Slop Liveliness Dials
- **ENERGY: 1** (Quiet, Restrained Enterprise Aesthetics, No Over-Decorated Accent Blurs).
- **RHYTHM: 1** (Structured Grid, Data-Dense Enterprise Layout, Purposeful Content Density).
- **MOTION: 1** (Fast 120–200ms Micro-Interactions, No Endless Looping Animations/Pulses).

### Core Principles (Anti-Slop Standards)
1. **NO GLASSMORPHISM (R-10)**: Do not use `backdrop-blur`, semi-transparent frosted glass effects, or floating surfaces lacking a solid background.
2. **NO GRADIENTS & ORBS (R-01)**: Do not use `bg-gradient-*`, `linear-gradient`, multi-tone text gradients, or radial orb effects. All surfaces must use solid colors or soft background tints.
3. **UNIFIED BORDERS (R-11)**: All cards, containers, and panels must use precise 1px solid borders (`border border-slate-200` or `border border-border`).
4. **NO DECORATIVE ORNAMENTS (R-31)**: Do not add artificial 3 vertical dots (`3 vertical dots`) or decorative visual marks to card or section headers. Headers must contain only functional titles, subtitles, or actual action controls.
5. **NO ENDLESS PULSE ANIMATIONS (R-19)**: Do not use `animate-pulse` on static status badges or indicators. Status indicators must use a solid 6px dot (`w-1.5 h-1.5 rounded-full shrink-0`). `animate-pulse` is strictly restricted to active real-time upload/parsing operations.
6. **MINIMALIST PILL BADGES + SOLID INDICATOR DOT (R-09)**: Status badges must use a neutral sunken Slate-100 background (`bg-slate-100`), a 1px solid border matching the status tone, and a solid 6px indicator dot.

---

## 2. Color Palette & Surface Tokens

| Role | Token | Hex / Class | Usage |
|:---|:---|:---:|:---|
| Primary Text | `ink.default` | `#0F172A` | Page titles, candidate names, quantitative metrics |
| Secondary Text | `ink.subtle` | `#475569` | Captions, metadata, field labels |
| Accent Text | `ink.brand` | `#1D4ED8` | Links, selected tabs, accent scores |
| App Canvas | `surface.canvas` | `#F1F5F9` | Main dashboard canvas background (`Slate-100`) |
| Sunken Surface | `surface.sunken` | `#E2E8F0` / `bg-slate-100` | Table headers, badge backgrounds, filter bars |
| Card Surface | `surface.soft` | `bg-white` / `bg-slate-50/80` | KPI card and job card backgrounds |
| Active Card | `surface.active_ring` | `bg-blue-50/60 border-blue-500 ring-1 ring-blue-500` | Selected job card highlight ring |
| Standard Border | `surface.border` | `#E2E8F0` / `border-slate-200` | Section dividers, table row borders, card outlines |

---

## 3. Typography & Numeric Precision

- **UI Font**: Inter / system-ui for all interface copy.
- **Numeric & Metric Font (R-17, C-5)**: Monospaced tabular numerals (`tabular-nums font-mono font-extrabold`) are mandatory for:
  - Job-Fit Scores (`85%`, `92.5/100`).
  - Total scoring weight accumulation (`Total Weight Accumulation: 100%`).
  - Applicant metrics (`applications_count`).
  - Work experience duration (`total_experience_months`).

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
- **Indicator Dot**: Solid 6px dot (`w-1.5 h-1.5 rounded-full shrink-0`) on the left side. **No `animate-pulse`** except for active `processing` during real-time document upload.

### B. Job-Fit Score Badges
- **Format**: `bg-slate-100 border text-caption font-bold tabular-nums font-mono px-2.5 py-1 rounded-full`.
- **Border Indicators**:
  - Score >= 80: `text-emerald-950 border-emerald-500`.
  - Score >= 60: `text-amber-950 border-amber-500`.
  - Score < 60: `text-rose-950 border-rose-500`.

### C. KPI & Job Cards
- **Precise Solid Border**: All cards use a uniform 1px solid border (`border-slate-200`).
- **No 3 Vertical Dots**: Card headers contain only functional titles, descriptive labels, or actual action buttons.
- **Soft Tint Background**: Card background `bg-white` or `bg-slate-50/80`.
- **Active Card**: Selected card uses an accent ring border `border-blue-500 bg-blue-50/60 ring-1 ring-blue-500`.

### D. Settings & Range Input Fields (`RangeField`)
- Slider container uses `bg-slate-50/80 border border-slate-200 rounded-xl p-4`.
- Header label contains criterion variable name and percentage badge `bg-slate-100 text-blue-900 border border-blue-500 font-mono font-extrabold`.
- Slider track & thumb use `accent-blue-600 h-2 bg-slate-200 rounded-lg` solid without gradients.

### E. Anti-Slop Hover & Interactive State Specification
- **Cards & Containers (KPI / Job / Candidate Cards)**:
  - **Pure Flat Shift**: Zero `translateY` elevation lift or heavy box shadows.
  - **Border Shift**: `border-slate-200` $\rightarrow$ `hover:border-slate-300` (or `hover:border-blue-300` for selectable cards).
  - **Background Tint Shift**: `bg-white` / `bg-slate-50` $\rightarrow$ `hover:bg-slate-100/50`.
  - **Motion**: `transition-colors duration-120 ease-in-out`.
- **Button & Action Controls (Primary, Secondary, Ghost, Destructive)**:
  - **Strict Flat Tint Transition**: Color fill, text, and border shift (120ms ease), strictly zero scale zoom on hover, zero radial glow or blurs.
  - **Primary**: `bg-blue-700` $\rightarrow$ `hover:bg-blue-800`.
  - **Secondary**: `bg-white border-slate-200` $\rightarrow$ `hover:bg-slate-100 hover:border-slate-300`.
  - **Ghost/Icon**: `text-slate-500` $\rightarrow$ `hover:bg-slate-100 hover:text-slate-900`.
  - **Active Click Feedback**: `active:scale-[0.98]` micro-compression.
- **Table Rows & List Items**:
  - **Subtle Slate Tint + Title Accent**: Background row shift `hover:bg-slate-100/70` (120ms).
  - **Clickable Row Titles/Links**: Shift from `text-slate-900` to `hover:text-blue-700` (`brand.accent`).
  - **Strict Rule R-31**: Zero decorative left stripes or vertical 3-dot ornaments.
- **Form Controls, Dropdowns & Sliders**:
  - **Hover**: `border-slate-200` $\rightarrow$ `hover:border-slate-300` (120ms).
  - **Focus**: `focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20` (3px soft focus ring).
  - **Strict Anti-Slop**: Zero glowing radial blurs or animated border gradients.

### F. Navbar & Sidebar Navigation System
- **Top Header / Navbar**:
  - **Solid Enterprise Surface (R-10)**: `bg-white` / `bg-surface-raised` with 1px solid bottom border (`border-b border-slate-200`).
  - **Position**: `sticky top-0 z-20`.
  - **Strict Anti-Slop R-10**: Strictly zero `backdrop-blur` or semi-transparent frosted glass on top header.
  - **Actions**: Flat tint button transitions without decorative ornaments.
- **Sidebar Navigation**:
  - **Permanent Desktop Panel**: `w-[264px] bg-ink-default border-r border-slate-800 text-white z-30`.
  - **Active Nav Item**: Solid block accent fill (`bg-blue-600 text-white font-bold shadow-e1`).
  - **Inactive Nav Items**: `text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors duration-120`.
  - **Strict Rule R-31**: Zero decorative dots or left vertical accent stripes on nav items.
- **Mobile Navigation Drawer**:
  - **Slide-over Panel**: `w-[264px] bg-ink-default border-r border-slate-800 text-white`.
  - **Backdrop**: Dark solid overlay `bg-black/50 transition-opacity` without heavy blur filters.
  - **Motion**: Smooth 200ms slide-in animation (`animate-in slide-in-from-left duration-200`).

### G. Anti-Slop Modal & Overlay Architecture
- **Backdrop & Focus Trap**:
  - **Solid Backdrop (R-10)**: `bg-slate-950/60` dark overlay without `backdrop-blur`.
  - **Native Accessibility**: Built-in Radix Dialog focus trap and escape key handling; no duplicate manual JS listeners.
- **Modal Header**:
  - **Surface & Border**: Solid background (`bg-white` or `bg-slate-900`), 1px solid bottom border (`border-b border-slate-200`).
  - **Clean Typography (R-31)**: Truncated title with optional concise subheadline; zero decorative 3-dot ornaments or artificial eyebrow badges.
- **Modal Body**:
  - **Single Scroll Container**: `max-h-[75vh] overflow-y-auto p-6 text-sm`; no double scrollbars.
- **Modal Footer**:
  - **Actions Container**: Sticky/fixed bottom panel with 1px solid top border (`border-t border-slate-200`), right-aligned action buttons using 120ms flat state transitions.
- **Redundancy Elimination Rules (R-05, R-16)**:
  - Do not create separate "Guidelines" tabs when file limits are stated on the dropzone.
  - Do not create 3 separate warning boxes displaying the same candidate name in deletion modals; merge into 1 single high-contrast warning card.

---

## 5. Integration Governance with AGENTS.md

`DESIGN.md` is strictly bound inside `AGENTS.md` under **MUST RULES** and **DO NOT RULES**:

1. **MUST RULE**:
   - `MUST follow DESIGN.md v3.0 as the single source of truth for all UI component styling, colors, and layout in apps/web.`
2. **DO NOT RULE**:
   - `DO NOT use gradients, linear-gradients, backdrop-blur, or glassmorphism in any UI component.`
   - `DO NOT add decorative repetitive ornaments (e.g. 3 vertical dots) or endless pulsing animations.`
   - `DO NOT hardcode ad-hoc colors or create un-unified card borders outside DESIGN.md tokens.`

---

## 6. Delivery Gate Verification Checklist

Every UI modification must pass the following verification checklist before delivery (Delivery Gate PASS/FAIL):

- [ ] Palette is derived strictly from `DESIGN.md` v3.0 without AI default gradients (R-01, R-29).
- [ ] UI is free of artificial 3 vertical dots decorative ornaments (R-31).
- [ ] UI is free of endless `animate-pulse` on static status badges or indicators (R-19).
- [ ] Scores and quantitative metrics use monospaced tabular numerals (`tabular-nums font-mono`) (R-17, C-5).
- [ ] Interactive components have real functionality without dummy placeholders (C-2, R-26).
- [ ] Loading, empty, and error states are explicitly defined and meaningful (C-4, R-27).
