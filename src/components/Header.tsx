import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
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

    ],
  },
  {
    label: 'Info',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/shop', label: 'Size Guide' },
    ],
  },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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




      {/* Full-screen mobile menu overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 md:hidden text-background"
          >
            {/* Background image with dark overlay */}
            <div className="absolute inset-0 -z-10">
              <img
                src={heroImage}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover grayscale"
              />

              <div className="absolute inset-0 bg-black/80" />
            </div>

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
              className="relative flex flex-col justify-between h-[calc(100dvh-4rem)] px-8 pt-14 overflow-y-auto"
              style={{ paddingBottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}
            >
              <nav className="flex flex-col gap-16">
                {mobileNavGroups.map((group, gIdx) => (
                  <motion.div
                    key={group.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + gIdx * 0.08, duration: 0.5 }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.4em] text-background/50 mb-6">
                      {group.label}
                    </p>
                    <ul className="flex flex-col gap-5">
                      {group.links.map((link) => (
                        <li key={link.label}>
                            <Link
                            to={link.href}
                            className="block text-2xl font-semibold tracking-[0.02em] text-background/95 hover:text-background transition-colors"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="pt-12 mt-12 border-t border-white/10"
              >
                <button
                  onClick={() => { openCart(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-background/60 hover:text-background transition-colors mb-8"
                >
                  <BagIcon className="w-4 h-4" />
                  Cart ({itemCount()})
                </button>
                <p className="text-[10px] uppercase tracking-[0.4em] text-background/40">
                  © {new Date().getFullYear()} Sigma
                </p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-background/40 mt-2">
                  Designed in South Africa
                </p>
              </motion.div>
            </div>
          </motion.div>

        )}
      </AnimatePresence>
    </>
  );
}
