import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Register() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError(t('auth.fillAll'));
      return;
    }
    if (form.password.length < 6) {
      setError(t('auth.passwordMin'));
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">{t('auth.createAccount')}</h1>
          <p className="text-muted-foreground mt-1">{t('auth.registerDesc')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-destructive">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.fullName')}</label>
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="John Doe" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
            <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
            <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Min. 6 characters" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.phone')}</label>
            <Input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 234 567 890" />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? t('auth.creating') : t('auth.createAccount')}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">{t('auth.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
