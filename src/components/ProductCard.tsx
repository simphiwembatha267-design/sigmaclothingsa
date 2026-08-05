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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index, 3) * 0.06, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link to={`/product/${product.id}`} className="group block product-card">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4">
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              width={900}
              height={1200}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={priority ? 'high' : 'auto'}
              className="w-full h-full object-cover object-center will-change-transform group-hover:scale-[1.04] transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
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
          {/* Quick add button - shows on hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <div className="bg-background/95 backdrop-blur-sm py-3 text-center text-caption uppercase">
              Quick View
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold tracking-wide group-hover:underline underline-offset-4 transition-all" style={{ fontFamily: 'var(--font-body)' }}>
            {product.name}
          </h3>
          <p className="text-body-sm text-muted-foreground">{formatPrice(product.price)}</p>

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
