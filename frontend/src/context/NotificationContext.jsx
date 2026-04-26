import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { notificationService } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await notificationService.getMyNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load notifications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    const onNotification = (notification) => {
      setNotifications(prev => {
        if (prev.some(entry => entry._id === notification._id)) return prev;
        return [notification, ...prev].slice(0, 20);
      });
      setUnreadCount(prev => prev + 1);
      setError('');
      toast(notification.title, { icon: '🔔' });
    };

    socket.on('notification:new', onNotification);

    return () => {
      socket.off('notification:new', onNotification);
    };
  }, [socket]);

  const markRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(notification => notification._id === id ? { ...notification, read: true } : notification));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  };

  const markUnread = async (id) => {
    await notificationService.markUnread(id);
    setNotifications(prev => prev.map(notification => notification._id === id ? { ...notification, read: false } : notification));
    setUnreadCount(prev => prev + 1);
  };

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
    markUnread,
  }), [notifications, unreadCount, loading, error]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => useContext(NotificationContext);