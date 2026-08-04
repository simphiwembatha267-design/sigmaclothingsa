import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { products } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import heroImage from '@/assets/hero-main.jpg';
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
              Uncommon
              <br />
              By Design
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

    </div>
  );
};

export default Index;
