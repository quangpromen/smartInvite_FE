import type { MockDb } from '@/services/repositories';
import type { InvitationResolution } from './types';

/**
 * Pure resolver to resolve an invitation token strictly according to domain invariants:
 * 1. Token must exist and be ACTIVE
 * 2. Guest must exist and belong to the same Event
 * 3. Guest must have an assigned CardDesign
 * 4. CardDesign must belong to the SAME Event
 * 5. Event must be PUBLISHED (not DRAFT, CANCELLED, or FINISHED)
 * 6. CardDesign must be PUBLISHED (not DRAFT or ARCHIVED)
 * 
 * Never falls back to a default guest or entity.
 */
export function resolveInvitationByToken(token: string, db: MockDb): InvitationResolution {
  const trimmed = (token || '').trim();
  if (!trimmed) {
    return {
      success: false,
      reason: 'TOKEN_NOT_FOUND',
      message: 'Mã thư mời không hợp lệ hoặc để trống.',
    };
  }

  // 1. Look up invitation by deterministic token
  const invitation = db.invitations.find((i) => i.token === trimmed);
  if (!invitation) {
    return {
      success: false,
      reason: 'TOKEN_NOT_FOUND',
      message: 'Không tìm thấy lời mời với đường dẫn này. Vui lòng kiểm tra lại liên kết.',
    };
  }

  // 2. Validate invitation status
  if (invitation.status === 'REVOKED') {
    return {
      success: false,
      reason: 'INVITATION_REVOKED',
      message: 'Liên kết mời này đã bị thu hồi hoặc đã được cấp lại bằng liên kết mới.',
      invitation,
    };
  }

  if (invitation.status !== 'ACTIVE') {
    return {
      success: false,
      reason: 'INVITATION_REVOKED',
      message: 'Lời mời hiện chưa được kích hoạt.',
      invitation,
    };
  }

  // 3. Look up Event
  const event = db.events.find((e) => e.id === invitation.eventId);
  if (!event) {
    return {
      success: false,
      reason: 'EVENT_DRAFT',
      message: 'Sự kiện liên kết không tồn tại.',
      invitation,
    };
  }

  // 4. Look up Guest strictly scoped to event
  const guest = db.guests.find((g) => g.id === invitation.guestId && g.eventId === event.id);
  if (!guest) {
    return {
      success: false,
      reason: 'GUEST_NOT_FOUND',
      message: 'Không tìm thấy thông tin khách mời trong sự kiện này.',
      invitation,
      event,
    };
  }

  // 5. Check assigned card
  if (!guest.assignedCardDesignId) {
    return {
      success: false,
      reason: 'GUEST_UNASSIGNED',
      message: 'Khách mời chưa được gán mẫu thiệp để mở lời mời.',
      invitation,
      guest,
      event,
    };
  }

  // 6. Look up card design
  const card = db.cardDesigns.find((c) => c.id === guest.assignedCardDesignId);
  if (!card) {
    return {
      success: false,
      reason: 'CARD_NOT_FOUND',
      message: 'Mẫu thiệp được gán không tồn tại.',
      invitation,
      guest,
      event,
    };
  }

  // 7. Strictly verify card belongs to SAME event
  if (card.eventId !== event.id) {
    return {
      success: false,
      reason: 'CARD_CROSS_EVENT',
      message: 'Lỗi bảo mật: Mẫu thiệp được gán không thuộc sự kiện này.',
      invitation,
      guest,
      event,
      card,
    };
  }

  // 8. Event status checks
  if (event.status === 'DRAFT') {
    return {
      success: false,
      reason: 'EVENT_DRAFT',
      message: 'Sự kiện hiện đang ở trạng thái bản nháp. Vui lòng quay lại khi sự kiện được công bố.',
      invitation,
      guest,
      event,
      card,
    };
  }

  if (event.status === 'CANCELLED') {
    return {
      success: false,
      reason: 'EVENT_CANCELLED',
      message: 'Rất tiếc, sự kiện này đã được thông báo hủy tổ chức.',
      invitation,
      guest,
      event,
      card,
    };
  }

  if (event.status === 'FINISHED') {
    return {
      success: false,
      reason: 'EVENT_FINISHED',
      message: 'Sự kiện này đã kết thúc.',
      invitation,
      guest,
      event,
      card,
    };
  }

  // 9. Card status checks
  if (card.status === 'DRAFT') {
    return {
      success: false,
      reason: 'CARD_DRAFT',
      message: 'Mẫu thiệp này đang là bản thảo nội bộ và chưa được công bố.',
      invitation,
      guest,
      event,
      card,
    };
  }

  if (card.status === 'ARCHIVED') {
    return {
      success: false,
      reason: 'CARD_ARCHIVED',
      message: 'Mẫu thiệp này đã được lưu trữ và không còn hiệu lực.',
      invitation,
      guest,
      event,
      card,
    };
  }

  // 10. Check if deadline passed
  let isDeadlinePassed = false;
  if (event.rsvpDeadline) {
    try {
      const deadlineDate = new Date(event.rsvpDeadline);
      if (!isNaN(deadlineDate.getTime()) && new Date() > deadlineDate) {
        isDeadlinePassed = true;
      }
    } catch {}
  }

  // 11. Read optional existing RSVP and CheckIn
  const rsvp = db.rsvpResponses.find((r) => r.invitationId === invitation.id);
  const checkIn = db.checkIns.find((c) => c.invitationId === invitation.id);

  return {
    success: true,
    reason: 'VALID',
    message: 'Thư mời hợp lệ.',
    invitation,
    guest,
    event,
    card,
    rsvp,
    checkIn,
    isDeadlinePassed,
  };
}
