import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getFeaturedProducts, getCategories } from '../services/productService.js';
import ProductCard from '../components/ProductCard.jsx';
import Button from '../components/ui/Button.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const featuredSlugs = ['laptops', 'mens-watches', 'beauty', 'furniture', 'fragrances', 'groceries'];

export default function Home() {
  const { t } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [categoryGroups, setCategoryGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [featuredRes, catRes] = await Promise.all([
          getFeaturedProducts(8),
          getCategories(),
        ]);
        setFeatured(featuredRes.data || []);

        const cats = catRes.data || [];
        setCategories(cats);

        const groupPromises = featuredSlugs.map((slug) =>
          getProducts({ category: slug, limit: 4, page: 1 })
            .then((res) => ({ slug, products: res.products || [] }))
            .catch(() => ({ slug, products: [] }))
        );

        const groups = await Promise.all(groupPromises);
        setCategoryGroups(groups.filter((g) => g.products.length > 0));
      } catch (err) {
        console.error('Failed to load homepage:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-80 w-full rounded-xl mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square rounded-xl mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {featured.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-border">
            <div className="flex flex-col md:flex-row items-center">
              <div className="p-8 md:p-12 md:w-1/2">
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {t('home.newArrivals')}
                </span>
                <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
                  {t('home.discover')} <span className="text-primary">{t('home.premium')}</span>
                </h1>
                <p className="mt-4 text-muted-foreground max-w-md">
                  {t('home.subtitle')}
                </p>
                <div className="mt-6 flex gap-3">
                  <Link to="/search">
                    <Button size="lg">{t('home.shopNow')}</Button>
                  </Link>
                  <Link to="/search?category=smartphones">
                    <Button variant="outline" size="lg">{t('home.viewDeals')}</Button>
                  </Link>
                </div>
              </div>
              {featured[0] && (
                <div className="md:w-1/2 p-4 md:p-8 flex items-center justify-center">
                  <img
                    src={featured[0].thumbnail || featured[0].images?.[0]}
                    alt={featured[0].name}
                    className="max-h-72 object-contain rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t('home.featuredProducts')}</h2>
            <Link to="/search" className="text-sm text-primary hover:underline font-medium">{t('home.viewAll')}</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {categoryGroups.map((group) => {
        const cat = categories.find((c) => c.slug === group.slug);
        return (
          <section key={group.slug} className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{cat?.name || group.slug}</h2>
                {cat?.description && (
                  <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>
                )}
              </div>
              <Link to={`/category/${group.slug}`} className="text-sm text-primary hover:underline font-medium">{t('home.viewMore')}</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {group.products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        );
      })}

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">{t('home.shopByCategory')}</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary hover:bg-accent transition-colors text-center"
              >
                <span className="text-2xl">{cat.icon || '📦'}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
