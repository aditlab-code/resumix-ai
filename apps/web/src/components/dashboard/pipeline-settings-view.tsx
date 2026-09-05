'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Trash2,
  Search,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui';
import { SubNavTab, TabItem } from './sub-nav-tab';

interface SkillTaxonomyItem {
  id: string;
  canonical_name: string;
  synonyms: string[];
  category: string;
}

interface PipelineSettingsViewProps {
  onSaveSettings: (msg: string) => void;
  onAddToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  onAddAuditLog?: (action: string, entity: string, entityId: string, details: string) => void;
}

const DEFAULT_CATEGORIES = ['backend', 'frontend', 'database', 'devops', 'mobile', 'data_ai', 'custom'];

const DEFAULT_TAXONOMIES: SkillTaxonomyItem[] = [
  { id: 'tax-1', canonical_name: 'Python', synonyms: ['python 3', 'py', 'fastapi', 'django', 'flask', 'pydantic'], category: 'backend' },
  { id: 'tax-2', canonical_name: 'PostgreSQL', synonyms: ['postgres', 'pg', 'postgresql 15', 'psql', 'sql rdbms'], category: 'database' },
  { id: 'tax-3', canonical_name: 'Docker', synonyms: ['docker compose', 'containerization', 'podman', 'docker container'], category: 'devops' },
  { id: 'tax-4', canonical_name: 'Node.js', synonyms: ['nodejs', 'node', 'express', 'express.js', 'nestjs', 'ts-node'], category: 'backend' },
  { id: 'tax-5', canonical_name: 'React', synonyms: ['react.js', 'reactjs', 'react native'], category: 'frontend' },
  { id: 'tax-6', canonical_name: 'Kubernetes', synonyms: ['k8s', 'k3s', 'helm'], category: 'devops' },
  { id: 'tax-7', canonical_name: 'Redis', synonyms: ['redis cache', 'in-memory database'], category: 'database' },
  { id: 'tax-8', canonical_name: 'Machine Learning', synonyms: ['ml', 'scikit-learn', 'sklearn'], category: 'data_ai' },
];

const DEFAULT_DECISION_PROMPT = `Anda adalah Senior HR System Auditor. Analisis kualifikasi kandidat berdasarkan hasil ekstraksi CV, Job-Fit Score, skill wajib yang cocok/kurang, dan total durasi pengalaman kerja. Susun ringkasan keputusan rekrutmen (Summary Decision) dalam 2-3 kalimat yang objektif, transparan, dan berikan rekomendasi aksi screening yang jelas (SANGAT DIREKOMENDASIKAN, REKOMENDASI REVIEW KHUSUS, atau TIDAK DIREKOMENDASIKAN).`;
const DEFAULT_API_KEY = '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';

export const PipelineSettingsView: React.FC<PipelineSettingsViewProps> = ({
  onSaveSettings,
  onAddToast,
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'scoring' | 'llm'>('dictionary');

  // Formula Scoring State
  const [semanticWeight, setSemanticWeight] = useState(45);
  const [mandatoryWeight, setMandatoryWeight] = useState(30);
  const [experienceWeight, setExperienceWeight] = useState(20);
  const [preferredWeight, setPreferredWeight] = useState(5);

  // LLM State
  const [llmProvider, setLlmProvider] = useState('groq');
  const [llmApiKey, setLlmApiKey] = useState(DEFAULT_API_KEY);
  const [llmModel, setLlmModel] = useState('llama-3.1-8b-instant');
  const [promptDecision, setPromptDecision] = useState(DEFAULT_DECISION_PROMPT);

  // Dictionary Skill State
  const [taxonomies, setTaxonomies] = useState<SkillTaxonomyItem[]>(DEFAULT_TAXONOMIES);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Dictionary Pagination State (5 items per page)
  const [dictPage, setDictPage] = useState(1);
  const itemsPerPage = 5;

  const [canonicalName, setCanonicalName] = useState('');
  const [synonymsInput, setSynonymsInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('backend');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Edit Skill Modal State
  const [editingItem, setEditingItem] = useState<SkillTaxonomyItem | null>(null);
  const [editCanonicalName, setEditCanonicalName] = useState('');
  const [editSynonymsInput, setEditSynonymsInput] = useState('');
  const [editCategoryInput, setEditCategoryInput] = useState('backend');

  const totalWeight = semanticWeight + mandatoryWeight + experienceWeight + preferredWeight;
  const weightValid = totalWeight === 100;

  useEffect(() => {
    try {
      const savedTax = localStorage.getItem('cv_ats_skill_taxonomies');
      if (savedTax) {
        const parsed = JSON.parse(savedTax);
        if (Array.isArray(parsed) && parsed.length > 0) setTaxonomies(parsed);
      }
      const savedCats = localStorage.getItem('cv_ats_taxonomy_categories');
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed])));
        }
      }
    } catch (e) {
      console.error('Failed to load taxonomies:', e);
    }
  }, []);

  useEffect(() => {
    setDictPage(1);
  }, [searchTerm, activeCategoryFilter]);

  const saveTaxonomies = (updated: SkillTaxonomyItem[]) => {
    setTaxonomies(updated);
    try {
      localStorage.setItem('cv_ats_skill_taxonomies', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save taxonomies:', e);
    }
  };

  const saveCategories = (updatedCats: string[]) => {
    const cleanCats = Array.from(new Set(updatedCats.map((c) => c.toLowerCase().trim()))).filter((c) => c);
    setCategories(cleanCats);
    try {
      localStorage.setItem('cv_ats_taxonomy_categories', JSON.stringify(cleanCats));
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
  };

  const formatCategoryLabel = (cat: string) => {
    return cat.replace(/_/g, ' ').toUpperCase();
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canonicalName.trim()) return;

    let targetCategory = categoryInput;
    if (isAddingNewCategory && newCategoryName.trim()) {
      targetCategory = newCategoryName.toLowerCase().trim().replace(/\s+/g, '_');
      if (!categories.includes(targetCategory)) {
        saveCategories([...categories, targetCategory]);
      }
    }

    const synonyms = synonymsInput
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s);

    const newItem: SkillTaxonomyItem = {
      id: `tax-${Date.now()}`,
      canonical_name: canonicalName.trim(),
      synonyms,
      category: targetCategory,
    };

    const updated = [newItem, ...taxonomies];
    saveTaxonomies(updated);

    setCanonicalName('');
    setSynonymsInput('');
    setIsAddingNewCategory(false);
    setNewCategoryName('');

    if (onAddToast) onAddToast('success', 'Skill Ditambahkan', `Skill "${newItem.canonical_name}" disimpan ke kamus.`);
    if (onAddAuditLog) onAddAuditLog('taxonomy_created', 'skill_taxonomies', newItem.id, `Tambah skill "${newItem.canonical_name}" ke kamus.`);
  };

  const handleOpenEditModal = (item: SkillTaxonomyItem) => {
    setEditingItem(item);
    setEditCanonicalName(item.canonical_name);
    setEditSynonymsInput(item.synonyms.join(', '));
    setEditCategoryInput(item.category);
  };

  const handleSaveEditSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editCanonicalName.trim()) return;

    const updatedSynonyms = editSynonymsInput
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s);

    const updatedList = taxonomies.map((item) => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          canonical_name: editCanonicalName.trim(),
          synonyms: updatedSynonyms,
          category: editCategoryInput,
        };
      }
      return item;
    });

    saveTaxonomies(updatedList);
    setEditingItem(null);

    if (onAddToast) onAddToast('success', 'Skill Diperbarui', `Skill "${editCanonicalName.trim()}" berhasil diperbarui.`);
    if (onAddAuditLog) onAddAuditLog('taxonomy_updated', 'skill_taxonomies', editingItem.id, `Perbarui skill "${editCanonicalName.trim()}" di kamus.`);
  };

  const handleDeleteSkill = (id: string, name: string) => {
    const updated = taxonomies.filter((t) => t.id !== id);
    saveTaxonomies(updated);
    if (onAddToast) onAddToast('error', 'Skill Dihapus', `Skill "${name}" dihapus dari kamus.`);
    if (onAddAuditLog) onAddAuditLog('taxonomy_deleted', 'skill_taxonomies', id, `Hapus skill "${name}" dari kamus.`);
  };

  const handleSave = () => {
    if (!weightValid) {
      if (onAddToast) onAddToast('error', 'Bobot Tidak Valid', 'Total bobot formula scoring harus 100%.');
      return;
    }
    onSaveSettings('Seluruh parameter ATS pipeline berhasil diperbarui.');
  };

  const filteredTaxonomies = taxonomies.filter((item) => {
    const matchesSearch =
      item.canonical_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.synonyms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategoryFilter === 'all' || item.category === activeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredTaxonomies.length / itemsPerPage) || 1;
  const paginatedTaxonomies = filteredTaxonomies.slice(
    (dictPage - 1) * itemsPerPage,
    dictPage * itemsPerPage
  );

  const settingsTabs: TabItem<'dictionary' | 'scoring' | 'llm'>[] = [
    { id: 'dictionary', label: 'Kamus Taksonomi Skill' },
    { id: 'scoring', label: 'Bobot Formula Scoring' },
    { id: 'llm', label: 'LLM Config' },
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* SubNavTab Underline Bar */}
      <SubNavTab
        tabs={settingsTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab 1: Kamus Skill */}
      {activeTab === 'dictionary' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <CardHeader
              className="p-0 border-none mb-2"
              title="Tambah Skill & Sinonim Baru"
              subtitle="Kamus deterministik ini digunakan untuk mencocokkan variasi penulisan skill pada CV pelamar."
            />

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Nama Skill Resmi (Canonical Name)" required>
                  <Input
                    value={canonicalName}
                    onChange={(e) => setCanonicalName(e.target.value)}
                    placeholder="Contoh: PostgreSQL"
                    required
                  />
                </Field>

                <Field label="Kategori Skill">
                  {isAddingNewCategory ? (
                    <div className="flex gap-2">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Kategori baru..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingNewCategory(false)}
                      >
                        Batal
                      </Button>
                    </div>
                  ) : (
                    <Select value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {formatCategoryLabel(cat)}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>

                <Field label="Daftar Sinonim (Pisahkan dengan Koma)">
                  <Input
                    value={synonymsInput}
                    onChange={(e) => setSynonymsInput(e.target.value)}
                    placeholder="postgres, pg, psql, postgresql 15"
                  />
                </Field>
              </div>

              <div className="flex justify-end items-center gap-2 pt-2 border-t border-border">
                {!isAddingNewCategory && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingNewCategory(true)}
                  >
                    + Kategori Baru
                  </Button>
                )}
                <Button type="submit" variant="primary" size="sm" iconLeft={<Plus className="w-4 h-4 text-white" />}>
                  Tambah ke Kamus
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Daftar Kamus Skill ({filteredTaxonomies.length})</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ringkasan 5 skill per halaman. Gunakan navigasi pagination di bawah.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari skill atau sinonim..."
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                <Select
                  value={activeCategoryFilter}
                  onChange={(e) => setActiveCategoryFilter(e.target.value)}
                  className="h-9 text-xs font-semibold w-auto"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {formatCategoryLabel(cat)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Dictionary Items List (Paginated 5 per page) */}
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
              {filteredTaxonomies.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Tidak ada skill yang cocok dengan pencarian.
                </div>
              ) : (
                paginatedTaxonomies.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-foreground">{item.canonical_name}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border text-[11px] font-bold uppercase">
                          {formatCategoryLabel(item.category)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.synonyms.map((syn) => (
                          <span key={syn} className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-md transition-colors"
                        title="Edit Skill"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(item.id, item.canonical_name)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors"
                        title="Hapus Skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {filteredTaxonomies.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-muted/40 border border-border rounded-xl text-xs">
                <span className="text-muted-foreground font-medium">
                  Menampilkan {Math.min((dictPage - 1) * itemsPerPage + 1, filteredTaxonomies.length)}–
                  {Math.min(dictPage * itemsPerPage, filteredTaxonomies.length)} dari {filteredTaxonomies.length} skill
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={dictPage === 1}
                    onClick={() => setDictPage((prev) => Math.max(1, prev - 1))}
                    iconLeft={<ChevronLeft className="w-4 h-4" />}
                  >
                    Sebelumnya
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setDictPage(page)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-xs font-bold transition-colors focus:outline-none',
                        dictPage === page
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-card border border-border text-foreground hover:bg-muted'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={dictPage >= totalPages}
                    onClick={() => setDictPage((prev) => Math.min(totalPages, prev + 1))}
                    iconRight={<ChevronRight className="w-4 h-4" />}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Formula Scoring */}
      {activeTab === 'scoring' && (
        <Card className="p-6 space-y-6">
          <CardHeader
            className="p-0 border-none mb-2"
            title="Pengaturan Bobot Formula Scoring"
            subtitle="Bobot penilaian otomatis kandidat (Total bobot harus bernilai 100%)."
          />

          <div className="space-y-5">
            <RangeField
              label="Relevansi Semantik Teks CV (Vector Similarity)"
              value={semanticWeight}
              min={0}
              max={100}
              onChange={(val) => setSemanticWeight(val)}
              hint="Persentase kemiripan vektor embeddings antara teks CV dengan deskripsi lowongan."
            />

            <RangeField
              label="Kesesuaian Skill Wajib (Mandatory Skill Match)"
              value={mandatoryWeight}
              min={0}
              max={100}
              onChange={(val) => setMandatoryWeight(val)}
              hint="Persentase kecocokan skill wajib yang ditetapkan pada posisi lowongan."
            />

            <RangeField
              label="Lama Pengalaman Kerja (Experience Score)"
              value={experienceWeight}
              min={0}
              max={100}
              onChange={(val) => setExperienceWeight(val)}
              hint="Skor berdasarkan total bulan pengalaman kerja kandidat dibanding kualifikasi minimal."
            />

            <RangeField
              label="Skill Tambahan / Preferred (Bonus Skill Match)"
              value={preferredWeight}
              min={0}
              max={100}
              onChange={(val) => setPreferredWeight(val)}
              hint="Skor bonus untuk skill preferred opsional."
            />

            <div className="p-4 rounded-xl border flex items-center justify-between bg-muted/40 border-border">
              <span className="font-bold text-sm text-foreground">Total Akumulasi Bobot:</span>
              <span className={cn('text-xl font-extrabold tabular-nums', weightValid ? 'text-emerald-600' : 'text-destructive')}>
                {totalWeight}% {weightValid ? '(Sesuai Spec 100%)' : '(Wajib 100%)'}
              </span>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button type="button" onClick={handleSave} variant="primary" size="sm" iconLeft={<Save className="w-4 h-4 text-white" />}>
                Simpan Bobot Formula
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Aturan LLM & Guardrails */}
      {activeTab === 'llm' && (
        <Card className="p-6 space-y-6">
          <CardHeader
            className="p-0 border-none mb-2"
            title="Konfigurasi Model LLM Groq & System Guardrails"
            subtitle="Atur provider LLM, model name, API key, dan instruksi keputusan HR."
          />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Provider LLM">
                <Select value={llmProvider} onChange={(e) => setLlmProvider(e.target.value)}>
                  <option value="groq">Groq Cloud (Fast Processing)</option>
                  <option value="gemini">Google Gemini 1.5</option>
                  <option value="openai">OpenAI GPT-4o Mini</option>
                </Select>
              </Field>

              <Field label="Model Name">
                <Select value={llmModel} onChange={(e) => setLlmModel(e.target.value)}>
                  <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Sangat Cepat & Presisi)</option>
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                </Select>
              </Field>
            </div>

            <Field label="API Key">
              <Input
                type="password"
                value={llmApiKey}
                onChange={(e) => setLlmApiKey(e.target.value)}
                placeholder="gsk_..."
              />
            </Field>

            <Field label="System Prompt Decision Guardrails">
              <Textarea
                rows={4}
                value={promptDecision}
                onChange={(e) => setPromptDecision(e.target.value)}
                className="w-full text-xs font-mono"
              />
            </Field>
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button type="button" onClick={handleSave} variant="primary" size="sm" iconLeft={<Save className="w-4 h-4 text-white" />}>
              Simpan Konfigurasi LLM
            </Button>
          </div>
        </Card>
      )}

      {/* Edit Skill Modal Dialog */}
      <Dialog open={editingItem !== null} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Skill & Sinonim</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEditSkill} className="space-y-4 py-2">
            <Field label="Nama Skill Resmi (Canonical Name)" required>
              <Input
                value={editCanonicalName}
                onChange={(e) => setEditCanonicalName(e.target.value)}
                placeholder="Contoh: PostgreSQL"
                required
              />
            </Field>

            <Field label="Kategori Skill">
              <Select value={editCategoryInput} onChange={(e) => setEditCategoryInput(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {formatCategoryLabel(cat)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Daftar Sinonim (Pisahkan dengan Koma)">
              <Input
                value={editSynonymsInput}
                onChange={(e) => setEditSynonymsInput(e.target.value)}
                placeholder="postgres, pg, psql"
              />
            </Field>

            <DialogFooter className="pt-4 gap-4 sm:gap-4">
              <Button type="button" variant="outline" size="md" onClick={() => setEditingItem(null)} className="px-5">
                Batal
              </Button>
              <Button type="submit" variant="primary" size="md" className="px-6" iconLeft={<Save className="w-4 h-4 text-white" />}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
