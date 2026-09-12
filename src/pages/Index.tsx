import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useCatalog } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';
import heroImage from '@/assets/hero-main.jpg';


const Index = () => {
  const { products } = useCatalog();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px]">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="SIGMA FW25 collection campaign"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/25 to-foreground/15" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute inset-x-6 top-[19%] flex flex-col items-start text-left text-primary-foreground md:inset-x-auto md:left-[8%] md:top-[21%] md:max-w-3xl"
        >
          <p className="mb-4 font-body text-[10px] font-medium uppercase tracking-[0.3em] md:mb-5 md:text-xs">
            FW25 Collection
          </p>
          <h1 className="max-w-4xl text-[clamp(3rem,9vw,7.5rem)] leading-[0.86] tracking-[0] text-balance">
            Uncommon By Design
          </h1>
          <p className="mt-4 font-display text-xl font-light tracking-[0] md:mt-5 md:text-2xl">
            Built for moguls.
          </p>

          <div className="mt-7 md:mt-9">
            <Link
              to="/shop"
              className="group inline-flex h-11 items-center justify-center gap-3 rounded-full border border-primary-foreground/80 bg-background/10 py-1 pl-5 pr-1 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground backdrop-blur-md transition-colors duration-300 hover:bg-background/20 md:h-12 md:gap-4 md:pl-6 md:text-[11px]"
            >
              Shop Collection
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-foreground text-foreground transition-transform duration-300 group-hover:translate-x-0.5 md:h-10 md:w-10">
                <ArrowRight size={14} strokeWidth={2} />
              </span>
            </Link>
          </div>
        </motion.div>
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
          
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
  <div className="flex gap-4 md:gap-8 min-w-min">
    {featuredProducts.map((product, index) => (
      <div key={product.id} className="flex-shrink-0 w-[160px] sm:w-[220px] md:w-[280px]">
        <ProductCard product={product} index={index} priority={index < 2} />
      </div>
    ))}
  </div>
</div>
        </div>
      </section>

      
    </div>
  );
};
export default Index;
