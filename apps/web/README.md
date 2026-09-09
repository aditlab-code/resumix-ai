# Resumix AI Web Dashboard (`apps/web`)

Next.js 14 HR Recruitment Dashboard & Candidate Intelligence Frontend built with TypeScript, Tailwind CSS, Lucide Icons, and embedded documentation viewer.

---

## Technical Stack & Features

1. **Framework**: Next.js 14 (App Router / Pages), React 18, TypeScript.
2. **Styling & UI Components**: Enterprise Dark Blue Navy theme, Lucide Icons, Tailwind CSS design system tokens.
3. **Features**:
   - Job vacancy management & qualification form inputs.
   - Drag-and-drop PDF resume upload dropzone with instant feedback.
   - Detailed candidate profile overlay modal with score breakdown radar/breakdown visualizer.
   - Secure PDF preview via Supabase Storage temporary signed URLs.
   - Built-in static documentation viewer (`src/content/docs/static-docs.ts`).

---

## Service Boundaries

- **UI/UX Only**: Handles user interaction, form inputs, candidate stage transitions, and AI score visual representations.
- **No Secret Handling**: Secrets (LLM API keys, Supabase Service Role keys, DB credentials) are strictly hidden behind Core API gateway.
- **No Direct DB Access**: All data operations pass through Core API REST endpoints `/api/v1`.

---

## Commands

```bash
# Start Next.js dev server (Port 3000)
npm run dev

# Typecheck TypeScript files
npm run typecheck   # npx tsc --noEmit

# Production build
npm run build
```
