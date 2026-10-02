import React, { useState } from 'react';
import { AppDocument, Application } from '../../types';
import { FileText, CheckCircle2, AlertTriangle, Edit2, Eye, ShieldCheck, HelpCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface OCRViewerProps {
  application: Application;
  document: AppDocument;
}

export const OCRViewer: React.FC<OCRViewerProps> = ({ application, document }) => {
  const { updateDocumentOcrField } = useData();
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSaveEdit = (fieldKey: string) => {
    updateDocumentOcrField(application.id, document.id, fieldKey, editValue, 'EDITED');
    setEditingFieldKey(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <div>
            <h4 className="font-bold text-sm">{document.documentName}</h4>
            <p className="text-xs text-slate-400">
              File: {document.fileName} • Size: {document.fileSize} • Uploaded: {document.uploadDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-3 py-1 rounded text-xs border border-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Confidence: <strong className="text-emerald-400">{document.overallAiConfidence}%</strong></span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Left Column: Document Preview Frame */}
        <div className="p-4 bg-slate-100 flex flex-col justify-between min-h-[400px]">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-blue-600" /> Document Preview Panel
            </span>
            <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded">PDF Standard Viewer</span>
          </div>
          <div className="flex-1 bg-white rounded border border-slate-300 p-8 flex flex-col items-center justify-center text-center shadow-inner my-2">
            <FileText className="w-16 h-16 text-slate-400 mb-3" />
            <p className="font-bold text-slate-800 text-sm">{document.fileName}</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Simulated PDF Rendering: Government Certificate document stream loaded securely.
            </p>
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 bg-blue-700 hover:bg-blue-800 text-white text-xs px-4 py-2 rounded-lg font-semibold transition"
            >
              Open Full Document
            </a>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            🔒 Document digitally signed & archived under GoI Document Retention Standard.
          </p>
        </div>

        {/* Right Column: OCR Extraction & Officer Verification Panel */}
        <div className="p-5 space-y-6">
          
          {/* AI Check Findings */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3 flex items-center justify-between">
              <span>AI Pre-Verification Checks</span>
              <span className="text-[10px] text-slate-400">Automated Audit</span>
            </h5>
            <div className="space-y-2">
              {document.aiChecks.map((chk) => (
                <div
                  key={chk.checkId}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                    chk.status === 'PASS'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : chk.status === 'WARNING'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  {chk.status === 'PASS' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{chk.title}</span>
                      <span className="text-[10px] font-semibold">{chk.confidence}% Confidence</span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed">{chk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OCR Extracted Fields Table */}
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
              Extracted OCR Fields vs Application Data
            </h5>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Field Label</th>
                    <th className="p-2.5">Extracted OCR Value</th>
                    <th className="p-2.5">Application Form Value</th>
                    <th className="p-2.5 text-center">Consistency</th>
                    <th className="p-2.5 text-right">Officer Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {document.ocrData.map((f) => (
                    <tr key={f.fieldKey} className="hover:bg-slate-50">
                      <td className="p-2.5 font-semibold text-slate-800">{f.label}</td>
                      <td className="p-2.5 font-mono text-slate-900">
                        {editingFieldKey === f.fieldKey ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="border border-blue-500 rounded px-2 py-0.5 text-xs w-full focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveEdit(f.fieldKey)}
                              className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          f.officerCorrectedValue || f.extractedValue
                        )}
                      </td>
                      <td className="p-2.5 text-slate-600">{f.appValue || 'N/A'}</td>
                      <td className="p-2.5 text-center">
                        {f.matchedWithApp ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                            MATCH
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 justify-center">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> MISMATCH
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right space-x-1">
                        <button
                          onClick={() => updateDocumentOcrField(application.id, document.id, f.fieldKey, f.extractedValue, 'ACCEPTED')}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            f.officerStatus === 'ACCEPTED' ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            setEditingFieldKey(f.fieldKey);
                            setEditValue(f.extractedValue);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-blue-700"
                        >
                          <Edit2 className="w-3 h-3 inline" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Governance Notice */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-[11px] text-blue-900 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Human-in-the-Loop Protocol:</strong> AI OCR field confidence is provided for assistance. Final eligibility determination is executed strictly by authorized Government Scrutiny Officers.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
