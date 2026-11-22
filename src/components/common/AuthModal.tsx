import React, { useState, useEffect } from 'react';
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
  RotateCw,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parseUSN, BMSIT_BRANCH_MAP, USNParseResult } from '../../utils/usnParser';
import { supabase, profileToStudent } from '../../lib/supabase';

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
  const { currentUser, setCurrentUser, registerUser, pushToast, triggerConfetti } = useApp();

  const [mode, setMode] = useState<'signin' | 'register' | 'verify' | 'forgot'>(initialMode);
  const [loading, setLoading] = useState(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [usnInput, setUsnInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [manualBranch, setManualBranch] = useState('');

  // Real-time USN parsed info
  const [usnResult, setUsnResult] = useState<USNParseResult | null>(null);

  // OTP verification state
  const [pendingEmail, setPendingEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [pendingData, setPendingData] = useState<any>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Timer countdown for Resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

  // Handle Registration Submit with Supabase Auth
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate full name
    if (!fullName.trim()) {
      pushToast('Please enter your full name.', 'warning');
      return;
    }

    // 2. Validate college email ending with @bmsit.in
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail.endsWith('@bmsit.in')) {
      pushToast('College email must strictly end with @bmsit.in.', 'error');
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

    const userData = {
      full_name: fullName.trim(),
      usn: usnInput.trim().toUpperCase(),
      branch: finalBranch,
      admission_year: usnResult.admissionYearFull || 2024,
      current_year: usnResult.currentYear || '1st Year (Fresher)',
    };

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        if (error.message.includes('suspended')) {
          pushToast(
            'An account associated with this email has been suspended. Please contact the administrator at gjr19atwork@gmail.com',
            'error'
          );
        } else if (error.message.includes('already registered')) {
          pushToast('This email is already registered. Please sign in instead.', 'info');
          setSignInEmail(trimmedEmail);
          setMode('signin');
        } else {
          pushToast(error.message, 'error');
        }
        setLoading(false);
        return;
      }

      setPendingEmail(trimmedEmail);
      setPendingData({
        name: fullName.trim(),
        email: trimmedEmail,
        usn: usnInput.trim().toUpperCase(),
        branch: finalBranch,
        admissionYear: usnResult.admissionYearFull || 2024,
        currentYear: usnResult.currentYear || '1st Year (Fresher)',
      });
      setResendCooldown(60);
      setMode('verify');
      pushToast(`Verification code sent to ${trimmedEmail}!`, 'success');
    } catch (err: any) {
      pushToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Real 6-Digit OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = enteredOtp.trim();
    if (cleanOtp.length !== 6) {
      pushToast('Please enter the full 6-digit verification code.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP with Supabase
      let verifyRes = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: cleanOtp,
        type: 'signup',
      });

      // Fallback for email type if signup type is exhausted
      if (verifyRes.error) {
        verifyRes = await supabase.auth.verifyOtp({
          email: pendingEmail,
          token: cleanOtp,
          type: 'email',
        });
      }

      if (verifyRes.error) {
        pushToast(verifyRes.error.message || 'Invalid or expired code. Please try again.', 'error');
        setLoading(false);
        return;
      }

      const sessionUser = verifyRes.data.user;
      if (sessionUser) {
        // Fetch student profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (profile) {
          setCurrentUser(profileToStudent(profile));
        } else if (pendingData) {
          registerUser({
            ...pendingData,
            id: sessionUser.id,
          });
        }
      }

      triggerConfetti();
      pushToast('Email verified successfully! Welcome to BMSIT Marketplace.', 'success');
      onClose();
    } catch (err: any) {
      pushToast(err.message || 'Verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !pendingEmail) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
      });

      if (error) {
        pushToast(error.message, 'error');
      } else {
        setResendCooldown(60);
        pushToast(`New verification code sent to ${pendingEmail}!`, 'success');
      }
    } catch (err: any) {
      pushToast(err.message || 'Failed to resend code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign-in with Supabase
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = signInEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      pushToast('Please enter your @bmsit.in email.', 'warning');
      return;
    }
    if (!trimmedEmail.endsWith('@bmsit.in')) {
      pushToast('Sign in requires your official @bmsit.in student email.', 'error');
      return;
    }
    if (!signInPassword) {
      pushToast('Please enter your password.', 'warning');
      return;
    }

    setSignInError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: signInPassword,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('email not confirmed')) {
          setPendingEmail(trimmedEmail);
          setMode('verify');
          pushToast('Please enter the 6-digit verification code sent to your email.', 'info');
        } else if (
          msg.includes('invalid login credentials') ||
          msg.includes('invalid credentials') ||
          msg.includes('invalid') ||
          msg.includes('user not found')
        ) {
          const userFriendlyError = 'Invalid email or password. Please register if you do not have an account.';
          setSignInError(userFriendlyError);
          pushToast(userFriendlyError, 'error');
        } else {
          setSignInError(error.message);
          pushToast(error.message, 'error');
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check for suspension
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile?.is_suspended) {
          await supabase.auth.signOut();
          pushToast(
            'Your account has been suspended. Please contact the administrator at gjr19atwork@gmail.com',
            'error'
          );
          setLoading(false);
          return;
        }

        if (profile) {
          setCurrentUser(profileToStudent(profile));
        }

        pushToast(`Welcome back, ${profile?.full_name || 'Student'}!`, 'success');
        onClose();
      }
    } catch (err: any) {
      pushToast(err.message || 'Sign in failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset Request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = forgotEmail.trim().toLowerCase();
    if (!trimmed.endsWith('@bmsit.in')) {
      pushToast('Please enter a valid @bmsit.in student email.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        pushToast(error.message, 'error');
      } else {
        setForgotSubmitted(true);
        pushToast('Password reset link sent to your email!', 'success');
      }
    } catch (err: any) {
      pushToast(err.message || 'Failed to request reset.', 'error');
    } finally {
      setLoading(false);
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
                VERIFIED AUTH
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
              onClick={() => {
                setSignInError(null);
                setMode('signin');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                mode === 'signin'
                  ? 'bg-[#1C1C1C] text-[#FFFBEA]'
                  : 'text-[#1C1C1C] hover:bg-[#F2A93B]/20'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setSignInError(null);
                setMode('register');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                mode === 'register'
                  ? 'bg-[#1C1C1C] text-[#FFFBEA]'
                  : 'text-[#1C1C1C] hover:bg-[#F2A93B]/20'
              }`}
            >
              Register (@bmsit.in)
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
                    onChange={(e) => {
                      setSignInEmail(e.target.value);
                      if (signInError) setSignInError(null);
                    }}
                    required
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
                    onClick={() => {
                      setSignInError(null);
                      setMode('forgot');
                    }}
                    className="text-[11px] text-[#1C1C1C]/70 hover:underline hover:text-[#1C1C1C]"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => {
                      setSignInPassword(e.target.value);
                      if (signInError) setSignInError(null);
                    }}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                  />
                </div>
              </div>

              {signInError && (
                <div className="p-3 rounded-xl border-2 border-rose-600 bg-rose-50 text-rose-900 text-xs font-bold flex items-center justify-between gap-2 shadow-[2px_2px_0px_#1C1C1C]">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{signInError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInError(null);
                      setMode('register');
                    }}
                    className="text-[11px] underline font-extrabold text-rose-700 hover:text-rose-900 shrink-0 cursor-pointer"
                  >
                    Register →
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs text-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Marketplace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
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
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={usnInput}
                  onChange={(e) => handleUsnChange(e.target.value)}
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
                  className="w-full px-3 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 leading-tight">
              By registering, you agree to BMSIT Campus Peer-to-Peer guidelines. Only current students with verified @bmsit.in emails may list items.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs text-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 3. REAL 6-DIGIT OTP VERIFICATION SCREEN */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1D9] border-2 border-[#1C1C1C] mx-auto flex items-center justify-center text-2xl shadow-[2px_2px_0px_#1C1C1C]">
              📬
            </div>

            <div>
              <h3 className="font-head text-lg font-bold text-[#1C1C1C]">
                Verify Your BMSIT Email
              </h3>
              <p className="text-xs text-[#1C1C1C]/80 mt-1 max-w-sm mx-auto">
                A 6-digit confirmation code was sent to{' '}
                <span className="font-mono font-bold text-[#1C1C1C]">
                  {pendingEmail}
                </span>. Please check your college inbox or spam folder.
              </p>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                className="w-56 mx-auto text-center font-mono text-2xl font-black tracking-[0.3em] py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[3px_3px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
              />
            </div>

            <div className="text-xs text-neutral-600">
              {resendCooldown > 0 ? (
                <span>Resend code in <strong className="font-mono">{resendCooldown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="font-bold text-[#1C1C1C] underline decoration-2 hover:text-[#F2A93B] cursor-pointer"
                >
                  Didn't receive code? Resend Code
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="w-1/2 py-2.5 text-xs font-semibold rounded-xl border-2 border-[#1C1C1C] bg-white hover:bg-neutral-100 transition cursor-pointer"
              >
                Back to Details
              </button>
              <button
                type="submit"
                disabled={loading || enteredOtp.trim().length !== 6}
                className="w-1/2 py-2.5 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Verify & Activate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 4. FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#F2A93B]" />
              <h3 className="font-head text-base font-bold text-[#1C1C1C]">
                Reset Password
              </h3>
            </div>

            {forgotSubmitted ? (
              <div className="p-4 bg-[#FFF9E6] rounded-xl border-2 border-[#1C1C1C] text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password reset link sent!</span>
                </div>
                <p className="text-neutral-700">
                  Check <span className="font-mono font-bold">{forgotEmail}</span> for a secure password reset link.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSubmitted(false);
                    setMode('signin');
                  }}
                  className="mt-2 px-3 py-1 bg-[#F2A93B] border border-[#1C1C1C] rounded-lg font-bold cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-neutral-600">
                  Enter your registered BMSIT email address to receive password instructions.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                />
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-xs text-neutral-500 hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#e49b2f] cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
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
