import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserCheck, ShieldCheck, CheckCircle2, ArrowRight, Phone } from 'lucide-react';
import { NavigateFn } from '../lib/navigation';

/** Shown on screen because no SMS gateway exists in this prototype. */
const DEMO_OTP = '123456';

export const RegisterPage: React.FC<{ navigate: NavigateFn }> = ({ navigate }) => {
  const { setCurrentUser } = useAuth();
  const { notify } = useToast();

  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [fullName, setFullName] = useState('Rahul Munda');
  const [email, setEmail] = useState('rahul.munda@example.com');
  const [mobile, setMobile] = useState('9876543210');
  const [stCertNo, setStCertNo] = useState('ST/JH/RNC/2024/99120');
  const [stateName, setStateName] = useState('Jharkhand');
  const [district, setDistrict] = useState('Ranchi');

  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [detailsError, setDetailsError] = useState('');
  const [verifying, setVerifying] = useState(false);
  /* The declaration must start unchecked and be explicitly accepted. */
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (fullName.trim().length < 3) {
      setDetailsError('Enter your full name exactly as printed on your ST certificate.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setDetailsError('Enter a valid email address.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setDetailsError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (stCertNo.trim().length < 6) {
      setDetailsError('Enter a valid ST certificate number.');
      return;
    }
    if (!declarationAccepted) {
      setDetailsError('Accept the declaration about your ST certificate before continuing.');
      return;
    }

    setDetailsError('');
    setStep('OTP');
    notify(`A ${DEMO_OTP} verification code was generated for ${mobile}.`, 'info');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    /* The old check accepted any six digits. Verification must match the code. */
    if (otpInput.trim() !== DEMO_OTP) {
      setOtpError(`Incorrect code. This demo expects ${DEMO_OTP}.`);
      return;
    }

    setOtpError('');
    setVerifying(true);

    window.setTimeout(() => {
      setCurrentUser({
        id: `usr-applicant-${Date.now()}`,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: 'APPLICANT',
        mobile: `+91 ${mobile.trim()}`,
        state: stateName,
        district,
        stCertNo: stCertNo.trim(),
        profileCompleted: true
      });
      setVerifying(false);
      notify('Mobile number verified. Your applicant account is ready.', 'success');
      navigate('applicant-dashboard');
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            Official Applicant Portal
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Create Applicant Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register to apply for National Fellowship for ST (NFST) & Overseas Scholarships (NOS)
          </p>
          <p className="text-[11px] text-slate-500 mt-2">
            Already registered?{' '}
            <button
              type="button"
              onClick={() => navigate('auth-login')}
              className="font-bold text-blue-700 hover:underline underline-offset-2"
            >
              Sign in to your account
            </button>
          </p>
        </div>

        {step === 'DETAILS' ? (
          <form onSubmit={handleRegisterSubmit} noValidate className="space-y-4 text-xs">
            {detailsError && (
              <p role="alert" className="text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {detailsError}
              </p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name (As on ST Certificate)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number (Aadhaar Seeded)</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ST Category Certificate Number</label>
                <input
                  type="text"
                  value={stCertNo}
                  onChange={(e) => setStCertNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900"
                  required
                />
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                declarationAccepted ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => {
                    setDeclarationAccepted(e.target.checked);
                    if (e.target.checked) setDetailsError('');
                  }}
                  className="mt-0.5 text-blue-600"
                />
                <span className="text-[11px] text-slate-600 leading-snug">
                  I hereby declare that all information provided is accurate and my Scheduled Tribe (ST) status is
                  recognized by the Government of India.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center gap-1.5 text-xs"
            >
              Generate Mobile OTP Verification <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-md mx-auto text-xs">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center space-y-1">
              <Phone className="w-6 h-6 text-blue-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Enter Mobile OTP</h4>
              <p className="text-slate-600 text-[11px]">Verification code issued for +91 {mobile}</p>
              <div className="mt-2 inline-block bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded font-bold">
                DEMO OTP: 123456
              </div>
            </div>

            {otpError && (
              <p role="alert" className="text-rose-700 font-semibold text-center">
                {otpError}
              </p>
            )}

            <div>
              <label htmlFor="otp" className="sr-only">
                Six digit verification code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (otpError) setOtpError('');
                }}
                placeholder="Enter 6-digit OTP"
                aria-invalid={Boolean(otpError)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-center text-lg font-mono font-bold tracking-widest text-slate-900"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={verifying || otpInput.length !== 6}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow text-xs flex items-center justify-center gap-2"
            >
              {verifying ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Verify OTP &amp; complete registration
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
