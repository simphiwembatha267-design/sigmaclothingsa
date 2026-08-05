import { Link } from 'react-router-dom';

const links = [
  { label: 'FAQs', to: '/legal#faqs' },
  { label: 'Terms + Conditions', to: '/legal#terms' },
  { label: 'Privacy Policy', to: '/legal#privacy' },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container-editorial py-14 md:py-16">
        <div className="flex flex-col items-center text-center gap-5">
          <nav className="flex items-center justify-center flex-wrap gap-x-2 gap-y-2 text-muted-foreground">
            {links.map((link, i) => (
              <span key={link.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="text-muted-foreground/50">/</span>}
                <Link
                  to={link.to}
                  className="text-sm tracking-wide hover:text-foreground transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            © {new Date().getFullYear()}, Sigma
          </p>
        </div>
      </div>
    </footer>
  );
}
