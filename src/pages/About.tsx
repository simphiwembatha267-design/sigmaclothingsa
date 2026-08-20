import { motion } from 'framer-motion';

const values = [
  {
    title: 'Craftsmanship',
    description:
      'Small-batch production with premium fabrics and finishing that lasts.',
  },
  {
    title: 'Community',
    description:
      'Built for a growing network of South African moguls shaping culture on their own terms.',
  },
  {
    title: 'Intention',
    description:
      'Every detail is considered. Nothing is added without purpose.',
  },
];

export default function About() {
  return (
    <div className="pt-20 md:pt-24 min-h-screen">
      {/* Hero */}
      <section className="container-editorial py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-caption uppercase text-muted-foreground mb-4">Our Story</p>
          <h1 className="font-body font-bold text-display-lg tracking-tight mb-8">
            Built for Moguls
          </h1>
          <p className="text-body-lg text-muted-foreground mb-6">
            Sigma is more than a clothing brand. It is a community of moguls —
            individuals who move with purpose, build in silence, and leave a mark.
          </p>
          <p className="text-body-lg text-muted-foreground">
            Born in South Africa, we create premium streetwear for those who lead
            without needing to be loud. Clean silhouettes, rich fabrics, and details
            that speak for themselves.
          </p>
        </motion.div>
      </section>

      {/* Philosophy */}
      <section className="container-editorial pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h2 className="font-body font-bold text-3xl tracking-tight mb-6">Our Philosophy</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              We believe in quality over noise. Every piece is designed to feel as
              good as it looks — minimal, intentional, and made to last. No fast
              fashion. No gimmicks.
            </p>
            <p>
              Our collections are inspired by the streets of South Africa and the
              global energy of modern moguls. From late nights to early wins, Sigma
              is made to move with you.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="bg-secondary section-padding">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-body font-bold text-3xl tracking-tight">What We Stand For</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <h3 className="font-body font-bold text-lg tracking-tight mb-4">{value.title}</h3>
                <p className="text-muted-foreground text-body-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
