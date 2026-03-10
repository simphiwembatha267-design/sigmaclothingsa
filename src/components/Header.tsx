import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Logo } from './Logo';
import heroImage from '@/assets/hero-main.jpg';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Background hero image with dark overlay */}
            <div className="absolute inset-0">
              <img src={heroImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/90" />
            </div>

            {/* Top bar */}
            <div className="relative flex items-center justify-between h-16 px-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <Logo className="h-12 brightness-0 invert" />
              </Link>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { openCart(); setIsMenuOpen(false); }}
                  className="text-white/70 text-caption uppercase tracking-wider"
                >
                  Cart ({itemCount()})
                </button>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-white" aria-label="Close menu">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Nav links */}
            <nav className="relative flex flex-col px-6 pt-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.06, duration: 0.4 }}
                >
                  <Link
                    to={link.href}
                    className={`block py-3 text-xl font-bold uppercase tracking-widest ${
                      location.pathname === link.href ? 'text-white' : 'text-white/60'
                    }`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
