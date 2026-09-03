# AI Extraction & Scoring Evaluation

## 1. Evaluasi Corpus Test

Evaluasi dilakukan menggunakan dataset test berisi **30–100 CV yang dianonimkan** dengan ground truth yang telah diverifikasi secara manual.

---

## 2. Metrik Kinerja MVP Target

| Metrik Kinerja | Target Minimal MVP | Metode Pengukuran |
| :--- | :---: | :--- |
| **JSON Validity Rate** | $\ge 98\%$ | Persentase output LLM yang lulus Pydantic validation |
| **Akurasi Email & Kontak** | $\ge 98\%$ | Field accuracy terhadap ground truth |
| **Skill Extraction F1-Score** | $\ge 0.80$ | Precision, Recall, & F1-Score skill kandidat |
| **Latency Digital PDF** | $< 10 \text{ detik}$ | Durasi dari upload hingga skor tersimpan |
| **Latency Scanned PDF (OCR)** | $< 45 \text{ detik}$ | Durasi ekstraksi OCR + LLM |
| **Manual HR Correction Rate** | $< 20\%$ | Persentase data yang diubah manual oleh HR |
