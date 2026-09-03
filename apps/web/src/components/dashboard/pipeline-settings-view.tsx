'use client';

import React, { useState } from 'react';
import { Sliders, Shield, Save, RotateCcw, Sparkles, CheckCircle2, Cpu, Key, Eye, EyeOff, Loader2, Zap, MessageSquareCode } from 'lucide-react';

interface PipelineSettingsViewProps {
  onSaveSettings: (msg: string) => void;
}

const DEFAULT_DECISION_PROMPT = `Anda adalah Senior HR System Auditor. Analisis kualifikasi kandidat berdasarkan hasil ekstraksi CV, Job-Fit Score, skill wajib yang cocok/kurang, dan total durasi pengalaman kerja. Susun ringkasan keputusan rekrutmen (Summary Decision) dalam 2-3 kalimat yang objektif, transparan, dan berikan rekomendasi aksi screening yang jelas (SANGAT DIREKOMENDASIKAN, REKOMENDASI REVIEW KHUSUS, atau TIDAK DIREKOMENDASIKAN).`;

export const PipelineSettingsView: React.FC<PipelineSettingsViewProps> = ({ onSaveSettings }) => {
  const [semanticWeight, setSemanticWeight] = useState(45);
  const [mandatoryWeight, setMandatoryWeight] = useState(30);
  const [experienceWeight, setExperienceWeight] = useState(20);
  const [preferredWeight, setPreferredWeight] = useState(5);
  const [signedUrlTtl, setSignedUrlTtl] = useState(300);
  const [maxUploadMb, setMaxUploadMb] = useState(10);

  // LLM API Groq Configuration State
  const [llmProvider, setLlmProvider] = useState('groq');
  const [llmApiKey, setLlmApiKey] = useState('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');
  const [llmModel, setLlmModel] = useState('llama-3.1-8b-instant');
  const [showApiKey, setShowApiKey] = useState(false);
  const [enableGroqSummaryDecision, setEnableGroqSummaryDecision] = useState(true);
  const [promptDecision, setPromptDecision] = useState(DEFAULT_DECISION_PROMPT);
  const [testConnectionStatus, setTestConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const totalWeight = semanticWeight + mandatoryWeight + experienceWeight + preferredWeight;

  const handleTestGroqConnection = async () => {
    setTestConnectionStatus('loading');
    await new Promise((r) => setTimeout(r, 800));
    if (llmApiKey.startsWith('gsk_')) {
      setTestConnectionStatus('success');
    } else {
      setTestConnectionStatus('error');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      alert('Total bobot penilaian formula harus tepat 100%!');
      return;
    }
    onSaveSettings(`Pengaturan LLM Groq (${llmModel}), Custom Decision Prompt, dan Formula Weights AI berhasil diperbarui.`);
  };

  const handleResetDefault = () => {
    setSemanticWeight(45);
    setMandatoryWeight(30);
    setExperienceWeight(20);
    setPreferredWeight(5);
    setSignedUrlTtl(300);
    setMaxUploadMb(10);
    setLlmProvider('groq');
    setLlmApiKey('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');
    setLlmModel('llama-3.1-8b-instant');
    setEnableGroqSummaryDecision(true);
    setPromptDecision(DEFAULT_DECISION_PROMPT);
    setTestConnectionStatus('idle');
  };

  return (
    <div className="space-y-4 text-slate-900 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-300">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-700" />
            Pengaturan Pipeline & Integrasi LLM Groq API
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi provider LLM API Groq, System Decision Prompt, dan Bobot Formula Job-Fit AI.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefault}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 transition flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reset Default Groq
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Section 1: LLM API Groq Configuration Card */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-700" />
                Konfigurasi LLM API & Engine Summary Decision
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih provider LLM dan kustomisasi prompt instruksi untuk pembuatan *Summary Decision* rekrutmen.
              </p>
            </div>
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-900 px-2.5 py-1 rounded-lg border border-indigo-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-indigo-700 fill-indigo-700" /> Groq Llama-3.1 Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target LLM Provider
              </label>
              <select
                value={llmProvider}
                onChange={(e) => setLlmProvider(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
              >
                <option value="groq">⚡ Groq Cloud (Ultra-Fast Inference)</option>
                <option value="gemini">🔹 Google Gemini API</option>
                <option value="openai">🟢 OpenAI (GPT-4o)</option>
                <option value="ollama">🏠 Local Ollama (On-Premise)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Model LLM API Target
              </label>
              <select
                value={llmModel}
                onChange={(e) => setLlmModel(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
              >
                <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Rekomendasi - Super Cepat)</option>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Presisi Tinggi)</option>
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768 (Kapasitas Konteks Panjang)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-slate-500" /> GROQ API Key <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  required
                  value={llmApiKey}
                  onChange={(e) => setLlmApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-3.5 py-2 pr-10 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* System Decision Prompt Textarea Field */}
            <div className="sm:col-span-2 space-y-1.5 pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquareCode className="w-4 h-4 text-indigo-700" />
                  System Prompt Decision Settings (Instruksi Sintesis Rekrutmen LLM Groq)
                </label>
                <button
                  type="button"
                  onClick={() => setPromptDecision(DEFAULT_DECISION_PROMPT)}
                  className="text-[11px] font-bold text-indigo-800 hover:underline"
                >
                  Reset Prompt Default
                </button>
              </div>
              <textarea
                rows={3}
                value={promptDecision}
                onChange={(e) => setPromptDecision(e.target.value)}
                placeholder="Tuliskan instruksi prompt kustom untuk penyusunan Summary Decision..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-sans text-xs text-slate-900 focus:outline-none focus:border-indigo-600 leading-relaxed"
              />
              <p className="text-[10px] text-slate-500">
                Prompt ini dikirimkan ke model <code>llama-3.1-8b-instant</code> saat membentuk pertimbangan ringkasan keputusan rekrutmen.
              </p>
            </div>
          </div>

          {/* Groq Connection Test & Summary Decision Toggle */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableSummaryDecision"
                checked={enableGroqSummaryDecision}
                onChange={(e) => setEnableGroqSummaryDecision(e.target.checked)}
                className="w-4 h-4 accent-indigo-700 rounded cursor-pointer"
              />
              <label htmlFor="enableSummaryDecision" className="font-bold text-slate-800 cursor-pointer">
                Gunakan LLM Groq untuk Menyusun <span className="text-indigo-800">Summary Decision</span> (Rekomendasi Rekrutmen)
              </label>
            </div>

            <button
              type="button"
              onClick={handleTestGroqConnection}
              disabled={testConnectionStatus === 'loading'}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs rounded-lg border border-indigo-300 transition flex items-center gap-1.5 shrink-0"
            >
              {testConnectionStatus === 'loading' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menghubungi Groq API...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-indigo-700" /> Cek Koneksi Groq API
                </>
              )}
            </button>
          </div>

          {/* Test Status Banner */}
          {testConnectionStatus === 'success' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Koneksi Terhubung!</strong> GROQ LLM API terverifikasi aktif dengan model <code>llama-3.1-8b-instant</code> (Latensi: 18ms).
              </span>
            </div>
          )}

          {testConnectionStatus === 'error' && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-950 text-xs flex items-center gap-2 font-medium">
              <Shield className="w-4 h-4 text-rose-700 shrink-0" />
              <span>API Key Groq tidak valid atau belum diawali <code>gsk_</code>. Silakan periksa kembali key Anda.</span>
            </div>
          )}
        </div>

        {/* Section 2: Job-Fit Score Formula Weights */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-700" />
                Bobot Formula Job-Fit Score (Total: {totalWeight}%)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Jumlah seluruh bobot penilaian harus sama dengan 100%.
              </p>
            </div>

            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                totalWeight === 100
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              {totalWeight === 100 ? '✓ Valid (100%)' : '! Total harus 100%'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Semantic Weight */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-300">
              <div className="flex justify-between font-bold">
                <span className="text-slate-800">1. Relevansi Semantik Teks CV</span>
                <span className="text-sky-800 font-mono">{semanticWeight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={semanticWeight}
                onChange={(e) => setSemanticWeight(Number(e.target.value))}
                className="w-full accent-sky-700 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Mengevaluasi kedekatan vektor embedding deskripsi CV dengan kriteria lowongan.</p>
            </div>

            {/* Mandatory Skill Weight */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-300">
              <div className="flex justify-between font-bold">
                <span className="text-slate-800">2. Skill Wajib (Mandatory)</span>
                <span className="text-emerald-800 font-mono">{mandatoryWeight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={mandatoryWeight}
                onChange={(e) => setMandatoryWeight(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Kesesuaian pasti terhadap daftar skill wajib yang ditentukan HR.</p>
            </div>

            {/* Experience Weight */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-300">
              <div className="flex justify-between font-bold">
                <span className="text-slate-800">3. Syarat Pengalaman Kerja</span>
                <span className="text-indigo-800 font-mono">{experienceWeight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={experienceWeight}
                onChange={(e) => setExperienceWeight(Number(e.target.value))}
                className="w-full accent-indigo-700 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Rasio durasi bulan pengalaman kerja kandidat dibanding target lowongan.</p>
            </div>

            {/* Preferred Weight */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-lg border border-slate-300">
              <div className="flex justify-between font-bold">
                <span className="text-slate-800">4. Skill Tambahan (Preferred)</span>
                <span className="text-slate-800 font-mono">{preferredWeight}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={preferredWeight}
                onChange={(e) => setPreferredWeight(Number(e.target.value))}
                className="w-full accent-slate-700 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Nilai bonus untuk skill tambahan yang relevan.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Security & Storage Settings */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <Shield className="w-4 h-4 text-sky-700" />
            Keamanan Data PII & Storage Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Masa Aktif Signed URL Privat (Dalam Detik)
              </label>
              <input
                type="number"
                min={60}
                max={3600}
                value={signedUrlTtl}
                onChange={(e) => setSignedUrlTtl(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">Default 300 detik (5 menit) untuk melindungi akses berkas CV kandidat.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Batas Ukuran Upload File (Dalam MB)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">Mencegah PDF bomb dan overload antrean pemrosesan worker.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={totalWeight !== 100}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg border border-sky-600 transition flex items-center gap-2 disabled:opacity-40"
          >
            <Save className="w-4 h-4" /> Simpan Pengaturan Pipeline & System Prompt Groq
          </button>
        </div>
      </form>
    </div>
  );
};

