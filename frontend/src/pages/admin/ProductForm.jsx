import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProduct, updateProduct, getProducts } from '../../services/adminService.js';
import { getCategories as fetchCategories } from '../../services/productService.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const emptyForm = {
  name: '', tagline: '', description: '', price: '', discountPercentage: 0,
  stock: '', brand: '', categorySlug: '', rating: 0,
  thumbnail: '', images: '', features: '', colors: '',
  warrantyInformation: '', shippingInformation: '', returnPolicy: '',
};

export default function ProductForm() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getProducts(1, 100)
      .then((res) => {
        const product = (res.products || []).find((p) => p._id === id);
        if (product) {
          setForm({
            name: product.name || '',
            tagline: product.tagline || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            discountPercentage: product.discountPercentage || 0,
            stock: product.stock?.toString() || '',
            brand: product.brand || '',
            categorySlug: product.category?.slug || '',
            rating: product.rating || 0,
            thumbnail: product.thumbnail || '',
            images: (product.images || []).join(','),
            features: (product.features || []).join('|'),
            colors: (product.colors || []).join(','),
            warrantyInformation: product.warrantyInformation || '',
            shippingInformation: product.shippingInformation || '',
            returnPolicy: product.returnPolicy || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.price) return alert(t('admin.namePriceRequired'));

    setLoading(true);
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      discountPercentage: parseFloat(form.discountPercentage) || 0,
      rating: parseFloat(form.rating) || 0,
      images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
      features: form.features ? form.features.split('|').map((s) => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/admin/products');
    } catch (err) {
      alert(err.response?.data?.message || t('admin.saveFailed'));
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className="text-muted-foreground">{t('common.loading')}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? t('admin.editProduct') : t('admin.newProduct')}</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">{t('admin.basicInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.name')} *</label>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.brand')}</label>
              <Input value={form.brand} onChange={(e) => update('brand', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.price')} *</label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.discountPercent')}</label>
              <Input type="number" step="0.1" value={form.discountPercentage} onChange={(e) => update('discountPercentage', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.stock')}</label>
              <Input type="number" value={form.stock} onChange={(e) => update('stock', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('admin.categorySlug')}</label>
              <div className="flex gap-2">
                <Input
                  list="category-list"
                  value={form.categorySlug}
                  onChange={(e) => update('categorySlug', e.target.value)}
                  placeholder="e.g. smartphones"
                />
                <datalist id="category-list">
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </datalist>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t('admin.tagline')}</label>
              <Input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">{t('admin.description')}</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">{t('admin.media')}</h2>
          <div>
            <label className="block text-sm font-medium mb-1">{t('admin.thumbnailUrl')}</label>
            <Input value={form.thumbnail} onChange={(e) => update('thumbnail', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('admin.imageUrls')}</label>
            <Input value={form.images} onChange={(e) => update('images', e.target.value)} placeholder="https://...,https://..." />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">{t('admin.details')}</h2>
          <div>
            <label className="block text-sm font-medium mb-1">{t('admin.features')}</label>
            <Input value={form.features} onChange={(e) => update('features', e.target.value)} placeholder="Feature 1|Feature 2|Feature 3" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('admin.colors')}</label>
            <Input value={form.colors} onChange={(e) => update('colors', e.target.value)} placeholder="Black,White,Blue" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('admin.rating')}</label>
            <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => update('rating', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('admin.warranty')}</label>
            <Input value={form.warrantyInformation} onChange={(e) => update('warrantyInformation', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('admin.shippingInfo')}</label>
            <Input value={form.shippingInformation} onChange={(e) => update('shippingInformation', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('admin.returnPolicy')}</label>
            <Input value={form.returnPolicy} onChange={(e) => update('returnPolicy', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? t('admin.saving') : isEdit ? t('admin.update') : t('admin.save')}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('/admin/products')}>
            {t('admin.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
