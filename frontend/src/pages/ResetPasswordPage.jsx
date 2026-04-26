import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authService.resetPassword(token, { password: form.password });
      const user = data.token ? await saveAuth(data.token) : null;
      toast.success('Password updated');
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #F5F5F5 0%, #E8F5E9 100%)', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '2rem' }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '0.5rem' }}>Reset password</h1>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input className="input-field" type="password" placeholder="New password" value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} style={{ paddingLeft: '2.6rem' }} required />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input className="input-field" type="password" placeholder="Confirm new password" value={form.confirmPassword} onChange={(e) => setForm(prev => ({ ...prev, confirmPassword: e.target.value }))} style={{ paddingLeft: '2.6rem' }} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? <LoaderCircle size={16} className="spin" /> : 'Update password'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', color: '#6B7280', fontSize: '0.9rem' }}>
          Already remembered it? <Link to="/login" style={{ color: '#1B5E20', fontWeight: 700, textDecoration: 'none' }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;