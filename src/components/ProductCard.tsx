 import { Link } from 'react-router-dom';
import { memo, useMemo } from 'react';
import { Product } from '@/lib/store';
import { motion } from 'framer-motion';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
}

function ProductCardBase({ product, index = 0, priority = false }: ProductCardProps) {
  const colorVariants = useMemo(
    () => (product.colorVariants ? products.filter((p) => product.colorVariants?.includes(p.id)) : []),
    [product.colorVariants]
  );

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
        <div className="relative aspect-[3/4] bg-background overflow-hidden mb-6 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6">
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


          {/* Color swatches */}
          {colorVariants.length > 1 && (
            <div className="flex gap-2 pt-1">
              {colorVariants.map((variant) => (
                <Link
                  key={variant.id}
                  to={`/product/${variant.id}`}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`View ${variant.name} in ${variant.color}`}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    variant.id === product.id
                      ? 'ring-1 ring-offset-2 ring-foreground'
                      : 'hover:scale-110'
                  }`}
                  style={{
                    backgroundColor: variant.color === 'Black' ? '#000' :
                                    variant.color === 'White' ? '#fff' :
                                    variant.color === 'Cream' ? '#f5f5dc' :
                                    variant.color === 'Olive' ? '#556b2f' : '#888',
                    borderColor: variant.color === 'White' ? '#ddd' : 'transparent'
                  }}
                  title={variant.color}
                />
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export const ProductCard = memo(ProductCardBase);
