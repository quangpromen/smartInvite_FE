'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { EventOverviewKpis } from '@/components/events/EventOverviewKpis';
import { selectEventStats, selectCardBreakdown } from '@/features/stats/selectors';
import { formatDateTime, formatCardStatus } from '@/lib/format-date';

export default function EventOverviewPage() {
  const params = useParams();
  const { db } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const event = db.events.find((e) => e.id === eventId);

  if (!event) return null; // Handled by layout

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

  return (
    <div>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--navy)' }}>
            Tổng quan sự kiện
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Toàn bộ số liệu và phân bố khách mời được đồng bộ thời gian thực theo cấu trúc sự kiện.
          </p>
        </div>

        <div className="actions">
          <Link href={`/dashboard/events/${event.id}/cards/new`} className="btn dark">
            <span>✉️</span>
            <span>Tạo thiệp mới cho sự kiện</span>
          </Link>
          <Link href={`/dashboard/events/${event.id}/cards`} className="btn">
            <span>🎨</span>
            <span>Quản lý mẫu thiệp ({cardBreakdown.length})</span>
          </Link>
        </div>
      </div>

      {/* Canonical Metadata Summary Box */}
      <div
        className="panel"
        style={{
          padding: '18px 24px',
          marginBottom: '24px',
          background: '#f8fafc',
          borderLeft: '4px solid var(--navy)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
              THÔNG TIN CANONICAL CỦA SỰ KIỆN (DÙNG CHUNG CHO TẤT CẢ THIỆP)
            </span>
            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--ink)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <strong>Thời gian:</strong> {formatDateTime(event.startsAt)}
              </div>
              <div>
                <strong>Địa điểm:</strong> {event.locationName}
              </div>
              <div>
                <strong>Địa chỉ:</strong> {event.locationAddress || 'Chưa cập nhật'}
              </div>
              <div>
                <strong>Hạn RSVP:</strong> {event.rsvpDeadline ? formatDateTime(event.rsvpDeadline) : 'Không giới hạn'}
              </div>
            </div>
          </div>

          <Link href={`/dashboard/events/${event.id}/settings`} className="btn sm">
            ✏️ Sửa thông tin này
          </Link>
        </div>
      </div>

      {/* Derived Event KPIs */}
      <EventOverviewKpis stats={stats} />

      {/* Cards Breakdown Section */}
      <div className="panel" style={{ marginTop: '24px' }}>
        <div
          className="section-bar"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h3 className="section-title">Phân rã theo mẫu thiệp ({cardBreakdown.length} mẫu)</h3>
            <p className="sub">
              Khách mời được gán vào từng mẫu thiệp riêng biệt. Chuyển mẫu không làm thay đổi tổng số liệu sự kiện.
            </p>
          </div>
          <Link href={`/dashboard/events/${event.id}/cards/new`} className="btn sm dark">
            + Thêm mẫu thiệp mới
          </Link>
        </div>

        {cardBreakdown.length > 0 ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên mẫu thiệp</th>
                  <th>Đối tượng</th>
                  <th>Trạng thái</th>
                  <th>Khách được gán</th>
                  <th>Đồng ý (YES)</th>
                  <th>Dự kiến đến</th>
                  <th>Đã check-in</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {cardBreakdown.map((card) => {
                  const statusInfo = formatCardStatus(card.status);
                  return (
                    <tr key={card.cardId}>
                      <td>
                        <strong>{card.title}</strong>
                        {card.isDefault && (
                          <span
                            className="tag blue"
                            style={{ marginLeft: '8px', fontSize: '9px', padding: '2px 6px' }}
                          >
                            Mặc định
                          </span>
                        )}
                      </td>
                      <td>{card.audienceLabel || 'Tất cả đối tượng'}</td>
                      <td>
                        <span className={statusInfo.tagClass}>{statusInfo.label}</span>
                      </td>
                      <td>
                        <strong>{card.guestCount}</strong> khách
                      </td>
                      <td>
                        <strong style={{ color: '#16a34a' }}>{card.yesCount}</strong>
                      </td>
                      <td>{card.expectedPeople} người</td>
                      <td>{card.checkedInCount}</td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/dashboard/events/${event.id}/cards`} className="btn sm">
                          Xem trong Thư viện →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px' }}>
              Sự kiện này chưa có mẫu thiệp nào. Hãy tạo mẫu thiệp đầu tiên cho sự kiện.
            </p>
            <Link href={`/dashboard/events/${event.id}/cards/new`} className="btn dark">
              Tạo mẫu thiệp đầu tiên
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
