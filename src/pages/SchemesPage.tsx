import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { NavigateFn } from '../lib/navigation';
import { GraduationCap, Globe2, ArrowRight, Search, CheckCircle2, Calendar } from 'lucide-react';

interface SchemesPageProps {
  navigate: NavigateFn;
}

export const SchemesPage: React.FC<SchemesPageProps> = ({ navigate }) => {
  const { schemes } = useData();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSchemes = schemes.filter((s) => {
    const matchesCat = filterCategory === 'ALL' || s.category === filterCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Government Fellowships & Scholarships
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Ministry of Tribal Affairs Schemes</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Explore national fellowship and overseas scholarship programs for ST candidates.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name or code..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs w-64 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-md transition ${filterCategory === 'ALL' ? 'bg-white font-bold text-slate-900 shadow' : 'text-slate-600'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterCategory('FELLOWSHIP')}
              className={`px-3 py-1.5 rounded-md transition ${filterCategory === 'FELLOWSHIP' ? 'bg-white font-bold text-slate-900 shadow' : 'text-slate-600'}`}
            >
              Fellowships
            </button>
            <button
              onClick={() => setFilterCategory('OVERSEAS')}
              className={`px-3 py-1.5 rounded-md transition ${filterCategory === 'OVERSEAS' ? 'bg-white font-bold text-slate-900 shadow' : 'text-slate-600'}`}
            >
              Overseas
            </button>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                    {scheme.code} • Academic Year {scheme.academicYear}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-3 leading-snug">{scheme.title}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shrink-0 shadow">
                  {scheme.code === 'NFST' ? <GraduationCap className="w-7 h-7" /> : <Globe2 className="w-7 h-7" />}
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{scheme.description}</p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Study Level & Location</span>
                  <span className="font-bold text-slate-900">{scheme.studyLevel} ({scheme.location})</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Application Deadline</span>
                  <span className="font-bold text-rose-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {scheme.deadline}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Eligibility Summary:</p>
                <ul className="space-y-1 text-xs text-slate-600">
                  {scheme.eligibilitySummary.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  navigate('scheme-detail', { schemeId: scheme.id });
                }}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
              >
                Full Details & Guidelines <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('eligibility', { schemeId: scheme.id })}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg text-xs transition"
                >
                  Check Eligibility
                </button>
                <button
                  onClick={() => navigate('application-wizard', { schemeId: scheme.id })}
                  disabled={!scheme.isActive}
                  className="bg-blue-800 hover:bg-blue-900 disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-lg text-xs transition shadow"
                >
                  {scheme.isActive ? 'Apply Now' : 'Closed'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
