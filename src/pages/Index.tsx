import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCatalog } from '@/lib/catalog';
import { ProductCard } from '@/components/ProductCard';
import heroImage from '@/assets/hero-main.jpg';


const Index = () => {
  const { products } = useCatalog();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-end">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Sigma Collection"
            fetchPriority="high"
            decoding="async"
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
          </motion.div>
        </div>

        <Link
          to="/shop"
          className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center w-[150px] md:w-[164px] h-11 md:h-12 rounded-lg border border-foreground/10 bg-background/80 backdrop-blur-sm text-foreground text-caption uppercase tracking-[0.22em] transition-all duration-300 hover:bg-background/95"
        >
          Find Yours
        </Link>
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
