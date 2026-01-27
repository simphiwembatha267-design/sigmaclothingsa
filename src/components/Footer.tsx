import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

const footerLinks = {
  shop: [
    { label: 'New Arrivals', href: '/shop' },
    { label: 'Hoodies', href: '/shop?category=Hoodies' },
    { label: 'T-Shirts', href: '/shop?category=T-Shirts' },
    { label: 'Pants', href: '/shop?category=Pants' },
    { label: 'Outerwear', href: '/shop?category=Outerwear' },
  ],
  info: [
    { label: 'About', href: '/about' },
    { label: 'Lookbook', href: '/lookbook' },
    { label: 'Contact', href: '/contact' },
    { label: 'Size Guide', href: '/shop' },
  ],
  legal: [
    { label: 'Terms & Conditions', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Shipping', href: '#' },
    { label: 'Returns', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container-editorial section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="font-display text-2xl tracking-widest uppercase">
              Sigma
            </Link>
            <p className="mt-4 text-body-sm text-background/60 max-w-xs">
              Avant-garde streetwear for the modern individual. Tokyo. Paris. London.
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-caption uppercase hover:text-background/80 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @sigmaofficial
            </a>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-caption uppercase mb-6">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-body-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-caption uppercase mb-6">Info</h4>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-body-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-caption uppercase mb-6">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-body-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-12 mt-12 border-t border-background/10">
          <p className="text-caption text-background/40">
            © {new Date().getFullYear()} Sigma. All rights reserved.
          </p>
          <p className="text-caption text-background/40 mt-2 md:mt-0">
            Designed in Tokyo. Made with intention.
          </p>
        </div>
      </div>
    </footer>
  );
}
