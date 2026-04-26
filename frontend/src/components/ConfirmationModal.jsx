import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger', 'warning', 'info'
  loading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconColor: '#dc2626',
          iconBg: 'rgba(239,68,68,0.1)',
          confirmBg: '#dc2626',
          confirmHover: '#b91c1c'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: '#f59e0b',
          iconBg: 'rgba(245,158,11,0.1)',
          confirmBg: '#f59e0b',
          confirmHover: '#d97706'
        };
      case 'info':
        return {
          icon: AlertTriangle,
          iconColor: '#3b82f6',
          iconBg: 'rgba(59,130,246,0.1)',
          confirmBg: '#3b82f6',
          confirmHover: '#2563eb'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: '#dc2626',
          iconBg: 'rgba(239,68,68,0.1)',
          confirmBg: '#dc2626',
          confirmHover: '#b91c1c'
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: styles.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Icon size={24} color={styles.iconColor} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#1a1a2e',
              margin: 0
            }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.background = '#F3F4F6';
                e.target.style.color = '#374151';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6B7280';
              }
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Message */}
        <p style={{
          color: '#6B7280',
          lineHeight: 1.6,
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              background: 'white',
              color: '#6B7280',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.background = '#F9FAFB';
                e.target.style.borderColor = '#D1D5DB';
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#E5E7EB';
              }
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              background: loading ? '#9CA3AF' : styles.confirmBg,
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '100px',
              justifyContent: 'center'
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.target.style.background = styles.confirmHover;
              }
            }}
            onMouseLeave={e => {
              if (!loading) {
                e.target.style.background = styles.confirmBg;
              }
            }}
          >
            {loading && (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;
