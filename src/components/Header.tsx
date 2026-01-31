import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Logo } from './Logo';

const navLinks = [{
  href: '/',
  label: 'Home'
}, {
  href: '/shop',
  label: 'Shop'
}, {
  href: '/lookbook',
  label: 'Lookbook'
}, {
  href: '/about',
  label: 'About'
}, {
  href: '/contact',
  label: 'Contact'
}];
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const {
    openCart,
    itemCount
  } = useCartStore();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  return <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-background/95 backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="container-editorial">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu button */}
            <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 -ml-2" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link to="/">
              <Logo className="h-12 md:h-14" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => <Link key={link.href} to={link.href} className={`text-caption uppercase link-underline transition-colors ${location.pathname === link.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {link.label}
                </Link>)}
            </nav>

            {/* Cart button */}
            <button onClick={openCart} className="relative p-2 -mr-2" aria-label="Open cart">
              <ShoppingBag className="w-5 h-5" />
              {itemCount() > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-foreground text-background text-[10px] flex items-center justify-center">
                  {itemCount()}
                </span>}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && <>
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden" onClick={() => setIsMenuOpen(false)} />
            <motion.div initial={{
          x: '-100%'
        }} animate={{
          x: 0
        }} exit={{
          x: '-100%'
        }} transition={{
          type: 'tween',
          duration: 0.3
        }} className="fixed top-0 left-0 bottom-0 w-[280px] bg-background z-50 md:hidden">
              <div className="flex items-center justify-between h-16 px-4">
                <Logo className="h-12" />
                <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col px-4 pt-8 gap-6">
                {navLinks.map((link, index) => <motion.div key={link.href} initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: index * 0.1
            }}>
                    <Link to={link.href} className={`font-display text-2xl ${location.pathname === link.href ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {link.label}
                    </Link>
                  </motion.div>)}
              </nav>
            </motion.div>
          </>}
      </AnimatePresence>
    </>;
}