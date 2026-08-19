import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail, Phone, Send } from 'lucide-react';

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const contactDetails = [
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    value: '071 446 9681',
    href: 'https://wa.me/27714469681',
    external: true,
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'sigma.sa38@gmail.com',
    href: 'mailto:sigma.sa38@gmail.com',
    external: false,
  },
  {
    icon: Instagram,
    label: 'Instagram',
    value: '@sigma.sa25',
    href: 'https://instagram.com/sigma.sa25',
    external: true,
  },
  {
    icon: TikTokIcon,
    label: 'TikTok',
    value: '@sigma.sa25',
    href: 'https://tiktok.com/@sigma.sa25',
    external: true,
    isCustom: true,
  },
];

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="pt-20 md:pt-24 min-h-screen">
      <div className="container-editorial py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-caption uppercase text-muted-foreground mb-4">Get in Touch</p>
            <h1 className="font-display text-display-lg mb-6">Contact</h1>
            <p className="text-body-lg text-muted-foreground mb-12 max-w-md">
              Have a question about an order, want to collaborate, or just want
              to say hello? We'd love to hear from you.
            </p>

            <div className="space-y-8">
              {contactDetails.map(({ icon: Icon, label, value, href, external, isCustom }) => (
                <div className="flex items-start gap-4" key={label}>
                  {isCustom ? (
                    <Icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                  ) : (
                    <Icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                  )}
                  <div>
                    <h3 className="text-caption uppercase mb-1">{label}</h3>
                    <a
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className="text-muted-foreground hover:text-foreground transition-colors link-underline"
                    >
                      {value}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 pt-8 border-t border-border">
              <h3 className="text-caption uppercase mb-4">Customer Service Hours</h3>
              <p className="text-body-sm text-muted-foreground">
                Monday – Friday: 09:00 – 17:00 SAST<br />
                Response time: Within 24 hours
              </p>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-caption uppercase mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                  className="w-full h-12 px-4 bg-transparent border border-border text-body-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-caption uppercase mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  required
                  className="w-full h-12 px-4 bg-transparent border border-border text-body-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-caption uppercase mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  required
                  className="w-full h-12 px-4 bg-transparent border border-border text-body-sm focus:outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Select a topic</option>
                  <option value="order">Order Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="returns">Returns & Exchanges</option>
                  <option value="collab">Collaboration</option>
                  <option value="press">Press Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-caption uppercase mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-transparent border border-border text-body-sm focus:outline-none focus:border-foreground transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitted}
                className={`w-full h-14 flex items-center justify-center gap-2 text-caption uppercase transition-all ${
                  isSubmitted
                    ? 'bg-green-600 text-white'
                    : 'bg-foreground text-background hover:bg-foreground/90'
                }`}
              >
                {isSubmitted ? (
                  'Message Sent'
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
