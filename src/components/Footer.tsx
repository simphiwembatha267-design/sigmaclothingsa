import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { Logo } from './Logo';

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
      <div className="container-editorial py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-caption text-background/40">
            © {new Date().getFullYear()} Sigma. All rights reserved.
          </p>
          <p className="text-caption text-background/40">
            Designed in South Africa.
          </p>
        </div>
      </div>
    </footer>
  );
}
