'use client';

import React from 'react';
import type { EventStats } from '@/features/stats/selectors';

export function EventOverviewKpis({ stats }: { stats: EventStats }) {
  return (
    <div className="stats">
      <div className="panel stat">
        <div className="stat-icon">👥</div>
        <b>{stats.guestCount}</b>
        <p>Tổng khách mời ({stats.linkedCount} đã cấp link)</p>
      </div>

      <div className="panel stat">
        <div className="stat-icon green">✓</div>
        <b style={{ color: '#16a34a' }}>{stats.yesCount}</b>
        <p>Đồng ý ({stats.expectedPeople} người dự kiến)</p>
      </div>

      <div className="panel stat">
        <div className="stat-icon gold">⏳</div>
        <b style={{ color: '#b45309' }}>{stats.pendingCount}</b>
        <p>Chưa phản hồi (PENDING)</p>
      </div>

      <div className="panel stat">
        <div className="stat-icon blue">📍</div>
        <b style={{ color: '#2563eb' }}>{stats.checkedInInvitations}</b>
        <p>Đã check-in ({stats.arrivedPeople} người đã đến)</p>
      </div>
    </div>
  );
}
