import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { products, categories, getProductsByCategory } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import { useSearchParams } from 'react-router-dom';
import heroImage from '@/assets/hero-main.jpg';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'All';
  const filteredProducts = useMemo(() => {
    return getProductsByCategory(selectedCategory);
  }, [selectedCategory]);
  const handleCategoryChange = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category === 'All') {
      next.delete('category');
    } else {
      next.set('category', category);
    }
    setSearchParams(next, { replace: true });
  };


  const heading = selectedCategory === 'All' ? 'All' : selectedCategory;

  return (
    <div>
      {/* Category cover — stays fixed while products scroll over it */}
      <section className="relative h-[62vh] min-h-[380px] md:h-[70vh]">
        <div className="fixed inset-x-0 top-0 h-[62vh] min-h-[380px] md:h-[70vh] -z-10">
          <img
            src={heroImage}
            alt={`${heading} collection`}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-foreground/30" />
          <div className="absolute inset-x-0 bottom-16 md:bottom-24 container-editorial">
            <motion.h1
              key={heading}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="text-background text-5xl md:text-7xl font-light tracking-[-0.03em] uppercase"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {heading}
            </motion.h1>
          </div>
        </div>
      </section>

      {/* White sheet */}
      <div className="relative z-10 -mt-6 md:-mt-8 rounded-t-[2.5rem] bg-background">

        {/* Filters */}
        <section className="sticky top-16 md:top-20 z-40 bg-background/85 backdrop-blur-md rounded-t-[2.5rem]">
          <div className="container-editorial px-6 sm:px-10 lg:px-16">
            <div className="flex gap-8 md:gap-14 pt-12 md:pt-16 pb-6 overflow-x-auto no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`text-[11px] font-light uppercase tracking-[0.28em] whitespace-nowrap transition-colors duration-300 ${
                    selectedCategory === category ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {category}
                  {selectedCategory === category && (
                    <motion.div layoutId="category-underline" className="h-px bg-foreground mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="container-editorial px-6 sm:px-10 lg:px-16 pb-32 pt-10 md:pt-16">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-14 md:gap-x-12 md:gap-y-24">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} priority={index < 2} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-24">
              <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Nothing here yet</p>
            </div>
          )}
        </section>
      </div>

    </div>
  );
}
