import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  icon = '📭',
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
        padding: '50px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '260px',
      }}
    >
      <div style={{ fontSize: '44px', marginBottom: '16px' }} aria-hidden="true">
        {icon}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--ink)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: '13px', maxWidth: '420px', margin: '0 0 20px', lineHeight: 1.6 }}>
        {description}
      </p>

      {actionText && (
        actionHref ? (
          <Link href={actionHref} className="btn dark">
            {actionText}
          </Link>
        ) : (
          <button type="button" onClick={onActionClick} className="btn dark">
            {actionText}
          </button>
        )
      )}
    </div>
  );
}
