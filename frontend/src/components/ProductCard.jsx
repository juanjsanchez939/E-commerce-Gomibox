import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import { formatCurrency } from '../utils/helpers.js';
import Badge from './ui/Badge.jsx';
import Button from './ui/Button.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { whatsappLink } from '../config.js';

export default function ProductCard({ product, compact = false }) {
  const { t } = useLanguage();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const image = product.images?.[0] || product.thumbnail || '';
  const isNew = product._id && parseInt(product._id.toString().slice(-2), 16) % 4 === 0;
  const isTrending = product.rating >= 4.5;

  return (
    <div className="group relative flex flex-col rounded-3xl border-2 border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_18px_40px_-20px_rgba(216,27,96,0.55)]">
      <Link to={`/products/${product._id}`} className="relative block aspect-square overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:rotate-1 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">{t('common.noImage')}</div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {isNew && <Badge variant="new">{t('product.newLaunch')}</Badge>}
          {isTrending && !isNew && <Badge variant="primary">{t('common.trending')}</Badge>}
        </div>

        {product.rating > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-0.5 rounded-full bg-background/90 px-2 py-0.5 text-xs font-bold backdrop-blur">
            <svg className="h-3 w-3 fill-current text-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            {product.rating}
          </div>
        )}
      </Link>

      <button
        onClick={() => toggleWishlist(product)}
        aria-label={t('product.wishlist')}
        className="absolute right-2 top-2 rounded-full bg-background/80 p-2 transition-colors hover:bg-background"
      >
        <svg
          className={`h-4 w-4 ${isInWishlist(product._id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <div className={`flex flex-1 flex-col ${compact ? 'p-3' : 'p-4'}`}>
        {product.category && (
          <p className="mb-1 text-xs font-semibold text-muted-foreground">
            {typeof product.category === 'object' ? product.category.name : product.category}
          </p>
        )}

        <Link to={`/products/${product._id}`}>
          <h3 className={`font-display font-bold text-foreground transition-colors hover:text-primary line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-primary">{formatCurrency(product.price)}</span>
        </div>

        {!compact && (
          <a
            href={whatsappLink(`¡Hola Gomibox! Quiero pedir: ${product.name} (${formatCurrency(product.price)}) 🍬`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto block pt-3"
          >
            <Button variant="whatsapp" size="sm" className="w-full gap-1.5 rounded-full">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              {t('product.orderWhatsApp')}
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
