 import { Link } from 'react-router-dom';
import { memo } from 'react';
import { Product } from '@/lib/store';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
}

function ProductCardBase({ product, index = 0, priority = false }: ProductCardProps) {
  

  const hasImage = product.image.startsWith('/') || product.image.startsWith('http');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index, 4) * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
    >
      <Link to={`/product/${product.id}`} className="group block product-card">
        <div className="relative aspect-square bg-background overflow-hidden mb-6 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={priority ? 'high' : 'auto'}
              className="block mx-auto w-[90%] h-[90%] object-contain object-center will-change-transform group-hover:scale-[1.03] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-4xl text-muted-foreground/20 uppercase">
                  {product.name.charAt(0)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold tracking-[0.02em]" style={{ fontFamily: 'var(--font-body)' }}>
            {product.name}
          </h3>
          <p className="text-xs font-light tracking-[0.08em] text-muted-foreground">{formatPrice(product.price)}</p>


          
        </div>
      </Link>
    </motion.div>
  );
}

export const ProductCard = memo(ProductCardBase);
