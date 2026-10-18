/**
 * Date and time formatting helpers for SmartInvite
 */

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatEventStatus(status: string): { label: string; tagClass: string } {
  switch (status) {
    case 'PUBLISHED':
      return { label: 'Đã công bố', tagClass: 'tag' };
    case 'DRAFT':
      return { label: 'Bản nháp', tagClass: 'tag pending' };
    case 'FINISHED':
      return { label: 'Đã kết thúc', tagClass: 'tag gray' };
    case 'CANCELLED':
      return { label: 'Đã hủy', tagClass: 'tag no' };
    default:
      return { label: status, tagClass: 'tag gray' };
  }
}

export function formatCardStatus(status: string): { label: string; tagClass: string } {
  switch (status) {
    case 'PUBLISHED':
      return { label: 'Đã xuất bản', tagClass: 'tag' };
    case 'DRAFT':
      return { label: 'Bản nháp', tagClass: 'tag pending' };
    case 'ARCHIVED':
      return { label: 'Đã lưu trữ', tagClass: 'tag gray' };
    default:
      return { label: status, tagClass: 'tag gray' };
  }
}

export function formatRsvpStatus(status: string): { label: string; tagClass: string } {
  switch (status) {
    case 'YES':
      return { label: 'Đồng ý', tagClass: 'tag' };
    case 'NO':
      return { label: 'Từ chối', tagClass: 'tag no' };
    case 'PENDING':
      return { label: 'Chưa phản hồi', tagClass: 'tag pending' };
    default:
      return { label: status, tagClass: 'tag gray' };
  }
}

export function formatEventType(type: string): string {
  switch (type) {
    case 'GRADUATION':
      return 'Lễ tốt nghiệp';
    case 'BIRTHDAY':
      return 'Sinh nhật';
    case 'WEDDING':
      return 'Tiệc cưới';
    case 'WORKSHOP':
      return 'Hội thảo';
    case 'ANNIVERSARY':
      return 'Kỷ niệm';
    case 'OTHER':
    default:
      return 'Sự kiện';
  }
}

export function formatEventDateRange(startsAt: string, endsAt?: string | null): string {
  try {
    const start = new Date(startsAt);
    if (isNaN(start.getTime())) return startsAt;

    const startDateStr = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(start);

    const startTimeStr = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(start);

    if (!endsAt) {
      return `${startDateStr} lúc ${startTimeStr}`;
    }

    const end = new Date(endsAt);
    if (isNaN(end.getTime())) {
      return `${startDateStr} lúc ${startTimeStr}`;
    }

    const endDateStr = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(end);

    const endTimeStr = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(end);

    // If on same date
    if (startDateStr === endDateStr) {
      return `${startDateStr} • ${startTimeStr} - ${endTimeStr}`;
    }

    return `${startDateStr}, ${startTimeStr} - ${endDateStr}, ${endTimeStr}`;
  } catch {
    return startsAt;
  }
}
