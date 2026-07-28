import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/productService.js';
import ProductCard from '../components/ProductCard.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Category() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts({ category: slug, limit: 30, page: 1 }),
          getCategories(),
        ]);
        setProducts(prodRes.products || []);
        const cats = catRes.data || [];
        setCategory(cats.find((c) => c.slug === slug) || null);
      } catch {
        setProducts([]);
        setCategory(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating-desc':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [products, sortBy]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square rounded-xl mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link to="/" className="hover:text-primary">{t('common.home')}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{category?.name || slug}</span>
        </nav>

        <h1 className="text-3xl font-bold">
          {category?.icon && <span className="mr-2">{category.icon}</span>}
          {category?.name || slug?.replace(/-/g, ' ')}
        </h1>
        {category?.description && (
          <p className="text-muted-foreground mt-1">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">{sortedProducts.length} products</p>
      </div>

      {sortedProducts.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="featured">{t('search.relevance')}</option>
            <option value="price-asc">{t('search.priceLow')}</option>
            <option value="price-desc">{t('search.priceHigh')}</option>
            <option value="rating-desc">{t('search.topRated')}</option>
            <option value="name-asc">{t('search.nameAz')}</option>
          </select>
        </div>
      )}

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-2">{t('search.noResults')}</p>
          <Link to="/" className="text-primary hover:underline text-sm">{t('home.shopNow')}</Link>
        </div>
      )}
    </div>
  );
}
