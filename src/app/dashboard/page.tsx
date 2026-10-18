'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMockStore } from '@/mocks/mock-store';
import { formatDateTime, formatEventStatus } from '@/lib/format-date';
import { selectEventStats } from '@/features/stats/selectors';

export default function DashboardOverviewPage() {
  const { db, currentUser } = useMockStore();
  const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'UPCOMING'>('ALL');

  // Total KPIs derived from normalized state
  const totalEvents = db.events.length;
  const totalCards = db.cardDesigns.length;
  const totalGuests = db.guests.length;

  const cardsDraftCount = useMemo(
    () => db.cardDesigns.filter((c) => c.status === 'DRAFT').length,
    [db.cardDesigns]
  );
  const cardsPublishedCount = useMemo(
    () => db.cardDesigns.filter((c) => c.status === 'PUBLISHED').length,
    [db.cardDesigns]
  );
  const cardsArchivedCount = useMemo(
    () => db.cardDesigns.filter((c) => c.status === 'ARCHIVED').length,
    [db.cardDesigns]
  );

  const eventsPublishedCount = useMemo(
    () => db.events.filter((e) => e.status === 'PUBLISHED').length,
    [db.events]
  );
  const eventsDraftCount = useMemo(
    () => db.events.filter((e) => e.status === 'DRAFT').length,
    [db.events]
  );

  // Aggregate derived metrics across normalized store
  const { totalYes, totalNo, expectedPeople } = useMemo(() => {
    let yes = 0;
    let no = 0;
    let exp = 0;
    for (const rsvp of db.rsvpResponses) {
      if (rsvp.status === 'YES') {
        yes += 1;
        exp += 1 + (rsvp.plusOnes || 0);
      } else if (rsvp.status === 'NO') {
        no += 1;
      }
    }
    return { totalYes: yes, totalNo: no, expectedPeople: exp };
  }, [db.rsvpResponses]);

  const totalPending = Math.max(0, totalGuests - totalYes - totalNo);
  const checkedInInvitations = db.checkIns.length;
  const arrivedPeople = db.checkIns.reduce((sum, c) => sum + (c.arrivedCount || 1), 0);

  const nowTime = new Date().getTime();
  const upcomingEvents = useMemo(() => {
    return db.events
      .filter((e) => {
        const time = new Date(e.startsAt).getTime();
        return time >= nowTime && e.status !== 'CANCELLED';
      })
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [db.events, nowTime]);

  const firstEventId = db.events[0]?.id || '';

  // Filtered events display
  const displayedEvents = filterPeriod === 'UPCOMING' ? upcomingEvents : db.events;

  return (
    <div>
      {/* Page Heading & User Greeting */}
      <div className="page-heading">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="eyebrow" style={{ margin: 0 }}>
              TỔNG QUAN TÀI KHOẢN • {currentUser.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'CHỦ SỰ KIỆN'}
            </span>
            <span
              className="tag gold"
              style={{ fontSize: '10px', padding: '2px 8px', letterSpacing: '0.5px' }}
            >
              Bản demo v2
            </span>
          </div>
          <h1>Xin chào, {currentUser.fullName}!</h1>
          <p>
            Chào mừng bạn đến với SmartInvite. Quản lý toàn bộ sự kiện, mẫu thiệp và khách mời từ một nơi tập trung theo cấu trúc Event-first.
          </p>
        </div>
        <div className="actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/dashboard/events/new" className="btn dark">
            <span>➕</span>
            <span>Tạo sự kiện mới</span>
          </Link>
          <Link href="/dashboard/cards/new" className="btn gold">
            <span>✉️</span>
            <span>Tạo thiệp mời (Chọn sự kiện)</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (All derived strictly from normalized store) */}
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
          <div className="stat-icon blue" aria-hidden="true">📅</div>
          <b>{totalEvents}</b>
          <p>Tổng sự kiện ({upcomingEvents.length} sắp tới)</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon gold" aria-hidden="true">✉️</div>
          <b>{totalCards}</b>
          <p>Mẫu thiệp ({cardsPublishedCount} đã công bố)</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon" aria-hidden="true">👥</div>
          <b>{totalGuests}</b>
          <p>Tổng khách mời sự kiện</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon green" aria-hidden="true">✓</div>
          <b style={{ color: '#16a34a' }}>{totalYes}</b>
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
          <b style={{ color: '#dc2626' }}>{totalNo}</b>
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
          <b style={{ color: '#d97706' }}>{totalPending}</b>
          <p>Chờ phản hồi (PENDING)</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon blue" aria-hidden="true">🎯</div>
          <b>{expectedPeople}</b>
          <p>Người dự kiến đến (YES+Kèm)</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon green" aria-hidden="true">🎫</div>
          <b style={{ color: '#059669' }}>{checkedInInvitations}</b>
          <p>Thư mời đã check-in</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon gold" aria-hidden="true">🏃</div>
          <b>{arrivedPeople}</b>
          <p>Khách thực tế đã đến</p>
        </div>
      </div>

      {/* System Status Breakdown Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* RSVP Status Breakdown */}
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--navy)', fontWeight: 700 }}>
            Phân bố phản hồi RSVP toàn hệ thống
          </h3>
          <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a' }}
                  aria-hidden="true"
                />
                Đồng ý (YES)
              </span>
              <strong>{totalYes} ({totalGuests > 0 ? Math.round((totalYes / totalGuests) * 100) : 0}%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }}
                  aria-hidden="true"
                />
                Từ chối (NO)
              </span>
              <strong>{totalNo} ({totalGuests > 0 ? Math.round((totalNo / totalGuests) * 100) : 0}%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d97706' }}
                  aria-hidden="true"
                />
                Chưa phản hồi (PENDING)
              </span>
              <strong>{totalPending} ({totalGuests > 0 ? Math.round((totalPending / totalGuests) * 100) : 0}%)</strong>
            </div>
          </div>
        </div>

        {/* Card Status Breakdown */}
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--navy)', fontWeight: 700 }}>
            Trạng thái mẫu thiệp (Card Designs)
          </h3>
          <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7' }}
                  aria-hidden="true"
                />
                Đã xuất bản (PUBLISHED)
              </span>
              <strong>{cardsPublishedCount} mẫu</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#94a3b8' }}
                  aria-hidden="true"
                />
                Bản nháp (DRAFT)
              </span>
              <strong>{cardsDraftCount} mẫu</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cbd5e1' }}
                  aria-hidden="true"
                />
                Đã lưu trữ (ARCHIVED)
              </span>
              <strong>{cardsArchivedCount} mẫu</strong>
            </div>
          </div>
        </div>

        {/* Event Status Breakdown */}
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '15px', color: 'var(--navy)', fontWeight: 700 }}>
            Trạng thái sự kiện (Events)
          </h3>
          <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Đang hoạt động (PUBLISHED)</span>
              <strong style={{ color: '#16a34a' }}>{eventsPublishedCount} sự kiện</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Bản nháp (DRAFT)</span>
              <strong style={{ color: '#64748b' }}>{eventsDraftCount} sự kiện</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Đã hủy / Kết thúc</span>
              <strong style={{ color: '#dc2626' }}>{totalEvents - eventsPublishedCount - eventsDraftCount} sự kiện</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Events List & Switcher Section */}
      <div className="panel" style={{ marginBottom: '24px' }}>
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
            <h2 className="section-title">Danh sách sự kiện</h2>
            <p className="sub">
              Mỗi sự kiện là một không gian độc lập, chứa các mẫu thiệp và danh sách khách mời riêng.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {/* Filter buttons */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setFilterPeriod('ALL')}
                style={{
                  border: 'none',
                  background: filterPeriod === 'ALL' ? '#ffffff' : 'transparent',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: filterPeriod === 'ALL' ? 700 : 500,
                  cursor: 'pointer',
                  color: filterPeriod === 'ALL' ? 'var(--navy)' : '#64748b',
                  boxShadow: filterPeriod === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Tất cả ({totalEvents})
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod('UPCOMING')}
                style={{
                  border: 'none',
                  background: filterPeriod === 'UPCOMING' ? '#ffffff' : 'transparent',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: filterPeriod === 'UPCOMING' ? 700 : 500,
                  cursor: 'pointer',
                  color: filterPeriod === 'UPCOMING' ? 'var(--navy)' : '#64748b',
                  boxShadow: filterPeriod === 'UPCOMING' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Sắp diễn ra ({upcomingEvents.length})
              </button>
            </div>

            <Link href="/dashboard/events/new" className="btn sm dark">
              ➕ Tạo sự kiện mới
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px', padding: '24px' }}>
          {displayedEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }} aria-hidden="true">
                📅
              </div>
              <h3 style={{ margin: '0 0 6px', color: 'var(--navy)' }}>
                {filterPeriod === 'UPCOMING' ? 'Không có sự kiện sắp diễn ra' : 'Chưa có sự kiện nào'}
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13px' }}>
                Bắt đầu bằng cách tạo sự kiện đầu tiên của bạn để thiết kế thiệp và mời khách.
              </p>
              <Link href="/dashboard/events/new" className="btn dark">
                Tạo sự kiện ngay
              </Link>
            </div>
          ) : (
            displayedEvents.map((event) => {
              const eventCards = db.cardDesigns.filter((c) => c.eventId === event.id);
              const stats = selectEventStats(
                event.id,
                db.guests,
                db.invitations,
                db.rsvpResponses,
                db.checkIns
              );
              const statusBadge = formatEventStatus(event.status);

              return (
                <div
                  key={event.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    background: '#fafbfc',
                  }}
                >
                  <div style={{ minWidth: '240px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                        <Link href={`/dashboard/events/${event.id}`} style={{ color: 'inherit' }}>
                          {event.title}
                        </Link>
                      </h3>
                      <span className={statusBadge.tagClass}>{statusBadge.label}</span>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        display: 'flex',
                        gap: '16px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>📍 {event.locationName}</span>
                      <span>🕒 {formatDateTime(event.startsAt)}</span>
                    </div>
                  </div>

                  {/* Event micro-stats */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '13px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <b style={{ display: 'block', fontSize: '16px', color: 'var(--ink)' }}>
                        {eventCards.length}
                      </b>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Mẫu thiệp</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <b style={{ display: 'block', fontSize: '16px', color: 'var(--ink)' }}>
                        {stats.guestCount}
                      </b>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Khách mời</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <b style={{ display: 'block', fontSize: '16px', color: '#16a34a' }}>
                        {stats.yesCount}
                      </b>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Đồng ý</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <b style={{ display: 'block', fontSize: '16px', color: '#d97706' }}>
                        {stats.pendingCount}
                      </b>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Chờ RSVP</span>
                    </div>
                    <Link href={`/dashboard/events/${event.id}`} className="btn sm dark">
                      Không gian sự kiện →
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Actions Footer Bar */}
      <div
        className="panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <strong style={{ fontSize: '14px', color: 'var(--navy)' }}>Thao tác nhanh</strong>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
            Truy cập nhanh các chức năng quản lý chính
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/dashboard/events" className="btn sm">
            Quản lý tất cả sự kiện
          </Link>
          <Link href="/dashboard/cards/new" className="btn sm gold">
            Tạo thiệp mới
          </Link>
          {firstEventId && (
            <Link href={`/dashboard/events/${firstEventId}/guests`} className="btn sm dark">
              Quản lý khách mời
            </Link>
          )}
          {firstEventId && (
            <Link href={`/dashboard/events/${firstEventId}/reports`} className="btn sm">
              Xem báo cáo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
