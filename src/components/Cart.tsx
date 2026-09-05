import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useFormatPrice } from '@/lib/format';
import { products } from '@/lib/products';
import { useCartStore } from '@/lib/store';

export function Cart() {
  const formatPrice = useFormatPrice();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { items, isOpen, closeCart, addItem, removeItem, updateQuantity, total } = useCartStore();

  const recommendations = useMemo(() => {
    const cartIds = new Set(items.map((item) => item.product.id));
    return products.filter((product) => !cartIds.has(product.id)).slice(0, 3);
  }, [items]);

  const addRecommendation = (productId: string) => {
    const product = products.find((candidate) => candidate.id === productId);
    const size = product?.sizes[0];
    if (!product || !size) return;
    addItem(product, size);
    toast(`${product.name} added`, { description: `Size ${size}` });
  };

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
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden bg-background sm:inset-y-3 sm:right-3 sm:max-w-2xl sm:rounded-lg"
            aria-label="Shopping cart"
          >
            <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-muted px-5 sm:px-8">
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
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <ul className="px-5 sm:px-8">
                  {items.map((item) => (
                    <li
                      key={`${item.product.id}-${item.size}`}
                      className="grid grid-cols-[108px_minmax(0,1fr)] gap-4 border-b border-border py-7 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-7"
                    >
                      <div className="flex aspect-square items-center justify-center overflow-hidden bg-background p-1">
                        {item.product.image && (item.product.image.startsWith('/') || item.product.image.startsWith('http')) ? (
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

                        <div className="mt-auto flex items-center gap-1 pt-4" aria-label={`Quantity for ${item.product.name}`}>
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

                {recommendations.length > 0 && (
                  <section className="mx-5 border-b border-border py-7 sm:mx-8" aria-labelledby="cart-recommendations">
                    <h3 id="cart-recommendations" className="mb-5 font-body text-sm font-bold uppercase">Don't Miss These</h3>
                    <div className="grid grid-cols-3 gap-3 sm:gap-5">
                      {recommendations.map((product) => (
                        <article key={product.id} className="min-w-0">
                          <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden bg-background p-1">
                            <img
                              src={product.image}
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-contain object-center"
                            />
                          </div>
                          <h4 className="line-clamp-2 min-h-8 font-body text-[11px] font-semibold leading-4 sm:text-xs">{product.name}</h4>
                          <p className="mt-1 text-[11px] font-medium sm:text-xs">{formatPrice(product.price)}</p>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => addRecommendation(product.id)}
                            className="mt-3 h-9 w-full rounded-full px-2 text-[10px] font-semibold uppercase sm:text-[11px]"
                          >
                            Add to Cart
                          </Button>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                <footer className="px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-7 sm:px-8 sm:pb-8">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => setTermsAccepted(event.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-foreground"
                    />
                    <span className="text-xs font-semibold uppercase leading-5">
                      I agree to SIGMA's <span className="underline underline-offset-4">shipping policy</span> &amp;{' '}
                      <span className="underline underline-offset-4">terms and conditions</span>
                    </span>
                  </label>

                  <div className="mt-9 flex items-center justify-between text-sm font-bold uppercase">
                    <span>Subtotal</span>
                    <span>{formatPrice(total())}</span>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">Shipping calculated at checkout</p>

                  <Button
                    type="button"
                    disabled={!termsAccepted}
                    onClick={() => toast('Checkout opening soon', { description: 'Message us on Instagram to complete your order.' })}
                    className="mt-5 h-14 w-full rounded-md text-sm font-semibold uppercase"
                  >
                    Checkout
                  </Button>
                </footer>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}