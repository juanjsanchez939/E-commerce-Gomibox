import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import Button from './ui/Button.jsx';
import Wordmark from './Wordmark.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { getProducts } from '../services/productService.js';
import { whatsappLink } from '../config.js';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    getProducts({ search: debouncedQuery, limit: 5 })
      .then((res) => setSuggestions(res.products || []))
      .catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="bg-gradient-to-r from-berry/25 via-lilac/25 to-cotton/25 text-center py-1.5 text-xs font-semibold text-foreground">
        {t('nav.promoFun')}
      </div>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="Gomibox — inicio">
          <Wordmark className="text-2xl md:text-3xl" />
        </Link>

        <div className="hidden md:flex flex-1 max-w-lg relative">
          <input
            type="text"
            placeholder={t('nav.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
              }
            }}
            className="w-full rounded-full border border-border bg-muted/60 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-2xl shadow-lg z-50 max-h-80 overflow-auto">
              {suggestions.map((p) => (
                <Link
                  key={p._id}
                  to={`/products/${p._id}`}
                  onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted transition-colors"
                >
                  <img src={p.thumbnail || p.images?.[0]} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            className="md:hidden p-2 rounded-full hover:bg-muted"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label={t('nav.search')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>

          <Link
            to="/search"
            className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors px-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" /></svg>
            {t('nav.catalog')}
          </Link>

          <button onClick={toggleLang} className="p-2 rounded-full hover:bg-muted text-xs font-bold uppercase" aria-label="Cambiar idioma" title="Change language">
            {lang}
          </button>

          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted" aria-label="Cambiar tema" title="Toggle theme">
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          <Link to="/profile" className="relative p-2 rounded-full hover:bg-muted" aria-label={t('product.wishlist')} title={t('product.wishlist')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-berry text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount > 9 ? '9+' : wishlistCount}
              </span>
            )}
          </Link>

          <a
            href={whatsappLink('¡Hola Gomibox! Quiero hacer un pedido 🍬')}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <Button variant="whatsapp" size="sm" className="rounded-full gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              {t('nav.orderWhatsApp')}
            </Button>
          </a>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <Link to="/admin"><Button variant="primary" size="sm" className="text-xs rounded-full">{t('nav.admin')}</Button></Link>
              )}
              <Link to="/profile" className="text-sm font-semibold hover:text-primary transition-colors">{user?.name}</Link>
              <Button variant="ghost" size="sm" onClick={logout}>{t('nav.signOut')}</Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-full">{t('nav.signIn')}</Button>
            </Link>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <input
            type="text"
            placeholder={t('nav.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                setSearchQuery('');
                setSearchOpen(false);
              }
            }}
            className="w-full rounded-full border border-border bg-muted px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            autoFocus
          />
        </div>
      )}
    </header>
  );
}
