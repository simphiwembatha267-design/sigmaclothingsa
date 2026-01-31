import { Link } from 'react-router-dom';
import { Product } from '@/lib/store';
import { motion } from 'framer-motion';
import { products } from '@/lib/products';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const colorVariants = product.colorVariants 
    ? products.filter(p => product.colorVariants?.includes(p.id))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/product/${product.id}`} className="group block product-card">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4">
          {product.image.startsWith('/assets') || product.image.startsWith('http') ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
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
          <h3 className="text-body-sm font-medium group-hover:underline underline-offset-4 transition-all">
            {product.name}
          </h3>
          <p className="text-body-sm text-muted-foreground">R{product.price}</p>
          
          {/* Color swatches */}
          {colorVariants.length > 1 && (
            <div className="flex gap-2 pt-1">
              {colorVariants.map((variant) => (
                <Link
                  key={variant.id}
                  to={`/product/${variant.id}`}
                  onClick={(e) => e.stopPropagation()}
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
