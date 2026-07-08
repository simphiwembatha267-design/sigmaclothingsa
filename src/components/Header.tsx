import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Logo } from './Logo';
import menuBg from '@/assets/lookbook-1.jpg';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const mobileNavGroups = [
  {
    label: 'Shop',
    links: [
      { href: '/shop', label: 'New Arrivals' },
      { href: '/shop?category=T-Shirts', label: 'T-Shirts' },
      { href: '/shop?category=Hoodies', label: 'Hoodies' },
      { href: '/shop?category=Outerwear', label: 'Outerwear' },
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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-background/95 backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="container-editorial">
          <nav className="flex items-center justify-between h-16 md:h-20">
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 -ml-2" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/">
              <Logo className="h-12 md:h-14" />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href} className={`text-caption uppercase link-underline transition-colors ${location.pathname === link.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <button onClick={openCart} className="relative p-2 -mr-2" aria-label="Open cart">
              <ShoppingBag className="w-5 h-5" />
              {itemCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-foreground text-background text-[10px] flex items-center justify-center">
                  {itemCount()}
                </span>
              )}
            </button>
          </nav>
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
            className="fixed inset-0 z-50 md:hidden bg-background text-foreground"
          >
            {/* Top bar */}
            <div className="relative flex items-center justify-between h-16 px-6 border-b border-border/40">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <Logo className="h-10" />
              </Link>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2" aria-label="Close menu">
                <X className="w-5 h-5" strokeWidth={1.25} />
              </button>
            </div>

            {/* Content */}
            <div className="relative flex flex-col justify-between h-[calc(100vh-4rem)] px-8 py-14 overflow-y-auto">
              <nav className="flex flex-col gap-16">
                {mobileNavGroups.map((group, gIdx) => (
                  <motion.div
                    key={group.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + gIdx * 0.08, duration: 0.5 }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
                      {group.label}
                    </p>
                    <ul className="flex flex-col gap-5">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            to={link.href}
                            className="block text-2xl font-light tracking-wide text-foreground/90 hover:text-foreground transition-colors"
                            style={{ fontFamily: 'var(--font-display), serif' }}
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
                className="pt-12 mt-12 border-t border-border/40"
              >
                <button
                  onClick={() => { openCart(); setIsMenuOpen(false); }}
                  className="flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                  <ShoppingBag className="w-4 h-4" strokeWidth={1.25} />
                  Cart ({itemCount()})
                </button>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
                  © {new Date().getFullYear()} Sigma
                </p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70 mt-2">
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
