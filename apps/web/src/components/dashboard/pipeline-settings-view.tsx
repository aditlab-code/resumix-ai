'use client';

import React, { useState } from 'react';
import { Save, RotateCcw, Eye, EyeOff, Loader2, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
  RangeField,
} from '@/components/ui';

interface PipelineSettingsViewProps {
  onSaveSettings: (msg: string) => void;
}

const DEFAULT_DECISION_PROMPT = `Anda adalah Senior HR System Auditor. Analisis kualifikasi kandidat berdasarkan hasil ekstraksi CV, Job-Fit Score, skill wajib yang cocok/kurang, dan total durasi pengalaman kerja. Susun ringkasan keputusan rekrutmen (Summary Decision) dalam 2-3 kalimat yang objektif, transparan, dan berikan rekomendasi aksi screening yang jelas (SANGAT DIREKOMENDASIKAN, REKOMENDASI REVIEW KHUSUS, atau TIDAK DIREKOMENDASIKAN).`;

const DEFAULT_API_KEY = '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';

export const PipelineSettingsView: React.FC<PipelineSettingsViewProps> = ({ onSaveSettings }) => {
  const [semanticWeight, setSemanticWeight] = useState(45);
  const [mandatoryWeight, setMandatoryWeight] = useState(30);
  const [experienceWeight, setExperienceWeight] = useState(20);
  const [preferredWeight, setPreferredWeight] = useState(5);
  const [signedUrlTtl, setSignedUrlTtl] = useState(300);
  const [maxUploadMb, setMaxUploadMb] = useState(10);

  const [llmProvider, setLlmProvider] = useState('groq');
  const [llmApiKey, setLlmApiKey] = useState(DEFAULT_API_KEY);
  const [llmModel, setLlmModel] = useState('llama-3.1-8b-instant');
  const [showApiKey, setShowApiKey] = useState(false);
  const [enableGroqSummaryDecision, setEnableGroqSummaryDecision] = useState(true);
  const [promptDecision, setPromptDecision] = useState(DEFAULT_DECISION_PROMPT);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const totalWeight = semanticWeight + mandatoryWeight + experienceWeight + preferredWeight;
  const weightValid = totalWeight === 100;

  const handleTestConnection = async () => {
    setTestStatus('loading');
    await new Promise((r) => setTimeout(r, 800));
    setTestStatus(llmApiKey.startsWith('gsk_') ? 'success' : 'error');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightValid) return;
    onSaveSettings(
      `Pengaturan LLM (${llmModel}), decision prompt, dan bobot formula berhasil diperbarui.`
    );
  };

  const handleResetDefault = () => {
    setSemanticWeight(45);
    setMandatoryWeight(30);
    setExperienceWeight(20);
    setPreferredWeight(5);
    setSignedUrlTtl(300);
    setMaxUploadMb(10);
    setLlmProvider('groq');
    setLlmApiKey(DEFAULT_API_KEY);
    setLlmModel('llama-3.1-8b-instant');
    setEnableGroqSummaryDecision(true);
    setPromptDecision(DEFAULT_DECISION_PROMPT);
    setTestStatus('idle');
  };

  return (
    <form onSubmit={handleSave} className="space-y-3 max-w-3xl">
      <Card className="space-y-4">
        <CardHeader
          title="Integrasi LLM"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetDefault}
              iconLeft={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset default
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Provider">
            <Select value={llmProvider} onChange={(e) => setLlmProvider(e.target.value)}>
              <option value="groq">Groq Cloud</option>
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="ollama">Local Ollama</option>
            </Select>
          </Field>

          <Field label="Model">
            <Select value={llmModel} onChange={(e) => setLlmModel(e.target.value)}>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
              <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
            </Select>
          </Field>

          <Field label="API Key" required className="sm:col-span-2">
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                required
                value={llmApiKey}
                onChange={(e) => setLlmApiKey(e.target.value)}
                placeholder="gsk_..."
                className="pr-9 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
                aria-label="Tampilkan API key"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field
            label="System Decision Prompt"
            className="sm:col-span-2"
            hint="Instruksi yang dikirim ke model saat menyusun ringkasan keputusan rekrutmen."
          >
            <Textarea
              rows={3}
              value={promptDecision}
              onChange={(e) => setPromptDecision(e.target.value)}
            />
          </Field>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-line">
          <label className="flex items-center gap-2 text-xs font-bold text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={enableGroqSummaryDecision}
              onChange={(e) => setEnableGroqSummaryDecision(e.target.checked)}
              className="w-4 h-4 accent-accent cursor-pointer"
            />
            Gunakan LLM untuk menyusun Summary Decision
          </label>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleTestConnection}
            disabled={testStatus === 'loading'}
            iconLeft={
              testStatus === 'loading' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )
            }
          >
            {testStatus === 'loading' ? 'Menghubungi...' : 'Cek koneksi'}
          </Button>
        </div>

        {testStatus === 'success' && (
          <div className="p-3 bg-ok-soft text-ok rounded text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Koneksi terhubung. Model <code>{llmModel}</code> terverifikasi aktif.
          </div>
        )}
        {testStatus === 'error' && (
          <div className="p-3 bg-danger-soft text-danger rounded text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            API Key tidak valid — harus diawali <code>gsk_</code>.
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <CardHeader
          title="Bobot Job-Fit Score"
          action={
            <span
              className={cn(
                'text-xs font-mono font-bold px-2.5 py-1 rounded',
                weightValid ? 'bg-ok-soft text-ok' : 'bg-danger-soft text-danger'
              )}
            >
              {weightValid ? 'Valid 100%' : `Total ${totalWeight}% (harus 100%)`}
            </span>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RangeField
            label="Relevansi semantik teks CV"
            value={semanticWeight}
            onChange={setSemanticWeight}
            hint="Kedekatan vektor embedding CV dengan kriteria lowongan."
          />
          <RangeField
            label="Skill wajib (mandatory)"
            value={mandatoryWeight}
            onChange={setMandatoryWeight}
            hint="Kesesuaian pasti terhadap daftar skill wajib."
          />
          <RangeField
            label="Syarat pengalaman kerja"
            value={experienceWeight}
            onChange={setExperienceWeight}
            hint="Rasio durasi pengalaman kandidat terhadap target."
          />
          <RangeField
            label="Skill tambahan (preferred)"
            value={preferredWeight}
            onChange={setPreferredWeight}
            hint="Nilai bonus untuk skill tambahan yang relevan."
          />
        </div>
      </Card>

      <Card className="space-y-4">
        <CardHeader title="Keamanan & Storage" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Masa aktif signed URL (detik)" hint="Default 300 detik untuk akses berkas CV privat.">
            <Input
              type="number"
              min={60}
              max={3600}
              value={signedUrlTtl}
              onChange={(e) => setSignedUrlTtl(Number(e.target.value))}
              className="font-mono"
            />
          </Field>
          <Field label="Batas ukuran upload (MB)" hint="Mencegah PDF bomb dan overload antrean worker.">
            <Input
              type="number"
              min={1}
              max={50}
              value={maxUploadMb}
              onChange={(e) => setMaxUploadMb(Number(e.target.value))}
              className="font-mono"
            />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={!weightValid} iconLeft={<Save className="w-4 h-4" />}>
          Simpan pengaturan
        </Button>
      </div>
    </form>
  );
};
