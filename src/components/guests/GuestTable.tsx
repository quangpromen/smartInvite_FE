'use client';

import React from 'react';
import Link from 'next/link';
import type { EventGuest, GuestPersonalization } from '@/features/guests/types';
import type { CardDesign } from '@/features/cards/types';
import type { Event } from '@/features/events/types';
import type { Invitation, RsvpResponse, CheckIn } from '@/features/invitations/types';
import { joinGuestDetails } from '@/features/stats/selectors';
import { formatRsvpStatus } from '@/lib/format-date';

interface GuestTableProps {
  guests: EventGuest[];
  event: Event;
  cards: CardDesign[];
  invitations: Invitation[];
  rsvpResponses: RsvpResponse[];
  checkIns: CheckIn[];
  onOpenPersonalize: (guest: EventGuest) => void;
  onOpenReassign: (guest: EventGuest) => void;
  onCopyLink: (token: string, guestName: string) => void;
}

export function GuestTable({
  guests,
  event,
  cards,
  invitations,
  rsvpResponses,
  checkIns,
  onOpenPersonalize,
  onOpenReassign,
  onCopyLink,
}: GuestTableProps) {
  if (guests.length === 0) {
    return (
      <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
        <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600 }}>
          Không tìm thấy khách mời nào phù hợp
        </p>
        <small style={{ color: '#94a3b8' }}>
          Thử thay đổi bộ lọc hoặc thêm khách mời mới vào sự kiện.
        </small>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Khách mời</th>
            <th>Nhóm</th>
            <th>Mẫu thiệp gán</th>
            <th>Trạng thái RSVP</th>
            <th>Đi kèm</th>
            <th>Check-in</th>
            <th>Liên kết mời (Token)</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => {
            const details = joinGuestDetails(g, cards, invitations, rsvpResponses, checkIns);
            const rsvpBadge = formatRsvpStatus(details.rsvpStatus);
            const card = details.assignedCard;
            const invitation = details.invitation;
            const hasPersonalization =
              !!g.personalization.greeting || !!g.personalization.personalMessage;

            // Determine if invitation link is usable
            const isUsable =
              invitation &&
              invitation.status === 'ACTIVE' &&
              card &&
              card.status === 'PUBLISHED';

            return (
              <tr key={g.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {g.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>
                        <Link
                          href={`/dashboard/events/${event.id}/guests/${g.id}`}
                          style={{ color: 'inherit', textDecoration: 'none' }}
                          title="Xem chi tiết khách mời"
                        >
                          {g.fullName} →
                        </Link>
                      </strong>
                      {g.personalization.salutation && (
                        <small style={{ color: '#64748b', fontSize: '11px' }}>
                          Xưng hô: {g.personalization.salutation}
                        </small>
                      )}
                      {hasPersonalization && (
                        <span
                          className="tag"
                          style={{
                            fontSize: '9px',
                            background: '#fef3c7',
                            color: '#b45309',
                            marginLeft: '4px',
                            padding: '2px 6px',
                          }}
                        >
                          Đã cá nhân hóa
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td>
                  <span style={{ fontSize: '12.5px', color: '#475569' }}>
                    {g.groupName || 'Chưa phân nhóm'}
                  </span>
                </td>

                <td>
                  {card ? (
                    <div>
                      <span className="tag" style={{ fontSize: '11px' }}>
                        {card.title}
                      </span>
                      {card.status === 'DRAFT' && (
                        <small style={{ display: 'block', color: '#d97706', fontSize: '10px' }}>
                          (Bản nháp)
                        </small>
                      )}
                    </div>
                  ) : (
                    <span className="tag gray" style={{ fontSize: '11px' }}>
                      Chưa gán thiệp
                    </span>
                  )}
                </td>

                <td>
                  <span className={rsvpBadge.tagClass} style={{ fontSize: '11px' }}>
                    {rsvpBadge.label}
                  </span>
                </td>

                <td>
                  <span style={{ fontSize: '12px', color: '#475569' }}>
                    {details.rsvp?.plusOnes ? `+${details.rsvp.plusOnes}` : '0'}
                  </span>
                </td>

                <td>
                  {details.checkIn ? (
                    <span
                      className="tag"
                      style={{ background: '#dcfce7', color: '#15803d', fontSize: '10.5px' }}
                    >
                      ✓ Đã đến ({details.checkIn.arrivedCount})
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>Chưa đến</span>
                  )}
                </td>

                <td>
                  {isUsable && invitation?.token ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn sm"
                        style={{ fontSize: '11px', padding: '5px 8px' }}
                        onClick={() => onCopyLink(invitation.token, g.fullName)}
                        title={`Sao chép liên kết /invite/${invitation.token}`}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        Sao chép link
                      </button>
                      <a
                        href={`/invite/${invitation.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn sm ghost"
                        style={{ padding: '4px 6px', color: '#4f46e5' }}
                        title="Mở thiệp mời trong tab mới"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  ) : !card ? (
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                      Cần gán thiệp trước
                    </span>
                  ) : card.status === 'DRAFT' ? (
                    <span style={{ color: '#d97706', fontSize: '11px' }}>
                      Thiệp đang là bản nháp
                    </span>
                  ) : invitation?.status === 'REVOKED' ? (
                    <span style={{ color: '#ef4444', fontSize: '11px' }}>
                      Link đã thu hồi
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                      Chưa cấp link
                    </span>
                  )}
                </td>

                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link
                      href={`/dashboard/events/${g.eventId}/guests/${g.id}`}
                      className="btn sm dark"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      title="Xem toàn bộ thông tin chi tiết và link mời của khách"
                    >
                      Chi tiết
                    </Link>
                    <button
                      type="button"
                      className="btn sm"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => onOpenPersonalize(g)}
                      title="Chỉnh sửa xưng hô và thông điệp riêng"
                    >
                      Cá nhân hóa
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => onOpenReassign(g)}
                      title="Chuyển sang mẫu thiệp khác trong cùng sự kiện"
                    >
                      Gán thiệp
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
