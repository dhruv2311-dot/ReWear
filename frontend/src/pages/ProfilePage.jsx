import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, BadgeCheck, Edit3, Leaf, MapPin, Package, RefreshCw, ShoppingBag, Star, User } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { itemService, swapService } from '../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [itemsRes, swapsRes] = await Promise.allSettled([
          itemService.getMyItems(),
          swapService.getMySwaps(),
        ]);
        if (!active) return;
        if (itemsRes.status === 'fulfilled') setItems(itemsRes.value.data.items || []);
        if (swapsRes.status === 'fulfilled') setSwaps(swapsRes.value.data.swaps || []);
        if (itemsRes.status === 'rejected' || swapsRes.status === 'rejected') {
          setError('Some data could not be loaded.');
        } else {
          setError(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const stats = [
    { label: 'Points', value: user?.points || 0, icon: Leaf, color: '#1B5E20' },
    { label: 'Swaps', value: user?.totalSwaps || 0, icon: RefreshCw, color: '#4DB6AC' },
    { label: 'Items', value: user?.itemsListed || 0, icon: Package, color: '#7B1FA2' },
    { label: 'Badges', value: user?.badges?.length || 0, icon: Award, color: '#F59E0B' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', padding: '2rem 0' }}>
      <div className="container-main">
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #0A3D0E, #1B5E20 50%, #2E7D32)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=1B5E20&color=fff`}
              alt={user?.name}
              style={{ width: '88px', height: '88px', borderRadius: '24px', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.25)' }}
            />
            <div style={{ color: 'white', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 'clamp(1.5rem, 4vw, 2.3rem)' }}>{user?.name}</h1>
                <span style={{ padding: '0.25rem 0.7rem', borderRadius: '999px', background: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 700 }}>Profile</span>
              </div>
              <p style={{ opacity: 0.8, marginTop: '0.3rem' }}>{user?.email}</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.9rem', fontSize: '0.9rem', opacity: 0.9 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={14} /> {user?.location?.city || 'Location not set'}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><User size={14} /> {user?.provider || 'local'}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Star size={14} /> Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '—'}</span>
              </div>
            </div>
            <Link to="/edit-profile" className="btn-accent" style={{ alignSelf: 'flex-start' }}>
              <Edit3 size={16} /> Edit Profile
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {stats.map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} whileHover={{ y: -4 }} className="card" style={{ padding: '1.2rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem' }}>
                <Icon size={20} color={color} />
              </div>
              <p style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', color }}>{value}</p>
              <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.85rem' }}>{label}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.4rem' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '1rem' }}>Profile Details</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[
                ['Name', user?.name],
                ['Email', user?.email],
                ['Location', [user?.location?.city, user?.location?.state, user?.location?.country].filter(Boolean).join(', ') || 'Not set'],
                ['Bio', user?.bio || 'Add a short bio to tell people what you like swapping.'],
              ].map(([label, value]) => (
                <div key={label} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #F3F4F6' }}>
                  <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', fontWeight: 700 }}>{label}</p>
                  <p style={{ color: '#1a1a2e', marginTop: '0.2rem' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1.4rem' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '1rem' }}>Badges</h2>
            {user?.badges?.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {user.badges.map((badge) => (
                  <span key={badge} className="badge badge-yellow" style={{ textTransform: 'none', letterSpacing: 0 }}>
                    <BadgeCheck size={14} /> {badge}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6B7280' }}>No badges yet. Complete swaps and listings to earn them.</p>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="card" style={{ padding: '1.4rem' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '1rem' }}>Recent Items</h2>
            {loading ? (
              <SkeletonLoader type="card" count={1} />
            ) : error ? (
              <p style={{ color: '#dc2626' }}>Failed to load items.</p>
            ) : items.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {items.slice(0, 3).map((item) => (
                  <Link key={item._id} to={`/item/${item._id}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <img src={item.images?.[0]?.url} alt={item.title} style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700 }}>{item.title}</p>
                      <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>{item.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6B7280' }}>No items listed yet.</p>
            )}
          </div>

          <div className="card" style={{ padding: '1.4rem' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '1rem' }}>Recent Swaps</h2>
            {loading ? (
              <SkeletonLoader type="card" count={1} />
            ) : error ? (
              <p style={{ color: '#dc2626' }}>Failed to load swaps.</p>
            ) : swaps.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                {swaps.slice(0, 3).map((swap) => (
                  <Link key={swap._id} to={`/chat/${swap._id}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(27,94,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={22} color="#1B5E20" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700 }}>{swap.item?.title || 'Swap'}</p>
                      <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>{swap.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: '#6B7280' }}>No swaps yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;