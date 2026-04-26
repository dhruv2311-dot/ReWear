import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, LoaderCircle, MapPin, Save, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', bio: '', city: '', state: '', country: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      bio: user.bio || '',
      city: user.location?.city || '',
      state: user.location?.state || '',
      country: user.location?.country || '',
    });
    setAvatarPreview(user.avatar || '');
  }, [user]);

  const handleAvatarChange = (file) => {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (avatarFile) formData.append('avatar', avatarFile);
      const { data } = await authService.updateProfile(formData);
      updateUser(data.user);
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', padding: '2rem 0' }}>
      <div className="container-main" style={{ maxWidth: '780px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '1.5rem' }}>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '0.35rem' }}>Edit Profile</h1>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Update your public profile and location for better matching.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <img src={avatarPreview || `https://ui-avatars.com/api/?name=${form.name}&background=1B5E20&color=fff`} alt="Avatar preview" style={{ width: '88px', height: '88px', borderRadius: '24px', objectFit: 'cover' }} />
              <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                <Camera size={16} /> Change avatar
                <input type="file" accept="image/*" hidden onChange={(e) => handleAvatarChange(e.target.files?.[0])} />
              </label>
            </div>

            <div>
              <label className="form-label">Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input className="input-field" style={{ paddingLeft: '2.6rem' }} value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="form-label">Bio</label>
              <textarea className="input-field" rows={4} value={form.bio} onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))} placeholder="Tell people what you love swapping" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem' }}>
              <div>
                <label className="form-label">City</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input className="input-field" style={{ paddingLeft: '2.6rem' }} value={form.city} onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="form-label">State</label>
                <input className="input-field" value={form.state} onChange={(e) => setForm(prev => ({ ...prev, state: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Country</label>
                <input className="input-field" value={form.country} onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn-secondary" onClick={() => navigate('/profile')}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />} Save changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfilePage;