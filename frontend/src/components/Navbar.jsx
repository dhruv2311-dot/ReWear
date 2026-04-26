import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useDebouncedCallback } from 'use-debounce';
import {
  Leaf, Menu, X, Plus, User, LayoutDashboard,
  LogOut, ShieldCheck, Bell, Search, ChevronDown, Sparkles, MessageSquare
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const notificationsStore = useNotifications();
  const notifications = notificationsStore?.notifications || [];
  const unreadCount = notificationsStore?.unreadCount || 0;
  const markRead = notificationsStore?.markRead;
  const markAllRead = notificationsStore?.markAllRead;
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [search, setSearch] = useState('');
  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const debouncedSearch = useDebouncedCallback((value) => {
    if (value.trim()) {
      navigate(`/browse?search=${encodeURIComponent(value.trim())}`);
    }
  }, 350);

  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get('search') || '');
  }, [location.search]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const target = event.target;
      if (notificationOpen && notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
        setNotificationOpen(false);
      }
      if (dropdownOpen && profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen, notificationOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const navLinks = [
    { label: 'Browse', href: '/browse' },
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Impact', href: '/#impact' },
  ];

  const notificationPreview = useMemo(() => notifications.slice(0, 5), [notifications]);

  return (
    <nav className="navbar">
      <div className="container-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', gap: '1rem' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: '40px', height: '40px', background: 'linear-gradient(135deg, #1B5E20, #4DB6AC)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Leaf size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: '#1B5E20' }}>
              Re<span style={{ color: '#4DB6AC' }}>Wear</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden-mobile">
            {navLinks.map(link => (
              <a key={link.href} href={link.href}
                style={{
                  padding: '0.5rem 1rem', borderRadius: '10px', textDecoration: 'none',
                  color: location.pathname === link.href ? '#1B5E20' : '#6B7280',
                  fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s',
                  background: location.pathname === link.href ? 'rgba(27,94,32,0.08)' : 'transparent'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#1B5E20'; e.currentTarget.style.background = 'rgba(27,94,32,0.08)'; }}
                onMouseLeave={e => {
                  if (location.pathname !== link.href) {
                    e.currentTarget.style.color = '#6B7280';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="hidden-mobile" style={{ position: 'relative', minWidth: '280px', maxWidth: '360px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/browse?search=${encodeURIComponent(search.trim())}`);
                  }
                }}
                placeholder="Search items, tags, city"
                className="input-field"
                style={{ paddingLeft: '2.35rem', paddingTop: '0.65rem', paddingBottom: '0.65rem', borderRadius: '999px' }}
              />
            </div>

            {isAuthenticated && (
              <button
                onClick={() => {
                  navigate('/chats');
                  setDropdownOpen(false);
                  setNotificationOpen(false);
                }}
                className="btn-ghost"
                style={{ padding: '0.55rem', position: 'relative' }}
                title="Open chats"
              >
                <MessageSquare size={18} />
              </button>
            )}

            {isAuthenticated && (
              <div ref={notificationMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setNotificationOpen((open) => !open);
                    setDropdownOpen(false);
                  }}
                  className="btn-ghost"
                  style={{ padding: '0.55rem', position: 'relative' }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', minWidth: '18px', height: '18px', borderRadius: '999px', background: '#dc2626', color: 'white', fontSize: '0.7rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 'min(360px, calc(100vw - 2rem))', background: 'white', border: '1px solid rgba(165,214,167,0.3)', borderRadius: '18px', boxShadow: '0 18px 40px rgba(15,23,42,0.12)', zIndex: 250, overflow: 'hidden' }}
                    >
                      <div style={{ padding: '1rem 1rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <div>
                          <p style={{ fontWeight: 800, color: '#1a1a2e' }}>Notifications</p>
                          <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{unreadCount} unread</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button onClick={() => markAllRead?.()} className="btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                            Mark all read
                          </button>
                          <button
                            onClick={() => setNotificationOpen(false)}
                            className="btn-ghost"
                            aria-label="Close notifications"
                            style={{ padding: '0.35rem' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <div style={{ maxHeight: '320px', overflow: 'auto' }}>
                        {notificationPreview.length > 0 ? notificationPreview.map(notification => (
                          <button
                            key={notification._id}
                            onClick={async () => {
                              if (!notification.read) await markRead?.(notification._id);
                              if (notification.link) navigate(notification.link);
                              setNotificationOpen(false);
                            }}
                            style={{ width: '100%', textAlign: 'left', padding: '0.9rem 1rem', border: 'none', background: notification.read ? 'white' : 'rgba(27,94,32,0.05)', borderTop: '1px solid #F3F4F6', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(27,94,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Sparkles size={16} color="#1B5E20" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.88rem', marginBottom: '0.2rem' }}>{notification.title}</p>
                                <p style={{ color: '#6B7280', fontSize: '0.8rem', lineHeight: 1.5 }}>{notification.body}</p>
                              </div>
                            </div>
                          </button>
                        )) : (
                          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6B7280' }}>
                            <Bell size={24} style={{ marginBottom: '0.5rem' }} />
                            <p>No notifications yet</p>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '0.9rem 1rem', borderTop: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                        <Link to="/notifications" onClick={() => setNotificationOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#1B5E20', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
                          View all notifications
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {isAuthenticated ? (
              <>
                {/* List Item Button */}
                <Link to="/add-item" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                  <Plus size={16} />
                  <span className="hidden-mobile">List Item</span>
                </Link>

                {/* User Dropdown */}
                <div ref={profileMenuRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      setDropdownOpen((open) => !open);
                      setNotificationOpen(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem',
                      background: 'rgba(27,94,32,0.06)', border: '2px solid rgba(27,94,32,0.15)',
                      borderRadius: '100px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=1B5E20&color=fff`}
                      alt={user?.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1B5E20', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden-mobile">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} color="#1B5E20" />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                          background: 'white', border: '1px solid rgba(165,214,167,0.3)',
                          borderRadius: '16px', padding: '0.5rem',
                          boxShadow: '0 8px 32px rgba(27,94,32,0.15)', minWidth: '200px', zIndex: 200
                        }}
                      >
                        {/* User info */}
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', marginBottom: '0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e' }}>{user?.name}</p>
                              <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{user?.email}</p>
                              <p style={{ fontSize: '0.8rem', color: '#4DB6AC', fontWeight: 600, marginTop: '0.25rem' }}>
                                🌿 {user?.points} points
                              </p>
                            </div>
                            <button
                              onClick={() => setDropdownOpen(false)}
                              className="btn-ghost"
                              aria-label="Close profile menu"
                              style={{ padding: '0.35rem' }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {[
                          { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                          ...(isAdmin ? [{ icon: ShieldCheck, label: 'Admin Panel', to: '/admin' }] : []),
                          { icon: User, label: 'My Profile', to: '/profile' },
                        ].map(item => (
                          <Link key={item.to + item.label} to={item.to}
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem',
                              borderRadius: '10px', textDecoration: 'none', color: '#374151',
                              fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(27,94,32,0.06)'; e.currentTarget.style.color = '#1B5E20'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
                          >
                            <item.icon size={16} />
                            {item.label}
                          </Link>
                        ))}

                        <hr style={{ margin: '0.25rem 0', borderColor: '#f3f4f6' }} />
                        <button onClick={handleLogout}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem',
                            borderRadius: '10px', color: '#dc2626', fontSize: '0.9rem', fontWeight: 500,
                            background: 'transparent', border: 'none', cursor: 'pointer', width: '100%',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn-ghost">Sign In</Link>
                <Link to="/register" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost show-mobile" style={{ padding: '0.5rem' }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(165,214,167,0.3)', paddingBottom: '1rem' }}
            >
              {navLinks.map(link => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'block', padding: '0.75rem 0.5rem', textDecoration: 'none', color: '#374151', fontWeight: 500 }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/browse" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Browse items</Link>
              </div>
              {isAuthenticated && (
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to="/chats" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    <MessageSquare size={16} /> Open chats
                  </Link>
                </div>
              )}
              {!isAuthenticated && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Join Free</Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
