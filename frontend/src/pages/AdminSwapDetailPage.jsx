import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LoaderCircle, MessageSquare, ShieldCheck, User } from 'lucide-react';
import { messageService, swapService } from '../services/api';

const AdminSwapDetailPage = () => {
  const { swapId } = useParams();
  const navigate = useNavigate();
  const [swap, setSwap] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [swapRes, msgRes] = await Promise.all([
          swapService.getSwap(swapId),
          messageService.getMessages(swapId),
        ]);

        if (!active) return;
        setSwap(swapRes.data.swap);
        setMessages(msgRes.data.messages || []);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || 'Failed to load swap details');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [swapId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F5F5F5' }}>
        <LoaderCircle size={30} className="spin" color="#1B5E20" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F5F5', padding: '2rem 0' }}>
        <div className="container-main" style={{ maxWidth: '860px' }}>
          <div className="card" style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p style={{ color: '#b91c1c', fontWeight: 700, marginBottom: '1rem' }}>{error}</p>
            <button className="btn-primary" onClick={() => navigate('/admin', { replace: true })}>
              <ArrowLeft size={16} /> Back to Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const participant = swap?.requester;
  const owner = swap?.owner;

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', padding: '2rem 0 3rem' }}>
      <div className="container-main" style={{ maxWidth: '980px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button className="btn-ghost" onClick={() => navigate('/admin', { replace: true })}>
            <ArrowLeft size={16} /> Back to Admin
          </button>
          <Link to={`/chat/${swap?._id}`} className="btn-secondary">
            <MessageSquare size={16} /> Open Participant Chat
          </Link>
        </div>

        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={22} color="#1B5E20" />
                <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.7rem', margin: 0 }}>Swap Detail</h1>
              </div>
              <p style={{ color: '#6B7280' }}>{swap?.item?.title}</p>
            </div>
            <span className="badge badge-green">{swap?.status}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '1rem' }}>Participants</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[{ title: 'Requester', user: participant }, { title: 'Owner', user: owner }].map(({ title, user }) => (
                <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
                  <img src={user?.avatar} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontWeight: 700 }}>{title}</p>
                    <p style={{ color: '#6B7280', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><User size={14} /> {user?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '1rem' }}>Swap Info</h2>
            <div style={{ display: 'grid', gap: '0.75rem', color: '#1a1a2e' }}>
              <p><strong>Type:</strong> {swap?.type}</p>
              <p><strong>Points:</strong> {swap?.pointsOffered || 0}</p>
              <p><strong>Created:</strong> {swap?.createdAt ? new Date(swap.createdAt).toLocaleString() : '—'}</p>
              <p><strong>Message:</strong> {swap?.message || 'No message'}</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, marginBottom: '1rem' }}>Messages</h2>
          {messages.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {messages.map((msg) => (
                <motion.div key={msg._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.9rem', borderRadius: '14px', background: '#FAFAFA', border: '1px solid #E5E7EB' }}>
                  <img src={msg.sender?.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 700 }}>{msg.sender?.name}</p>
                      <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</span>
                    </div>
                    <p style={{ color: '#374151', marginTop: '0.35rem', lineHeight: 1.6 }}>{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
              No messages in this swap yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSwapDetailPage;