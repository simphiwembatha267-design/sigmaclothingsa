import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/format';
import { useCartStore } from '@/lib/store';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';

import { toast } from 'sonner';


export function Cart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
            onClick={closeCart}
          />
          
          {/* Cart panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-border">
              <h2 className="text-caption uppercase font-semibold tracking-[0.02em]" style={{ fontFamily: 'var(--font-body), sans-serif' }}>Cart ({itemCount()})</h2>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 hover:opacity-60 transition-opacity"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" strokeWidth={2} />
                  <p className="text-muted-foreground mb-6" style={{ fontFamily: 'var(--font-body), sans-serif' }}>Your cart is empty</p>
                  <button
                    onClick={closeCart}
                    className="text-caption uppercase link-underline font-semibold tracking-[0.02em]"
                    style={{ fontFamily: 'var(--font-body), sans-serif' }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li key={`${item.product.id}-${item.size}`} className="flex gap-4 p-6">
                      <div className="w-24 h-32 bg-background flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
                        {item.product.image && (item.product.image.startsWith('/') || item.product.image.startsWith('http')) ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            loading="lazy"
                            decoding="async"
                            className="max-w-full max-h-full w-auto h-auto object-contain object-center"
                          />
                        ) : null}
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-sm font-bold tracking-wide" style={{ fontFamily: 'var(--font-body), sans-serif' }}>{item.product.name}</h3>
                            <p className="text-caption text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-body), sans-serif' }}>
                              Size: {item.size}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
                            className="p-1 -mr-1 hover:opacity-60 transition-opacity"
                            aria-label="Remove item"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity - 1)
                              }
                              className="p-2 hover:bg-muted transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-body-sm" style={{ fontFamily: 'var(--font-body), sans-serif' }}>{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity + 1)
                              }
                              className="p-2 hover:bg-muted transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-body-sm" style={{ fontFamily: 'var(--font-body), sans-serif' }}>{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex justify-between text-body-sm" style={{ fontFamily: 'var(--font-body), sans-serif' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(total())}</span>
                </div>
                <p className="text-caption text-muted-foreground" style={{ fontFamily: 'var(--font-body), sans-serif' }}>
                  Shipping calculated at checkout
                </p>
                <button
                  onClick={() =>
                    toast('Checkout opening soon', {
                      description: 'Message us on Instagram to complete your order.',
                    })
                  }
                  className="w-full h-12 bg-foreground text-background text-caption uppercase font-semibold tracking-[0.02em] hover:bg-foreground/90 transition-colors"
                  style={{ fontFamily: 'var(--font-body), sans-serif' }}
                >
                  Checkout
                </button>

                <button
                  onClick={closeCart}
                  className="w-full text-center text-caption uppercase link-underline font-semibold tracking-[0.02em]"
                  style={{ fontFamily: 'var(--font-body), sans-serif' }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
