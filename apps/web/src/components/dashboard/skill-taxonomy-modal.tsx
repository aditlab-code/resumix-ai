'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Upload, Trash2, Search, FileCode, Check, X, Tag } from 'lucide-react';
import { Overlay, Button, Field, Input, Select, Card } from '@/components/ui';

interface SkillTaxonomyItem {
  id: string;
  canonical_name: string;
  synonyms: string[];
  category: string;
}

interface SkillTaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToast: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  onAddAuditLog: (action: string, entity: string, entityId: string, details: string) => void;
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

export const SkillTaxonomyModal: React.FC<SkillTaxonomyModalProps> = ({
  isOpen,
  onClose,
  onAddToast,
  onAddAuditLog,
}) => {
  const [taxonomies, setTaxonomies] = useState<SkillTaxonomyItem[]>(DEFAULT_TAXONOMIES);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Form State
  const [canonicalName, setCanonicalName] = useState('');
  const [synonymsInput, setSynonymsInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('backend');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    try {
      const savedTax = localStorage.getItem('cv_ats_skill_taxonomies');
      if (savedTax) {
        const parsed = JSON.parse(savedTax);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTaxonomies(parsed);
        }
      }

      const savedCats = localStorage.getItem('cv_ats_taxonomy_categories');
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed])));
        }
      }
    } catch (e) {
      console.error('Failed to load taxonomies & categories:', e);
    }
  }, [isOpen]);

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

  const handleCategorySelectChange = (val: string) => {
    if (val === '__NEW_CATEGORY__') {
      setIsAddingNewCategory(true);
      setNewCategoryName('');
    } else {
      setCategoryInput(val);
      setIsAddingNewCategory(false);
    }
  };

  const handleConfirmAddNewCategory = () => {
    const slug = newCategoryName.toLowerCase().trim().replace(/\s+/g, '_');
    if (!slug) return;

    if (!categories.includes(slug)) {
      const updatedCats = [...categories, slug];
      saveCategories(updatedCats);
      onAddToast('success', 'Kategori Ditambahkan', `Kategori baru "${formatCategoryLabel(slug)}" berhasil dibuat.`);
      onAddAuditLog('CREATE_TAXONOMY_CATEGORY', 'taxonomy_categories', slug, `Membuat kategori taksonomi baru: ${slug}`);
    }

    setCategoryInput(slug);
    setIsAddingNewCategory(false);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (catToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (DEFAULT_CATEGORIES.slice(0, 4).includes(catToDelete)) {
      onAddToast('info', 'Kategori Standar', `Kategori bawaan "${formatCategoryLabel(catToDelete)}" tidak dapat dihapus.`);
      return;
    }

    const updatedCats = categories.filter((c) => c !== catToDelete);
    saveCategories(updatedCats);

    // Reassign items with deleted category to 'custom'
    const updatedItems = taxonomies.map((item) =>
      item.category === catToDelete ? { ...item, category: 'custom' } : item
    );
    saveTaxonomies(updatedItems);

    if (activeCategoryFilter === catToDelete) setActiveCategoryFilter('all');
    if (categoryInput === catToDelete) setCategoryInput('backend');

    onAddToast('info', 'Kategori Dihapus', `Kategori "${formatCategoryLabel(catToDelete)}" berhasil dihapus.`);
    onAddAuditLog('DELETE_TAXONOMY_CATEGORY', 'taxonomy_categories', catToDelete, `Menghapus kategori taksonomi: ${catToDelete}`);
  };

  const handleAddTaxonomy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canonicalName.trim()) return;

    const synList = synonymsInput
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    const targetCategory = isAddingNewCategory && newCategoryName.trim()
      ? newCategoryName.toLowerCase().trim().replace(/\s+/g, '_')
      : categoryInput;

    if (isAddingNewCategory && targetCategory) {
      if (!categories.includes(targetCategory)) {
        saveCategories([...categories, targetCategory]);
      }
    }

    const newItem: SkillTaxonomyItem = {
      id: `tax-${Date.now()}`,
      canonical_name: canonicalName.trim(),
      synonyms: synList,
      category: targetCategory || 'custom',
    };

    const updated = [newItem, ...taxonomies.filter((t) => t.canonical_name.toLowerCase() !== canonicalName.trim().toLowerCase())];
    saveTaxonomies(updated);

    onAddToast('success', 'Taksonomi Skill Ditambahkan', `Skill "${canonicalName}" dengan ${synList.length} sinonim berhasil disimpan.`);
    onAddAuditLog('REGISTER_SKILL_TAXONOMY', 'skill_taxonomies', newItem.id, `Mendaftarkan sinonim skill: ${canonicalName} -> [${synList.join(', ')}]`);

    setCanonicalName('');
    setSynonymsInput('');
    setIsAddingNewCategory(false);
    setNewCategoryName('');
  };

  const handleDeleteTaxonomy = (id: string, name: string) => {
    const updated = taxonomies.filter((t) => t.id !== id);
    saveTaxonomies(updated);
    onAddToast('info', 'Taksonomi Dihapus', `Skill taksonomi "${name}" telah dihapus.`);
    onAddAuditLog('DELETE_SKILL_TAXONOMY', 'skill_taxonomies', id, `Menghapus sinonim skill: ${name}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let newItems: SkillTaxonomyItem[] = [];
        const detectedCategories = new Set<string>();

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          const rawArr = Array.isArray(parsed) ? parsed : [parsed];
          newItems = rawArr.map((item: any, idx: number) => {
            const cat = (item.category || 'custom').toLowerCase().trim().replace(/\s+/g, '_');
            detectedCategories.add(cat);
            return {
              id: `tax-upload-${Date.now()}-${idx}`,
              canonical_name: item.canonical_name || item.name || 'Unknown',
              synonyms: Array.isArray(item.synonyms) ? item.synonyms : (item.synonyms || '').split(',').map((s: string) => s.trim()),
              category: cat,
            };
          });
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter((l) => l.trim());
          lines.forEach((line, idx) => {
            if (idx === 0 && line.toLowerCase().includes('canonical')) return;
            const parts = line.split(';');
            if (parts.length >= 2) {
              const name = parts[0].trim();
              const syns = parts[1].split(',').map((s) => s.trim()).filter((s) => s);
              const cat = (parts[2]?.trim() || 'custom').toLowerCase().replace(/\s+/g, '_');
              if (name) {
                detectedCategories.add(cat);
                newItems.push({
                  id: `tax-upload-${Date.now()}-${idx}`,
                  canonical_name: name,
                  synonyms: syns,
                  category: cat,
                });
              }
            }
          });
        }

        if (newItems.length > 0) {
          const mergedItems = [...newItems, ...taxonomies];
          saveTaxonomies(mergedItems);

          if (detectedCategories.size > 0) {
            const mergedCats = Array.from(new Set([...categories, ...Array.from(detectedCategories)]));
            saveCategories(mergedCats);
          }

          onAddToast('success', 'Upload Taksonomi Berhasil', `Berhasil mengimpor ${newItems.length} data taksonomi sinonim skill.`);
          onAddAuditLog('UPLOAD_SKILL_TAXONOMIES', 'skill_taxonomies', file.name, `Mengunggah ${newItems.length} sinonim taksonomi dari file ${file.name}`);
        } else {
          onAddToast('error', 'Format Berkas Tidak Sesuai', 'Pastikan berkas JSON atau CSV memiliki kolom canonical_name dan synonyms.');
        }
      } catch (err) {
        onAddToast('error', 'Gagal Membaca Berkas', 'Berkas JSON/CSV tidak valid atau rusak.');
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  const formatCategoryLabel = (cat: string): string => {
    if (cat === 'all') return 'SEMUA';
    if (cat === 'data_ai') return 'Data & AI';
    if (cat === 'devops') return 'DevOps & Cloud';
    if (cat === 'mobile') return 'Mobile Dev';
    return cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const filteredTaxonomies = taxonomies.filter((t) => {
    const matchCat = activeCategoryFilter === 'all' || t.category === activeCategoryFilter;
    const matchSearch =
      t.canonical_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.synonyms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" />
          <span>Kelola Taksonomi Skill & Sinonim</span>
        </div>
      }
      footer={
        <Button variant="ghost" size="sm" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-ink-muted">
          Kelola sinonim dan alias teknologi kustom untuk membantu <strong>Skill Normalizer & Mandatory Skill Penalty Engine</strong> mengenali variasi penulisan skill kandidat secara presisi.
        </p>

        {/* Section: Add & Upload Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="md:col-span-2 space-y-3 p-3">
            <h3 className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-accent" />
              Tambah Taksonomi Baru
            </h3>

            <form onSubmit={handleAddTaxonomy} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Field label="Skill Utama (Canonical)" required>
                  <Input
                    required
                    placeholder="Contoh: Golang"
                    value={canonicalName}
                    onChange={(e) => setCanonicalName(e.target.value)}
                  />
                </Field>

                <Field label="Kategori Rumpun">
                  {!isAddingNewCategory ? (
                    <Select
                      value={categoryInput}
                      onChange={(e) => handleCategorySelectChange(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {formatCategoryLabel(cat)}
                        </option>
                      ))}
                      <option value="__NEW_CATEGORY__">+ Tambah Kategori Baru...</option>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Input
                        autoFocus
                        placeholder="Kategori baru..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="text-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleConfirmAddNewCategory}
                        disabled={!newCategoryName.trim()}
                        className="p-2"
                        aria-label="Konfirmasi kategori baru"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingNewCategory(false)}
                        className="p-2"
                        aria-label="Batal tambah kategori"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </Field>
              </div>

              <Field label="Daftar Sinonim / Alias (Pisahkan dengan koma)" hint="Contoh: go, gin, gorm, go lang">
                <Input
                  placeholder="go, gin, gorm, go lang"
                  value={synonymsInput}
                  onChange={(e) => setSynonymsInput(e.target.value)}
                />
              </Field>

              <div className="flex justify-end">
                <Button type="submit" size="sm" iconLeft={<Plus className="w-3.5 h-3.5" />}>
                  Simpan Taksonomi
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-3 space-y-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-ink flex items-center gap-1.5 mb-1">
                <Upload className="w-3.5 h-3.5 text-accent" />
                Upload Masal (JSON/CSV)
              </h3>
              <p className="text-[11px] text-ink-subtle leading-relaxed">
                Unggah berkas taksonomi sinonim dalam format JSON atau CSV (dipisahkan titik koma <code>;</code>).
              </p>
            </div>

            <label className="border border-dashed border-line hover:border-accent bg-canvas/50 hover:bg-canvas rounded p-3 text-center cursor-pointer block transition-colors mt-2">
              <FileCode className="w-6 h-6 mx-auto mb-1 text-ink-subtle" />
              <span className="text-xs font-bold text-accent block">
                {isUploading ? 'Memproses...' : 'Pilih Berkas JSON/CSV'}
              </span>
              <span className="text-[10px] text-ink-subtle">Contoh: skill_taxonomies.json</span>
              <input
                type="file"
                accept=".json,.csv"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          </Card>
        </div>

        {/* Section: Search & Category Filter (No Scrolling Needed) */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-line">
          <div className="relative flex-1 w-full">
            <Input
              placeholder="Cari skill atau sinonim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
          </div>

          <div className="w-full sm:w-60 shrink-0 flex items-center gap-1">
            <Select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="text-xs font-semibold"
            >
              <option value="all">Filter: Semua Rumpun ({taxonomies.length})</option>
              {categories.map((cat) => {
                const count = taxonomies.filter((t) => t.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {formatCategoryLabel(cat)} ({count})
                  </option>
                );
              })}
            </Select>

            {activeCategoryFilter !== 'all' && !DEFAULT_CATEGORIES.slice(0, 4).includes(activeCategoryFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteCategory(activeCategoryFilter, e)}
                title={`Hapus kategori "${formatCategoryLabel(activeCategoryFilter)}"`}
                className="text-danger hover:bg-danger-soft p-1 shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>


        {/* Section: Taxonomy List Table */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredTaxonomies.length === 0 ? (
            <div className="text-center py-8 text-xs text-ink-subtle italic">
              Tidak ada taksonomi sinonim skill yang cocok dengan pencarian.
            </div>
          ) : (
            filteredTaxonomies.map((item) => (
              <div key={item.id} className="bg-canvas border border-line rounded p-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">{item.canonical_name}</span>
                    <span className="bg-line/70 text-ink-subtle text-[10px] font-mono px-1.5 py-0.5 rounded uppercase">
                      {formatCategoryLabel(item.category)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.synonyms.map((syn, idx) => (
                      <span key={idx} className="bg-surface text-ink-muted border border-line text-[11px] px-1.5 py-0.5 rounded font-mono">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTaxonomy(item.id, item.canonical_name)}
                  aria-label={`Hapus ${item.canonical_name}`}
                  className="text-danger hover:text-danger hover:bg-danger-soft p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Overlay>
  );
};
