import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createOrder } from '../services/orderService.js';
import { validatePromoCode } from '../services/promoService.js';
import { formatCurrency } from '../utils/helpers.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const emptyForm = {
  email: '', phone: '', firstName: '', lastName: '',
  address: '', apartment: '', city: '', state: '', zipCode: '', country: 'US',
  shippingMethod: 'standard', paymentMethod: 'card',
  cardNumber: '', cardExpiry: '', cardCvc: '', cardHolder: '',
  promoCode: '',
};

function luhnCheck(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export default function Checkout() {
  const { t } = useLanguage();
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => ({
    ...emptyForm,
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
  }));
  const [errors, setErrors] = useState({});
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">{t('checkout.emptyCart')}</h1>
        <p className="text-muted-foreground mb-4">{t('checkout.emptyDesc')}</p>
        <Button onClick={() => navigate('/')}>{t('checkout.continueShopping')}</Button>
      </div>
    );
  }

  const shippingRates = { standard: 5.99, express: 14.99, overnight: 29.99 };
  const shipping = subtotal > 150 ? 0 : (shippingRates[form.shippingMethod] || 5.99);
  const discount = promoDiscount;
  const taxableSubtotal = subtotal - discount;
  const tax = Math.round(taxableSubtotal * 0.08 * 100) / 100;
  const total = Math.round((taxableSubtotal + shipping + tax) * 100) / 100;

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validateForm() {
    const errs = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = t('checkout.validation.email');
    if (!form.phone || form.phone.length < 7) errs.phone = t('checkout.validation.phone');
    if (!form.firstName || form.firstName.length < 2) errs.firstName = t('checkout.validation.firstName');
    if (!form.lastName || form.lastName.length < 2) errs.lastName = t('checkout.validation.lastName');
    if (!form.address || form.address.length < 5) errs.address = t('checkout.validation.address');
    if (!form.city || form.city.length < 2) errs.city = t('checkout.validation.city');
    if (!form.state || form.state.length < 2) errs.state = t('checkout.validation.state');
    if (!form.zipCode || form.zipCode.length < 4) errs.zipCode = t('checkout.validation.zipCode');

    if (form.paymentMethod === 'card') {
      const raw = form.cardNumber?.replace(/\s/g, '') || '';
      if (!raw || raw.length < 13) errs.cardNumber = t('checkout.validation.cardNumber');
      else if (!luhnCheck(raw)) errs.cardNumber = t('checkout.validation.invalidCard');
      if (!form.cardExpiry || !/^\d{2}\/\d{2}$/.test(form.cardExpiry)) errs.cardExpiry = t('checkout.validation.expiry');
      else {
        const [m, y] = form.cardExpiry.split('/').map(Number);
        const now = new Date();
        if (m < 1 || m > 12 || y < now.getFullYear() % 100 || (y === now.getFullYear() % 100 && m < now.getMonth() + 1)) {
          errs.cardExpiry = t('checkout.validation.expiredCard');
        }
      }
      if (!form.cardCvc || !/^\d{3,4}$/.test(form.cardCvc)) errs.cardCvc = t('checkout.validation.cvc');
      if (!form.cardHolder || form.cardHolder.length < 2) errs.cardHolder = t('checkout.validation.cardHolder');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleApplyPromo() {
    if (!form.promoCode) return;
    setPromoError('');
    try {
      const res = await validatePromoCode(form.promoCode, subtotal);
      setPromoDiscount(res.data.discountAmount);
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid promo code');
      setPromoDiscount(0);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const orderRes = await createOrder(form);
      sessionStorage.setItem('gomibox_last_order', JSON.stringify({
        orderId: orderRes.data.orderNumber,
        date: orderRes.data.createdAt,
        items: cartItems,
        total: orderRes.data.total,
        customer: form,
      }));
      await clearCart();
      navigate('/checkout/success');
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Checkout failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">{t('checkout.contactInfo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.email')}</label>
                <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@example.com" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.phone')}</label>
                <Input type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+1 234 567 890" />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">{t('checkout.shippingAddress')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.firstName')}</label>
                <Input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
                {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.lastName')}</label>
                <Input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
                {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t('checkout.address')}</label>
                <Input value={form.address} onChange={(e) => updateField('address', e.target.value)} />
                {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.apartment')}</label>
                <Input value={form.apartment} onChange={(e) => updateField('apartment', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.city')}</label>
                <Input value={form.city} onChange={(e) => updateField('city', e.target.value)} />
                {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.state')}</label>
                <Input value={form.state} onChange={(e) => updateField('state', e.target.value)} />
                {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.zipCode')}</label>
                <Input value={form.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} />
                {errors.zipCode && <p className="text-xs text-destructive mt-1">{errors.zipCode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('checkout.shippingMethod')}</label>
                <select
                  value={form.shippingMethod}
                  onChange={(e) => updateField('shippingMethod', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="standard">{t('checkout.standard')} ($5.99)</option>
                  <option value="express">{t('checkout.express')} ($14.99)</option>
                  <option value="overnight">{t('checkout.overnight')} ($29.99)</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg mb-4">{t('checkout.payment')}</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {['card', 'apple_pay', 'upi', 'cod'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => updateField('paymentMethod', method)}
                  className={`px-4 py-2 rounded-lg border text-sm transition-colors ${form.paymentMethod === method ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:bg-muted'}`}
                >
                  {method === 'card' && t('checkout.creditCard')}
                  {method === 'apple_pay' && t('checkout.applePay')}
                  {method === 'upi' && t('checkout.upi')}
                  {method === 'cod' && t('checkout.cod')}
                </button>
              ))}
            </div>

            {form.paymentMethod === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('checkout.cardNumber')}</label>
                  <Input value={form.cardNumber} onChange={(e) => updateField('cardNumber', e.target.value)} placeholder="1234 5678 9012 3456" />
                  {errors.cardNumber && <p className="text-xs text-destructive mt-1">{errors.cardNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('checkout.expiry')} (MM/YY)</label>
                  <Input value={form.cardExpiry} onChange={(e) => updateField('cardExpiry', e.target.value)} placeholder="MM/YY" />
                  {errors.cardExpiry && <p className="text-xs text-destructive mt-1">{errors.cardExpiry}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('checkout.cvc')}</label>
                  <Input value={form.cardCvc} onChange={(e) => updateField('cardCvc', e.target.value)} placeholder="123" />
                  {errors.cardCvc && <p className="text-xs text-destructive mt-1">{errors.cardCvc}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">{t('checkout.cardHolder')}</label>
                  <Input value={form.cardHolder} onChange={(e) => updateField('cardHolder', e.target.value)} />
                  {errors.cardHolder && <p className="text-xs text-destructive mt-1">{errors.cardHolder}</p>}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6 sticky top-20">
            <h3 className="font-semibold text-lg mb-4">{t('cart.orderSummary')}</h3>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {cartItems.map((item, i) => {
                const p = item.product || item;
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <img src={p.images?.[0] || p.thumbnail || p.image || ''} alt="" className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity || 1}</p>
                    </div>
                    <span className="font-medium">{formatCurrency(p.price * (item.quantity || 1))}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 mb-4">
              <Input
                value={form.promoCode}
                onChange={(e) => updateField('promoCode', e.target.value)}
                placeholder={t('checkout.promoCode')}
                className="text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleApplyPromo}>{t('checkout.apply')}</Button>
            </div>
            {promoError && <p className="text-xs text-destructive mb-2">{promoError}</p>}
            {promoDiscount > 0 && (
              <p className="text-xs text-primary mb-2">{t('checkout.promoApplied')}: -{formatCurrency(promoDiscount)}</p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.subtotal')}</span><span>{formatCurrency(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-primary"><span>{t('checkout.discount')}</span><span>-{formatCurrency(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.shipping')}</span><span>{shipping === 0 ? t('cart.freeShipping') : formatCurrency(shipping)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t('cart.tax')}</span><span>{formatCurrency(tax)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
                <span>{t('cart.total')}</span><span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {errors.submit && (
              <p className="text-sm text-destructive mt-4 p-3 bg-red-50 rounded-lg">{errors.submit}</p>
            )}

            <Button type="submit" size="lg" className="w-full mt-6" disabled={submitting}>
              {submitting ? t('checkout.processing') : `${t('checkout.pay')} ${formatCurrency(total)}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
