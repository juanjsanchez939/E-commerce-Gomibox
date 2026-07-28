import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency, getDiscountBadge } from '../utils/helpers.js';
import Badge from './ui/Badge.jsx';
import Button from './ui/Button.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const colorMap = {
  red: 'bg-red-500', blue: 'bg-blue-500', green: 'bg-green-500',
  black: 'bg-black', white: 'bg-white border', gray: 'bg-gray-400',
  purple: 'bg-purple-500', gold: 'bg-yellow-500', silver: 'bg-gray-300',
  pink: 'bg-pink-400', navy: 'bg-blue-900', brown: 'bg-amber-800',
};

export default function ProductCard({ product, compact = false }) {
  const { t } = useLanguage();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();

  const isInCart = cartItems.some((i) => (i.product?._id || i.product) === product._id);
  const discount = getDiscountBadge(product.price, product.discountPercentage);
  const image = product.images?.[0] || product.thumbnail || '';
  const isNew = product._id && parseInt(product._id.toString().slice(-2), 16) % 4 === 0;
  const isTrending = product.rating >= 4.5;

  return (
    <div className="group relative rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-all">
      <Link to={`/products/${product._id}`} className="block relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">{t('common.noImage')}</div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <Badge variant="new">{t('product.newLaunch')}</Badge>}
          {discount && <Badge variant="sale">{discount.label.replace('SAVE', t('product.save'))}</Badge>}
          {isTrending && !isNew && !discount && <Badge variant="primary">{t('common.trending')}</Badge>}
        </div>

        {product.rating > 0 && (
          <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur rounded-md px-1.5 py-0.5 text-xs font-medium flex items-center gap-0.5">
            <svg className="w-3 h-3 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            {product.rating}
          </div>
        )}
      </Link>

      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
      >
        <svg
          className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div className={compact ? 'p-3' : 'p-4'}>
        {product.category && (
          <p className="text-xs text-muted-foreground mb-1">
            {typeof product.category === 'object' ? product.category.name : product.category}
          </p>
        )}

        <Link to={`/products/${product._id}`}>
          <h3 className={`font-semibold text-foreground hover:text-primary transition-colors line-clamp-1 ${compact ? 'text-sm' : ''}`}>
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
          {discount && (
            <span className="text-xs text-muted-foreground line-through">{formatCurrency(discount.originalPrice)}</span>
          )}
        </div>

        {product.colors && product.colors.length > 0 && (
          <div className="mt-2 flex gap-1">
            {product.colors.slice(0, 5).map((color) => (
              <span
                key={color}
                className={`w-3.5 h-3.5 rounded-full border border-border ${colorMap[color.toLowerCase()] || 'bg-gray-300'}`}
                title={color}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[10px] text-muted-foreground">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        {!compact && (
          <Button
            variant={isInCart ? 'secondary' : 'primary'}
            size="sm"
            className="mt-3 w-full"
            onClick={() => addToCart(product, 1, product.colors?.[0] || '')}
          >
            {isInCart ? t('common.addMore') : t('product.addToCart')}
          </Button>
        )}
      </div>
    </div>
  );
}
