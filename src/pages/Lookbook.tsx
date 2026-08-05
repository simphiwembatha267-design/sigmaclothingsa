import { motion } from 'framer-motion';
import sigmaExclusiveCover from '@/assets/sigma-exclusive-cover.jpg.asset.json';
import lookbook2 from '@/assets/lookbook-2.jpg';
import lookbook3 from '@/assets/lookbook-3.jpg';
import sigmaLookbookSS25 from '@/assets/sigma-lookbook-ss25.png.asset.json';
import lookbookSS25Cover from '@/assets/lookbook-ss25-cover.jpg.asset.json';

const images = [
  { src: sigmaExclusiveCover.url, title: 'Sigma Exclusive', season: 'FW25' },
  { src: lookbook2, title: 'Urban Poetry', season: 'FW25' },
  { src: lookbook3, title: 'Form & Function', season: 'FW25' },
  { src: sigmaLookbookSS25.url, title: 'Between Shadow and Light', season: 'SS25' },
  { src: sigmaLookbookSS25.url, title: 'Dawn Walker', season: 'SS25' },
  { src: sigmaLookbookSS25.url, title: 'Shadow Play', season: 'SS25' },
];

export default function Lookbook() {
  return (
    <div className="pt-20 md:pt-24">
      {/* Header */}
      <section className="container-editorial py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-caption uppercase text-muted-foreground mb-4">Archive</p>
          <h1 className="font-display text-display-lg mb-6">Lookbook</h1>
          <p className="text-body-lg text-muted-foreground">
            A visual exploration of form, fabric, and philosophy. 
            Each collection tells a story of duality—where silence meets statement.
          </p>
        </motion.div>
      </section>

      {/* Masonry Grid */}
      <section className="container-editorial pb-24">
        <div className="columns-1 md:columns-2 gap-4 md:gap-8">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="break-inside-avoid mb-4 md:mb-8 group"
            >
              <div className="relative overflow-hidden">
                <img
                  loading="lazy"
                  decoding="async"
                  src={image.src}
                  alt={image.title}
                  className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-caption uppercase text-background/80 mb-1">
                    {image.season}
                  </p>
                  <h3 className="font-display text-xl text-background">
                    {image.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-foreground text-background section-padding">
        <div className="container-editorial">
          <motion.blockquote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="font-display text-display-md italic mb-8">
              "Clothing is the first word of a conversation we have with the world—
              make it count."
            </p>
            <cite className="text-caption uppercase text-background/60 not-italic">
              — Creative Director, Sigma
            </cite>
          </motion.blockquote>
        </div>
      </section>
    </div>
  );
}
