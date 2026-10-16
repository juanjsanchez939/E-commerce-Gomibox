import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCategories } from '../services/productService.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import Wordmark from './Wordmark.jsx';
import GummyBear from './GummyBear.jsx';
import Button from './ui/Button.jsx';
import { whatsappLink } from '../config.js';

export default function Footer() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-auto border-t-2 border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <GummyBear color="#ff8fc0" className="animate-jelly h-10 w-10 shrink-0" />
              <Wordmark className="text-3xl" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t('footer.tagline')}</p>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-bold">{t('footer.shop')}</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/category/${cat.slug}`} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    <span aria-hidden="true">{cat.icon || '🍬'}</span> {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-bold">{t('footer.customerCare')}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">{t('footer.helpCenter')}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">{t('footer.shippingInfo')}</a></li>
              <li><a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">{t('footer.returns')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-bold">{t('footer.contact')}</h4>
            <p className="text-sm text-muted-foreground">{t('home.ctaSubtitle')}</p>
            <a href={whatsappLink('¡Hola Gomibox! Quiero hacer un pedido 🍬')} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block">
              <Button variant="whatsapp" size="sm" className="rounded-full">{t('footer.whatsapp')}</Button>
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Gomibox. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
