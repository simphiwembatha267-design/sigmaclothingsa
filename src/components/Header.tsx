import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import { Menu, X, ShoppingBag, User, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import sigmaLockup from '@/assets/sigma-lockup.png';
import heroImage from '@/assets/hero-main.jpg';



function DurbanClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Africa/Johannesburg',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date())
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      className="flex flex-col leading-tight select-none"
      style={{ fontFamily: 'var(--font-body), sans-serif' }}
    >
      <span className="text-[11px] md:text-[13px] font-bold tracking-[0.01em]">Durban</span>
      <span className="text-[11px] md:text-[13px] font-bold tracking-[0.01em] tabular-nums">{time}</span>
    </div>
  );
}

function BagIcon({ className }: { className?: string }) {
  return <ShoppingBag className={className} strokeWidth={1.5} />;
}



const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const mobileNavGroups = [
  {
    label: 'Shop',
    links: [
      { href: '/shop', label: 'New Arrivals' },
      { href: '/shop?category=Tops', label: 'Tops' },
      { href: '/shop?category=Bottoms', label: 'Bottoms' },
      { href: '/shop?category=Outerwear', label: 'Outerwear' },
      { href: '/shop?category=Accessories', label: 'Accessories' },
      { href: '/shop', label: 'All Products' },
    ],
  },
  {
    label: 'Info',
    links: [
      { href: '/about', label: 'About Sigma' },
      { href: '/contact', label: 'Contact' },
      { href: '/shop', label: 'Size Guide' },
      { href: '/legal', label: 'Shipping & Returns' },
    ],
  },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuEmail, setMenuEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const location = useLocation();
  const { openCart, itemCount } = useCartStore();
  


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5 lg:px-8 pt-3 sm:pt-4">
        <div
          className={`relative rounded-[28px] md:rounded-[36px] transition-all duration-500 ${
            isScrolled
              ? 'bg-background/90 backdrop-blur-md shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.25)]'
              : 'bg-background/75 backdrop-blur-md shadow-[0_8px_30px_-14px_hsl(var(--foreground)/0.2)]'
          }`}
        >
          <div className="relative flex items-center h-14 md:h-20 px-4 sm:px-6 md:px-10">
            {/* Left: hamburger + clock */}
            <div className="flex items-center gap-4 md:gap-8">
              <button onClick={() => setIsMenuOpen(true)} className="p-1.5 -ml-1.5" aria-label="Open menu">
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <DurbanClock />
            </div>

            {/* Center: logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <Logo className="h-7 md:h-10" />
            </Link>

            {/* Right: account + bag */}
            <div className="flex items-center gap-4 md:gap-8 ml-auto">
              <Link to="/admin" className="p-1.5" aria-label="Account">
                <User className="w-5 h-5" strokeWidth={1.5} />
              </Link>

              <button onClick={openCart} className="relative p-1.5 -mr-1.5" aria-label="Open cart">
                <BagIcon className="w-5 h-5" />
                {itemCount() > 0 && (
                  <span
                    className="absolute top-0 right-0 text-[10px] font-semibold text-foreground leading-none tabular-nums"
                    style={{ fontFamily: 'var(--font-body), sans-serif' }}
                  >
                    {itemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>


      </header>




      {/* Full-screen navigation overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 h-[100dvh] z-50 text-background overflow-hidden"
          >
            {/* Homepage hero → blurred, darkened background */}
            <motion.div
              initial={{ scale: 1.12, opacity: 0.4 }}
              animate={{ scale: 1.06, opacity: 1 }}
              exit={{ scale: 1.12, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 -z-10"
            >
              <img
                src={heroImage}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover grayscale blur-xl"
              />
              <div className="absolute inset-0 bg-black/75" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80" />
            </motion.div>

            {/* Top bar */}
            <div className="relative flex items-center justify-between h-16 px-6 border-b border-white/10">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center">
                <img
                  src={sigmaLockup}
                  alt="Sigma Clothing"
                  className="h-6 invert w-auto object-contain select-none"
                  draggable={false}
                />
              </Link>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-background" aria-label="Close menu">
                <X className="w-5 h-5" strokeWidth={1.25} />
              </button>
            </div>

            {/* Content */}
            <div
              className="relative h-[calc(100dvh-4rem)] px-8 pt-12 overflow-y-auto"
              style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}
            >
              <div className="mx-auto w-full max-w-md md:max-w-lg">
                <nav className="flex flex-col gap-12">
                  {mobileNavGroups.map((group, gIdx) => (
                    <motion.div
                      key={group.label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + gIdx * 0.08, duration: 0.5 }}
                    >
                      <p className="text-[10px] uppercase tracking-[0.4em] text-background/45 mb-6">
                        {group.label}
                      </p>
                      <ul className="flex flex-col">
                        {group.links.map((link) => (
                          <li key={link.label} className="border-b border-white/[0.08]">
                            <Link
                              to={link.href}
                              className="block py-4 text-xl font-semibold tracking-[0.02em] text-background/90 hover:text-background transition-colors"
                              style={{ fontFamily: 'var(--font-body), sans-serif' }}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.5 }}
                  className="mt-14"
                >
                  <button
                    onClick={() => { openCart(); setIsMenuOpen(false); }}
                    className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-background/70 hover:text-background transition-colors"
                  >
                    <BagIcon className="w-4 h-4" />
                    Cart ({itemCount()})
                  </button>

                  {/* Country / currency */}
                  <CurrencySelect />

                  {/* Newsletter */}
                  <form onSubmit={submitSignup} className="mt-12">
                    <div className="flex items-center gap-4 border-b border-white/25 pb-3">
                      <input
                        type="email"
                        required
                        value={menuEmail}
                        onChange={(e) => { setMenuEmail(e.target.value); setSignupError(''); }}
                        placeholder="Email address"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        inputMode="email"
                        aria-label="Email address"
                        className="flex-1 min-w-0 bg-transparent border-0 focus:outline-none text-[12px] normal-case tracking-[0.06em] lowercase text-background placeholder:text-background/45 placeholder:normal-case py-1"
                      />
                    </div>
                    <div className="mt-5 flex items-center gap-4 border-b border-white/25 pb-3">
                      <input
                        type="tel"
                        required
                        value={menuPhone}
                        onChange={(e) => { setMenuPhone(e.target.value); setSignupError(''); }}
                        placeholder="PHONE NUMBER"
                        autoComplete="tel"
                        aria-label="Phone number"
                        className="flex-1 min-w-0 bg-transparent border-0 focus:outline-none text-[11px] uppercase tracking-[0.25em] text-background placeholder:text-background/45 py-1"
                      />
                      <button
                        type="submit"
                        disabled={signupState === 'loading' || signupState === 'success'}
                        className="shrink-0 text-[11px] uppercase tracking-[0.25em] text-background/80 hover:text-background disabled:opacity-60 transition-colors"
                      >
                        {signupState === 'loading' ? 'Sending' : signupState === 'success' ? 'Joined' : 'Sign Up'}
                      </button>
                    </div>
                    <div className="min-h-[1.25rem] mt-3">
                      {signupError && (
                        <p className="text-[10px] tracking-[0.15em] text-background/60">{signupError}</p>
                      )}
                      {signupState === 'success' && (
                        <p className="text-[10px] uppercase tracking-[0.25em] text-background/60">
                          You're on the list.
                        </p>
                      )}
                    </div>
                  </form>


                  <div className="mt-14 pt-8 border-t border-white/10">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-background/35">
                      © {new Date().getFullYear()} Sigma
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-background/35 mt-2">
                      Designed in South Africa
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
