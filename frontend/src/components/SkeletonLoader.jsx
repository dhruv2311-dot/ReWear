import React from 'react';

const SkeletonLoader = ({ 
  type = 'card', 
  count = 1, 
  height = 'auto', 
  width = '100%',
  className = '',
  style = {}
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div 
            className={`skeleton-card ${className}`}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #E5E7EB',
              height,
              width,
              ...style
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '0.5rem', borderRadius: '4px' }} />
                <div className="skeleton" style={{ width: '40%', height: '16px', borderRadius: '4px' }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '0.5rem', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '80%', height: '16px', borderRadius: '4px' }} />
          </div>
        );

      case 'table':
        return (
          <div 
            className={`skeleton-table ${className}`}
            style={{
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #E5E7EB',
              width,
              ...style
            }}
          >
            {/* Table Header */}
            <div style={{ background: '#F9FBF9', padding: '1rem', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '16px', borderRadius: '4px' }} />
                ))}
              </div>
            </div>
            {/* Table Rows */}
            {[...Array(count)].map((_, rowIndex) => (
              <div key={rowIndex} style={{ 
                padding: '1rem', 
                borderBottom: '1px solid #F3F4F6',
                background: rowIndex % 2 === 0 ? 'white' : '#FAFAFA'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', alignItems: 'center' }}>
                  {/* User column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: '80%', height: '14px', marginBottom: '0.25rem', borderRadius: '4px' }} />
                      <div className="skeleton" style={{ width: '60%', height: '12px', borderRadius: '4px' }} />
                    </div>
                  </div>
                  {/* Other columns */}
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: '14px', borderRadius: '4px' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'item':
        return (
          <div 
            className={`skeleton-item ${className}`}
            style={{
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #E5E7EB',
              height,
              width,
              ...style
            }}
          >
            <div className="skeleton" style={{ aspectRatio: '4/5', width: '100%' }} />
            <div style={{ padding: '1rem' }}>
              <div className="skeleton" style={{ width: '100%', height: '18px', marginBottom: '0.5rem', borderRadius: '4px' }} />
              <div className="skeleton" style={{ width: '60%', height: '16px', borderRadius: '4px' }} />
            </div>
          </div>
        );

      case 'chat':
        return (
          <div 
            className={`skeleton-chat ${className}`}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1rem',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              width,
              ...style
            }}
          >
            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '70%', height: '16px', marginBottom: '0.5rem', borderRadius: '4px' }} />
              <div className="skeleton" style={{ width: '90%', height: '14px', borderRadius: '4px' }} />
            </div>
            <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '4px' }} />
          </div>
        );

      case 'avatar':
        return (
          <div 
            className={`skeleton-avatar ${className}`}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#E5E7EB',
              ...style
            }}
          />
        );

      case 'text':
        return (
          <div 
            className={`skeleton-text ${className}`}
            style={{
              height: '16px',
              borderRadius: '4px',
              background: '#E5E7EB',
              width: width || '100%',
              ...style
            }}
          />
        );

      case 'button':
        return (
          <div 
            className={`skeleton-button ${className}`}
            style={{
              height: '40px',
              borderRadius: '8px',
              background: '#E5E7EB',
              width: width || '120px',
              ...style
            }}
          />
        );

      default:
        return (
          <div 
            className={`skeleton-default ${className}`}
            style={{
              height: '20px',
              borderRadius: '4px',
              background: '#E5E7EB',
              width: width || '100%',
              ...style
            }}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[...Array(count)].map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
