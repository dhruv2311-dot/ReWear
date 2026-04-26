import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.forgotPassword({ email });
      setResetUrl(data.resetUrl || '');
      toast.success('Reset link generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #F5F5F5 0%, #E8F5E9 100%)', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '2rem' }}>
        <Link to="/login" className="btn-ghost" style={{ padding: 0, marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to login
        </Link>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '0.5rem' }}>Forgot password</h1>
        <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Enter your email and we’ll generate a reset link.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: '2.6rem' }} required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? <LoaderCircle size={16} className="spin" /> : 'Send reset link'}
          </button>
        </form>

        {resetUrl && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(27,94,32,0.08)', borderRadius: '12px', color: '#1B5E20', wordBreak: 'break-word' }}>
            Development reset link: <Link to={resetUrl.replace(window.location.origin, '')}>{resetUrl}</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;