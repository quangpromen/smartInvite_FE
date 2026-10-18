'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { selectEventStats, selectCardBreakdown, selectGroupBreakdown, joinGuestDetails } from '@/features/stats/selectors';
import { formatRsvpStatus, formatDateTime } from '@/lib/format-date';
import type { RsvpStatus } from '@/features/invitations/types';

export default function EventRsvpPage() {
  const params = useParams();
  const { db, invitationsRepo, showToast } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const event = db.events.find((e) => e.id === eventId);

  const [cardFilter, setCardFilter] = useState<string>('ALL');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RsvpStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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

  const groupBreakdown = selectGroupBreakdown(
    event.id,
    db.guests,
    db.invitations,
    db.rsvpResponses
  );

  const eventGuests = useMemo(() => {
    return db.guests.filter((g) => g.eventId === event.id);
  }, [db.guests, event.id]);

  // Joined guests with RSVP details
  const joinedGuests = useMemo(() => {
    return eventGuests.map((g) =>
      joinGuestDetails(g, db.cardDesigns, db.invitations, db.rsvpResponses, db.checkIns)
    );
  }, [eventGuests, db.cardDesigns, db.invitations, db.rsvpResponses, db.checkIns]);

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return joinedGuests.filter((d) => {
      const matchesSearch = d.guest.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCard =
        cardFilter === 'ALL' || d.guest.assignedCardDesignId === cardFilter;
      const matchesGroup =
        groupFilter === 'ALL' || d.guest.groupName === groupFilter;
      const matchesStatus =
        statusFilter === 'ALL' || d.rsvpStatus === statusFilter;

      return matchesSearch && matchesCard && matchesGroup && matchesStatus;
    });
  }, [joinedGuests, searchTerm, cardFilter, groupFilter, statusFilter]);

  const handleManualRsvp = (invitationId: string, status: 'YES' | 'NO', guestName: string) => {
    try {
      invitationsRepo.recordRsvp(invitationId, status, 0);
      showToast(
        `Đã cập nhật phản hồi của "${guestName}" thành ${status === 'YES' ? 'ĐỒNG Ý (YES)' : 'TỪ CHỐI (NO)'} (Demo)`,
        'success'
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi cập nhật RSVP', 'error');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">PHÂN TÍCH PHẢN HỒI</span>
          <h1>Quản lý phản hồi RSVP sự kiện</h1>
          <p>
            Theo dõi chi tiết khách mời đồng ý tham dự, từ chối hoặc chưa phản hồi. Dữ liệu được nhóm theo mẫu thiệp và nhóm khách.
          </p>
        </div>
        <div className="actions">
          <Link href={`/dashboard/events/${event.id}/reports`} className="btn">
            📊 Xem báo cáo tổng hợp
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div
        className="stats"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div className="panel stat">
          <div className="stat-icon" aria-hidden="true">👥</div>
          <b>{stats.guestCount}</b>
          <p>Tổng khách mời</p>
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
          <p>Tổng người dự kiến (YES+Kèm)</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon gold" aria-hidden="true">📈</div>
          <b>{stats.responseRate}%</b>
          <p>Tỷ lệ phản hồi</p>
        </div>
      </div>

      {/* Card Breakdown Strip */}
      <div className="panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--navy)' }}>
          Phân bố RSVP theo mẫu thiệp trong sự kiện
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {cardBreakdown.map((cb) => (
            <div
              key={cb.card.id}
              onClick={() => setCardFilter(cardFilter === cb.card.id ? 'ALL' : cb.card.id)}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: cardFilter === cb.card.id ? '2px solid var(--navy)' : '1px solid #e2e8f0',
                background: cardFilter === cb.card.id ? '#f8fafc' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>{cb.card.title}</strong>
                <span className="tag gray" style={{ fontSize: '10px' }}>{cb.guestCount} khách</span>
              </div>
              <div style={{ fontSize: '12px', display: 'flex', gap: '10px', color: '#64748b' }}>
                <span style={{ color: '#16a34a' }}>✓ {cb.yesCount} YES</span>
                <span style={{ color: '#d97706' }}>⏳ {cb.pendingCount} Chờ</span>
                <span>🎯 {cb.expectedPeople} người</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div
        className="panel"
        style={{
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên khách mời..."
            style={{ maxWidth: '260px' }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | RsvpStatus)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="YES">Đồng ý (YES)</option>
            <option value="NO">Từ chối (NO)</option>
            <option value="PENDING">Chưa phản hồi (PENDING)</option>
          </select>

          <select
            value={cardFilter}
            onChange={(e) => setCardFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">Tất cả mẫu thiệp</option>
            {cardBreakdown.map((cb) => (
              <option key={cb.card.id} value={cb.card.id}>
                {cb.card.title}
              </option>
            ))}
          </select>

          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">Tất cả nhóm khách</option>
            {groupBreakdown.map((gb) => (
              <option key={gb.groupName} value={gb.groupName}>
                {gb.groupName} ({gb.guestCount})
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Hiển thị <strong>{filteredGuests.length}</strong> / {eventGuests.length} khách mời
        </div>
      </div>

      {/* Guests RSVP Table */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Khách mời</th>
                <th>Nhóm</th>
                <th>Mẫu thiệp gán</th>
                <th>Trạng thái RSVP</th>
                <th>Đi kèm</th>
                <th>Chế độ tham gia</th>
                <th>Cập nhật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    Không có khách mời nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((d) => {
                  const rBadge = formatRsvpStatus(d.rsvpStatus);
                  const isYes = d.rsvpStatus === 'YES';
                  const isNo = d.rsvpStatus === 'NO';

                  return (
                    <tr key={d.guest.id}>
                      <td>
                        <strong>
                          <Link href={`/dashboard/events/${event.id}/guests/${d.guest.id}`}>
                            {d.guest.fullName}
                          </Link>
                        </strong>
                        {d.guest.personalization.salutation && (
                          <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>
                            ({d.guest.personalization.salutation})
                          </small>
                        )}
                      </td>

                      <td>{d.guest.groupName || 'Chưa phân nhóm'}</td>

                      <td>
                        {d.assignedCard ? (
                          <span className="tag">{d.assignedCard.title}</span>
                        ) : (
                          <span className="tag gray">Chưa gán</span>
                        )}
                      </td>

                      <td>
                        <span className={rBadge.tagClass}>{rBadge.label}</span>
                      </td>

                      <td>
                        {d.rsvp?.plusOnes ? `+${d.rsvp.plusOnes}` : '0'}
                      </td>

                      <td style={{ fontSize: '12px' }}>
                        {d.rsvp?.attendanceMode === 'CEREMONY'
                          ? 'Dự lễ'
                          : d.rsvp?.attendanceMode === 'PHOTOS'
                          ? 'Chụp ảnh'
                          : d.rsvp?.attendanceMode === 'BOTH'
                          ? 'Cả hai'
                          : '-'}
                      </td>

                      <td style={{ fontSize: '11px', color: '#64748b' }}>
                        {d.rsvp?.updatedAt ? formatDateTime(d.rsvp.updatedAt) : '-'}
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {d.invitation && (
                            <>
                              {!isYes && (
                                <button
                                  type="button"
                                  className="btn sm"
                                  style={{ fontSize: '11px', padding: '3px 8px', color: '#16a34a' }}
                                  onClick={() => handleManualRsvp(d.invitation!.id, 'YES', d.guest.fullName)}
                                  title="Ghi nhận YES hộ khách (Quản trị)"
                                >
                                  ✓ YES
                                </button>
                              )}
                              {!isNo && (
                                <button
                                  type="button"
                                  className="btn sm"
                                  style={{ fontSize: '11px', padding: '3px 8px', color: '#dc2626' }}
                                  onClick={() => handleManualRsvp(d.invitation!.id, 'NO', d.guest.fullName)}
                                  title="Ghi nhận NO hộ khách (Quản trị)"
                                >
                                  ✕ NO
                                </button>
                              )}
                            </>
                          )}
                          <Link
                            href={`/dashboard/events/${event.id}/guests/${d.guest.id}`}
                            className="btn sm"
                            style={{ fontSize: '11px', padding: '3px 8px' }}
                          >
                            Chi tiết
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
