import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import heroImage from '@/assets/hero-main.jpg';

const MONO = { fontFamily: "'DM Mono', monospace" } as const;

export interface Country {
  name: string;
  iso: string;
  dial: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: 'South Africa', iso: 'ZA', dial: '+27', flag: '🇿🇦' },
  { name: 'Botswana', iso: 'BW', dial: '+267', flag: '🇧🇼' },
  { name: 'Eswatini', iso: 'SZ', dial: '+268', flag: '🇸🇿' },
  { name: 'Lesotho', iso: 'LS', dial: '+266', flag: '🇱🇸' },
  { name: 'Namibia', iso: 'NA', dial: '+264', flag: '🇳🇦' },
  { name: 'Mozambique', iso: 'MZ', dial: '+258', flag: '🇲🇿' },
  { name: 'Zimbabwe', iso: 'ZW', dial: '+263', flag: '🇿🇼' },
  { name: 'Zambia', iso: 'ZM', dial: '+260', flag: '🇿🇲' },
  { name: 'Kenya', iso: 'KE', dial: '+254', flag: '🇰🇪' },
  { name: 'Nigeria', iso: 'NG', dial: '+234', flag: '🇳🇬' },
  { name: 'Ghana', iso: 'GH', dial: '+233', flag: '🇬🇭' },
  { name: 'Egypt', iso: 'EG', dial: '+20', flag: '🇪🇬' },
  { name: 'United Kingdom', iso: 'GB', dial: '+44', flag: '🇬🇧' },
  { name: 'United States', iso: 'US', dial: '+1', flag: '🇺🇸' },
  { name: 'Canada', iso: 'CA', dial: '+1', flag: '🇨🇦' },
  { name: 'France', iso: 'FR', dial: '+33', flag: '🇫🇷' },
  { name: 'Germany', iso: 'DE', dial: '+49', flag: '🇩🇪' },
  { name: 'Italy', iso: 'IT', dial: '+39', flag: '🇮🇹' },
  { name: 'Spain', iso: 'ES', dial: '+34', flag: '🇪🇸' },
  { name: 'Netherlands', iso: 'NL', dial: '+31', flag: '🇳🇱' },
  { name: 'Portugal', iso: 'PT', dial: '+351', flag: '🇵🇹' },
  { name: 'United Arab Emirates', iso: 'AE', dial: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', iso: 'SA', dial: '+966', flag: '🇸🇦' },
  { name: 'Australia', iso: 'AU', dial: '+61', flag: '🇦🇺' },
  { name: 'New Zealand', iso: 'NZ', dial: '+64', flag: '🇳🇿' },
  { name: 'India', iso: 'IN', dial: '+91', flag: '🇮🇳' },
  { name: 'Japan', iso: 'JP', dial: '+81', flag: '🇯🇵' },
  { name: 'China', iso: 'CN', dial: '+86', flag: '🇨🇳' },
  { name: 'Brazil', iso: 'BR', dial: '+55', flag: '🇧🇷' },
];

interface Props {
  value: Country;
  onChange: (c: Country) => void;
}

export function CountrySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? COUNTRIES.filter(
          (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.iso.toLowerCase() === q
        )
      : COUNTRIES;
    return list;
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Select country"
        className="shrink-0 flex items-center gap-1.5 pr-3 mr-1 border-r border-foreground/15"
      >
        <span className="text-base leading-none">{value.flag}</span>
        <span className="text-[11px] tracking-tight text-foreground/70" style={MONO}>
          {value.dial}
        </span>
        <ChevronDown className="w-3 h-3 text-foreground/50" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[120] text-background"
          >
            <div className="absolute inset-0 -z-10">
              <img
                src={heroImage}
                alt=""
                className="w-full h-full object-cover grayscale scale-110 blur-2xl"
              />
              <div className="absolute inset-0 bg-black/85" />
            </div>

            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col h-[100dvh]"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
                <p className="text-[10px] uppercase tracking-[0.4em] text-background/60">Country</p>
                <button onClick={() => setOpen(false)} className="p-2 -mr-2" aria-label="Close">
                  <X className="w-5 h-5" strokeWidth={1.25} />
                </button>
              </div>

              <div className="px-6 pt-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-background/40" strokeWidth={1.5} />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SEARCH COUNTRY"
                    className="w-full bg-transparent border-0 focus:outline-none py-1 text-xs tracking-[0.2em] uppercase placeholder:text-background/40 text-background"
                    style={MONO}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-[env(safe-area-inset-bottom)]">
                {results.map((c) => {
                  const selected = c.iso === value.iso;
                  return (
                    <button
                      key={c.iso}
                      type="button"
                      onClick={() => {
                        onChange(c);
                        setOpen(false);
                        setQuery('');
                      }}
                      className="w-full flex items-center gap-4 py-4 border-b border-white/[0.07] text-left"
                    >
                      <span className="text-lg leading-none">{c.flag}</span>
                      <span
                        className={`flex-1 text-sm tracking-[0.02em] ${
                          selected ? 'text-background' : 'text-background/80'
                        }`}
                        style={{ fontFamily: 'var(--font-body), sans-serif', fontWeight: 600 }}
                      >
                        {c.name}
                      </span>
                      {selected && <Check className="w-4 h-4 text-background" strokeWidth={1.5} />}
                      <span className="text-[11px] tabular-nums text-background/55" style={MONO}>
                        {c.dial}
                      </span>
                    </button>
                  );
                })}
                {results.length === 0 && (
                  <p className="py-10 text-center text-xs tracking-[0.2em] uppercase text-background/40" style={MONO}>
                    No results
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
