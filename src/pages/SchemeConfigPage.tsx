import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { Scheme } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { CheckCircle2, ArrowLeft, FolderOpen, Info } from 'lucide-react';
import { NavigateFn } from '../lib/navigation';

export const SchemeConfigPage: React.FC<{ navigate: NavigateFn }> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { schemes, updateScheme } = useData();
  const { notify } = useToast();

  /* Guard: the old code indexed schemes[0] into state, which crashed on an
     empty configuration and kept a stale scheme selected after a reset. */
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const selectedScheme = schemes.find((s) => s.id === selectedSchemeId) ?? schemes[0] ?? null;

  const [editingTitle, setEditingTitle] = useState('');
  const [editingBenefit, setEditingBenefit] = useState('');
  const [editingDeadline, setEditingDeadline] = useState('');
  const [editingSlots, setEditingSlots] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!selectedScheme) return;
    setEditingTitle(selectedScheme.title);
    setEditingBenefit(selectedScheme.financialBenefit);
    setEditingDeadline(selectedScheme.deadline?.slice(0, 10) ?? '');
    setEditingSlots(String(selectedScheme.totalSlots ?? 0));
    setErrors({});
  }, [selectedScheme?.id]);

  const handleSaveScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheme) return;

    const errs: Record<string, string> = {};
    if (editingTitle.trim().length < 5) errs.title = 'Scheme title must be at least 5 characters.';
    if (editingBenefit.trim().length < 5) errs.benefit = 'Describe the financial benefit.';
    if (!editingDeadline) errs.deadline = 'Set the application deadline.';
    else if (new Date(editingDeadline) < new Date()) errs.deadline = 'The deadline cannot be in the past.';
    const slots = Number(editingSlots);
    if (!Number.isFinite(slots) || slots < 0) errs.slots = 'Enter a non-negative slot count.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      notify('Please correct the highlighted scheme fields.', 'error');
      return;
    }

    updateScheme(
      {
        ...selectedScheme,
        title: editingTitle.trim(),
        financialBenefit: editingBenefit.trim(),
        deadline: new Date(editingDeadline).toISOString(),
        totalSlots: Math.round(slots)
      },
      { id: currentUser.id, name: currentUser.name, role: currentUser.role }
    );
    notify(`Configuration saved for ${selectedScheme.code}.`, 'success');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('admin-dashboard')}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
        </button>

        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full uppercase">
              Dynamic Architecture Engine
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-1">Scheme & Workflow Configurator</h1>
            <p className="text-xs text-slate-400">Configure eligibility criteria rules, document requirements, & stage workflows</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
              {schemes.length} scheme{schemes.length === 1 ? '' : 's'} configured
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Scheme creation and retirement are handled through the departmental scheme notification workflow and
          are out of scope for this prototype. Edits made here are stored in this browser only.
        </p>
      </div>

      {schemes.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <EmptyState
            icon={FolderOpen}
            title="No schemes configured"
            message="Scheme parameters, eligibility rules and document requirements appear here once a scheme is published for a cycle."
            action={
              <button
                onClick={() => navigate('admin-dashboard')}
                className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg"
              >
                Return to admin dashboard
              </button>
            }
          />
        </div>
      )}

      {/* Main Grid */}
      {schemes.length > 0 && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Scheme Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            Active Schemes
          </h3>

          <div className="space-y-2">
            {schemes.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setSelectedSchemeId(s.id)}
                aria-current={selectedScheme?.id === s.id}
                className={`w-full text-left p-3.5 rounded-xl border transition text-xs ${
                  selectedScheme?.id === s.id
                    ? 'bg-amber-50 border-amber-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">{s.code}</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">{s.category}</span>
                </div>
                <p className="font-semibold text-slate-800 mt-1">{s.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {s.eligibilityRules.length} rule{s.eligibilityRules.length === 1 ? '' : 's'} &middot;{' '}
                  {s.requiredDocuments.length} document{s.requiredDocuments.length === 1 ? '' : 's'} &middot;{' '}
                  {s.isActive ? 'Active' : 'Inactive'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Visual Rule & Stage Builder (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-xs">
          
          <form onSubmit={handleSaveScheme} className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Scheme Parameters ({selectedScheme.code})</h3>
            
            <div>
              <label className="block font-bold text-slate-700 mb-1">Scheme Title</label>
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                aria-invalid={Boolean(errors.title)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
              />
              {errors.title && <p className="text-[11px] text-rose-700 font-medium mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Financial Benefit Formula</label>
              <input
                type="text"
                value={editingBenefit}
                onChange={(e) => setEditingBenefit(e.target.value)}
                aria-invalid={Boolean(errors.benefit)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900"
              />
              {errors.benefit && <p className="text-[11px] text-rose-700 font-medium mt-1">{errors.benefit}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="deadline" className="block font-bold text-slate-700 mb-1">
                  Application Deadline
                </label>
                <input
                  id="deadline"
                  type="date"
                  value={editingDeadline}
                  onChange={(e) => setEditingDeadline(e.target.value)}
                  aria-invalid={Boolean(errors.deadline)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900"
                />
                {errors.deadline && (
                  <p className="text-[11px] text-rose-700 font-medium mt-1">{errors.deadline}</p>
                )}
              </div>
              <div>
                <label htmlFor="slots" className="block font-bold text-slate-700 mb-1">
                  Fellowship Slots Available
                </label>
                <input
                  id="slots"
                  type="number"
                  min="0"
                  step="1"
                  value={editingSlots}
                  onChange={(e) => setEditingSlots(e.target.value)}
                  aria-invalid={Boolean(errors.slots)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-semibold text-slate-900"
                />
                {errors.slots && (
                  <p className="text-[11px] text-rose-700 font-medium mt-1">{errors.slots}</p>
                )}
              </div>
            </div>

            {/* Visual Eligibility Rules List */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Configured Eligibility Rules Engine</h4>
              <div className="space-y-2">
                {selectedScheme.eligibilityRules.length === 0 && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    No scheme-specific rules are configured. Only the standard MoTA checks apply.
                  </p>
                )}
                {selectedScheme.eligibilityRules.map((rule) => (
                  <div key={rule.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">{rule.description}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Field: {rule.field} • Op: {rule.operator}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                        rule.mandatory
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {rule.mandatory ? 'MANDATORY' : 'OPTIONAL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Documents Rules */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Document Requirements Checklist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedScheme.requiredDocuments.map((doc) => (
                  <div key={doc.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900">{doc.name}</p>
                    <p className="text-[10px] text-slate-500">Formats: {doc.allowedFormats.join(', ')} • Max: {doc.maxSizeMB} MB</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-6 py-2.5 rounded-lg transition shadow text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save Scheme Configurations
            </button>
          </form>

        </div>

      </div>
      )}
    </div>
  );
};
