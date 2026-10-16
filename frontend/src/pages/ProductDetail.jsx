import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getProducts } from '../services/productService.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import { formatCurrency, getDiscountBadge, getStarRating } from '../utils/helpers.js';
import { whatsappLink } from '../config.js';
import ProductCard from '../components/ProductCard.jsx';
import GummyBear from '../components/GummyBear.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function ProductDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getProductById(id);
        const prod = res.data;
        setProduct(prod);
        setSelectedColor(prod.colors?.[0] || '');

        if (prod.category) {
          const catId = typeof prod.category === 'object' ? prod.category._id : prod.category;
          const relRes = await getProducts({ category: catId, limit: 5, page: 1 });
          setRelated((relRes.products || []).filter((p) => p._id !== prod._id));
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-6 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <GummyBear color="#ff8fc0" className="animate-jelly mx-auto mb-4 h-20 w-20" />
        <h1 className="text-2xl font-bold mb-2">{t('product.notFound')}</h1>
        <p className="text-muted-foreground mb-4">{t('product.notFoundDesc')}</p>
        <Link to="/"><Button>{t('product.backToStore')}</Button></Link>
      </div>
    );
  }

  const discount = getDiscountBadge(product.price, product.discountPercentage);
  const images = product.images?.length ? product.images : [product.thumbnail];
  const catSlug = typeof product.category === 'object' ? product.category.slug : '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">{t('common.home')}</Link>
        <span>/</span>
        {catSlug && (
          <>
            <Link to={`/category/${catSlug}`} className="hover:text-primary">
              {typeof product.category === 'object' ? product.category.name : product.category}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl border-2 border-border bg-muted mb-3">
            {images[selectedImage] ? (
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">{t('common.noImage')}</div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product._id && parseInt(product._id.toString().slice(-2), 16) % 4 === 0 && <Badge variant="new">{t('product.newLaunch')}</Badge>}
            {discount && <Badge variant="sale">{discount.label.replace('SAVE', t('product.save'))}</Badge>}
          </div>

          <h1 className="font-display text-3xl font-extrabold md:text-4xl">{product.name}</h1>
          {product.brand && <p className="text-sm text-muted-foreground mt-1">by {product.brand}</p>}

          <div className="flex items-center gap-2 mt-3">
            <span className="text-3xl font-bold text-primary">{formatCurrency(product.price)}</span>
            {discount && <span className="text-lg text-muted-foreground line-through">{formatCurrency(discount.originalPrice)}</span>}
          </div>

          {product.rating > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const starRating = getStarRating(product.rating);
                return (
                  <svg key={i} className={`w-4 h-4 ${i < starRating.full + starRating.half ? 'text-yellow-500 fill-current' : 'text-muted'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                );
              })}
              <span className="text-sm text-muted-foreground ml-1">({product.rating})</span>
            </div>
          )}

          <p className="mt-4 text-muted-foreground leading-relaxed">{product.description || product.tagline}</p>

          {product.colors && product.colors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">{t('product.color')}: <span className="text-muted-foreground">{selectedColor}</span></p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1 rounded-full border text-sm transition-colors ${selectedColor === color ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-muted-foreground'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border-2 border-border">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3.5 py-2 font-bold transition-colors hover:bg-muted" aria-label="Menos">−</button>
              <span className="min-w-[3rem] px-2 py-2 text-center text-sm font-bold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3.5 py-2 font-bold transition-colors hover:bg-muted" aria-label="Más">+</button>
            </div>

            <a
              href={whatsappLink(`¡Hola Gomibox! Quiero pedir ${quantity} x ${product.name} (${formatCurrency(product.price * quantity)}) 🍬`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="whatsapp" size="lg" className="w-full gap-2 rounded-full">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                {t('product.orderWhatsApp')}
              </Button>
            </a>

            <button
              onClick={() => toggleWishlist(product)}
              aria-label={t('product.wishlist')}
              className={`rounded-full border-2 p-2.5 transition-colors ${isInWishlist(product._id) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'}`}
            >
              <svg className="w-5 h-5" fill={isInWishlist(product._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <p className="mt-3 text-sm font-semibold text-muted-foreground">
            {product.stock > 0 ? `✅ ${product.stock} ${t('product.available')}` : `❌ ${t('product.outOfStock')}`}
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {product.shippingInformation && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                {product.shippingInformation}
              </div>
            )}
            {product.warrantyInformation && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                {product.warrantyInformation}
              </div>
            )}
            {product.returnPolicy && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                {product.returnPolicy}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex border-b border-border gap-0">
          {['overview', 'features', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab === 'overview' ? t('product.overview') : tab === 'features' ? t('product.features') : t('product.reviews')}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'overview' && (
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              {product.tagline && <p className="mt-2 font-medium">{product.tagline}</p>}
            </div>
          )}

          {activeTab === 'features' && (
            <ul className="space-y-2">
              {(product.features || []).length > 0 ? (
                product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">{t('product.noFeatures')}</li>
              )}
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t('product.stock')}: {product.stock > 0 ? `${product.stock} ${t('product.available')}` : t('product.outOfStock')}
              </li>
            </ul>
          )}

          {activeTab === 'reviews' && (
            <div>
              {(product.reviews || []).length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review, i) => (
                    <div key={i} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {(review.user?.name || review.reviewerName || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.user?.name || review.reviewerName || 'Anonymous'}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <svg key={s} className={`w-3 h-3 ${s < review.rating ? 'text-yellow-500 fill-current' : 'text-muted'}`} viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto">{review.date || new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('product.noReviews')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">{t('product.youMightLike')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
