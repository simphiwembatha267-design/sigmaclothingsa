import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X } from 'lucide-react';
import { CURRENCIES, useCurrency, useCurrencyStore } from '@/lib/currency';

export function CurrencySelect() {
  const [open, setOpen] = useState(false);
  const current = useCurrency();
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change currency — currently ${current.country}, ${current.code}`}
        className="mt-10 w-full flex items-center justify-between gap-4 border border-white/20 px-5 py-4 hover:border-white/40 transition-colors"
      >
        <span className="text-[11px] uppercase tracking-[0.3em] text-background/85">
          {current.country}
        </span>
        <span className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-background/60">
          {current.code} {current.symbol.trim()}
          <ChevronDown className="w-4 h-4" strokeWidth={1.25} />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-xl text-background"
            role="dialog"
            aria-modal="true"
            aria-label="Select currency"
          >
            <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
              <span className="text-[10px] uppercase tracking-[0.4em] text-background/60">
                Currency
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close currency selector" className="p-2 -mr-2">
                <X className="w-5 h-5" strokeWidth={1.25} />
              </button>
            </div>
            <ul
              role="listbox"
              className="h-[calc(100dvh-4rem)] overflow-y-auto px-6 py-4"
              style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
            >
              {CURRENCIES.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.code === current.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-4 py-4 border-b border-white/[0.08] text-left"
                  >
                    <span className="text-sm font-semibold tracking-[0.02em] text-background/90" style={{ fontFamily: 'var(--font-body), sans-serif' }}>
                      {c.country}
                    </span>
                    <span className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-background/60">
                      {c.code} {c.symbol.trim()}
                      {c.code === current.code && <Check className="w-4 h-4" strokeWidth={1.5} />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
