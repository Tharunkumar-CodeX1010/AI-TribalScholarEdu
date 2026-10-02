import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_USERS } from '../mock/initialData';
import { User } from '../types';
import { Building2, ShieldCheck, UserCheck, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { NavigateFn, ROLE_LANDING } from '../lib/navigation';

export const LoginPage: React.FC<{ navigate: NavigateFn }> = ({ navigate }) => {
  const { loginAsDemoUser, setCurrentUser } = useAuth();
  const [email, setEmail] = useState('applicant@mota.gov.in');
  const [password, setPassword] = useState('demo1234');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Enter your password (minimum 6 characters).');
      return;
    }

    if (loginAsDemoUser(email)) {
      const signedIn = MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      navigate(signedIn ? ROLE_LANDING[signedIn.role] : 'applicant-dashboard');
    } else {
      setErrorMsg('No demo account matches that email address. Choose one of the demo accounts below.');
    }
  };

  const handleQuickDemoClick = (usr: User) => {
    setCurrentUser(usr);
    setEmail(usr.email);
    setPassword('demo1234');
    setErrorMsg('');
    navigate(ROLE_LANDING[usr.role]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Side Info Panel */}
        <div className="md:col-span-5 bg-gradient-to-b from-gov-navy to-slate-950 text-white p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="w-12 h-12 bg-slate-900 border-2 border-amber-500 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold font-sans">Tribal Govt-Edu Portal</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Ministry of Tribal Affairs, Govt of India. Unified portal for NFST and NOS scholarship application, scrutiny, and award management.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> GoI Security Protocols
            </span>
            <p className="text-slate-400 text-[11px]">
              Multi-factor Aadhaar authentication & role-based encrypted session control active.
            </p>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="md:col-span-7 p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Official Portal Login</h3>
            <p className="text-xs text-slate-500 mt-1">Select demo account or enter registered credentials</p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs p-3 rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-2.5 rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-500 text-center pt-1">
              New applicant without an account?{' '}
              <button
                type="button"
                onClick={() => navigate('auth-register')}
                className="font-bold text-blue-700 hover:underline underline-offset-2"
              >
                Create one with mobile OTP verification
              </button>
            </p>
          </form>

          {/* Quick Click Demo Accounts */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> One-Click Demo Role Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {MOCK_USERS.slice(0, 5).map((usr) => (
                <button
                  key={usr.id}
                  onClick={() => handleQuickDemoClick(usr)}
                  className="bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 p-2 rounded-lg text-left transition"
                >
                  <p className="font-bold text-slate-900 text-[11px] leading-none">{usr.name}</p>
                  <p className="text-[10px] text-blue-700 font-semibold mt-1">{usr.role.replace(/_/g, ' ')}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
