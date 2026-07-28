import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/helpers.js';
import Button from '../components/ui/Button.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function CheckoutSuccess() {
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('gomibox_last_order');
      if (stored) {
        setOrder(JSON.parse(stored));
        sessionStorage.removeItem('gomibox_last_order');
      }
    } catch {}
  }, []);

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('success.noOrder')}</h1>
        <p className="text-muted-foreground mb-4">{t('success.noOrderDesc')}</p>
        <Link to="/"><Button>{t('checkout.continueShopping')}</Button></Link>
      </div>
    );
  }

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">{t('success.orderConfirmed')}</h1>
        <p className="text-muted-foreground mt-1">{t('success.thanks')}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">{t('success.orderNumber')}</p>
            <p className="font-bold text-lg">{order.orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('success.date')}</p>
            <p className="font-medium">{order.date ? formatDate(order.date) : ''}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="font-semibold mb-3">{t('success.items')}</h3>
          <div className="space-y-3">
            {(order.items || []).map((item, i) => {
              const p = item.product || item;
              return (
                <div key={i} className="flex items-center gap-3">
                  <img
                    src={p.images?.[0] || p.thumbnail || p.image || ''}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity || 1}</p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency((p.price || 0) * (item.quantity || 1))}</span>
                </div>
              );
            })}
          </div>
        </div>

        {order.customer && (
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-2">{t('success.shippingAddress')}</h3>
            <p className="text-sm text-muted-foreground">
              {order.customer.firstName} {order.customer.lastName}<br />
              {order.customer.address}{order.customer.apartment ? `, ${order.customer.apartment}` : ''}<br />
              {order.customer.city}, {order.customer.state} {order.customer.zipCode}
            </p>
          </div>
        )}

        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('success.estimatedDelivery')}</span>
            <span className="font-medium">{formatDate(deliveryDate.toISOString())}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>{t('success.totalPaid')}</span>
            <span className="text-primary">{formatCurrency(order.total || 0)}</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link to="/"><Button size="lg">{t('checkout.continueShopping')}</Button></Link>
      </div>
    </div>
  );
}
