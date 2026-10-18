'use client';

import React, { useState } from 'react';
import type { Event, EventType, EventStatus, CreateEventInput } from '@/features/events/types';

interface EventFormProps {
  initialData?: Event;
  onSubmit: (data: CreateEventInput & { status?: EventStatus }) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export function EventForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Lưu sự kiện',
  onCancel,
}: EventFormProps) {
  // Convert ISO to input datetime-local format (YYYY-MM-DDTHH:mm)
  const toLocalInput = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      // local datetime offset
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  const [title, setTitle] = useState(initialData?.title || '');
  const [eventType, setEventType] = useState<EventType>(initialData?.eventType || 'GRADUATION');
  const [description, setDescription] = useState(initialData?.description || '');
  const [startsAt, setStartsAt] = useState(
    toLocalInput(initialData?.startsAt) || '2026-11-20T08:00'
  );
  const [endsAt, setEndsAt] = useState(toLocalInput(initialData?.endsAt) || '2026-11-20T11:30');
  const [timezone, setTimezone] = useState(initialData?.timezone || 'Asia/Ho_Chi_Minh');
  const [locationName, setLocationName] = useState(initialData?.locationName || '');
  const [locationAddress, setLocationAddress] = useState(initialData?.locationAddress || '');
  const [mapUrl, setMapUrl] = useState(initialData?.mapUrl || '');
  const [rsvpDeadline, setRsvpDeadline] = useState(
    toLocalInput(initialData?.rsvpDeadline) || '2026-11-15T23:59'
  );
  const [status, setStatus] = useState<EventStatus>(initialData?.status || 'DRAFT');
  const [attendanceOptionsEnabled, setAttendanceOptionsEnabled] = useState(
    initialData?.attendanceOptionsEnabled ?? true
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      errs.title = 'Vui lòng nhập tên sự kiện';
    } else if (trimmedTitle.length < 3 || trimmedTitle.length > 150) {
      errs.title = 'Tên sự kiện phải từ 3 đến 150 ký tự';
    }

    if (!startsAt) {
      errs.startsAt = 'Vui lòng chọn thời gian bắt đầu';
    }

    if (!locationName.trim()) {
      errs.locationName = 'Vui lòng nhập tên địa điểm tổ chức';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert local datetime input string back to ISO string
    const toIso = (localStr: string) => {
      if (!localStr) return undefined;
      const d = new Date(localStr);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    };

    onSubmit({
      title: title.trim(),
      eventType,
      description: description.trim(),
      startsAt: toIso(startsAt) || new Date().toISOString(),
      endsAt: endsAt ? toIso(endsAt) : null,
      timezone,
      locationName: locationName.trim(),
      locationAddress: locationAddress.trim(),
      mapUrl: mapUrl.trim(),
      rsvpDeadline: rsvpDeadline ? toIso(rsvpDeadline) : null,
      attendanceOptionsEnabled,
      status: initialData ? status : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="panel form-panel" noValidate>
      <div className="form-block">
        <label htmlFor="event-title">
          Tên sự kiện <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Lễ Tốt Nghiệp — Graduation Day 2026"
          maxLength={150}
          aria-describedby={errors.title ? 'title-error' : undefined}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <div id="title-error" className="input-error" role="alert">
            {errors.title}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="form-block">
          <label htmlFor="event-type">Loại sự kiện</label>
          <select
            id="event-type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            className="select"
          >
            <option value="GRADUATION">Lễ tốt nghiệp (Graduation)</option>
            <option value="WEDDING">Đám cưới (Wedding)</option>
            <option value="BIRTHDAY">Sinh nhật (Birthday)</option>
            <option value="WORKSHOP">Hội thảo / Workshop</option>
            <option value="ANNIVERSARY">Lễ kỷ niệm</option>
            <option value="OTHER">Sự kiện khác</option>
          </select>
        </div>

        {initialData && (
          <div className="form-block">
            <label htmlFor="event-status">Trạng thái sự kiện</label>
            <select
              id="event-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as EventStatus)}
              className="select"
            >
              <option value="DRAFT">Bản nháp (DRAFT)</option>
              <option value="PUBLISHED">Đã công bố (PUBLISHED)</option>
              <option value="FINISHED">Đã kết thúc (FINISHED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
          </div>
        )}
      </div>

      <div className="form-block">
        <label htmlFor="event-desc">Mô tả hoặc thông điệp ngắn</label>
        <textarea
          id="event-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập thông tin giới thiệu về sự kiện..."
          rows={3}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="form-block">
          <label htmlFor="event-starts">
            Thời gian bắt đầu <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            id="event-starts"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            aria-describedby={errors.startsAt ? 'starts-error' : undefined}
            aria-invalid={!!errors.startsAt}
          />
          {errors.startsAt && (
            <div id="starts-error" className="input-error" role="alert">
              {errors.startsAt}
            </div>
          )}
        </div>

        <div className="form-block">
          <label htmlFor="event-ends">Thời gian kết thúc (tùy chọn)</label>
          <input
            id="event-ends"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>

        <div className="form-block">
          <label htmlFor="event-deadline">Hạn chót phản hồi RSVP</label>
          <input
            id="event-deadline"
            type="datetime-local"
            value={rsvpDeadline}
            onChange={(e) => setRsvpDeadline(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="form-block" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="event-location-name">
            Tên địa điểm tổ chức <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            id="event-location-name"
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Ví dụ: Hội trường Lớn A5 • ĐH Bách Khoa TP.HCM"
            aria-describedby={errors.locationName ? 'location-error' : undefined}
            aria-invalid={!!errors.locationName}
          />
          {errors.locationName && (
            <div id="location-error" className="input-error" role="alert">
              {errors.locationName}
            </div>
          )}
        </div>

        <div className="form-block" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="event-address">Địa chỉ chi tiết</label>
          <input
            id="event-address"
            type="text"
            value={locationAddress}
            onChange={(e) => setLocationAddress(e.target.value)}
            placeholder="Ví dụ: 268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh"
          />
        </div>

        <div className="form-block" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="event-map">Link bản đồ Google Maps (tùy chọn)</label>
          <input
            id="event-map"
            type="url"
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
        <input
          id="event-attendance"
          type="checkbox"
          checked={attendanceOptionsEnabled}
          onChange={(e) => setAttendanceOptionsEnabled(e.target.checked)}
          style={{ width: '18px', height: '18px' }}
        />
        <label htmlFor="event-attendance" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
          Bật tùy chọn tham dự phân đoạn (Ví dụ: Chỉ dự Lễ tốt nghiệp / Chỉ dự Chụp ảnh / Cả hai)
        </label>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn">
            Hủy bỏ
          </button>
        )}
        <button type="submit" disabled={isSubmitting} className="btn dark">
          {isSubmitting ? 'Đang lưu...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
