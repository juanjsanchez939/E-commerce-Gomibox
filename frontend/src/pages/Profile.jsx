import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrders } from '../services/orderService.js';
import { formatCurrency, formatDate } from '../utils/helpers.js';
import Button from '../components/ui/Button.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Profile() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t('profile.myAccount')}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="outline" onClick={logout}>{t('nav.signOut')}</Button>
      </div>

      <div className="flex border-b border-border gap-0 mb-6">
        {['orders', 'profile'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {tab === 'orders' ? t('profile.orders') : t('profile.profile')}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="rounded-xl border border-border p-6">
          <h2 className="font-semibold text-lg mb-4">{t('profile.profileInfo')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{t('profile.name')}</span>
              <span className="font-medium">{user?.name || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{t('profile.email')}</span>
              <span className="font-medium">{user?.email || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{t('profile.phone')}</span>
              <span className="font-medium">{user?.phone || '-'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">{t('profile.memberSince')}</span>
              <span className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : '-'}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="rounded-xl border border-border p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{order.items?.length || 0} {t('profile.items')}</span>
                    <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('profile.noOrders')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
