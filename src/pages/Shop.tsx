import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { products, categories, getProductsByCategory } from '@/lib/products';
import { ProductCard } from '@/components/ProductCard';
import { useSearchParams } from 'react-router-dom';

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

  return (
    <div className="pt-20 md:pt-24">
      {/* Header */}
      <section className="container-editorial py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-display-lg mb-4">Shop</h1>
          <p className="text-muted-foreground max-w-lg">
            Curated essentials and statement pieces. Each garment is designed 
            to transcend seasons and trends.
          </p>
        </motion.div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container-editorial">
          <div className="flex gap-4 md:gap-8 py-4 overflow-x-auto no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`text-caption uppercase whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {category}
                {selectedCategory === category && (
                  <motion.div
                    layoutId="category-underline"
                    className="h-px bg-foreground mt-1"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container-editorial section-padding">
        <div className="flex items-center justify-between mb-8">
          <p className="text-caption text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
}
