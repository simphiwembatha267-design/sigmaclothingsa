import { Link } from 'react-router-dom';
import { Product } from '@/lib/store';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/product/${product.id}`} className="group block product-card">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/5" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl text-muted-foreground/20 uppercase">
              {product.name.charAt(0)}
            </span>
          </div>
          {/* Quick add button - shows on hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <div className="bg-background/95 backdrop-blur-sm py-3 text-center text-caption uppercase">
              Quick View
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-body-sm font-medium group-hover:underline underline-offset-4 transition-all">
            {product.name}
          </h3>
          <p className="text-body-sm text-muted-foreground">R{product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
}
