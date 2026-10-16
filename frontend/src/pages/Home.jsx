import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../services/productService.js';
import ProductCard from '../components/ProductCard.jsx';
import Button from '../components/ui/Button.jsx';
import Wordmark from '../components/Wordmark.jsx';
import GummyBear from '../components/GummyBear.jsx';
import Balloon from '../components/Balloon.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { whatsappLink } from '../config.js';

const GALLERY = [
  { src: '/brand/bandeja-1.jpeg', key: 'home.gallery.bandeja1' },
  { src: '/brand/bandeja-2.jpeg', key: 'home.gallery.bandeja2' },
  { src: '/brand/bolsa-gomibox.jpeg', key: 'home.gallery.bolsa' },
  { src: '/brand/caja-regalo.jpeg', key: 'home.gallery.caja' },
];

const GENERAL_ORDER = '¡Hola Gomibox! Quiero armar mi caja de gomitas 🍬';

const BEARS = [
  { color: '#ff8fc0', delay: '' },
  { color: '#a8e6cf', delay: 'delay-1' },
  { color: '#c7b8ea', delay: 'delay-2' },
  { color: '#ffe5a0', delay: 'delay-3' },
  { color: '#a8d8ea', delay: 'delay-1' },
];

const BALLOONS = [
  { color: '#ff8fc0', mt: '', delay: '' },
  { color: '#a8d8ea', mt: 'mt-6', delay: 'delay-1' },
  { color: '#ffe5a0', mt: 'mt-2', delay: 'delay-2' },
  { color: '#a8e6cf', mt: 'mt-8', delay: 'delay-3' },
  { color: '#c7b8ea', mt: 'mt-3', delay: 'delay-1' },
  { color: '#ff9f1c', mt: 'mt-7', delay: 'delay-2' },
];

export default function Home() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts({ limit: 8, page: 1 }),
          getCategories(),
        ]);
        setProducts(prodRes.products || []);
        setTotal(prodRes.total || prodRes.products?.length || 0);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to load homepage:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const catalogHref = categories[0] ? `/category/${categories[0].slug}` : '/search';

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="mb-4 h-64 w-full rounded-[2.5rem]" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-2 aspect-square rounded-3xl" />
              <Skeleton className="mb-1 h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
          <div className="text-center md:text-left">
            <h1 className="sr-only">Gomibox</h1>

            <Wordmark className="text-5xl md:text-7xl" bounce />

            <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground md:mx-0">
              {t('home.heroSubtitle')}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link to={catalogHref}>
                <Button size="lg" className="rounded-full">{t('home.seeCatalog')}</Button>
              </Link>
              <a href={whatsappLink(GENERAL_ORDER)} target="_blank" rel="noopener noreferrer">
                <Button variant="whatsapp" size="lg" className="rounded-full">{t('home.orderWhatsApp')}</Button>
              </a>
            </div>
          </div>

          <div className="relative">
            <GummyBear color="#a8e6cf" className="animate-drift absolute -left-3 top-6 h-14 w-14 md:h-20 md:w-20" />
            <GummyBear color="#c7b8ea" className="animate-drift delay-2 absolute -right-2 bottom-8 h-12 w-12 md:h-16 md:w-16" />
            <GummyBear color="#ffe5a0" className="animate-drift delay-1 absolute -right-4 top-2 h-10 w-10 md:h-14 md:w-14" />
            <Balloon color="#c7b8ea" className="animate-balloon absolute -left-6 bottom-0 h-16 w-10 md:h-24 md:w-14" />
            <span aria-hidden="true" className="animate-twinkle absolute left-6 top-0 text-3xl">✨</span>
            <img
              src="/brand/poster-valijita.jpeg"
              alt="Valijita Gomibox con gomitas Mogul"
              className="sticker mx-auto w-full max-w-sm rotate-2 rounded-[2.5rem] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Cinta divertida */}
      <div className="overflow-hidden border-y-2 border-border bg-butter/40 py-2.5">
        <div className="animate-marquee flex w-max whitespace-nowrap font-display text-lg font-bold text-primary">
          <span className="pr-10">{t('home.marquee')}</span>
          <span className="pr-10" aria-hidden="true">{t('home.marquee')}</span>
        </div>
      </div>

      {/* Ositos de goma */}
      <div className="mx-auto flex max-w-7xl items-end justify-center gap-2 px-4 pt-10 md:gap-4">
        {BEARS.map((bear) => (
          <GummyBear key={bear.color} color={bear.color} className={`animate-jelly h-9 w-9 md:h-14 md:w-14 ${bear.delay}`} />
        ))}
      </div>

      {/* Categorías */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-center font-display text-3xl font-extrabold md:text-4xl">{t('home.categoriesTitle')}</h2>
          <p className="mt-1 text-center text-muted-foreground">{t('home.categoriesSubtitle')}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group flex items-center gap-4 rounded-3xl border-2 border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-butter/60 text-3xl">
                  {cat.icon || '🍬'}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-xl font-bold">{cat.name}</span>
                  {cat.description && <span className="block truncate text-sm text-muted-foreground">{cat.description}</span>}
                  <span className="mt-1 block text-sm font-bold text-primary group-hover:underline">{t('home.browseCategory')} →</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Galería */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-center font-display text-3xl font-extrabold md:text-4xl">{t('home.galleryTitle')}</h2>
        <p className="mt-1 text-center text-muted-foreground">{t('home.gallerySubtitle')}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {GALLERY.map((item, i) => (
            <figure
              key={item.src}
              className={`sticker group relative overflow-hidden rounded-3xl ${i % 2 ? 'md:rotate-1' : 'md:-rotate-1'}`}
            >
              <img
                src={item.src}
                alt={t(item.key)}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-bold text-white">
                {t(item.key)}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Video */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid items-center gap-8 rounded-[2.5rem] border-2 border-border bg-lilac/25 p-6 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="font-display text-3xl font-extrabold md:text-4xl">{t('home.videoTitle')}</h2>
            <p className="mt-2 text-muted-foreground">{t('home.videoSubtitle')}</p>
            <a href={whatsappLink(GENERAL_ORDER)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block">
              <Button variant="whatsapp" size="lg" className="rounded-full">{t('home.ctaButton')}</Button>
            </a>
          </div>
          <video
            src="/brand/reel.mp4"
            className="sticker w-full rounded-3xl"
            controls
            muted
            loop
            playsInline
            preload="metadata"
          />
        </div>
      </section>

      {/* Destacadas */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-3xl font-extrabold md:text-4xl">
                <GummyBear color="#ff8fc0" className="animate-jelly h-8 w-8 shrink-0" />
                {t('home.featuredTitle')}
              </h2>
              <p className="mt-1 text-muted-foreground">
                {total} {t('home.productsCount')} · {t('home.featuredSubtitle')}
              </p>
            </div>
            <Link to={catalogHref} className="font-bold text-primary hover:underline">
              {t('home.viewCatalog')} →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to={catalogHref}>
              <Button size="lg" className="rounded-full">{t('home.viewCatalog')}</Button>
            </Link>
          </div>
        </section>
      )}

      {/* Guirnalda de globos */}
      <div aria-hidden="true" className="animate-pop-bounce mx-auto flex max-w-7xl items-start justify-center gap-1 px-4 pt-12 md:gap-4">
        {BALLOONS.map((balloon) => (
          <Balloon
            key={balloon.color}
            color={balloon.color}
            className={`animate-balloon h-16 w-9 md:h-24 md:w-14 ${balloon.mt} ${balloon.delay}`}
          />
        ))}
      </div>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-12 text-center text-white">
          <GummyBear color="#a8e6cf" className="animate-drift absolute left-6 top-6 h-10 w-10 md:h-14 md:w-14" />
          <GummyBear color="#ffe5a0" className="animate-drift delay-2 absolute right-8 top-10 h-9 w-9 md:h-12 md:w-12" />
          <Balloon color="#ffd23f" className="animate-balloon absolute -left-1 bottom-2 h-14 w-9 md:left-8 md:h-20 md:w-12" />
          <Balloon color="#a8d8ea" className="animate-balloon delay-2 absolute -right-1 bottom-2 h-12 w-8 md:right-10 md:h-16 md:w-10" />
          <span aria-hidden="true" className="animate-twinkle absolute bottom-6 right-1/4 text-3xl">✨</span>

          <h2 className="font-display text-3xl font-extrabold md:text-4xl">{t('home.ctaTitle')}</h2>
          <p className="mt-2 text-white/90">{t('home.ctaSubtitle')}</p>
          <a href={whatsappLink(GENERAL_ORDER)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block">
            <Button variant="whatsapp" size="lg" className="rounded-full">{t('home.ctaButton')}</Button>
          </a>
        </div>
      </section>
    </div>
  );
}
