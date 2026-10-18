'use client';

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import {
  selectEventStats,
  selectCardBreakdown,
  selectGroupBreakdown,
  joinGuestDetails,
} from '@/features/stats/selectors';
import { formatDateTime } from '@/lib/format-date';

export default function EventReportsPage() {
  const params = useParams();
  const { db, showToast } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const event = db.events.find((e) => e.id === eventId);

  if (!event) return null;

  const stats = selectEventStats(
    event.id,
    db.guests,
    db.invitations,
    db.rsvpResponses,
    db.checkIns
  );

  const cardBreakdown = selectCardBreakdown(
    event.id,
    db.cardDesigns,
    db.guests,
    db.invitations,
    db.rsvpResponses,
    db.checkIns
  );

  const groupBreakdown = selectGroupBreakdown(
    event.id,
    db.guests,
    db.invitations,
    db.rsvpResponses
  );

  const eventGuests = useMemo(() => {
    return db.guests.filter((g) => g.eventId === event.id);
  }, [db.guests, event.id]);

  const joinedGuests = useMemo(() => {
    return eventGuests.map((g) =>
      joinGuestDetails(g, db.cardDesigns, db.invitations, db.rsvpResponses, db.checkIns)
    );
  }, [eventGuests, db.cardDesigns, db.invitations, db.rsvpResponses, db.checkIns]);

  // Export CSV mock function with UTF-8 BOM
  const handleExportCsv = () => {
    try {
      const headers = [
        'Họ và tên',
        'Xưng hô',
        'Nhóm',
        'Mẫu thiệp',
        'Trạng thái RSVP',
        'Người đi kèm',
        'Đã Check-in',
        'Thời gian Check-in',
      ];

      const rows = joinedGuests.map((d) => [
        `"${d.guest.fullName.replace(/"/g, '""')}"`,
        `"${(d.guest.personalization.salutation || '').replace(/"/g, '""')}"`,
        `"${(d.guest.groupName || 'Chưa phân nhóm').replace(/"/g, '""')}"`,
        `"${(d.assignedCard?.title || 'Chưa gán').replace(/"/g, '""')}"`,
        `"${d.rsvpStatus}"`,
        d.rsvp?.plusOnes || 0,
        d.checkIn ? `Có (${d.checkIn.arrivedCount})` : 'Chưa',
        d.checkIn ? `"${formatDateTime(d.checkIn.checkedInAt)}"` : '""',
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartInvite_${event.title.replace(/\s+/g, '_')}_Guests.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Đã tải xuống tệp danh sách khách mời (CSV) thành công!', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi xuất CSV', 'error');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">BÁO CÁO TỔNG HỢP</span>
          <h1>Thống kê &amp; Xuất dữ liệu sự kiện</h1>
          <p>
            Phân tích số liệu khách mời theo từng mẫu thiệp và nhóm đối tượng. Tải danh sách khách mời dự phòng sang định dạng CSV.
          </p>
        </div>
        <div className="actions">
          <button type="button" className="btn dark" onClick={handleExportCsv}>
            <span>📥</span>
            <span>Xuất danh sách khách (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div
        className="stats"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div className="panel stat">
          <div className="stat-icon" aria-hidden="true">👥</div>
          <b>{stats.guestCount}</b>
          <p>Tổng khách mời sự kiện</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon green" aria-hidden="true">✓</div>
          <b style={{ color: '#16a34a' }}>{stats.yesCount}</b>
          <p>Đồng ý tham gia (YES)</p>
        </div>

        <div className="panel stat">
          <div
            className="stat-icon"
            style={{ background: '#fef2f2', color: '#dc2626' }}
            aria-hidden="true"
          >
            ✕
          </div>
          <b style={{ color: '#dc2626' }}>{stats.noCount}</b>
          <p>Từ chối tham gia (NO)</p>
        </div>

        <div className="panel stat">
          <div
            className="stat-icon"
            style={{ background: '#fffbeb', color: '#d97706' }}
            aria-hidden="true"
          >
            ⏳
          </div>
          <b style={{ color: '#d97706' }}>{stats.pendingCount}</b>
          <p>Chưa phản hồi (PENDING)</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon blue" aria-hidden="true">🎯</div>
          <b>{stats.expectedPeople}</b>
          <p>Người dự kiến đến (YES+Kèm)</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon gold" aria-hidden="true">🏃</div>
          <b>{stats.arrivedPeople}</b>
          <p>Khách thực tế đã đến</p>
        </div>
      </div>

      {/* Breakdown by Card Designs */}
      <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="section-title">Phân tích theo mẫu thiệp mời ({cardBreakdown.length} mẫu)</h3>
        <p className="sub" style={{ margin: '4px 0 16px' }}>
          Số liệu phản hồi của từng mẫu thiệp trong cùng sự kiện.
        </p>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Mẫu thiệp</th>
                <th>Đối tượng</th>
                <th>Trạng thái</th>
                <th>Số khách gán</th>
                <th>Đồng ý (YES)</th>
                <th>Từ chối (NO)</th>
                <th>Chờ RSVP</th>
                <th>Dự kiến đến</th>
              </tr>
            </thead>
            <tbody>
              {cardBreakdown.map((cb) => (
                <tr key={cb.card.id}>
                  <td>
                    <strong>{cb.card.title}</strong>
                    {cb.card.isDefault && (
                      <span className="tag gold" style={{ fontSize: '9px', marginLeft: '6px' }}>
                        Mặc định
                      </span>
                    )}
                  </td>
                  <td>{cb.card.audienceLabel || 'Mẫu chung'}</td>
                  <td>
                    <span className="tag">{cb.card.status}</span>
                  </td>
                  <td>
                    <strong>{cb.guestCount}</strong>
                  </td>
                  <td style={{ color: '#16a34a', fontWeight: 600 }}>{cb.yesCount}</td>
                  <td style={{ color: '#dc2626' }}>{cb.noCount}</td>
                  <td style={{ color: '#d97706' }}>{cb.pendingCount}</td>
                  <td>
                    <strong>{cb.expectedPeople}</strong> người
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown by Groups */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 className="section-title">Phân tích theo nhóm khách mời ({groupBreakdown.length} nhóm)</h3>
        <p className="sub" style={{ margin: '4px 0 16px' }}>
          Tỷ lệ phản hồi chi tiết theo từng nhóm phân loại.
        </p>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tên nhóm</th>
                <th>Số khách</th>
                <th>Đồng ý (YES)</th>
                <th>Từ chối (NO)</th>
                <th>Chưa phản hồi (PENDING)</th>
                <th>Tỷ lệ phản hồi</th>
              </tr>
            </thead>
            <tbody>
              {groupBreakdown.map((grp) => {
                const total = grp.guestCount;
                const answered = grp.yesCount + grp.noCount;
                const rate = total > 0 ? Math.round((answered / total) * 100) : 0;

                return (
                  <tr key={grp.groupName}>
                    <td>
                      <strong>{grp.groupName}</strong>
                    </td>
                    <td>{grp.guestCount}</td>
                    <td style={{ color: '#16a34a', fontWeight: 600 }}>{grp.yesCount}</td>
                    <td style={{ color: '#dc2626' }}>{grp.noCount}</td>
                    <td style={{ color: '#d97706' }}>{grp.pendingCount}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '60px',
                            height: '6px',
                            background: '#e2e8f0',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${rate}%`,
                              height: '100%',
                              background: '#16a34a',
                            }}
                          />
                        </div>
                        <span>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
