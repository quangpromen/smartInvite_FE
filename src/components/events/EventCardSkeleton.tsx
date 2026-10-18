import React from 'react';

export function EventCardSkeleton() {
  return (
    <div className="event-card-skeleton" aria-hidden="true">
      <div className="skeleton-header">
        <div className="skeleton-line skeleton-badge" style={{ width: '90px', height: '18px' }} />
        <div className="skeleton-line skeleton-badge" style={{ width: '80px', height: '24px' }} />
      </div>

      <div className="skeleton-line" style={{ width: '65%', height: '24px', margin: '10px 0 8px' }} />
      
      <div className="skeleton-meta-row">
        <div className="skeleton-line" style={{ width: '180px', height: '16px' }} />
        <div className="skeleton-line" style={{ width: '220px', height: '16px' }} />
      </div>

      <div className="skeleton-line" style={{ width: '85%', height: '14px', marginTop: '12px' }} />

      <div className="skeleton-divider" />

      <div className="skeleton-footer">
        <div className="skeleton-metrics">
          <div className="skeleton-line" style={{ width: '80px', height: '16px' }} />
          <div className="skeleton-line" style={{ width: '60px', height: '16px' }} />
          <div className="skeleton-line" style={{ width: '70px', height: '16px' }} />
          <div className="skeleton-line" style={{ width: '80px', height: '16px' }} />
        </div>
        <div className="skeleton-actions">
          <div className="skeleton-btn" style={{ width: '88px', height: '36px' }} />
          <div className="skeleton-btn" style={{ width: '110px', height: '36px' }} />
        </div>
      </div>
    </div>
  );
}

export function EventListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}
