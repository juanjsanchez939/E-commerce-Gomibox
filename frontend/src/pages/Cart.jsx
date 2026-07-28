import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/helpers.js';
import Button from '../components/ui/Button.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Cart() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { cartItems, subtotal, cartCount, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const shipping = subtotal > 150 ? 0 : 5.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h1 className="text-2xl font-bold mb-2">{t('cart.empty')}</h1>
        <p className="text-muted-foreground mb-4">{t('cart.emptyDesc')}</p>
        <Link to="/"><Button>{t('cart.startShopping')}</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('cart.title')} ({cartCount} {t('cart.items')})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const product = item.product || item;
            const productId = product._id || product.product;
            const itemId = item._id;

            return (
              <div key={itemId || productId} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
                <Link to={`/products/${productId}`} className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={product.images?.[0] || product.thumbnail || product.image || ''}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${productId}`}>
                    <h3 className="font-medium text-sm hover:text-primary transition-colors truncate">{product.name}</h3>
                  </Link>
                  {item.selectedColor && (
                    <p className="text-xs text-muted-foreground mt-0.5">{t('product.color')}: {item.selectedColor}</p>
                  )}
                  <p className="text-primary font-semibold text-sm mt-1">{formatCurrency(product.price)}</p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(itemId, productId)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => updateQuantity(itemId, productId, (item.quantity || 1) - 1)}
                      className="px-2 py-1 text-sm hover:bg-muted transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{item.quantity || 1}</span>
                    <button
                      onClick={() => updateQuantity(itemId, productId, (item.quantity || 1) + 1)}
                      className="px-2 py-1 text-sm hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-sm font-semibold">{formatCurrency(product.price * (item.quantity || 1))}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6 sticky top-20">
            <h3 className="font-semibold text-lg mb-4">{t('cart.orderSummary')}</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.shipping')}</span>
                <span>{shipping === 0 ? t('cart.freeShipping') : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.tax')}</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                <span>{t('cart.total')}</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {subtotal > 0 && subtotal < 150 && (
              <p className="text-xs text-muted-foreground mt-3">
                {t('cart.addMoreForFree').replace('{amount}', formatCurrency(150 - subtotal))}
              </p>
            )}

            <Button
              size="lg"
              className="w-full mt-6"
              onClick={() => {
                if (!isAuthenticated) {
                  sessionStorage.setItem('gomibox_redirect', '/checkout');
                }
                navigate(isAuthenticated ? '/checkout' : '/login');
              }}
            >
              {t('cart.proceedCheckout')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
