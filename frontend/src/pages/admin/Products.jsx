import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/adminService.js';
import { formatCurrency } from '../../utils/helpers.js';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function Products() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProducts(page)
      .then((res) => {
        setProducts(res.products);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  async function handleDelete(id, name) {
    if (!confirm(t('admin.deleteConfirm').replace('{name}', name))) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert(t('admin.deleteFailed'));
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('admin.products')} ({total})</h1>
        <Link to="/admin/products/new"><Button>{t('admin.addProduct')}</Button></Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t('admin.name')}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t('admin.categories')}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t('admin.price')}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t('admin.stock')}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">{t('admin.rating')}</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.thumbnail || product.images?.[0] || ''}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category?.name || '-'}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">{product.rating.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/products/${product._id}`}>
                          <Button variant="ghost" size="sm">{t('admin.edit')}</Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-red-50"
                          disabled={deleting === product._id}
                          onClick={() => handleDelete(product._id, product.name)}
                        >
                          {deleting === product._id ? '...' : t('admin.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">{t('admin.noProducts')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('admin.previous')}</Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">{t('admin.page')} {page} {t('search.of')} {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>{t('admin.next')}</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
