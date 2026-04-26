import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { messageService, swapService } from '../services/api';

const ChatsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    let active = true;

    const loadConversations = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await swapService.getMySwaps();
        const swaps = data.swaps || [];

        const convPromises = swaps.map(async (swap) => {
          try {
            const msgRes = await messageService.getMessages(swap._id);
            const messages = msgRes.data.messages || [];
            const lastMessage = messages[messages.length - 1] || null;
            const other = swap.requester?._id === user?._id ? swap.owner : swap.requester;

            return {
              swapId: swap._id,
              other,
              item: swap.item,
              status: swap.status,
              lastMessage,
              updatedAt: lastMessage?.createdAt || swap.updatedAt || swap.createdAt,
            };
          } catch {
            const other = swap.requester?._id === user?._id ? swap.owner : swap.requester;
            return {
              swapId: swap._id,
              other,
              item: swap.item,
              status: swap.status,
              lastMessage: null,
              updatedAt: swap.updatedAt || swap.createdAt,
            };
          }
        });

        const rows = await Promise.all(convPromises);
        rows.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (!active) return;
        setConversations(rows);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Failed to load chats');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadConversations();
    return () => {
      active = false;
    };
  }, [user?._id]);

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((entry) => {
      const name = entry.other?.name?.toLowerCase() || '';
      const title = entry.item?.title?.toLowerCase() || '';
      const message = entry.lastMessage?.content?.toLowerCase() || '';
      return name.includes(query) || title.includes(query) || message.includes(query);
    });
  }, [conversations, search]);

  const formatTime = (value) => {
    if (!value) return '';
    const dt = new Date(value);
    return dt.toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', padding: '2rem 0 3rem' }}>
      <div className="container-main" style={{ maxWidth: '860px' }}>
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)' }}>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 'clamp(1.45rem, 3vw, 2rem)', color: 'white', marginBottom: '0.35rem' }}>
            Chats
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)' }}>
            Continue conversations with people you swapped with.
          </p>
        </div>

        <div className="card" style={{ padding: '0.9rem 1rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              placeholder="Search by name, product, or message"
              style={{ paddingLeft: '2.35rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ padding: '2rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : error ? (
          <div className="card" style={{ padding: '1.25rem', border: '1px solid rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.06)', color: '#b91c1c' }}>
            {error}
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="card" style={{ padding: '0.35rem', overflow: 'hidden' }}>
            {filteredConversations.map((entry, index) => (
              <motion.button
                key={entry.swapId}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => navigate(`/chat/${entry.swapId}`)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: 'white',
                  padding: '0.9rem',
                  display: 'flex',
                  gap: '0.8rem',
                  cursor: 'pointer',
                  borderBottom: index === filteredConversations.length - 1 ? 'none' : '1px solid #F3F4F6',
                  alignItems: 'center',
                }}
              >
                <img
                  src={entry.other?.avatar || `https://ui-avatars.com/api/?name=${entry.other?.name || 'User'}&background=1B5E20&color=fff`}
                  alt={entry.other?.name || 'User'}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <p style={{ fontWeight: 800, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.other?.name || 'Unknown user'}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                      {formatTime(entry.updatedAt)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.item?.title || 'Swap item'}
                  </p>
                  <p style={{ fontSize: '0.83rem', color: '#4B5563', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.lastMessage?.content || 'No messages yet. Tap to start chatting.'}
                  </p>
                </div>
                <ArrowRight size={16} color="#9CA3AF" />
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '2.5rem 1.25rem', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '20px', margin: '0 auto 1rem', background: 'rgba(27,94,32,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={30} color="#1B5E20" />
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '0.4rem' }}>No chats yet</h2>
            <p style={{ color: '#6B7280', marginBottom: '1.25rem' }}>
              Start by browsing items and sending your first swap request.
            </p>
            <Link to="/browse" className="btn-primary">Browse Items</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;
