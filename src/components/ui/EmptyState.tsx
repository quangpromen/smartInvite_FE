import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode | string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div
      className="panel"
      style={{
        padding: '56px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '280px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f8fafc, #edf2f7)',
          border: '1px solid #e2e8f0',
          display: 'grid',
          placeItems: 'center',
          marginBottom: '20px',
          color: 'var(--navy)',
          fontSize: '28px',
        }}
        aria-hidden="true"
      >
        {icon || '📭'}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--navy)' }}>
        {title}
      </h3>
      <p style={{ color: '#475569', fontSize: '13px', maxWidth: '440px', margin: '0 0 24px', lineHeight: 1.6 }}>
        {description}
      </p>

      {actionText && (
        actionHref ? (
          <Link href={actionHref} className="btn dark" style={{ minHeight: '44px', padding: '10px 20px' }}>
            {actionText}
          </Link>
        ) : (
          <button type="button" onClick={onActionClick} className="btn dark" style={{ minHeight: '44px', padding: '10px 20px' }}>
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
