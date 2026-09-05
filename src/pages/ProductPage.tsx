import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, X, ZoomIn } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useFormatPrice } from '@/lib/format';
import { getProductById, products } from '@/lib/products';
import { useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const sizeGuide = [
  { size: 'XS', chest: '86–91', waist: '71–76', hips: '86–91' },
  { size: 'S', chest: '91–97', waist: '76–81', hips: '91–97' },
  { size: 'M', chest: '97–102', waist: '81–86', hips: '97–102' },
  { size: 'L', chest: '102–107', waist: '86–91', hips: '102–107' },
  { size: 'XL', chest: '107–112', waist: '91–97', hips: '107–112' },
  { size: 'XXL', chest: '112–117', waist: '97–102', hips: '112–117' },
];

const colorClass: Record<string, string> = {
  Black: 'bg-foreground',
  White: 'bg-background',
  Cream: 'bg-muted',
  Olive: 'bg-muted-foreground',
};

export default function ProductPage() {
  const formatPrice = useFormatPrice();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = getProductById(id || '');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();

  const galleryImages = useMemo(() => {
    const list = product?.images?.length ? product.images : product?.image ? [product.image] : [];
    return list.filter((src) => src.startsWith('/') || src.startsWith('http')).slice(0, 3);
  }, [product]);

  const colorVariants = product?.colorVariants
    ? products.filter((candidate) => product.colorVariants?.includes(candidate.id))
    : [];

  useEffect(() => {
    setSelectedSize(null);
    setActiveImage(0);
    setZoomImage(null);
    setAdded(false);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center px-5">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-5" style={{ fontFamily: 'var(--font-body)' }}>
            Product Not Found
          </h1>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link to="/shop">Return to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((candidate) => candidate.category === product.category && candidate.id !== product.id)
    .slice(0, 4);

  const mainImage = galleryImages[activeImage] ?? product.image;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setAdded(true);
    window.setTimeout(() => {
      setAdded(false);
      openCart();
    }, 650);
  };

  const informationSections = [
    {
      id: 'details',
      title: 'Product Details',
      content: (
        <p className="text-sm leading-6 text-muted-foreground">{product.description}</p>
      ),
    },
    {
      id: 'size-chart',
      title: 'Size Chart',
      content: (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-xs">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 font-semibold">Size</th>
                <th className="py-3 font-semibold">Chest</th>
                <th className="py-3 font-semibold">Waist</th>
                <th className="py-3 font-semibold">Hips</th>
              </tr>
            </thead>
            <tbody>
              {sizeGuide.map((row) => (
                <tr key={row.size} className="border-b border-border/70 text-muted-foreground">
                  <td className="py-3 font-medium text-foreground">{row.size}</td>
                  <td className="py-3">{row.chest}</td>
                  <td className="py-3">{row.waist}</td>
                  <td className="py-3">{row.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="pt-3 text-[11px] text-muted-foreground">Measurements are in centimetres.</p>
        </div>
      ),
    },
    {
      id: 'size-reference',
      title: 'Size Reference',
      content: (
        <p className="text-sm leading-6 text-muted-foreground">
          This style has a relaxed fit. Choose your usual size for the intended silhouette, or size down for a closer fit.
        </p>
      ),
    },
    {
      id: 'shipping',
      title: 'Shipping',
      content: (
        <p className="text-sm leading-6 text-muted-foreground">
          Orders are carefully packed and dispatched after processing. Delivery timing and cost are shown at checkout for your location.
        </p>
      ),
    },
    {
      id: 'care',
      title: 'Care Guide',
      content: (
        <p className="text-sm leading-6 text-muted-foreground">
          Wash cold with similar colours. Turn inside out before washing. Do not bleach or tumble dry. Cool iron away from printed artwork.
        </p>
      ),
    },
  ];

  return (
    <div className="pt-24 md:pt-28">
      <section className="container-editorial pb-16 md:pb-24">
        <Button
          asChild
          variant="secondary"
          className="mb-5 h-11 rounded-full bg-muted px-4 text-xs font-semibold uppercase hover:bg-muted/80 md:mb-8"
        >
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back Home
          </Link>
        </Button>

        <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] lg:gap-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55 }}
            className="min-w-0"
          >
            {galleryImages.length > 0 ? (
              <div>
                <button
                  type="button"
                  onClick={() => setZoomImage(mainImage)}
                  className="group relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-background px-5 py-8 md:aspect-square md:px-12"
                  aria-label={`Zoom ${product.name}`}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={mainImage}
                      src={mainImage}
                      alt={`${product.name} — view ${activeImage + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      fetchPriority="high"
                      decoding="async"
                      className="block h-full w-full object-contain object-center"
                    />
                  </AnimatePresence>
                  <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 opacity-100 backdrop-blur-sm transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <ZoomIn className="h-4 w-4" />
                  </span>
                </button>

                <div className="mt-4 grid grid-cols-3 gap-3 md:mt-5 md:gap-4" aria-label="Product images">
                  {galleryImages.map((src, index) => (
                    <Button
                      key={src}
                      type="button"
                      variant="outline"
                      onClick={() => setActiveImage(index)}
                      aria-label={`Show product image ${index + 1}`}
                      aria-pressed={activeImage === index}
                      className={cn(
                        'aspect-square h-auto w-full rounded-md bg-background p-2 transition-colors hover:bg-background md:p-3',
                        activeImage === index ? 'border-foreground' : 'border-transparent',
                      )}
                    >
                      <img
                        src={src}
                        alt=""
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                        className="h-full w-full object-contain object-center"
                      />
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-muted md:aspect-square">
                <span className="font-display text-8xl text-muted-foreground/20">{product.name.charAt(0)}</span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="md:sticky md:top-28"
          >
            <h1 className="text-2xl font-bold leading-tight md:text-3xl" style={{ fontFamily: 'var(--font-body)' }}>
              {product.name}
            </h1>
            <p className="mt-3 text-base font-medium">{formatPrice(product.price)}</p>

            {colorVariants.length > 1 && (
              <div className="mt-8">
                <p className="mb-4 text-xs font-medium uppercase">Color — {product.color}</p>
                <div className="flex gap-3">
                  {colorVariants.map((variant) => (
                    <Button
                      key={variant.id}
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/product/${variant.id}`)}
                      aria-label={`Select ${variant.color}`}
                      aria-pressed={variant.id === product.id}
                      className={cn(
                        'h-9 w-9 rounded-full p-1.5',
                        variant.id === product.id ? 'border-foreground ring-1 ring-foreground ring-offset-2' : 'border-border',
                      )}
                    >
                      <span className={cn('h-full w-full rounded-full border border-border', colorClass[variant.color ?? ''] ?? 'bg-muted-foreground')} />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-9">
              <p className="mb-5 text-xs font-medium uppercase">Size</p>
              <div className="grid grid-cols-6 gap-1" role="group" aria-label="Select size">
                {allSizes.map((size) => {
                  const available = product.sizes.includes(size);
                  return (
                    <Button
                      key={size}
                      type="button"
                      variant="ghost"
                      disabled={!available}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={cn(
                        'h-11 rounded-none px-0 text-sm font-medium hover:bg-muted',
                        selectedSize === size && 'bg-foreground text-background hover:bg-foreground/90 hover:text-background',
                        !available && 'text-muted-foreground line-through opacity-45',
                      )}
                    >
                      {size}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={cn(
                'mt-7 h-14 w-full rounded-md text-xs font-semibold uppercase transition-colors',
                added && 'bg-foreground text-background',
              )}
            >
              {added ? (
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" /> Added to Cart</span>
              ) : selectedSize ? (
                `Purchase — ${formatPrice(product.price)}`
              ) : (
                'Select Size'
              )}
            </Button>

            <Accordion type="single" collapsible defaultValue="details" className="mt-10 border-t border-border">
              {informationSections.map((section) => (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger
                    className="py-5 text-left text-sm font-semibold hover:no-underline"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">{section.content}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="border-t border-border pb-20 pt-14 md:pb-28 md:pt-20">
          <div className="container-editorial">
            <h2 className="mb-9 text-2xl font-bold md:mb-12 md:text-3xl" style={{ fontFamily: 'var(--font-body)' }}>
              Complete the Fit
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 md:gap-x-8">
              {relatedProducts.map((candidate, index) => (
                <ProductCard key={candidate.id} product={candidate} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background"
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setZoomImage(null)}
              aria-label="Close zoom"
              className="absolute right-4 top-4 z-10 h-11 w-11 rounded-full bg-background/90 backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex h-full w-full items-center justify-center overflow-auto p-4 md:p-10">
              <motion.img
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35 }}
                src={zoomImage}
                alt={`${product.name} — zoomed`}
                onClick={() => setZoomImage(null)}
                className="max-h-none min-h-full min-w-full cursor-zoom-out object-contain md:min-h-0 md:min-w-0 md:max-h-full md:max-w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
