import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import heroImage from '@/assets/hero-main.jpg';
import lookbook1 from '@/assets/lookbook-1.jpg';
import lookbook2 from '@/assets/lookbook-2.jpg';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-end">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Sigma Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        </div>
        
        <div className="relative container-editorial pb-16 md:pb-24 text-background">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <p className="text-caption uppercase mb-4 opacity-80">FW25 Collection</p>
            <h1 className="font-display text-display-xl mb-6">
              The Art of Silence
            </h1>
            <p className="text-body-lg opacity-80 mb-8 max-w-md">
              Built for moguls.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 text-caption uppercase group"
            >
              <span className="link-underline">Shop Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>


      {/* Featured Products */}
      <section className="section-padding">
        <div className="container-editorial">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-caption uppercase text-muted-foreground mb-2">Featured</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>New Arrivals</h2>
            </div>
            <Link
              to="/shop"
              className="text-caption uppercase link-underline"
            >
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Split */}
      <section className="section-padding bg-foreground text-background">
        <div className="container-editorial">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-[3/4] bg-background/10 overflow-hidden">
                <img
                  src={lookbook1}
                  alt="Lookbook"
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
              <p className="text-caption uppercase text-background/60 mb-4">Lookbook SS25</p>
              <h2 className="font-display text-display-md mb-6">
                Between Shadow and Light
              </h2>
              <p className="text-body-lg text-background/70 mb-8 max-w-md">
                Our latest visual story explores the duality of urban existence—
                where calm meets chaos, and silence speaks volumes.
              </p>
              <Link
                to="/lookbook"
                className="inline-flex items-center gap-3 text-caption uppercase group"
              >
                <span className="link-underline">View Lookbook</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="section-padding">
        <div className="container-editorial">
          <div className="text-center mb-12">
            <p className="text-caption uppercase text-muted-foreground mb-2">@sigmaofficial</p>
            <h2 className="font-display text-display-md">Follow the Movement</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {[lookbook1, lookbook2, lookbook1, lookbook2].map((img, index) => (
              <motion.a
                key={index}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="aspect-square overflow-hidden group"
              >
                <img
                  src={img}
                  alt={`Instagram post ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-secondary">
        <div className="container-editorial">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-wide mb-4" style={{ fontFamily: 'var(--font-body)' }}>Membership</h2>
            <p className="text-muted-foreground mb-8">
              Early access to drops. Exclusive content. No spam.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 h-14 px-5 bg-background border border-border text-body-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              <button
                type="submit"
                className="h-14 px-8 bg-foreground text-background font-bold tracking-wide hover:bg-foreground/90 transition-colors"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                JOIN SIGMA
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
