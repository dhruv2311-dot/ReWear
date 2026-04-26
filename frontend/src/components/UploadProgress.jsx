import React from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const UploadProgress = ({
  files,
  progress = {},
  errors = {},
  onRemove,
  showProgress = true,
  compact = false
}) => {
  const getStatusIcon = (file, fileProgress, fileError) => {
    if (fileError) {
      return <AlertCircle size={16} color="#dc2626" />;
    }
    if (fileProgress === 100) {
      return <CheckCircle size={16} color="#22c55e" />;
    }
    return <Upload size={16} color="#6B7280" />;
  };

  const getStatusColor = (fileProgress, fileError) => {
    if (fileError) return '#dc2626';
    if (fileProgress === 100) return '#22c55e';
    return '#1B5E20';
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return '#dc2626';
    if (progress < 60) return '#f59e0b';
    return '#22c55e';
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {files.map((file, index) => {
          const fileProgress = progress[`${file.name}_${index}`] || 0;
          const fileError = errors[`${file.name}_${index}`];
          
          return (
            <div key={`${file.name}_${index}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem',
              background: 'rgba(27,94,32,0.04)',
              borderRadius: '8px',
              border: `1px solid ${fileError ? 'rgba(239,68,68,0.3)' : 'rgba(27,94,32,0.2)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                {getStatusIcon(file, fileProgress, fileError)}
                <span style={{
                  fontSize: '0.85rem',
                  color: '#374151',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {file.name}
                </span>
              </div>
              
              {showProgress && !fileError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '60px',
                    height: '4px',
                    background: '#E5E7EB',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${fileProgress}%`,
                      height: '100%',
                      background: getProgressColor(fileProgress),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    color: getStatusColor(fileProgress, fileError),
                    fontWeight: 600,
                    minWidth: '35px',
                    textAlign: 'right'
                  }}>
                    {fileProgress}%
                  </span>
                </div>
              )}
              
              <button
                onClick={() => onRemove && onRemove(index)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6B7280',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(239,68,68,0.1)';
                  e.target.style.color = '#dc2626';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#6B7280';
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {files.map((file, index) => {
        const fileProgress = progress[`${file.name}_${index}`] || 0;
        const fileError = errors[`${file.name}_${index}`];
        const progressColor = getProgressColor(fileProgress);
        
        return (
          <div key={`${file.name}_${index}`} style={{
            padding: '1rem',
            background: 'white',
            borderRadius: '12px',
            border: `1px solid ${fileError ? 'rgba(239,68,68,0.3)' : 'rgba(27,94,32,0.2)'}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              {getStatusIcon(file, fileProgress, fileError)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#374151',
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {file.name}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#6B7280'
                }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              
              <button
                onClick={() => onRemove && onRemove(index)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6B7280',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(239,68,68,0.1)';
                  e.target.style.color = '#dc2626';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#6B7280';
                }}
              >
                <X size={16} />
              </button>
            </div>
            
            {fileError && (
              <div style={{
                padding: '0.5rem',
                background: 'rgba(239,68,68,0.1)',
                borderRadius: '6px',
                marginBottom: '0.75rem'
              }}>
                <p style={{
                  fontSize: '0.8rem',
                  color: '#dc2626',
                  fontWeight: 500,
                  margin: 0
                }}>
                  {fileError}
                </p>
              </div>
            )}
            
            {showProgress && !fileError && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '0.8rem',
                    color: '#6B7280',
                    fontWeight: 500
                  }}>
                    Uploading...
                  </span>
                  <span style={{
                    fontSize: '0.8rem',
                    color: getStatusColor(fileProgress, fileError),
                    fontWeight: 600
                  }}>
                    {fileProgress}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#E5E7EB',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${fileProgress}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${progressColor}, ${progressColor}dd)`,
                    transition: 'width 0.3s ease',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UploadProgress;
