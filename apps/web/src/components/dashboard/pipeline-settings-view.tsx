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
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
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

interface ModelOption {
  label: string;
  value: string;
}

const PROVIDER_MODEL_PRESETS: Record<string, ModelOption[]> = {
  groq: [
    { label: 'llama-3.1-8b-instant (Fast & Precise)', value: 'llama-3.1-8b-instant' },
    { label: 'llama-3.3-70b-versatile (High Intelligence)', value: 'llama-3.3-70b-versatile' },
    { label: 'mixtral-8x7b-32768 (32k Context)', value: 'mixtral-8x7b-32768' },
    { label: 'Custom Model Name...', value: 'custom' },
  ],
  gemini: [
    { label: 'gemini-1.5-flash (Fast & Multilingual)', value: 'gemini-1.5-flash' },
    { label: 'gemini-1.5-pro (Complex Reasoning)', value: 'gemini-1.5-pro' },
    { label: 'gemini-2.0-flash-exp (Experimental Speed)', value: 'gemini-2.0-flash-exp' },
    { label: 'Custom Model Name...', value: 'custom' },
  ],
  openai: [
    { label: 'gpt-4o-mini (Lightweight & Smart)', value: 'gpt-4o-mini' },
    { label: 'gpt-4o (Omni High Accuracy)', value: 'gpt-4o' },
    { label: 'gpt-3.5-turbo (Legacy Standard)', value: 'gpt-3.5-turbo' },
    { label: 'Custom Model Name...', value: 'custom' },
  ],
};

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

const DEFAULT_DECISION_PROMPT = `You are a Senior HR System Auditor. Analyze candidate qualifications based on extracted resume data, Job-Fit Score, matched/missing mandatory skills, and total experience duration. Provide an objective 2-3 sentence Summary Decision with a clear screening recommendation (HIGHLY RECOMMENDED, SPECIAL REVIEW RECOMMENDED, or NOT RECOMMENDED).`;
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

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

  // LLM Multi-Provider State
  const [llmProvider, setLlmProvider] = useState<string>('groq');
  const [llmApiKey, setLlmApiKey] = useState<string>(DEFAULT_API_KEY);
  const [selectedModelOption, setSelectedModelOption] = useState<string>('llama-3.1-8b-instant');
  const [customModelInput, setCustomModelInput] = useState<string>('');
  const [promptDecision, setPromptDecision] = useState<string>(DEFAULT_DECISION_PROMPT);

  // 15-Minute Session Active Timer State (900 seconds)
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number>(900);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(false);

  // Connection Test State
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message?: string;
    latencyMs?: number;
  }>({ status: 'idle' });

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

  // 15-Minute Countdown Timer Effect (Only ticks when activeTab === 'llm' AND isSessionActive AND NOT isSessionLocked)
  useEffect(() => {
    if (activeTab !== 'llm' || !isSessionActive || isSessionLocked) return;

    const timer = setInterval(() => {
      setSessionSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSessionLocked(true);
          setIsSessionActive(false);
          setLlmApiKey(''); // Lock & clear key for security
          if (onAddToast) {
            onAddToast('error', 'LLM Session Expired', 'The 15-minute active session has ended for security.');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTab, isSessionActive, isSessionLocked, onAddToast]);

  const handleExtendSession = () => {
    if (!isSessionActive) return;
    setSessionSecondsLeft(900);
    if (onAddToast) {
      onAddToast('info', 'Session Extended', 'Active session renewed for +15 minutes.');
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const effectiveModelName = selectedModelOption === 'custom' ? customModelInput.trim() : selectedModelOption;
  const isFormValid = llmProvider.trim() !== '' && llmApiKey.trim() !== '' && effectiveModelName !== '';

  const handleProviderChange = (newProvider: string) => {
    setLlmProvider(newProvider);
    const defaultModel = PROVIDER_MODEL_PRESETS[newProvider]?.[0]?.value || 'custom';
    setSelectedModelOption(defaultModel);
    setTestResult({ status: 'idle' });
  };

  const handleTestConnection = async () => {
    if (!llmApiKey.trim()) {
      setTestResult({ status: 'error', message: 'API Key is required.' });
      return;
    }
    if (!effectiveModelName) {
      setTestResult({ status: 'error', message: 'Model Name is required.' });
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: 'idle' });
    const startTime = Date.now();

    try {
      if (llmProvider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${llmApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: effectiveModelName,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
        });
        const latencyMs = Date.now() - startTime;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error?.message || `HTTP ${res.status} ${res.statusText}`);
        }
        setTestResult({ status: 'success', message: 'Groq Cloud Connection Successful!', latencyMs });
      } else if (llmProvider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModelName}:generateContent?key=${llmApiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'ping' }] }],
          }),
        });
        const latencyMs = Date.now() - startTime;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error?.message || `HTTP ${res.status} ${res.statusText}`);
        }
        setTestResult({ status: 'success', message: 'Google Studio Gemini Connection Successful!', latencyMs });
      } else if (llmProvider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${llmApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: effectiveModelName,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
        });
        const latencyMs = Date.now() - startTime;
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error?.message || `HTTP ${res.status} ${res.statusText}`);
        }
        setTestResult({ status: 'success', message: 'OpenAI Connection Successful!', latencyMs });
      }
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      setTestResult({
        status: 'error',
        message: err.message || 'Failed to connect to Provider API.',
        latencyMs,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

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

    if (onAddToast) onAddToast('success', 'Skill Added', `Skill "${newItem.canonical_name}" saved to dictionary.`);
    if (onAddAuditLog) onAddAuditLog('taxonomy_created', 'skill_taxonomies', newItem.id, `Added skill "${newItem.canonical_name}" to dictionary.`);
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

    if (onAddToast) onAddToast('success', 'Skill Updated', `Skill "${editCanonicalName.trim()}" successfully updated.`);
    if (onAddAuditLog) onAddAuditLog('taxonomy_updated', 'skill_taxonomies', editingItem.id, `Updated skill "${editCanonicalName.trim()}" in dictionary.`);
  };

  const handleDeleteSkill = (id: string, name: string) => {
    const updated = taxonomies.filter((t) => t.id !== id);
    saveTaxonomies(updated);
    if (onAddToast) onAddToast('error', 'Skill Deleted', `Skill "${name}" removed from dictionary.`);
    if (onAddAuditLog) onAddAuditLog('taxonomy_deleted', 'skill_taxonomies', id, `Deleted skill "${name}" from dictionary.`);
  };

  const handleSave = () => {
    if (!weightValid) {
      if (onAddToast) onAddToast('error', 'Invalid Weights', 'Total scoring formula weights must equal 100%.');
      return;
    }
    onSaveSettings('All ATS pipeline parameters were successfully updated.');
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
    { id: 'dictionary', label: 'Skill Acronym Config' },
    { id: 'scoring', label: 'Scoring Config' },
    { id: 'llm', label: 'LLM API Config' },
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
              title="Add New Skill & Synonyms"
            />

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Canonical Skill Name" required>
                  <Input
                    value={canonicalName}
                    onChange={(e) => setCanonicalName(e.target.value)}
                    placeholder="Example: PostgreSQL"
                    required
                  />
                </Field>

                <Field label="Skill Category">
                  {isAddingNewCategory ? (
                    <div className="flex gap-2">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingNewCategory(false)}
                      >
                        Cancel
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

                <Field label="Synonym List (Comma-separated)">
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
                    + New Category
                  </Button>
                )}
                <Button type="submit" variant="primary" size="sm" iconLeft={<Plus className="w-4 h-4 text-white" />}>
                  Add to Dictionary
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Skill Dictionary List ({filteredTaxonomies.length})</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search skill or synonym..."
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                <Select
                  value={activeCategoryFilter}
                  onChange={(e) => setActiveCategoryFilter(e.target.value)}
                  sizeVariant="sm"
                  containerClassName="w-auto"
                  className="font-semibold"
                >
                  <option value="all">All Categories</option>
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
                  No skills match your search.
                </div>
              ) : (
                paginatedTaxonomies.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-foreground">{item.canonical_name}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-extrabold uppercase shadow-2xs">
                          {formatCategoryLabel(item.category)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.synonyms.map((syn) => (
                          <span key={syn} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-blue-900 border border-blue-500 text-xs font-bold shadow-2xs font-mono">
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
                        title="Delete Skill"
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
                  Showing {Math.min((dictPage - 1) * itemsPerPage + 1, filteredTaxonomies.length)}–
                  {Math.min(dictPage * itemsPerPage, filteredTaxonomies.length)} of {filteredTaxonomies.length} skills
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={dictPage === 1}
                    onClick={() => setDictPage((prev) => Math.max(1, prev - 1))}
                    iconLeft={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
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
                    Next
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
            title="Scoring Config"
          />

          <div className="space-y-5">
            <RangeField
              label="Resume Semantic Relevance (Vector Similarity)"
              value={semanticWeight}
              min={0}
              max={100}
              onChange={(val) => setSemanticWeight(val)}
              hint="Embedding vector similarity percentage between resume text and job description."
            />

            <RangeField
              label="Mandatory Skill Match"
              value={mandatoryWeight}
              min={0}
              max={100}
              onChange={(val) => setMandatoryWeight(val)}
              hint="Matching percentage for mandatory skills specified in the job opening."
            />

            <RangeField
              label="Work Experience Duration (Experience Score)"
              value={experienceWeight}
              min={0}
              max={100}
              onChange={(val) => setExperienceWeight(val)}
              hint="Score based on candidate total work experience months relative to minimum requirement."
            />

            <RangeField
              label="Preferred Skills (Bonus Skill Match)"
              value={preferredWeight}
              min={0}
              max={100}
              onChange={(val) => setPreferredWeight(val)}
              hint="Bonus score for optional preferred skills."
            />

            <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 border-slate-200">
              <span className="font-bold text-sm text-foreground flex items-center gap-2.5">
                <div className="flex flex-col gap-0.5 shrink-0" aria-hidden="true">
                  <span className="w-1 h-1 rounded-full bg-blue-600" />
                  <span className="w-1 h-1 rounded-full bg-blue-600" />
                  <span className="w-1 h-1 rounded-full bg-blue-600" />
                </div>
                Total Weight Accumulation:
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold font-mono tabular-nums tracking-wider uppercase border bg-slate-100 shadow-2xs self-start sm:self-auto',
                  weightValid ? 'text-emerald-900 border-emerald-500' : 'text-rose-900 border-rose-500'
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    weightValid ? 'bg-emerald-600' : 'bg-rose-600 animate-pulse'
                  )}
                />
                {totalWeight}% {weightValid ? 'Valid (100%)' : 'Must be 100%'}
              </span>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button type="button" onClick={handleSave} variant="primary" size="sm" iconLeft={<Save className="w-4 h-4 text-white" />}>
                Save Formula Weights
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Aturan LLM & Guardrails */}
      {activeTab === 'llm' && (
        <Card className="p-6 space-y-6">
          {/* Minimalist Session Active Badge (No Icons, Minimal Text, Pure Status Pill) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 text-foreground border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-800">Session:</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold font-mono tabular-nums border bg-slate-100 shadow-2xs',
                  isSessionLocked
                    ? 'text-rose-900 border-rose-500'
                    : isSessionActive
                    ? 'text-emerald-900 border-emerald-500'
                    : 'text-slate-700 border-slate-300'
                )}
              >
                {isSessionLocked
                  ? 'Expired'
                  : isSessionActive
                  ? formatTimer(sessionSecondsLeft)
                  : 'Inactive'}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExtendSession}
              disabled={!isSessionActive}
              className="text-xs bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shrink-0 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              iconLeft={<RefreshCw className="w-3.5 h-3.5 text-blue-600" />}
            >
              {isSessionLocked
                ? 'Session Expired (Save Config to Unlock)'
                : isSessionActive
                ? 'Extend Session (+15m)'
                : 'Save Config to Start Session'}
            </Button>
          </div>

          <CardHeader
            className="p-0 border-none mb-2"
            title="Multi-Provider LLM Configuration & System Guardrails"
          />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="LLM Provider" required>
                <Select
                  value={llmProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  disabled={isSessionLocked}
                >
                  <option value="groq">Groq Cloud (Fast Processing)</option>
                  <option value="gemini">Google Studio API (Gemini)</option>
                  <option value="openai">OpenAI API (GPT-4o)</option>
                </Select>
              </Field>

              <Field label="Model Name" required>
                <Select
                  value={selectedModelOption}
                  onChange={(e) => {
                    setSelectedModelOption(e.target.value);
                    setTestResult({ status: 'idle' });
                  }}
                  disabled={isSessionLocked}
                >
                  {(PROVIDER_MODEL_PRESETS[llmProvider] || []).map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            {selectedModelOption === 'custom' && (
              <Field label="Custom Model Identifier Name" required>
                <Input
                  value={customModelInput}
                  onChange={(e) => {
                    setCustomModelInput(e.target.value);
                    setTestResult({ status: 'idle' });
                  }}
                  placeholder="e.g. gemini-2.0-flash-exp or gpt-4o-mini"
                  disabled={isSessionLocked}
                />
                {!customModelInput.trim() && (
                  <p className="text-[11px] text-rose-500 font-mono mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Custom Model Name is required.
                  </p>
                )}
              </Field>
            )}

            <Field label="API Key" required>
              <Input
                type="password"
                value={llmApiKey}
                onChange={(e) => {
                  setLlmApiKey(e.target.value);
                  setTestResult({ status: 'idle' });
                }}
                placeholder={
                  llmProvider === 'groq'
                    ? 'gsk_...'
                    : llmProvider === 'gemini'
                    ? 'AIzaSy...'
                    : 'sk-proj-...'
                }
                disabled={isSessionLocked}
              />
              {!llmApiKey.trim() && (
                <p className="text-[11px] text-rose-500 font-mono mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> API Key is required and cannot be empty.
                </p>
              )}
            </Field>

            {/* Test Connection Button & Result */}
            <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Provider & Model Connection Test</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Perform a direct client-side fetch ping to verify credentials & model availability.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !llmApiKey.trim() || !effectiveModelName || isSessionLocked}
                  iconLeft={
                    isTestingConnection ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 text-amber-500" />
                    )
                  }
                >
                  {isTestingConnection ? 'Testing Connection...' : 'Test Connection'}
                </Button>
              </div>

              {testResult.status === 'success' && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-mono flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    {testResult.message}
                  </span>
                  {testResult.latencyMs && (
                    <span className="text-[11px] text-emerald-700 font-bold">
                      {testResult.latencyMs} ms
                    </span>
                  )}
                </div>
              )}

              {testResult.status === 'error' && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 text-xs font-mono flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    {testResult.message}
                  </span>
                  {testResult.latencyMs && (
                    <span className="text-[11px] text-rose-700 font-bold">
                      {testResult.latencyMs} ms
                    </span>
                  )}
                </div>
              )}
            </div>

            <Field label="System Prompt Decision Guardrails">
              <Textarea
                rows={4}
                value={promptDecision}
                onChange={(e) => setPromptDecision(e.target.value)}
                className="w-full text-xs font-mono"
                disabled={isSessionLocked}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            {!isFormValid ? (
              <span className="text-xs text-rose-500 font-mono flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {isSessionLocked
                  ? 'Session expired. Click Re-activate Session (+15m) or Save LLM Configuration to unlock.'
                  : 'All fields (Provider, API Key, Model) must be non-empty.'}
              </span>
            ) : (
              <span className="text-xs text-emerald-600 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Form valid. Click Save to activate 15-minute active session window.
              </span>
            )}

            <Button
              type="button"
              onClick={() => {
                if (isFormValid) {
                  setSessionSecondsLeft(900);
                  setIsSessionActive(true);
                  setIsSessionLocked(false);
                  onSaveSettings(`Saved LLM Config (${llmProvider} / ${effectiveModelName})`);
                  if (onAddToast) {
                    onAddToast('success', 'LLM Settings Saved & Session Activated', `Provider: ${llmProvider}, Model: ${effectiveModelName} (15m active timer started)`);
                  }
                  if (onAddAuditLog) {
                    onAddAuditLog('UPDATE_LLM_CONFIG', 'Settings', 'llm-config', `Updated LLM provider to ${llmProvider} with model ${effectiveModelName}`);
                  }
                }
              }}
              variant="primary"
              size="sm"
              disabled={!isFormValid}
              iconLeft={<Save className="w-4 h-4 text-white" />}
            >
              Save LLM Configuration
            </Button>
          </div>
        </Card>
      )}

      {/* Edit Skill Modal Dialog */}
      <Dialog open={editingItem !== null} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Edit Skill & Synonyms</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEditSkill} className="space-y-4 py-2">
            <Field label="Canonical Skill Name" required>
              <Input
                value={editCanonicalName}
                onChange={(e) => setEditCanonicalName(e.target.value)}
                placeholder="Example: PostgreSQL"
                required
              />
            </Field>

            <Field label="Skill Category">
              <Select value={editCategoryInput} onChange={(e) => setEditCategoryInput(e.target.value)}>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {formatCategoryLabel(cat)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Synonym List (Comma-separated)">
              <Input
                value={editSynonymsInput}
                onChange={(e) => setEditSynonymsInput(e.target.value)}
                placeholder="postgres, pg, psql"
              />
            </Field>

            <DialogFooter className="pt-4 gap-4 sm:gap-4">
              <Button type="button" variant="outline" size="md" onClick={() => setEditingItem(null)} className="px-5">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" className="px-6" iconLeft={<Save className="w-4 h-4 text-white" />}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
