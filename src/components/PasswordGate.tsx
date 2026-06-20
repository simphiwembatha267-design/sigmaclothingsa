import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

const SITE_PASSWORD = 'SIGMA2024';
const STORAGE_KEY = 'sigma-authed';

interface PasswordGateProps {
  onAuthenticated: () => void;
}

export function PasswordGate({ onAuthenticated }: PasswordGateProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [stage, setStage] = useState<'gate' | 'welcome'>('gate');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value === SITE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setError(false);
      setStage('welcome');
      window.setTimeout(() => {
        onAuthenticated();
      }, 2600);
    } else {
      setError(true);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {stage === 'gate' ? (
        <motion.div
          key="gate"
          className="fixed inset-0 z-[100] bg-background text-foreground flex flex-col items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex flex-col items-center w-full max-w-sm">
            <Logo className="h-16 mb-16" />

            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
              <input
                type="password"
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="enter password"
                className="w-full bg-transparent border-0 border-b border-foreground/30 focus:border-foreground focus:outline-none text-center py-3 text-base tracking-wide placeholder:text-foreground/40 placeholder:lowercase transition-colors"
                style={{ fontFamily: "'DM Mono', monospace" }}
                autoComplete="off"
                spellCheck={false}
              />

              <div className="h-6 mt-6">
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs lowercase tracking-wider text-muted-foreground"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    incorrect.
                  </motion.p>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="welcome"
          className="fixed inset-0 z-[100] bg-foreground text-background flex flex-col items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl italic font-light tracking-wide"
          >
            you're in.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-6 text-xs md:text-sm lowercase tracking-[0.3em]"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            welcome to sigma.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY) === 'true';
}
