'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { selectEventStats, joinGuestDetails } from '@/features/stats/selectors';
import { formatDateTime } from '@/lib/format-date';

export default function EventCheckInPage() {
  const params = useParams();
  const { db, invitationsRepo, showToast } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const event = db.events.find((e) => e.id === eventId);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ARRIVED' | 'NOT_ARRIVED'>('ALL');
  const [scannedInvitationId, setScannedInvitationId] = useState<string>('');
  const [scanResult, setScanResult] = useState<{
    guestName: string;
    arrivedCount: number;
    time: string;
    alreadyCheckedIn?: boolean;
  } | null>(null);

  if (!event) return null;

  const stats = selectEventStats(
    event.id,
    db.guests,
    db.invitations,
    db.rsvpResponses,
    db.checkIns
  );

  const eventGuests = useMemo(() => {
    return db.guests.filter((g) => g.eventId === event.id);
  }, [db.guests, event.id]);

  const joinedGuests = useMemo(() => {
    return eventGuests.map((g) =>
      joinGuestDetails(g, db.cardDesigns, db.invitations, db.rsvpResponses, db.checkIns)
    );
  }, [eventGuests, db.cardDesigns, db.invitations, db.rsvpResponses, db.checkIns]);

  const filteredGuests = useMemo(() => {
    return joinedGuests.filter((d) => {
      const matchesSearch =
        d.guest.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.guest.groupName || '').toLowerCase().includes(searchTerm.toLowerCase());

      const isArrived = !!d.checkIn;
      const matchesFilter =
        filterMode === 'ALL' ||
        (filterMode === 'ARRIVED' && isArrived) ||
        (filterMode === 'NOT_ARRIVED' && !isArrived);

      return matchesSearch && matchesFilter;
    });
  }, [joinedGuests, searchTerm, filterMode]);

  // Handle manual check-in
  const handleCheckInGuest = (invitationId: string, guestName: string, expectedCount: number) => {
    try {
      const checkIn = invitationsRepo.recordCheckIn(invitationId, expectedCount);
      showToast(
        `Điểm danh thành công: "${guestName}" (${checkIn.arrivedCount} người)!`,
        'success'
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi điểm danh', 'error');
    }
  };

  // Handle simulated QR code scan
  const handleSimulateScan = () => {
    if (!scannedInvitationId) {
      showToast('Vui lòng chọn một mã QR để quét mô phỏng.', 'warning');
      return;
    }

    const targetGuestDetail = joinedGuests.find((d) => d.invitation?.id === scannedInvitationId);
    if (!targetGuestDetail || !targetGuestDetail.invitation) {
      showToast('Không tìm thấy thông tin thư mời từ mã QR này.', 'error');
      return;
    }

    const isAlreadyArrived = !!targetGuestDetail.checkIn;
    const count = 1 + (targetGuestDetail.rsvp?.plusOnes || 0);

    const checkIn = invitationsRepo.recordCheckIn(targetGuestDetail.invitation.id, count);

    setScanResult({
      guestName: targetGuestDetail.guest.fullName,
      arrivedCount: checkIn.arrivedCount,
      time: new Date().toLocaleTimeString('vi-VN'),
      alreadyCheckedIn: isAlreadyArrived,
    });

    if (isAlreadyArrived) {
      showToast(
        `Khách mời "${targetGuestDetail.guest.fullName}" ĐÃ CHECK-IN TRƯỚC ĐÓ. Không đếm trùng.`,
        'warning'
      );
    } else {
      showToast(
        `Quét mã QR thành công: "${targetGuestDetail.guest.fullName}" (${count} người)!`,
        'success'
      );
    }
  };

  return (
    <div>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">ĐIỂM DANH SỰ KIỆN</span>
          <h1>Quản lý Check-in &amp; Quét mã QR</h1>
          <p>
            Ghi nhận khách mời đến tham dự sự kiện. Tự động kiểm tra tính duy nhất (idempotency) để tránh quét trùng.
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <div
        className="stats"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div className="panel stat">
          <div className="stat-icon green" aria-hidden="true">🎫</div>
          <b style={{ color: '#059669' }}>{stats.checkedInInvitations}</b>
          <p>Thư mời đã check-in</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon gold" aria-hidden="true">🏃</div>
          <b>{stats.arrivedPeople}</b>
          <p>Khách thực tế đã đến</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon blue" aria-hidden="true">🎯</div>
          <b>{stats.expectedPeople}</b>
          <p>Người dự kiến đến (YES)</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon" aria-hidden="true">📊</div>
          <b>
            {stats.expectedPeople > 0
              ? `${Math.round((stats.arrivedPeople / stats.expectedPeople) * 100)}%`
              : '0%'}
          </b>
          <p>Tiến độ khách đến</p>
        </div>
      </div>

      {/* Two Column Layout: Simulated QR Camera Scanner & Manual Guest Check-in */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Panel 1: Simulated QR Camera Scanner */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: 'var(--navy)' }}>
            Máy quét mã QR (Mô phỏng Camera)
          </h3>

          <div
            style={{
              background: '#0f172a',
              borderRadius: '16px',
              padding: '30px 20px',
              textAlign: 'center',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '20px',
            }}
          >
            {/* Viewfinder frame */}
            <div
              style={{
                width: '180px',
                height: '180px',
                margin: '0 auto',
                border: '2px dashed var(--gold)',
                borderRadius: '16px',
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '48px' }} aria-hidden="true">
                📷
              </div>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '14px',
                  boxShadow: 'inset 0 0 20px rgba(183, 151, 98, 0.3)',
                }}
              />
            </div>
            <p style={{ margin: '14px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Hướng camera về phía mã QR trên thư mời điện tử của khách
            </p>
          </div>

          {/* QR Simulation Selector */}
          <div className="form-block" style={{ marginBottom: '16px' }}>
            <label htmlFor="sim-qr-select">Chọn thư mời để thử nghiệm quét mã:</label>
            <select
              id="sim-qr-select"
              value={scannedInvitationId}
              onChange={(e) => setScannedInvitationId(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
            >
              <option value="">-- Chọn khách mời để quét --</option>
              {joinedGuests.map((d) => (
                <option key={d.guest.id} value={d.invitation?.id || ''}>
                  {d.guest.fullName} ({d.rsvpStatus === 'YES' ? '✓ YES' : 'Chưa YES'}) {d.checkIn ? '• Đã đến' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn gold full"
            onClick={handleSimulateScan}
            style={{ padding: '12px', fontWeight: 700 }}
          >
            ⚡ Quét mã QR mô phỏng
          </button>

          {/* Scan result display */}
          {scanResult && (
            <div
              style={{
                marginTop: '16px',
                padding: '14px 16px',
                borderRadius: '10px',
                background: scanResult.alreadyCheckedIn ? '#fffbeb' : '#f0fdf4',
                border: `1px solid ${scanResult.alreadyCheckedIn ? '#fde68a' : '#bbf7d0'}`,
                color: scanResult.alreadyCheckedIn ? '#92400e' : '#166534',
                fontSize: '13px',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                {scanResult.alreadyCheckedIn
                  ? '⚠️ CẢNH BÁO: ĐÃ CHECK-IN TRƯỚC ĐÓ'
                  : '✓ ĐIỂM DANH THÀNH CÔNG!'}
              </div>
              <div>Khách mời: <strong>{scanResult.guestName}</strong></div>
              <div>Số người ghi nhận: <strong>{scanResult.arrivedCount} người</strong></div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.85 }}>
                Thời gian: {scanResult.time}
              </div>
            </div>
          )}
        </div>

        {/* Panel 2: Manual Search & 1-Click Check-in */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '16px', color: 'var(--navy)' }}>
            Điểm danh thủ công theo danh sách
          </h3>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên khách hoặc nhóm..."
              style={{ flex: 1, minWidth: '180px' }}
            />

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as 'ALL' | 'ARRIVED' | 'NOT_ARRIVED')}
              style={{ width: 'auto' }}
            >
              <option value="ALL">Tất cả ({joinedGuests.length})</option>
              <option value="ARRIVED">Đã đến ({stats.checkedInInvitations})</option>
              <option value="NOT_ARRIVED">Chưa đến ({joinedGuests.length - stats.checkedInInvitations})</option>
            </select>
          </div>

          <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'grid', gap: '8px' }}>
            {filteredGuests.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                Không tìm thấy khách mời nào phù hợp.
              </div>
            ) : (
              filteredGuests.map((d) => {
                const isArrived = !!d.checkIn;
                const expected = 1 + (d.rsvp?.plusOnes || 0);

                return (
                  <div
                    key={d.guest.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: isArrived ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '13.5px', color: 'var(--navy)', display: 'block' }}>
                        {d.guest.fullName}
                      </strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {d.guest.groupName || 'Khách mời'} • {d.rsvpStatus === 'YES' ? `Dự kiến: ${expected} người` : 'Chưa RSVP YES'}
                      </div>
                    </div>

                    <div>
                      {isArrived ? (
                        <div style={{ textAlign: 'right' }}>
                          <span className="tag green" style={{ fontSize: '10.5px' }}>
                            ✓ Đã đến ({d.checkIn!.arrivedCount})
                          </span>
                          <span style={{ display: 'block', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                            {formatDateTime(d.checkIn!.checkedInAt)}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn sm dark"
                          onClick={() => {
                            if (d.invitation) {
                              handleCheckInGuest(d.invitation.id, d.guest.fullName, expected);
                            }
                          }}
                        >
                          Điểm danh ({expected})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
