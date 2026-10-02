import React, { useState } from 'react';
import { Application, Deficiency } from '../../types';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, Upload, CheckCircle2, X } from 'lucide-react';

interface DeficiencyResponderModalProps {
  application: Application;
  deficiency: Deficiency;
  onClose: () => void;
}

export const DeficiencyResponderModal: React.FC<DeficiencyResponderModalProps> = ({ application, deficiency, onClose }) => {
  const { resubmitDeficiency } = useData();
  const { notify } = useToast();
  const [responseNotes, setResponseNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [fileError, setFileError] = useState('');
  const [notesError, setNotesError] = useState('');

  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  const MAX_SIZE_MB = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    /* The old handler accepted any file of any size, so a 400 MB video could be
       "attached" and the UI reported success regardless. */
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only PDF, JPG or PNG files are accepted.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File exceeds the ${MAX_SIZE_MB} MB limit.`);
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setFileError('');
    setSelectedFile({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const notes = responseNotes.trim();
    if (notes.length < 20) {
      setNotesError('Explain the correction in at least 20 characters so the officer can verify it.');
      return;
    }
    setNotesError('');

    resubmitDeficiency(application.id, deficiency.id, notes, selectedFile || undefined);
    notify(`Resubmission sent to ${deficiency.raisedByName || 'the scrutiny officer'}.`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-lg w-full p-6 space-y-6 text-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h3 className="font-bold text-base">Respond to Officer Deficiency Notice</h3>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-xs text-orange-950 space-y-1">
          <p className="font-bold text-sm text-orange-900">{deficiency.title}</p>
          <p className="text-slate-700 leading-relaxed">{deficiency.description}</p>
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-600">
            <span>Raised By: <strong>{deficiency.raisedByName}</strong></span>
            <span>Deadline: <strong className="text-rose-600">{new Date(deficiency.deadlineDate).toLocaleDateString()}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Upload Corrected / Updated Document</label>
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 transition text-center">
              <Upload className="w-8 h-8 text-blue-600 mb-1" />
              <span className="font-bold text-slate-800 text-xs">
                {selectedFile ? selectedFile.name : 'Click to select replacement PDF / Image file'}
              </span>
              {selectedFile && <span className="text-[10px] text-emerald-700 font-bold mt-1">Size: {selectedFile.size}</span>}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                aria-label="Corrected document"
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-slate-500 mt-1">Accepted formats: PDF, JPG, PNG up to {MAX_SIZE_MB} MB.</p>
            {fileError && (
              <p role="alert" className="text-[11px] text-rose-700 font-medium mt-1">
                {fileError}
              </p>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Applicant Clarification Remarks / Explanation</label>
            <textarea
              rows={3}
              value={responseNotes}
              onChange={(e) => {
                setResponseNotes(e.target.value);
                if (notesError) setNotesError('');
              }}
              aria-invalid={Boolean(notesError)}
              placeholder="Provide explanation e.g., 'Attached updated income certificate valid for FY 2025-26 issued by Tehsildar'..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600"
            />
            {notesError && (
              <p role="alert" className="text-[11px] text-rose-700 font-medium mt-1">
                {notesError}
              </p>
            )}
          </div>

          {selectedFile && (
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {selectedFile.name} will be attached to this notice.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2 rounded-lg text-xs transition shadow flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Resubmission to Officer
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
