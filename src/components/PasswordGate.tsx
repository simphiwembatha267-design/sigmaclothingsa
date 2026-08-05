import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'sigma-authed';
const MONO = { fontFamily: "'DM Mono', monospace" } as const;

interface PasswordGateProps {
  onAuthenticated: () => void;
}

type Stage = 'email' | 'password' | 'phone' | 'success';

const COUNTRIES = [
  { code: '+27', label: 'ZA' },
  { code: '+266', label: 'LS' },
  { code: '+267', label: 'BW' },
  { code: '+268', label: 'SZ' },
  { code: '+263', label: 'ZW' },
  { code: '+44', label: 'UK' },
  { code: '+1', label: 'US' },
  { code: '+971', label: 'AE' },
];

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const },
};

export function PasswordGate({ onAuthenticated }: PasswordGateProps) {
  const [stage, setStage] = useState<Stage>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dial, setDial] = useState('+27');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const enterSite = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    onAuthenticated();
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('enter a valid email.');
      return;
    }
    setError('');
    setStage('phone');
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('site-access', {
        body: { password },
      });
      if (fnError || !data?.valid) {
        setError('incorrect.');
        return;
      }
      enterSite();
    } catch {
      setError('something went wrong. try again.');
    } finally {
      setChecking(false);
    }
  };

  const submitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length < 7) {
      setError('enter a valid phone number.');
      return;
    }
    setError('');
    try {
      const list = JSON.parse(localStorage.getItem('sigma-early-access') || '[]');
      list.push({ email, phone: `${dial}${phone}`, at: new Date().toISOString() });
      localStorage.setItem('sigma-early-access', JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setStage('success');
  };

  const inputClass =
    'w-full bg-transparent border-0 border-b border-foreground/20 focus:border-foreground focus:outline-none py-3 text-sm tracking-wide placeholder:text-foreground/35 transition-colors';

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground overflow-y-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          {...fade}
          className="min-h-full flex flex-col items-center justify-center px-6 py-24"
        >
          <div className="w-full max-w-sm flex flex-col items-center">
            <Logo className="h-14 mb-20" />

            {stage === 'email' && (
              <form onSubmit={submitEmail} className="w-full">
                <div className="flex w-full items-stretch gap-2">
                  <div className="flex flex-1 min-w-0 items-center rounded-full bg-muted-foreground/10 px-4">
                    <input
                      type="email"
                      autoFocus
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="EMAIL ADDRESS"
                      className="w-full min-w-0 bg-transparent border-0 focus:outline-none py-3.5 text-xs tracking-[0.06em] placeholder:text-foreground/40"
                      style={MONO}
                      autoComplete="email"
                    />
                  </div>
                  <button
                    type="submit"
                    aria-label="Continue"
                    className="shrink-0 rounded-full bg-foreground text-background px-5 flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="h-5 mt-4 text-center">
                  {error && (
                    <p className="text-xs lowercase tracking-wider text-muted-foreground" style={MONO}>
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStage('password');
                  }}
                  className="mt-10 w-full text-center text-[11px] lowercase tracking-[0.2em] text-foreground/60 hover:text-foreground transition-colors"
                  style={MONO}
                >
                  <span className="inline-flex items-center gap-3">
                    <Lock size={16} strokeWidth={1.5} color="#111111" />
                    Enter using password
                  </span>
                </button>
              </form>
            )}

            {stage === 'password' && (
              <form onSubmit={submitPassword} className="w-full">
                <div className="flex w-full items-stretch gap-2">
                  <div className="flex flex-1 min-w-0 items-center rounded-full bg-muted-foreground/10 px-4">
                    <input
                      type="password"
                      autoFocus
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="PASSWORD"
                      className="w-full min-w-0 bg-transparent border-0 focus:outline-none py-3.5 text-xs tracking-[0.06em] placeholder:text-foreground/40"
                      style={MONO}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={checking}
                    className="shrink-0 rounded-full bg-foreground text-background px-5 text-[10px] uppercase tracking-[0.14em] font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {checking ? '...' : 'Enter'}
                  </button>
                </div>
                <div className="h-5 mt-4 text-center">
                  {error && (
                    <p className="text-xs lowercase tracking-wider text-muted-foreground" style={MONO}>
                      {error}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setStage('email');
                  }}
                  className="mt-8 w-full text-center text-[11px] lowercase tracking-[0.2em] text-foreground/60 hover:text-foreground transition-colors"
                  style={MONO}
                >
                  back to early access
                </button>
              </form>
            )}


            {stage === 'phone' && (
              <form onSubmit={submitPhone} className="w-full">
                <h2 className="text-center text-xl md:text-2xl font-bold tracking-[-0.03em] uppercase mb-8" style={{ fontFamily: 'var(--font-body)' }}>
                  GET ACCESS
                </h2>

                <div className="flex w-full items-stretch gap-2">
                  <div className="flex flex-1 min-w-0 items-center rounded-full bg-muted-foreground/10 pl-3 pr-1">
                    <select
                      value={dial}
                      onChange={(e) => setDial(e.target.value)}
                      className="shrink-0 bg-transparent border-0 focus:outline-none text-[10px] tracking-tight text-foreground/70 pr-1 cursor-pointer"
                      style={MONO}
                      aria-label="Country code"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label} {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      autoFocus
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError('');
                      }}
                      placeholder="PHONE NUMBER"
                      className="w-full min-w-0 bg-transparent border-0 focus:outline-none py-3.5 text-xs tracking-[0.06em] placeholder:text-foreground/40"
                      style={MONO}
                      autoComplete="tel"
                    />
                  </div>
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-foreground text-background px-4 text-[10px] uppercase tracking-[0.14em] font-semibold hover:opacity-90 transition-opacity"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Sign Up
                  </button>
                </div>


                <div className="h-5 mt-4 text-center">
                  {error && (
                    <p className="text-xs lowercase tracking-wider text-muted-foreground" style={MONO}>
                      {error}
                    </p>
                  )}
                </div>


                <p className="mt-10 text-center text-[10px] leading-relaxed tracking-wide text-muted-foreground">
                  By signing up you agree to receive updates about future drops, launch
                  announcements and exclusive releases from SIGMA. You can unsubscribe at any
                  time.
                </p>
              </form>
            )}

            {stage === 'success' && (
              <div className="w-full text-center">
                <h2 className="text-center text-xl md:text-2xl font-bold tracking-[-0.03em] uppercase" style={{ fontFamily: 'var(--font-body)' }}>YOU'RE IN.</h2>
                <p className="mt-8 text-xs leading-relaxed tracking-wide text-muted-foreground">
                  You'll be the first to know when SIGMA officially launches.
                </p>
                <p className="mt-3 text-xs leading-relaxed tracking-wide text-muted-foreground">
                  Thank you for joining the movement.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('');
                    setPhone('');
                    setStage('email');
                  }}
                  className="mt-12 w-full rounded-full border border-foreground py-3 text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-foreground hover:text-background transition-colors"
                >
                  Return to Home
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY) === 'true';
}
