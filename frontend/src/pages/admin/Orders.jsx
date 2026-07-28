import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../services/adminService.js';
import { formatCurrency, formatDate } from '../../utils/helpers.js';
import Button from '../../components/ui/Button.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrders(page)
      .then((res) => {
        setOrders(res.orders);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  async function handleStatusChange(id, status) {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch {
      alert(t('admin.statusUpdateFailed'));
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.orders')} ({total})</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.user?.name || t('admin.unknown')} ({order.user?.email})</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    <p className="text-sm mt-2 text-muted-foreground">
                      {order.items?.length || 0} {t('admin.items')} | {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(order.total)}</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`mt-2 text-xs px-2 py-1 rounded-full font-medium capitalize border-0 cursor-pointer ${statusColors[order.status] || 'bg-muted'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-center text-muted-foreground py-12">{t('admin.noOrders')}</p>
            )}
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
