import { Link } from 'react-router-dom';
import { memo, useRef, useState } from 'react';
import { Product } from '@/lib/store';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/format';

interface ProductCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
}

function ProductCardBase({ product, index = 0, priority = false }: ProductCardProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const isDisplayable = (src?: string) => !!src && (src.startsWith('/') || src.startsWith('http'));
  const gallery = (product.images?.length ? product.images : [product.image]).filter(isDisplayable);
  const hasImage = gallery.length > 0;

  const scrollFrame = useRef<number | null>(null);

const handleScroll = () => {
  if (scrollFrame.current !== null) return;

  scrollFrame.current = requestAnimationFrame(() => {
    const el = scrollerRef.current;

    if (el) {
      const nextActive = Math.round(el.scrollLeft / el.clientWidth);

      setActive((current) =>
        current === nextActive ? current : nextActive
      );
    }

    scrollFrame.current = null;
  });
};

  const scrollTo = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: Math.min(index, 4) * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
    >
      <Link to={`/product/${product.id}`} className="group block product-card">
        <div className="relative aspect-square bg-background overflow-hidden mb-6">
          {hasImage ? (
            <>
              <div
                ref={scrollerRef}
                onScroll={handleScroll}
                className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar touch-pan-x"
              >
                {gallery.map((src, i) => (
                  <div
                    key={src}
                    className="min-w-full h-full snap-center flex items-center justify-center px-3 py-4 sm:px-4 sm:py-6"
                  >
                    <img
                      src={src}
                      alt={`${product.name} — view ${i + 1}`}
                      loading={priority && i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                      fetchPriority={priority && i === 0 ? 'high' : 'auto'}
                      className="block mx-auto w-[90%] h-[90%] object-contain object-center will-change-transform group-hover:scale-[1.03] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    />
                  </div>
                ))}
              </div>

              {gallery.length > 1 && (
                <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                  {gallery.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={(e) => scrollTo(e, i)}
                      aria-label={`View image ${i + 1}`}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        active === i ? 'w-4 bg-foreground/70' : 'w-1 bg-foreground/25'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
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
