import { useState, useEffect } from 'react';
import { getStats } from '../../services/adminService.js';
import { formatCurrency } from '../../utils/helpers.js';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function Dashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-muted-foreground">{t('admin.failedLoad')}</div>;
  }

  const cards = [
    { label: t('admin.products'), value: stats.productCount, color: 'text-blue-600 bg-blue-50' },
    { label: t('admin.categories'), value: stats.categoryCount, color: 'text-green-600 bg-green-50' },
    { label: t('admin.users'), value: stats.userCount, color: 'text-purple-600 bg-purple-50' },
    { label: t('admin.orders'), value: stats.orderCount, color: 'text-orange-600 bg-orange-50' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color.split(' ')[1] || 'text-foreground'}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold text-lg mb-4">{t('admin.recentOrders')}</h2>
        {stats.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 font-medium text-muted-foreground">{t('admin.orderNumber')}</th>
                  <th className="pb-2 font-medium text-muted-foreground">{t('admin.customer')}</th>
                  <th className="pb-2 font-medium text-muted-foreground">{t('admin.total')}</th>
                  <th className="pb-2 font-medium text-muted-foreground">{t('admin.status')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-border last:border-0">
                    <td className="py-2 font-medium">{order.orderNumber}</td>
                    <td className="py-2">{order.user?.name || '-'}</td>
                    <td className="py-2">{formatCurrency(order.total)}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('admin.noOrders')}</p>
        )}
      </div>
    </div>
  );
}
