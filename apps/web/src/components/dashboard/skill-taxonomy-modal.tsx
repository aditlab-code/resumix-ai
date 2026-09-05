'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Search, Check, X } from 'lucide-react';
import { Overlay, Button, Field, Input, Select, Tabs } from '@/components/ui';

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
  const [activeTab, setActiveTab] = useState<'manage' | 'add' | 'upload'>('manage');

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
    if (!newCategoryName.trim()) return;
    const cleanCat = newCategoryName.toLowerCase().trim().replace(/\s+/g, '_');
    if (!categories.includes(cleanCat)) {
      const updatedCats = [...categories, cleanCat];
      saveCategories(updatedCats);
      setCategoryInput(cleanCat);
      onAddToast('success', 'Kategori Ditambahkan', `Kategori baru "${formatCategoryLabel(cleanCat)}" berhasil dibuat.`);
      onAddAuditLog('ADD_TAXONOMY_CATEGORY', 'taxonomy_categories', cleanCat, `Menambahkan kategori taksonomi baru: ${cleanCat}`);
    }
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

    const updatedTax = taxonomies.map((t) => (t.category === catToDelete ? { ...t, category: 'custom' } : t));
    saveTaxonomies(updatedTax);

    if (activeCategoryFilter === catToDelete) {
      setActiveCategoryFilter('all');
    }

    onAddToast('info', 'Kategori Dihapus', `Kategori "${formatCategoryLabel(catToDelete)}" berhasil dihapus.`);
    onAddAuditLog('DELETE_TAXONOMY_CATEGORY', 'taxonomy_categories', catToDelete, `Menghapus kategori taksonomi: ${catToDelete}`);
  };

  const handleAddTaxonomy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canonicalName.trim()) {
      onAddToast('error', 'Form Tidak Lengkap', 'Nama skill utama (canonical name) wajib diisi.');
      return;
    }

    const synonyms = synonymsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const existingIndex = taxonomies.findIndex(
      (t) => t.canonical_name.toLowerCase() === canonicalName.trim().toLowerCase()
    );

    let updatedTax: SkillTaxonomyItem[];
    if (existingIndex >= 0) {
      const existing = taxonomies[existingIndex];
      const mergedSynonyms = Array.from(new Set([...existing.synonyms, ...synonyms]));
      updatedTax = [...taxonomies];
      updatedTax[existingIndex] = {
        ...existing,
        synonyms: mergedSynonyms,
        category: categoryInput,
      };
      onAddToast('success', 'Taksonomi Diperbarui', `Sinonim untuk "${canonicalName}" telah diperbarui.`);
      onAddAuditLog('UPDATE_SKILL_TAXONOMY', 'skill_taxonomies', existing.id, `Memperbarui sinonim skill "${canonicalName}": [${mergedSynonyms.join(', ')}]`);
    } else {
      const newItem: SkillTaxonomyItem = {
        id: `tax-${Date.now()}`,
        canonical_name: canonicalName.trim(),
        synonyms: synonyms.length > 0 ? synonyms : [canonicalName.trim().toLowerCase()],
        category: categoryInput,
      };
      updatedTax = [newItem, ...taxonomies];
      onAddToast('success', 'Taksonomi Ditambahkan', `Skill "${canonicalName}" berhasil ditambahkan ke kamus taksonomi.`);
      onAddAuditLog('ADD_SKILL_TAXONOMY', 'skill_taxonomies', newItem.id, `Menambahkan taksonomi skill baru "${canonicalName}" dengan sinonim: [${newItem.synonyms.join(', ')}]`);
    }

    saveTaxonomies(updatedTax);
    setCanonicalName('');
    setSynonymsInput('');
    setActiveTab('manage');
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
        let importedItems: SkillTaxonomyItem[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            importedItems = parsed.map((item: any, idx: number) => ({
              id: item.id || `tax-imp-${Date.now()}-${idx}`,
              canonical_name: item.canonical_name || item.name || 'Unknown',
              synonyms: Array.isArray(item.synonyms) ? item.synonyms : [String(item.canonical_name || '').toLowerCase()],
              category: item.category || 'custom',
            }));
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split(/\r?\n/).filter((l) => l.trim());
          importedItems = lines.slice(1).map((line, idx) => {
            const parts = line.split(';').map((p) => p.trim());
            const canonical = parts[0] || 'Unknown';
            const synStr = parts[1] || canonical.toLowerCase();
            const cat = parts[2] || 'custom';
            return {
              id: `tax-csv-${Date.now()}-${idx}`,
              canonical_name: canonical,
              synonyms: synStr.split(',').map((s) => s.trim()).filter(Boolean),
              category: cat,
            };
          });
        }

        if (importedItems.length > 0) {
          const merged = [...taxonomies];
          let addedCount = 0;
          importedItems.forEach((imp) => {
            if (!merged.some((m) => m.canonical_name.toLowerCase() === imp.canonical_name.toLowerCase())) {
              merged.push(imp);
              addedCount++;
            }
          });

          saveTaxonomies(merged);
          onAddToast('success', 'Import Berhasil', `${addedCount} taksonomi sinonim berhasil diimport dari berkas ${file.name}.`);
          onAddAuditLog('BULK_IMPORT_TAXONOMY', 'skill_taxonomies', `bulk-${Date.now()}`, `Import masal ${addedCount} taksonomi skill dari file: ${file.name}`);
          setActiveTab('manage');
        } else {
          onAddToast('error', 'Format Berkas Rusak', 'Tidak ada data taksonomi valid yang dapat diekstrak.');
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
    if (cat === 'all') return 'ALL';
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
        <div>
          <h3 className="text-base font-bold text-foreground">Skill Taxonomy & Synonym Dictionary</h3>
          <p className="text-xs font-normal text-muted-foreground mt-0.5">
            Normalize skill variations for Mandatory Skill Penalty Engine accuracy
          </p>
        </div>
      }
      subheader={
        <Tabs
          items={[
            { key: 'manage', label: `Taxonomy List (${taxonomies.length})` },
            { key: 'add', label: 'Manual Entry' },
            { key: 'upload', label: 'Bulk Import (JSON/CSV)' },
          ]}
          active={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          className="w-full justify-start overflow-x-auto"
        />
      }
      footer={
        <div className="flex items-center justify-end gap-3.5 w-full">
          <Button variant="ghost" size="md" onClick={onClose} className="px-6">
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {activeTab === 'add' && (
          <div className="space-y-3.5 p-4 bg-card border border-border rounded-xl shadow-xs">
            <h3 className="text-xs font-bold text-foreground border-b border-border pb-2">
              Add New Skill Taxonomy
            </h3>

            <form onSubmit={handleAddTaxonomy} className="space-y-3.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Field label="Primary Skill (Canonical)" required hint="Example: Golang, Python, PostgreSQL">
                  <Input
                    required
                    placeholder="Example: Golang"
                    value={canonicalName}
                    onChange={(e) => setCanonicalName(e.target.value)}
                  />
                </Field>

                <Field label="Skill Category">
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
                      <option value="__NEW_CATEGORY__">+ Add New Category...</option>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Input
                        autoFocus
                        placeholder="New category..."
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
                        aria-label="Confirm new category"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingNewCategory(false)}
                        className="p-2"
                        aria-label="Cancel new category"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </Field>
              </div>

              <Field label="Synonym / Alias List (Comma-separated)" hint="Example: go, gin, gorm, go lang">
                <Input
                  placeholder="go, gin, gorm, go lang"
                  value={synonymsInput}
                  onChange={(e) => setSynonymsInput(e.target.value)}
                />
              </Field>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="md" className="px-6">
                  Save Taxonomy
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="p-5 bg-card border border-border rounded-xl shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-foreground mb-1">
                Bulk Upload (JSON/CSV)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload synonym taxonomy files in JSON or CSV format (semicolon-separated <code>;</code>) to add dozens of taxonomies simultaneously.
              </p>
            </div>

            <label className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50 rounded-xl p-6 text-center cursor-pointer block transition-all">
              <span className="text-xs font-bold text-primary block">
                {isUploading ? 'Processing File...' : 'Select JSON or CSV File'}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 block">File format: skill_taxonomies.json or skill_taxonomies.csv</span>
              <input
                type="file"
                accept=".json,.csv"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}

        {activeTab === 'manage' && (
          <>
            {/* Section: Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Input
                  placeholder="Search primary skill or synonym..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-xs"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>

              <div className="w-full sm:w-64 shrink-0 flex items-center gap-1.5">
                <Select
                  value={activeCategoryFilter}
                  onChange={(e) => setActiveCategoryFilter(e.target.value)}
                  sizeVariant="sm"
                  className="font-semibold"
                >
                  <option value="all">Filter: All Categories ({taxonomies.length})</option>
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
                    title={`Delete category "${formatCategoryLabel(activeCategoryFilter)}"`}
                    className="text-destructive hover:bg-destructive/10 p-1 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Section: Taxonomy List Table */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredTaxonomies.length === 0 ? (
                <div className="text-center py-10 text-xs text-muted-foreground italic">
                  No skill synonym taxonomies match your search.
                </div>
              ) : (
                filteredTaxonomies.map((item) => (
                  <div key={item.id} className="bg-muted/40 border border-border rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs shadow-2xs">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{item.canonical_name}</span>
                        <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase">
                          {formatCategoryLabel(item.category)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.synonyms.map((syn, idx) => (
                          <span key={idx} className="bg-background text-foreground border border-border text-[11px] px-2 py-0.5 rounded-md font-mono shadow-2xs">
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTaxonomy(item.id, item.canonical_name)}
                      aria-label={`Delete ${item.canonical_name}`}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </Overlay>
  );
};
