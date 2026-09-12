import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import sigmaLockup from '@/assets/sigma-lockup.png';
import newsletterImageAsset from '@/assets/sigma-newsletter-orange.jpg.asset.json';

const STORAGE_KEY = 'sigma-newsletter-dismissed';

export function NewsletterModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = window.setTimeout(() => setIsVisible(true), 1000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!agreed || status === 'loading') return;

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setStatus('loading');
    try {
      const { data, error: signupError } = await supabase.functions.invoke('newsletter-signup', {
        body: { email: normalizedEmail, source: 'popup' },
      });
      if (signupError || !data?.ok) {
        setError('Something went wrong. Please try again.');
        setStatus('idle');
        return;
      }
      setStatus('success');
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      setError('Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/70 px-5 py-6 sm:px-8"
          role="dialog"
          aria-modal="true"
          aria-label="Join the SIGMA newsletter"
        >
          <button className="absolute inset-0 cursor-default" onClick={handleClose} aria-label="Close newsletter backdrop" />

          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative h-[min(720px,calc(100dvh-32px))] w-full max-w-[430px] overflow-hidden bg-foreground text-background shadow-2xl sm:h-[min(760px,calc(100dvh-48px))]"
          >
            <img
              src={newsletterImageAsset.url}
              alt="SIGMA orange back design"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-foreground/42" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute right-3 top-3 z-10 text-background hover:bg-background/10 hover:text-background"
              aria-label="Close newsletter modal"
            >
              <X className="h-7 w-7" strokeWidth={3} />
            </Button>

            <div className="relative z-[1] flex h-full flex-col px-5 pb-7 pt-[19%] text-center sm:px-7 sm:pb-9">
              {status === 'success' ? (
                <div className="flex h-full flex-col items-center">
                  <div>
                    <h2 className="font-body text-[30px] font-bold uppercase leading-none sm:text-[34px]">You're In</h2>
                    <p className="mt-3 font-body text-sm font-semibold uppercase sm:text-base">Check Your Email</p>
                  </div>
                  <img src={sigmaLockup} alt="SIGMA Clothing" className="mt-[40%] h-auto w-44 invert sm:w-52" />
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleClose}
                    className="mt-auto h-auto p-0 font-body text-base font-medium uppercase text-background underline underline-offset-2 hover:text-background/80 sm:text-lg"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="font-body text-[27px] font-bold uppercase leading-none sm:text-[32px]">Never Miss A Drop</h2>
                    <p className="mt-2 font-body text-sm font-semibold uppercase sm:text-base">Get The Updates</p>
                  </div>

                  <img src={sigmaLockup} alt="SIGMA Clothing" className="mx-auto mt-[25%] h-auto w-44 invert sm:mt-[27%] sm:w-52" />

                  <form onSubmit={handleSubmit} className="mt-auto w-full">
                    <Input
                      type="email"
                      value={email}
                      onChange={(event) => { setEmail(event.target.value); setError(''); }}
                      placeholder="Email Address"
                      required
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="h-14 rounded-none border-0 bg-foreground px-4 text-center font-body text-base normal-case text-background placeholder:text-background/65 focus-visible:ring-1 focus-visible:ring-background sm:h-16 sm:text-lg"
                    />
                    <Button
                      type="submit"
                      disabled={!agreed || status === 'loading'}
                      className="mt-3 h-14 w-full rounded-none bg-foreground font-body text-base font-semibold uppercase text-background hover:bg-foreground/90 disabled:opacity-70 sm:h-16 sm:text-lg"
                    >
                      {status === 'loading' ? 'Joining' : 'Get On The List'}
                    </Button>

                    <div className="mt-4 flex items-start gap-3 px-3 text-left">
                      <Checkbox
                        id="newsletter-terms"
                        checked={agreed}
                        onCheckedChange={(checked) => setAgreed(checked === true)}
                        className="mt-0.5 h-5 w-5 shrink-0 rounded-sm border-background bg-background data-[state=checked]:bg-background data-[state=checked]:text-foreground"
                      />
                      <label htmlFor="newsletter-terms" className="font-body text-[11px] leading-relaxed text-background sm:text-xs">
                        Terms apply. See{' '}
                        <Link to="/legal#privacy" onClick={(event) => event.stopPropagation()} className="underline underline-offset-2">privacy policy</Link>
                        {' '}and{' '}
                        <Link to="/legal#faqs" onClick={(event) => event.stopPropagation()} className="underline underline-offset-2">FAQ</Link>
                        {' '}for more details.
                      </label>
                    </div>

                    <div className="min-h-5 pt-2">
                      {error && <p className="font-body text-[11px] text-background">{error}</p>}
                    </div>

                    <Button
                      type="button"
                      variant="link"
                      onClick={handleClose}
                      className="mt-2 h-auto p-0 font-body text-base font-medium uppercase text-background underline underline-offset-2 hover:text-background/80 sm:text-lg"
                    >
                      No, Thanks
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}