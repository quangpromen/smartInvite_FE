import React from 'react';

export function LoadingState({ message = 'Đang tải dữ liệu...' }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        gap: '16px',
        color: 'var(--muted)',
        minHeight: '200px',
      }}
    >
      <div
        className="spinner"
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e2e8f0',
          borderTopColor: 'var(--navy)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: '13px' }}>{message}</span>
    </div>
  );
}
