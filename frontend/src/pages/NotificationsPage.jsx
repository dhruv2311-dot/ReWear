import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, LoaderCircle, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, error, refresh, markRead, markAllRead, markUnread } = useNotifications();

  useEffect(() => {
    refresh();
  }, []);

  const handleOpen = async (notification) => {
    try {
      if (!notification.read) {
        await markRead(notification._id);
      }
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const iconFor = (type) => {
    if (type === 'message') return MessageSquare;
    if (type === 'swap-request' || type === 'swap-status') return CheckCheck;
    if (type === 'item-status') return ShieldAlert;
    return Sparkles;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', padding: '2rem 0 3rem' }}>
      <div className="container-main" style={{ maxWidth: '900px' }}>
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <Bell size={22} />
                <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}>Notifications</h1>
              </div>
              <p style={{ opacity: 0.85 }}>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</p>
            </div>
            <button onClick={() => markAllRead()} className="btn-accent" style={{ background: 'white', color: '#1B5E20' }}>
              <CheckCheck size={16} /> Mark all read
            </button>
          </div>
        </div>

        {error && (
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#b91c1c' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <LoaderCircle size={28} className="spin" color="#1B5E20" />
            <p style={{ marginTop: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.9rem' }}>
            {notifications.map((notification) => {
              const Icon = iconFor(notification.type);
              return (
                <motion.button
                  key={notification._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleOpen(notification)}
                  className="card"
                  style={{
                    padding: '1rem 1.1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: notification.read ? '1px solid rgba(229,231,235,0.8)' : '1px solid rgba(27,94,32,0.22)',
                    background: notification.read ? 'white' : 'rgba(27,94,32,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(27,94,32,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={18} color="#1B5E20" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontWeight: 800, color: '#1a1a2e', marginBottom: '0.2rem' }}>{notification.title}</p>
                          <p style={{ color: '#6B7280', lineHeight: 1.55 }}>{notification.body}</p>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                      <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: notification.read ? '#6B7280' : '#1B5E20', background: notification.read ? '#F3F4F6' : 'rgba(27,94,32,0.1)', padding: '0.28rem 0.6rem', borderRadius: '999px' }}>
                          {notification.read ? 'Read' : 'Unread'}
                        </span>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (notification.read) {
                              await markUnread(notification._id);
                            } else {
                              await markRead(notification._id);
                            }
                          }}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#4B5563',
                            background: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            padding: '0.28rem 0.6rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => {
                            e.target.style.borderColor = '#1B5E20';
                            e.target.style.background = 'rgba(27,94,32,0.04)';
                          }}
                          onMouseLeave={e => {
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.background = 'transparent';
                          }}
                        >
                          {notification.read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        {notification.link && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563' }}>
                            Open linked item / chat
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '22px', margin: '0 auto 1rem', background: 'rgba(27,94,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={30} color="#1B5E20" />
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '0.35rem' }}>No notifications yet</h2>
            <p style={{ color: '#6B7280', marginBottom: '1.25rem' }}>New swap, message, and moderation updates will appear here.</p>
            <Link to="/browse" className="btn-primary">Browse Items</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;