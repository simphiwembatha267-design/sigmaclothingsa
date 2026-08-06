import { useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductById, products } from '@/lib/products';
import { useCartStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import { ChevronLeft, Plus, Minus, Check, X } from 'lucide-react';
import { formatPrice } from '@/lib/format';

const sizeGuide = [
  { size: 'XS', chest: '86-91', waist: '71-76', hips: '86-91' },
  { size: 'S', chest: '91-97', waist: '76-81', hips: '91-97' },
  { size: 'M', chest: '97-102', waist: '81-86', hips: '97-102' },
  { size: 'L', chest: '102-107', waist: '86-91', hips: '102-107' },
  { size: 'XL', chest: '107-112', waist: '91-97', hips: '107-112' },
];

const getColorHex = (color?: string) => {
  switch (color) {
    case 'Black': return '#000';
    case 'White': return '#fff';
    case 'Cream': return '#f5f5dc';
    case 'Olive': return '#556b2f';
    default: return '#888';
  }
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = getProductById(id || '');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();
  
  const colorVariants = product?.colorVariants 
    ? products.filter(p => product.colorVariants?.includes(p.id))
    : [];

  if (!product) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-display-md mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-caption uppercase link-underline">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize);
    }
    
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 1000);
  };

  return (
    <div className="pt-20 md:pt-24">
      {/* Breadcrumb */}
      <div className="container-editorial py-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-caption uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>

      {/* Product Details */}
      <section className="container-editorial pb-16 md:pb-24">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="sticky top-24">
              {galleryImages.length > 0 ? (
                <>
                  <div
                    ref={galleryRef}
                    onScroll={handleGalleryScroll}
                    className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar"
                  >
                    {galleryImages.map((src, i) => (
                      <div key={src} className="min-w-full snap-center aspect-[3/4] bg-muted overflow-hidden">
                        <img
                          src={src}
                          alt={`${product.name} — ${i === 0 ? 'back design' : 'front design'}`}
                          width={900}
                          height={1200}
                          fetchPriority={i === 0 ? 'high' : 'auto'}
                          loading={i === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    ))}
                  </div>
                  {galleryImages.length > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
                      {galleryImages.map((src, i) => (
                        <button
                          key={src}
                          onClick={() => scrollToImage(i)}
                          aria-label={`View image ${i + 1}`}
                          className={`h-1.5 rounded-full transition-all ${
                            activeImage === i ? 'w-6 bg-foreground' : 'w-1.5 bg-foreground/25'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[3/4] bg-muted relative flex items-center justify-center">
                  <span className="font-display text-[8rem] text-muted-foreground/20 uppercase">
                    {product.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>


          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            <p className="text-caption uppercase text-muted-foreground mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide mb-2" style={{ fontFamily: 'var(--font-body)' }}>{product.name}</h1>
            <p className="text-body-lg mb-6">{formatPrice(product.price)}</p>
            
            <p className="text-muted-foreground mb-8">{product.description}</p>

            {/* Color Selection */}
            {colorVariants.length > 1 && (
              <div className="mb-6">
                <span className="text-caption uppercase block mb-3">Color — {product.color}</span>
                <div className="flex gap-3">
                  {colorVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => navigate(`/product/${variant.id}`)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        variant.id === product.id 
                          ? 'ring-2 ring-offset-2 ring-foreground' 
                          : 'hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: getColorHex(variant.color),
                        borderColor: variant.color === 'White' ? '#ddd' : 'transparent'
                      }}
                      title={variant.color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-caption uppercase">Size</span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-caption uppercase text-muted-foreground hover:text-foreground transition-colors link-underline"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 min-w-[48px] px-4 border text-caption uppercase transition-colors ${
                      selectedSize === size
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <span className="text-caption uppercase block mb-3">Quantity</span>
              <div className="inline-flex items-center border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-muted transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-muted transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`h-14 text-caption uppercase transition-all ${
                added
                  ? 'bg-green-600 text-white'
                  : selectedSize
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {added ? (
                <span className="inline-flex items-center gap-2">
                  <Check className="w-4 h-4" /> Added to Cart
                </span>
              ) : selectedSize ? (
                `Add to Cart — ${formatPrice(product.price * quantity)}`
              ) : (
                'Select a Size'
              )}
            </button>

            {/* Details */}
            <div className="mt-12 pt-8 border-t border-border space-y-4">
              <div>
                <h3 className="text-lg font-bold tracking-wide mb-2" style={{ fontFamily: 'var(--font-body)' }}>Details</h3>
                <ul className="text-body-sm text-muted-foreground space-y-1">
                  <li>• Premium quality materials</li>
                  <li>• Made in Portugal</li>
                  <li>• Model wears size M</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-wide mb-2" style={{ fontFamily: 'var(--font-body)' }}>Shipping</h3>
                <p className="text-body-sm text-muted-foreground">
                  Free worldwide shipping on orders over €200. 
                  Standard delivery 3-7 business days.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container-editorial section-padding border-t border-border">
          <h2 className="text-2xl md:text-3xl font-bold tracking-wide mb-12" style={{ fontFamily: 'var(--font-body)' }}>You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {relatedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
              onClick={() => setShowSizeGuide(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background p-8 z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">Size Guide</h2>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="p-2 -mr-2 hover:opacity-60 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-body-sm text-muted-foreground mb-6">
                All measurements in centimeters. If you're between sizes, we recommend sizing up for a relaxed fit.
              </p>
              
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 text-left text-caption uppercase">Size</th>
                    <th className="py-3 text-left text-caption uppercase">Chest</th>
                    <th className="py-3 text-left text-caption uppercase">Waist</th>
                    <th className="py-3 text-left text-caption uppercase">Hips</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.map((row) => (
                    <tr key={row.size} className="border-b border-border">
                      <td className="py-3 font-medium">{row.size}</td>
                      <td className="py-3 text-muted-foreground">{row.chest}</td>
                      <td className="py-3 text-muted-foreground">{row.waist}</td>
                      <td className="py-3 text-muted-foreground">{row.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
