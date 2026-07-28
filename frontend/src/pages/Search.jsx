import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/productService.js';
import { useDebounce } from '../hooks/useDebounce.js';
import ProductCard from '../components/ProductCard.jsx';
import Button from '../components/ui/Button.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Search() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(query);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const debouncedInput = useDebounce(searchInput, 500);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = { page, limit: 20 };
        if (query) params.search = query;
        if (sort !== 'relevance') {
          const sortMap = {
            'price-asc': 'price-asc',
            'price-desc': 'price-desc',
            'rating-desc': 'rating-desc',
            'name-asc': 'name-asc',
            newest: 'newest',
          };
          if (sortMap[sort]) params.sortBy = sortMap[sort];
        }
        if (category) {
          const foundCat = categories.find((c) => c.slug === category || c._id === category);
          if (foundCat) params.category = foundCat._id;
        }

        const res = await getProducts(params);
        setProducts(res.products || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 0);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [query, category, sort, page, categories]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    if (updates.q !== undefined || updates.category !== undefined) newParams.delete('page');
    setSearchParams(newParams);
  };

  const activeFilters = [];
  if (query) activeFilters.push({ key: 'q', label: `${t('search.search')}: "${query}"` });
  if (category) {
    const catName = categories.find((c) => c.slug === category)?.name || category;
    activeFilters.push({ key: 'category', label: `${t('common.category')}: ${catName}` });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('search.title')}</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParams({ q: debouncedInput || searchInput });
            }}
            placeholder={t('nav.search')}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button onClick={() => updateParams({ q: searchInput })}>{t('search.search')}</Button>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setCategoryDialogOpen(!categoryDialogOpen)}
          >
            {category ? (categories.find((c) => c.slug === category)?.name || t('common.category')) : t('search.allCategories')}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </Button>

          {categoryDialogOpen && (
            <div className="absolute top-full mt-1 right-0 w-64 bg-card border border-border rounded-lg shadow-lg z-50 p-3">
              <input
                type="text"
                placeholder={t('search.filterCategories')}
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full rounded-md border border-border px-2 py-1 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-primary/50"
                autoFocus
              />
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                <button
                  onClick={() => { updateParams({ category: '' }); setCategoryDialogOpen(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm ${!category ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                >
                  {t('search.allCategories')}
                </button>
                {filteredCategories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => { updateParams({ category: cat.slug }); setCategoryDialogOpen(false); }}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm ${category === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
        >
          <option value="relevance">{t('search.relevance')}</option>
          <option value="name-asc">{t('search.nameAz')}</option>
          <option value="price-asc">{t('search.priceLow')}</option>
          <option value="price-desc">{t('search.priceHigh')}</option>
          <option value="rating-desc">{t('search.topRated')}</option>
          <option value="newest">{t('search.newest')}</option>
        </select>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map((f) => (
            <span key={f.key} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
              {f.label}
              <button onClick={() => updateParams({ [f.key]: '' })} className="hover:text-primary-dark">&times;</button>
            </span>
          ))}
          <button onClick={() => setSearchParams({})} className="text-sm text-muted-foreground hover:text-foreground">{t('search.clearAll')}</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square rounded-xl mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">{total} {t('search.results')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                {t('search.previous')}
              </Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                {t('search.page')} {page} {t('search.of')} {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                {t('search.next')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-2">{t('search.noResults')}</p>
          <p className="text-sm text-muted-foreground">{t('search.noResultsDesc')}</p>
        </div>
      )}
    </div>
  );
}
