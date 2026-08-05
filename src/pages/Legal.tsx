import { motion } from 'framer-motion';

const sections = [
  {
    id: 'faqs',
    title: 'FAQs',
    body: [
      ['How long does delivery take?', 'Orders are dispatched within 1–3 working days. Local delivery in South Africa takes 2–5 working days.'],
      ['Do you ship internationally?', 'Yes. International delivery times vary between 7–14 working days.'],
      ['Can I exchange an item?', 'Unworn items in original packaging can be exchanged within 14 days of delivery.'],
      ['How do I track my order?', 'A tracking link is emailed to you the moment your parcel leaves our studio.'],
    ],
  },
  {
    id: 'terms',
    title: 'Terms + Conditions',
    body: [
      ['Orders', 'All orders are subject to availability. Prices are listed in South African Rand and include VAT where applicable.'],
      ['Returns', 'Items must be returned unworn, unwashed and with all tags attached within 14 days of delivery.'],
      ['Intellectual property', 'All imagery, graphics and garment designs remain the property of SIGMA and may not be reproduced.'],
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    body: [
      ['What we collect', 'Contact details you provide at checkout or sign-up: name, email, phone number and delivery address.'],
      ['How we use it', 'To fulfil orders, provide support and — only with your consent — share drop announcements.'],
      ['Your control', 'You can request access to or deletion of your data at any time by contacting us.'],
    ],
  },
];

export default function Legal() {
  return (
    <div className="pt-20 md:pt-24">
      <section className="container-editorial py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-caption uppercase text-muted-foreground mb-4">Information</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.02em]" style={{ fontFamily: 'var(--font-body)' }}>
            FAQs, Terms &amp; Privacy
          </h1>
        </motion.div>
      </section>

      <section className="container-editorial pb-24 max-w-3xl">
        {sections.map((section) => (
          <div key={section.id} id={section.id} className="scroll-mt-28 border-t border-border py-10 md:py-14">
            <h2 className="text-xl md:text-2xl font-bold tracking-[-0.02em] mb-8" style={{ fontFamily: 'var(--font-body)' }}>
              {section.title}
            </h2>
            <dl className="space-y-6">
              {section.body.map(([q, a]) => (
                <div key={q}>
                  <dt className="text-sm font-semibold tracking-wide mb-1">{q}</dt>
                  <dd className="text-body-sm text-muted-foreground leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </section>
    </div>
  );
}
