import { motion } from 'framer-motion';
import lookbook2 from '@/assets/lookbook-2.jpg';
import lookbook3 from '@/assets/lookbook-3.jpg';

const values = [
  {
    title: 'Craftsmanship',
    description:
      'Every garment is produced in small batches by skilled artisans. We partner with family-owned factories in Portugal, Italy, and Japan.',
  },
  {
    title: 'Sustainability',
    description:
      'We use organic cotton, recycled nylon, and deadstock fabrics. Our packaging is fully recyclable and plastic-free.',
  },
  {
    title: 'Timelessness',
    description:
      'We design for longevity, not trends. Each piece is meant to be worn, loved, and passed on.',
  },
];

export default function About() {
  return (
    <div className="pt-20 md:pt-24">
      {/* Hero */}
      <section className="container-editorial py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <p className="text-caption uppercase text-muted-foreground mb-4">Est. 2020</p>
          <h1 className="font-display text-display-xl mb-8">
            Built on the belief that less is more
          </h1>
          <p className="text-body-lg text-muted-foreground">
            Sigma was born in Tokyo, inspired by the quiet intensity of Japanese design 
            philosophy and the raw energy of global street culture. We create for the 
            ones who move in silence but leave a mark.
          </p>
        </motion.div>
      </section>

      {/* Image + Story */}
      <section className="container-editorial pb-24">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={lookbook2}
                alt="Sigma Atelier"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <h2 className="font-display text-display-md mb-6">Our Philosophy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We reject the noise of fast fashion. Each Sigma piece is designed to 
                exist beyond seasons—garments that grow more meaningful with time and wear.
              </p>
              <p>
                Our design process begins with a single question: will this matter in 
                ten years? If the answer isn't yes, we start over.
              </p>
              <p>
                We draw inspiration from architecture, poetry, and the streets of 
                Tokyo, Paris, and London. Our collections are visual essays on 
                modern existence—explorations of identity, rebellion, and quiet confidence.
              </p>
            </div>
          </motion.div>
        </div>
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
            <h2 className="font-display text-display-md">What We Stand For</h2>
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
                <h3 className="font-display text-xl mb-4">{value.title}</h3>
                <p className="text-muted-foreground text-body-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Image */}
      <section className="container-editorial section-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="aspect-[21/9] overflow-hidden">
            <img
              src={lookbook3}
              alt="Sigma Studio"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="max-w-2xl mt-8">
            <p className="text-body-lg text-muted-foreground">
              Our team spans three continents, united by a shared vision: 
              to create clothing that speaks without words.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Global Presence */}
      <section className="bg-foreground text-background section-padding">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-caption uppercase text-background/60 mb-8">
              Designed in Tokyo. Made with intention.
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-display-md font-display">
              <span>東京</span>
              <span className="text-background/40">•</span>
              <span>Paris</span>
              <span className="text-background/40">•</span>
              <span>London</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
