import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Mail,
  Lock,
  User,
  Hash,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseUSN, BMSIT_BRANCH_MAP, USNParseResult } from '../../utils/usnParser';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { students, currentUser, switchUser, registerUser, pushToast } = useApp();

  const [mode, setMode] = useState<'signin' | 'register' | 'verify' | 'forgot'>(initialMode);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [usnInput, setUsnInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [manualBranch, setManualBranch] = useState('');

  // Real-time USN parsed info
  const [usnResult, setUsnResult] = useState<USNParseResult | null>(null);

  // Simulated OTP verification state
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('842019');
  const [registeredDataPending, setRegisteredDataPending] = useState<any>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  if (!isOpen) return null;

  // Handle USN input change with auto-derivation
  const handleUsnChange = (val: string) => {
    const clean = val.toUpperCase();
    setUsnInput(clean);
    if (clean.length >= 7) {
      const parsed = parseUSN(clean);
      setUsnResult(parsed);
      if (parsed.branchName) {
        setManualBranch(parsed.branchName);
      }
    } else {
      setUsnResult(null);
    }
  };

  // Handle Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate full name
    if (!fullName.trim()) {
      pushToast('Please enter your full name.', 'warning');
      return;
    }

    // 2. Validate college email ending with @bmsit.in
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith('@bmsit.in')) {
      pushToast('College email must end with @bmsit.in (BMSIT domain required).', 'error');
      return;
    }

    // 3. Validate USN
    if (!usnResult || !usnResult.isValidFormat) {
      pushToast('Please enter a valid VTU USN format (e.g. 1BY24AI049).', 'error');
      return;
    }

    // 4. Branch check
    const finalBranch = usnResult.isKnownBranch ? usnResult.branchName : manualBranch;
    if (!finalBranch) {
      pushToast('Please select your branch manually.', 'warning');
      return;
    }

    // 5. Password check
    if (password.length < 6) {
      pushToast('Password should be at least 6 characters.', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      pushToast('Passwords do not match.', 'error');
      return;
    }

    // Store pending student and trigger simulated OTP verification
    const pending = {
      name: fullName.trim(),
      email: trimmedEmail,
      usn: usnInput.trim().toUpperCase(),
      branch: finalBranch,
      admissionYear: usnResult.admissionYearFull || 2024,
      currentYear: usnResult.currentYear || '1st Year (Fresher)',
    };

    setRegisteredDataPending(pending);
    setGeneratedOtp(Math.floor(100000 + Math.random() * 900000).toString());
    setMode('verify');
  };

  // Handle Simulated Verification
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp) {
      pushToast('Invalid demo OTP. Use the demo auto-fill button.', 'error');
      return;
    }

    // Complete registration
    registerUser(registeredDataPending);
    onClose();
  };

  // Handle Standard Sign-in
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      pushToast('Please enter your @bmsit.in email.', 'warning');
      return;
    }

    const found = students.find(
      (s) => s.email.toLowerCase() === signInEmail.trim().toLowerCase()
    );

    if (found) {
      switchUser(found.id);
      pushToast(`Signed in as ${found.name}`, 'success');
      onClose();
    } else {
      pushToast('No demo student found with this email. Use quick switch accounts below.', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FFFBF5] rounded-2xl border-2 border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full border border-[#1C1C1C] bg-[#FFF9E6] hover:bg-[#F2A93B] transition shadow-[1.5px_1.5px_0px_#1C1C1C]"
        >
          <X className="w-4 h-4 text-[#1C1C1C]" />
        </button>

        {/* Modal Branding Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#F2A93B] border-2 border-[#1C1C1C] flex items-center justify-center font-bold text-base shadow-[2px_2px_0px_#1C1C1C]">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-head text-xl font-bold text-[#1C1C1C]">
                marketplace.bmsit
              </span>
              <span className="nb-sticker text-[10px] py-0.5 px-2 bg-[#FFE082]">
                DEMO AUTH
              </span>
            </div>
            <p className="text-xs text-[#1C1C1C]/70">
              Student-only verified marketplace for BMSIT & Management
            </p>
          </div>
        </div>

        {/* Tabs */}
        {mode !== 'verify' && mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-[#FFF9E6] rounded-xl border-2 border-[#1C1C1C] mb-5 shadow-[2px_2px_0px_#1C1C1C]">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                mode === 'signin'
                  ? 'bg-[#F2A93B] text-[#1C1C1C] border border-[#1C1C1C] shadow-[1px_1px_0px_#1C1C1C]'
                  : 'text-[#1C1C1C]/70 hover:text-[#1C1C1C]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                mode === 'register'
                  ? 'bg-[#F2A93B] text-[#1C1C1C] border border-[#1C1C1C] shadow-[1px_1px_0px_#1C1C1C]'
                  : 'text-[#1C1C1C]/70 hover:text-[#1C1C1C]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* 1. SIGN IN MODE */}
        {mode === 'signin' && (
          <div>
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="e.g. rohan.24ai049@bmsit.in"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1C1C1C]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-[#E1467A] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs text-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-1.5"
              >
                <span>Sign In to BMSIT Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Switcher Section */}
            <div className="mt-6 pt-5 border-t-2 border-dashed border-[#1C1C1C]/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-2.5">
                ⚡ Quick Switch Demo Personas:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {students.slice(0, 4).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      switchUser(s.id);
                      onClose();
                    }}
                    className={`p-2 rounded-xl border-1.5 border-[#1C1C1C] text-left transition flex items-center gap-2 shadow-[2px_2px_0px_#1C1C1C] ${
                      currentUser.id === s.id
                        ? 'bg-[#FFF1D9] ring-2 ring-[#F2A93B]'
                        : 'bg-white hover:bg-[#FFF9E6]'
                    }`}
                  >
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-7 h-7 rounded-full border border-[#1C1C1C] object-cover"
                    />
                    <div className="min-w-0">
                      <div className="font-bold truncate text-[#1C1C1C]">{s.name}</div>
                      <div className="text-[10px] text-neutral-500 font-mono truncate">{s.usn}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. REGISTER MODE WITH USN AUTO-DETECTION */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                />
              </div>
            </div>

            {/* USN Field with Realtime Parser */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#1C1C1C]">
                  University Seat Number (USN) *
                </label>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Example: 1BY24AI049
                </span>
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={usnInput}
                  onChange={(e) => handleUsnChange(e.target.value)}
                  placeholder="1BY24AI049"
                  maxLength={10}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                />
              </div>

              {/* Dynamic USN Auto-Derivation Badge */}
              {usnResult && usnResult.isValidFormat && (
                <div className="mt-2 p-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#FFF9E6] shadow-[2px_2px_0px_#1C1C1C] text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#1C1C1C] mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Recognised BMSIT Identity:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-neutral-700">
                    <div>
                      • Admission Year:{' '}
                      <span className="font-semibold">{usnResult.admissionYearFull}</span>
                    </div>
                    <div>
                      • Current Status:{' '}
                      <span className="font-semibold">{usnResult.currentYear}</span>
                    </div>
                    <div className="col-span-2">
                      • Branch:{' '}
                      <span className="font-semibold">
                        {usnResult.isKnownBranch
                          ? usnResult.branchName
                          : 'Unknown branch code (' + usnResult.branchCode + ')'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback if branch is not recognized */}
              {usnResult && usnResult.isValidFormat && !usnResult.isKnownBranch && (
                <div className="mt-2 p-2 bg-[#FFF1D9] border-2 border-[#1C1C1C] rounded-xl text-xs">
                  <div className="flex items-center gap-1 text-[#E1467A] font-bold mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Branch not recognised automatically</span>
                  </div>
                  <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                    Please select your department manually:
                  </label>
                  <select
                    value={manualBranch}
                    onChange={(e) => setManualBranch(e.target.value)}
                    className="w-full p-1.5 text-xs rounded-lg border border-[#1C1C1C] bg-white"
                  >
                    <option value="">-- Choose Branch --</option>
                    {Object.values(BMSIT_BRANCH_MAP).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#1C1C1C]">
                  College Email *
                </label>
                <span className="text-[10px] text-[#E1467A] font-bold">
                  Must end with @bmsit.in
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name.usn@bmsit.in"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-tight">
              By registering, you agree to BMSIT Campus Peer-to-Peer guidelines. Only current students with verified @bmsit.in emails may list items.
            </p>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs text-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Create Student Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. SIMULATED VERIFICATION SCREEN */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1D9] border-2 border-[#1C1C1C] mx-auto flex items-center justify-center text-2xl shadow-[2px_2px_0px_#1C1C1C]">
              📩
            </div>

            <div>
              <h3 className="font-head text-lg font-bold text-[#1C1C1C]">
                Verify Your BMSIT Email
              </h3>
              <p className="text-xs text-[#1C1C1C]/80 mt-1 max-w-sm mx-auto">
                In production, a 6-digit confirmation code is dispatched to{' '}
                <span className="font-mono font-bold text-[#1C1C1C]">
                  {registeredDataPending?.email}
                </span>.
              </p>
            </div>

            {/* Demo Helper Box */}
            <div className="bg-[#FFF9E6] border-2 border-[#1C1C1C] rounded-xl p-3 shadow-[2px_2px_0px_#1C1C1C] text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-neutral-600">
                  ⚡ DEMO VERIFICATION CODE:
                </span>
                <span className="font-mono text-sm font-extrabold text-[#E1467A] tracking-widest">
                  {generatedOtp}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEnteredOtp(generatedOtp)}
                className="w-full py-1 text-[11px] font-bold bg-white border border-[#1C1C1C] rounded-lg hover:bg-[#F2A93B] transition"
              >
                Auto-fill Demo Code ({generatedOtp})
              </button>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-48 mx-auto text-center font-mono text-lg font-bold tracking-widest py-2 rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="w-1/2 py-2 text-xs font-semibold rounded-xl border-2 border-[#1C1C1C] bg-white"
              >
                Back to Details
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#e49b2f]"
              >
                Verify & Activate
              </button>
            </div>
          </form>
        )}

        {/* 4. FORGOT PASSWORD SIMULATION */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#F2A93B]" />
              <h3 className="font-head text-base font-bold text-[#1C1C1C]">
                Password Reset Simulation
              </h3>
            </div>

            {forgotSubmitted ? (
              <div className="p-4 bg-[#FFF9E6] rounded-xl border-2 border-[#1C1C1C] text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulated reset link dispatched!</span>
                </div>
                <p className="text-neutral-700">
                  A reset token was simulated for <span className="font-mono font-bold">{forgotEmail}</span>. No actual email was sent since this is a frontend demonstration.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSubmitted(false);
                    setMode('signin');
                  }}
                  className="mt-2 px-3 py-1 bg-[#F2A93B] border border-[#1C1C1C] rounded-lg font-bold"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotEmail.endsWith('@bmsit.in')) {
                    pushToast('Please enter your valid @bmsit.in address.', 'warning');
                    return;
                  }
                  setForgotSubmitted(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-neutral-600">
                  Enter your registered BMSIT email address to receive password instructions.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="student.usn@bmsit.in"
                  className="w-full px-3 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                />
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-xs text-neutral-500 hover:underline"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2px_2px_0px_#1C1C1C]"
                  >
                    Simulate Password Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
