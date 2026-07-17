import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Logo } from './Logo';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const STORAGE_KEY = 'sigma-newsletter-dismissed';

export function NewsletterModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !agreed) return;
    handleClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Join the SIGMA newsletter"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-[520px] bg-white rounded-[18px] p-8 sm:p-12 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 text-black/60 hover:text-black transition-colors"
              aria-label="Close newsletter modal"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center">
              {/* Logo */}
              <Logo className="h-10 sm:h-12 text-black mb-8 sm:mb-10" />

              {/* Headline */}
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-black mb-3"
                style={{ fontFamily: 'var(--font-body), sans-serif' }}
              >
                Join the Movement
              </h2>

              {/* Subheading */}
              <p
                className="text-sm sm:text-base font-semibold tracking-wide text-black/70 mb-8 sm:mb-10"
                style={{ fontFamily: 'var(--font-body), sans-serif' }}
              >
                Get exclusive access to every drop.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 sm:h-14 w-full rounded-none border-0 border-b border-black bg-transparent px-0 text-sm sm:text-base font-medium text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:border-black"
                  style={{ fontFamily: 'var(--font-body), sans-serif' }}
                />
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 sm:h-14 w-full rounded-none border-0 border-b border-black bg-transparent px-0 text-sm sm:text-base font-medium text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:border-black"
                  style={{ fontFamily: 'var(--font-body), sans-serif' }}
                />

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="agree"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked === true)}
                    required
                    className="mt-0.5 h-4 w-4 rounded-none border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
                  />
                  <label
                    htmlFor="agree"
                    className="text-xs sm:text-sm font-medium text-black/70 text-left leading-relaxed cursor-pointer"
                    style={{ fontFamily: 'var(--font-body), sans-serif' }}
                  >
                    I agree to receive emails from SIGMA and accept the Privacy Policy.
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-4 sm:mt-6 h-11 sm:h-12 px-8 sm:px-10 rounded-full border border-black bg-white text-black text-xs sm:text-sm font-semibold tracking-wide uppercase hover:bg-black hover:text-white transition-colors duration-300"
                  style={{ fontFamily: 'var(--font-body), sans-serif' }}
                >
                  Join Now
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
