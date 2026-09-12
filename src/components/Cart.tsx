import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useFormatPrice } from '@/lib/format';
import { useCartStore, type Product } from '@/lib/store';
import { getProductById } from '@/lib/products';

const hatProduct: Product = {
  id: 'sigma-hat',
  name: 'SIGMA Hat',
  price: 250,
  image: '',
  category: 'Accessories',
  description: 'SIGMA hat.',
  sizes: ['OS'],
};

const beanieProduct: Product = {
  id: 'sigma-beanie',
  name: 'SIGMA Beanie',
  price: 220,
  image: '',
  category: 'Accessories',
  description: 'SIGMA beanie.',
  sizes: ['OS'],
};

const recommendedTee = getProductById('sigma-gallery-top-black');

function RecommendationCard({ product, needsSize }: { product: Product; needsSize: boolean }) {
  const formatPrice = useFormatPrice();
  const addItem = useCartStore((state) => state.addItem);
  const [size, setSize] = useState('');

  const handleAdd = () => {
    if (needsSize && !size) {
      toast('Select a size first');
      return;
    }
    addItem(product, needsSize ? size : 'OS');
    toast(`${product.name} added to cart`);
  };

  return (
    <div className="flex w-28 shrink-0 snap-start flex-col">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain object-center p-1"
          />
        ) : (
          <span className="font-display text-lg text-muted-foreground/40">S.</span>
        )}
      </div>
      <p className="mt-2 truncate font-body text-[11px] font-bold leading-4">{product.name}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase text-muted-foreground">{formatPrice(product.price)}</p>
      {needsSize && (
        <select
          value={size}
          onChange={(event) => setSize(event.target.value)}
          className="mt-1.5 h-7 w-full border border-border bg-background px-1 text-[11px] font-semibold uppercase outline-none"
          aria-label={`Size for ${product.name}`}
        >
          <option value="" disabled>
            Size ▼
          </option>
          {product.sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}
      <Button
        type="button"
        variant="ghost"
        onClick={handleAdd}
        className="mt-1.5 h-7 w-full rounded-none border border-foreground px-0 text-[10px] font-bold uppercase hover:bg-foreground hover:text-background"
      >
        Add to cart
      </Button>
    </div>
  );
}

export function Cart() {
  const formatPrice = useFormatPrice();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/55 backdrop-blur-sm"
            onClick={closeCart}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-4 right-0 z-50 flex flex-col overflow-hidden rounded-l-lg bg-background sm:inset-y-3 sm:left-auto sm:right-3 sm:w-[min(94vw,640px)] sm:rounded-lg"
            aria-label="Shopping cart"
          >
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-muted px-4 sm:px-7">
              <h2 className="font-body text-sm font-bold uppercase">Cart</h2>
              <Button
                type="button"
                variant="ghost"
                onClick={closeCart}
                className="h-auto rounded-none px-0 py-2 text-sm font-bold uppercase hover:bg-transparent hover:opacity-60"
              >
                [ Close ]
              </Button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <ShoppingBag className="mb-5 h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
                <p className="mb-7 text-sm font-semibold">Your cart is empty</p>
                <Button onClick={closeCart} className="h-12 rounded-full px-8 text-xs font-semibold uppercase">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <ul className="px-4 sm:px-7">
                  {items.map((item) => (
                    <li
                      key={`${item.product.id}-${item.size}`}
                      className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 border-b border-border py-5 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-6 sm:py-6"
                    >
                      <div className="flex aspect-square items-center justify-center overflow-hidden bg-background p-1">
                        {item.product.image && (item.product.image.startsWith('/') || item.product.image.startsWith('http') || item.product.image.startsWith('data:')) ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-contain object-center"
                          />
                        ) : null}
                      </div>

                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-body text-sm font-bold leading-5">{item.product.name}</h3>
                            <p className="mt-1 text-xs font-medium uppercase">{formatPrice(item.product.price)}</p>
                            <p className="mt-1 text-xs font-medium uppercase text-muted-foreground">Size {item.size}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeItem(item.product.id, item.size)}
                            className="h-auto rounded-none px-0 py-0 text-[11px] font-medium uppercase text-muted-foreground hover:bg-transparent hover:text-foreground"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="mt-auto flex items-center gap-1 pt-3" aria-label={`Quantity for ${item.product.name}`}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                            className="h-8 w-8 rounded-none hover:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                            className="h-8 w-8 rounded-none hover:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <section className="border-b border-border px-4 py-5 sm:px-7 sm:py-6" aria-labelledby="cart-recommendations">
                  <h3 id="cart-recommendations" className="font-body text-xs font-bold uppercase">Don't Miss These</h3>
                  <div
                    className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain"
                    aria-label="Recommended products"
                  >
                    <RecommendationCard product={hatProduct} needsSize={false} />
                    <RecommendationCard product={beanieProduct} needsSize={false} />
                    {recommendedTee && <RecommendationCard product={recommendedTee} needsSize />}
                  </div>
                </section>
              </div>

              <footer className="shrink-0 border-t border-border bg-background px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 sm:px-7 sm:pb-6">
                <div className="flex items-start gap-3">
                  <input
                    id="cart-terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-foreground"
                  />
                  <span className="text-xs font-semibold uppercase leading-5">
                    <label htmlFor="cart-terms" className="cursor-pointer">
                      I agree to SIGMA's{' '}
                    </label>
                    <Link to="/legal#faqs" onClick={closeCart} className="underline underline-offset-4">
                      shipping policy
                    </Link>{' '}
                    &amp;{' '}
                    <Link to="/legal#terms" onClick={closeCart} className="underline underline-offset-4">
                      terms and conditions
                    </Link>
                  </span>
                </div>

                <PromoAndTotals subtotal={total()} />


                <Button
                  type="button"
                  disabled={!termsAccepted}
                  onClick={() => toast('Checkout opening soon', { description: 'Message us on Instagram to complete your order.' })}
                  className="mt-4 h-14 w-full rounded-md text-sm font-semibold uppercase"
                >
                  Checkout
                </Button>
              </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
