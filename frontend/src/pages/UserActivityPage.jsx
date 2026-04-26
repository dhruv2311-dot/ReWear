import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Package, RefreshCw, 
  MapPin, Mail, Award, CheckCircle, Clock, 
  Shield, User, Droplets, Wind, Leaf, Users, TrendingUp, Eye, LoaderCircle 
} from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';

const UserActivityPage = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await adminService.getUserActivity(id);
        setActivity(data.activity);
      } catch (error) {
        toast.error('Failed to load user activity');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#6B7280', marginBottom: '1rem' }}>User not found</h2>
          <Link to="/admin" className="btn-primary">Back to Admin</Link>
        </div>
      </div>
    );
  }

  const { user, recentSwaps, recentItems, stats } = activity;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', padding: '2rem 0' }}>
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                background: 'rgba(27,94,32,0.08)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                color: '#1B5E20'
              }}
            >
              <ArrowLeft size={18} />
              Back to Admin
            </Link>
            <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.8rem', color: '#1B5E20' }}>
              User Activity: {user.name}
            </h1>
          </div>

          {/* User Info Card */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                alt=""
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }}
              />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {user.name}
                </h2>
                <p style={{ opacity: 0.9, marginBottom: '0.5rem' }}>{user.email}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {user.role}
                  </span>
                  <span style={{ padding: '0.3rem 0.8rem', background: user.isBanned ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {user.isBanned ? 'Banned' : 'Active'}
                  </span>
                  <span style={{ padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Calendar size={14} style={{ marginRight: '0.3rem', display: 'inline' }} />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <motion.div whileHover={{ y: -2 }} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(27,94,32,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Package size={24} color="#1B5E20" />
              </div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', color: '#1B5E20', marginBottom: '0.25rem' }}>
                {stats.itemsListed}
              </div>
              <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.9rem' }}>Items Listed</p>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(77,182,172,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <RefreshCw size={24} color="#4DB6AC" />
              </div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', color: '#4DB6AC', marginBottom: '0.25rem' }}>
                {stats.totalSwaps}
              </div>
              <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.9rem' }}>Total Swaps</p>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Droplets size={24} color="#3B82F6" />
              </div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', color: '#3B82F6', marginBottom: '0.25rem' }}>
                {stats.totalWaterSaved.toLocaleString()}L
              </div>
              <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.9rem' }}>Water Saved</p>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(34,197,94,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Wind size={24} color="#22C55E" />
              </div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', color: '#22C55E', marginBottom: '0.25rem' }}>
                {stats.totalCarbonSaved}kg
              </div>
              <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.9rem' }}>CO₂ Saved</p>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {/* Recent Items */}
            <motion.div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} color="#1B5E20" />
                Recent Items ({recentItems.length})
              </h3>
              {recentItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentItems.map((item, i) => (
                    <div key={item._id} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: '#F9FBF9', borderRadius: '10px' }}>
                      <img
                        src={item.images?.[0]?.url}
                        alt=""
                        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e', marginBottom: '0.25rem' }}>{item.title}</p>
                        <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                          {item.category} • 🌿 {item.pointsValue} points
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                  <Package size={32} style={{ marginBottom: '0.5rem' }} />
                  <p>No items listed yet</p>
                </div>
              )}
            </motion.div>

            {/* Recent Swaps */}
            <motion.div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={18} color="#4DB6AC" />
                Recent Swaps ({recentSwaps.length})
              </h3>
              {recentSwaps.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {recentSwaps.map((swap, i) => {
                    const isRequester = swap.requester?._id === user._id;
                    const other = isRequester ? swap.owner : swap.requester;
                    return (
                      <div key={swap._id} style={{ padding: '0.75rem', background: '#F0FDF4', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <img
                            src={swap.item?.images?.[0]?.url}
                            alt=""
                            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1a1a2e', marginBottom: '0.2rem' }}>{swap.item?.title}</p>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                              {isRequester ? `You → ${other?.name}` : `${other?.name} → You`}
                            </p>
                          </div>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, background: '#4DB6AC20', color: '#4DB6AC' }}>
                            {swap.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                          {new Date(swap.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>
                  <RefreshCw size={32} style={{ marginBottom: '0.5rem' }} />
                  <p>No swaps yet</p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserActivityPage;
