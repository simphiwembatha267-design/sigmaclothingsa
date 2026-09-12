import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Facebook, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/sigma.sa25', Icon: Instagram, isLucide: true },
  { label: 'TikTok', href: 'https://tiktok.com/@sigma.sa25', Icon: TikTokIcon, isLucide: false },
  { label: 'Facebook', href: 'https://facebook.com', Icon: Facebook, isLucide: true },
];

const helpLinks = [
  { label: 'Contact', href: '/contact' },
  { label: 'Size Guide', href: '/shop' },
  { label: 'FAQs', href: '/legal#faqs' },
  { label: 'Terms', href: '/legal#terms' },
  { label: 'Shipping', href: '/legal#shipping' },
];

export function Footer() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <footer className="relative z-30 w-full border-t border-border bg-background">
      <div className="relative mx-auto max-w-[1800px] px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between sm:h-[72px]">
          {/* Social icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {socialLinks.map(({ label, href, Icon, isLucide }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-1.5 text-foreground hover:text-foreground transition-colors"
              >
                {isLucide ? (
                  <Icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" strokeWidth={2.25} />
                ) : (
                  <Icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                )}
              </a>
            ))}
          </div>

          {/* Center logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <Logo className="h-5 sm:h-6" />
          </Link>

          {/* Need help dropdown */}
          <div className="relative">
            <button
              onClick={() => setHelpOpen((v) => !v)}
              className="flex items-center gap-1 sm:gap-1.5 py-1.5 pl-2 pr-1 sm:pl-2.5 sm:pr-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-foreground hover:text-foreground transition-colors"
              style={{ fontFamily: 'var(--font-body), sans-serif' }}
              aria-expanded={helpOpen}
              aria-label="Need help"
            >
              Need Help?
              <ChevronDown
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${helpOpen ? 'rotate-180' : ''}`}
                strokeWidth={2}
              />
            </button>

            <AnimatePresence>
              {helpOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute bottom-full right-0 mb-2 min-w-[140px] overflow-hidden rounded-[20px] border border-border/50 bg-background/95 py-2 shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.25)] backdrop-blur-md"
                >
                  {helpLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setHelpOpen(false)}
                      className="block px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      style={{ fontFamily: 'var(--font-body), sans-serif' }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </footer>
  );
}
