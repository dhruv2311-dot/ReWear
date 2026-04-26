import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, Package, RefreshCw, ShieldCheck, TrendingUp,
  Check, X, Ban, Eye, ChevronDown, Search, Leaf, Droplets, Wind
} from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import { adminService, itemService } from '../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <motion.div whileHover={{ y: -2 }}
    style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: `1px solid ${color}25` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
      <div style={{ width: '44px', height: '44px', background: `${color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
    </div>
    <p style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', color: '#1a1a2e', lineHeight: 1 }}>{value}</p>
    <p style={{ fontWeight: 600, color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>{label}</p>
    {sub && <p style={{ fontSize: '0.8rem', color, fontWeight: 600, marginTop: '0.25rem' }}>{sub}</p>}
  </motion.div>
);

const TABS = ['Overview', 'Pending Items', 'All Items', 'Users', 'Swaps'];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [errorStats, setErrorStats] = useState(null);
  const [errorPending, setErrorPending] = useState(null);
  const [errorAll, setErrorAll] = useState(null);
  const [errorUsers, setErrorUsers] = useState(null);
  const [errorSwaps, setErrorSwaps] = useState(null);

  useEffect(() => {
    if (activeTab === 'Overview') {
      adminService.getStats()
        .then(r => { setStats(r.data.stats); setErrorStats(null); })
        .catch(e => setErrorStats(e.response?.data?.message || 'Failed to load stats'));
    }
    if (activeTab === 'Pending Items') {
      setLoading(true);
      adminService.getPendingItems()
        .then(r => { setPendingItems(r.data.items || []); setErrorPending(null); })
        .catch(e => setErrorPending(e.response?.data?.message || 'Failed to load pending items'))
        .finally(() => setLoading(false));
    }
    if (activeTab === 'All Items') {
      setLoading(true);
      adminService.getItems()
        .then(r => { setAllItems(r.data.items || []); setErrorAll(null); })
        .catch(e => setErrorAll(e.response?.data?.message || 'Failed to load items'))
        .finally(() => setLoading(false));
    }
    if (activeTab === 'Users') {
      setLoading(true);
      adminService.getUsers({ search })
        .then(r => { setUsers(r.data.users || []); setErrorUsers(null); })
        .catch(e => setErrorUsers(e.response?.data?.message || 'Failed to load users'))
        .finally(() => setLoading(false));
    }
    if (activeTab === 'Swaps') {
      setLoading(true);
      adminService.getAllSwaps()
        .then(r => { setSwaps(r.data.swaps || []); setErrorSwaps(null); })
        .catch(e => setErrorSwaps(e.response?.data?.message || 'Failed to load swaps'))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handleItemStatus = async (id, status) => {
    try {
      await adminService.approveItem(id, status);
      setPendingItems(prev => prev.filter(i => i._id !== id));
      setAllItems(prev => prev.map(i => i._id === id ? { ...i, status } : i));
      toast.success(`Item ${status}!`);
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      const { data } = await adminService.toggleBan(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: data.user.isBanned } : u));
      toast.success(data.message);
    } catch (e) {
      toast.error('Action failed');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await itemService.deleteItem(deleteConfirm);
      setAllItems(prev => prev.filter(item => item._id !== deleteConfirm));
      setPendingItems(prev => prev.filter(item => item._id !== deleteConfirm));
      toast.success('Item deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const statusColor = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444', swapped: '#3b82f6', redeemed: '#8b5cf6' };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0A3D0E, #1B5E20)', color: 'white', padding: '2.5rem 0 2rem' }}>
        <div className="container-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={26} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.75rem' }}>Admin Panel</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Manage the ReWear platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: '65px', zIndex: 50 }}>
        <div className="container-main">
          <div style={{ display: 'flex', overflowX: 'auto', gap: '0' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', color: activeTab === tab ? '#1B5E20' : '#6B7280', borderBottom: `3px solid ${activeTab === tab ? '#1B5E20' : 'transparent'}`, transition: 'all 0.2s' }}>
                {tab}
                {tab === 'Pending Items' && pendingItems.length > 0 && (
                  <span style={{ marginLeft: '0.4rem', background: '#ef4444', color: 'white', borderRadius: '100px', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 800 }}>
                    {pendingItems.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-main" style={{ padding: '2rem 1.5rem' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

            {/* ─── OVERVIEW ──────────────────────────────────────────────── */}
            {activeTab === 'Overview' && (
              <div>
                {errorStats ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626', fontWeight: 700 }}>{errorStats}</div>
                ) : stats ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                      <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="#7B1FA2" sub={`+12 this week`} />
                  <StatCard icon={Package} label="Total Items" value={stats.totalItems} color="#1B5E20" sub={`${stats.pendingItems} pending`} />
                  <StatCard icon={RefreshCw} label="Total Swaps" value={stats.totalSwaps} color="#4DB6AC" />
                  <StatCard icon={TrendingUp} label="Pending Reviews" value={stats.pendingItems} color="#F59E0B" sub="Needs attention" />
                </div>

                {/* Sustainability */}
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>🌍 Platform Impact</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  {[
                    { label: 'Items Reused', value: (stats.sustainability?.totalItemsReused || 0).toLocaleString(), icon: Leaf, color: '#1B5E20' },
                    { label: 'Water Saved (L)', value: (stats.sustainability?.totalWaterSaved || 0).toLocaleString(), icon: Droplets, color: '#0288D1' },
                    { label: 'CO₂ Saved (kg)', value: (stats.sustainability?.totalCarbonSaved || 0).toLocaleString(), icon: Wind, color: '#4DB6AC' },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', background: `${s.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <s.icon size={20} color={s.color} />
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.25rem', color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>{s.label}</p>
                      </div>
                    </div>
                  ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                )}
              </div>
            )}

            {/* ─── PENDING ITEMS ─────────────────────────────────────────── */}
            {activeTab === 'Pending Items' && (
              <div>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                  Pending Approval ({pendingItems.length})
                </h2>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                ) : errorPending ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626', fontWeight: 700 }}>{errorPending}</div>
                ) : pendingItems.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pendingItems.map(item => (
                      <motion.div key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          <img src={item.images?.[0]?.url} alt="" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a2e', marginBottom: '0.25rem' }}>{item.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.5rem', lineHeight: 1.5 }}>{item.description?.slice(0, 120)}...</p>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span className="badge badge-green">{item.category}</span>
                              <span className="badge badge-teal">{item.size}</span>
                              <span className="badge badge-teal">{item.condition}</span>
                              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>by {item.owner?.name}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <button onClick={() => handleItemStatus(item._id, 'approved')}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: '#1B5E20', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s' }}>
                              <Check size={15} /> Approve
                            </button>
                            <button onClick={() => handleItemStatus(item._id, 'rejected')}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s' }}>
                              <X size={15} /> Reject
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#374151' }}>All caught up!</p>
                    <p>No pending items to review.</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── ALL ITEMS ─────────────────────────────────────────────── */}
            {activeTab === 'All Items' && (
              <div>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                  All Items ({allItems.length})
                </h2>
                {loading ? <SkeletonLoader type="table" count={5} /> : errorAll ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626', fontWeight: 700 }}>{errorAll}</div>
                ) : (
                  <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F9FBF9' }}>
                          {['Item', 'Category', 'Owner', 'Status', 'Points', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allItems.map((item, i) => (
                          <tr key={item._id} style={{ borderTop: '1px solid #F3F4F6', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={item.images?.[0]?.url} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a1a2e' }}>{item.title}</span>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#6B7280' }}>{item.category}</td>
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#6B7280' }}>{item.owner?.name}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, color: statusColor[item.status] || '#6b7280', background: `${statusColor[item.status] || '#6b7280'}15` }}>
                                {item.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: '#4DB6AC', fontWeight: 700 }}>🌿 {item.pointsValue}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {item.status === 'pending' && (
                                  <>
                                    <button onClick={() => handleItemStatus(item._id, 'approved')} style={{ padding: '0.35rem 0.75rem', background: '#1B5E20', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Approve</button>
                                    <button onClick={() => handleItemStatus(item._id, 'rejected')} style={{ padding: '0.35rem 0.75rem', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Reject</button>
                                  </>
                                )}
                                <button onClick={() => setDeleteConfirm(item._id)} style={{ padding: '0.35rem 0.75rem', background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ─── USERS ─────────────────────────────────────────────────── */}
            {activeTab === 'Users' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem' }}>All Users ({users.length})</h2>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input type="text" className="input-field" placeholder="Search users..." style={{ paddingLeft: '2.5rem', padding: '0.6rem 1rem 0.6rem 2.5rem', fontSize: '0.875rem', maxWidth: '280px' }}
                      value={search}
                      onChange={e => {
                        setSearch(e.target.value);
                        adminService.getUsers({ search: e.target.value }).then(r => setUsers(r.data.users || []));
                      }} />
                  </div>
                </div>
                {loading ? <SkeletonLoader type="table" count={8} /> : errorUsers ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626', fontWeight: 700 }}>{errorUsers}</div>
                ) : (
                  <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F9FBF9' }}>
                          {['User', 'Role', 'Swaps', 'Points', 'Status', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <tr key={u._id} style={{ borderTop: '1px solid #F3F4F6', background: i % 2 === 0 ? 'white' : '#FAFAFA' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={u.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div>
                                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a1a2e' }}>{u.name}</p>
                                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, background: u.role === 'admin' ? '#FFF9C4' : '#E8F5E9', color: u.role === 'admin' ? '#b7860b' : '#1B5E20' }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: '#374151' }}>{u.totalSwaps}</td>
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.875rem', color: '#4DB6AC', fontWeight: 700 }}>🌿 {u.points}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, background: u.isBanned ? '#FEE2E2' : '#DCFCE7', color: u.isBanned ? '#dc2626' : '#16a34a' }}>
                                {u.isBanned ? 'Banned' : 'Active'}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <Link to={`/admin/users/${u._id}/activity`}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem', background: 'rgba(27,94,32,0.08)', color: '#1B5E20', textDecoration: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(27,94,32,0.2)' }}>
                                  <Eye size={13} /> Activity
                                </Link>
                                {u.role !== 'admin' && (
                                  <button onClick={() => handleToggleBan(u._id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem', background: u.isBanned ? '#E8F5E9' : 'rgba(239,68,68,0.1)', color: u.isBanned ? '#1B5E20' : '#dc2626', border: u.isBanned ? '1px solid rgba(27,94,32,0.3)' : '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
                                    <Ban size={13} /> {u.isBanned ? 'Unban' : 'Ban'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ─── SWAPS ────────────────────────────────────────────────── */}
            {activeTab === 'Swaps' && (
              <div>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                  All Swaps ({swaps.length})
                </h2>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                ) : errorSwaps ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626', fontWeight: 700 }}>{errorSwaps}</div>
                ) : swaps.length > 0 ? (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {swaps.map((swap) => (
                      <div key={swap._id} className="card" style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <img src={swap.item?.images?.[0]?.url} alt="" style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover' }} />
                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <p style={{ fontWeight: 700, color: '#1a1a2e' }}>{swap.item?.title}</p>
                              <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', background: `${statusColor[swap.status] || '#6b7280'}15`, color: statusColor[swap.status] || '#6b7280', fontSize: '0.75rem', fontWeight: 700 }}>{swap.status}</span>
                            </div>
                            <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>
                              {swap.requester?.name} → {swap.owner?.name} · {swap.type === 'points' ? `🌿 ${swap.pointsOffered} pts` : 'Swap'}
                            </p>
                          </div>
                          <Link to={`/admin/swaps/${swap._id}`} className="btn-secondary" style={{ padding: '0.5rem 0.9rem' }}>
                            <Eye size={14} /> View Chat
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ padding: '1.5rem', color: '#6B7280' }}>No swaps to monitor yet.</div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {deleteConfirm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDeleteConfirm(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.75rem', color: '#1a1a2e' }}>Confirm Deletion</h3>
              <p style={{ color: '#6B7280', marginBottom: '1.5rem', lineHeight: 1.5 }}>Are you sure you want to delete this item permanently? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
                <button onClick={confirmDelete} style={{ padding: '0.6rem 1.25rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Delete Item</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
