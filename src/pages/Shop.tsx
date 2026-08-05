import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { products, categories, getProductsByCategory } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import { useSearchParams } from 'react-router-dom';
import heroImage from '@/assets/hero-main.jpg';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const filteredProducts = useMemo(() => {
    return getProductsByCategory(selectedCategory);
  }, [selectedCategory]);
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const heading = selectedCategory === 'All' ? 'All' : selectedCategory;

  return (
    <div>
      {/* Category cover */}
      <section className="relative h-[62vh] min-h-[380px] md:h-[70vh]">
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
      </section>

      {/* White sheet */}
      <div className="relative -mt-10 md:-mt-14 rounded-t-[2rem] bg-background">
        {/* Filters */}
        <section className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-sm rounded-t-[2rem] border-b border-border">
          <div className="container-editorial">
            <div className="flex gap-4 md:gap-8 pt-8 pb-4 overflow-x-auto no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`text-caption uppercase whitespace-nowrap transition-colors ${
                    selectedCategory === category ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {category}
                  {selectedCategory === category && (
                    <motion.div layoutId="category-underline" className="h-px bg-foreground mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="container-editorial pb-24 pt-10 md:pt-14">
          <div className="flex items-center justify-between mb-8">
            <p className="text-caption text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} priority={index < 2} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
