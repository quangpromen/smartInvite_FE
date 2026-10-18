'use client';

import React, { useState } from 'react';
import type { RsvpResponse, CheckIn, AttendanceMode } from '@/features/invitations/types';
import type { EventGuest } from '@/features/guests/types';
import type { Event } from '@/features/events/types';
import { QrPass } from './QrPass';

interface RsvpFormProps {
  guest: EventGuest;
  event: Event;
  invitationId: string;
  token: string;
  existingRsvp?: RsvpResponse;
  checkIn?: CheckIn;
  isDeadlinePassed?: boolean;
  onSubmitRsvp: (input: { status: 'YES' | 'NO'; plusOnes: number; attendanceMode?: AttendanceMode }) => void;
}

export function RsvpForm({
  guest,
  event,
  invitationId,
  token: _token,
  existingRsvp,
  checkIn,
  isDeadlinePassed = false,
  onSubmitRsvp,
}: RsvpFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<'YES' | 'NO' | null>(
    existingRsvp ? existingRsvp.status : null
  );
  const [plusOnes, setPlusOnes] = useState<number>(existingRsvp?.plusOnes || 0);
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>(
    existingRsvp?.attendanceMode || 'BOTH'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);

  const maxPlusOnes = guest.plusOnesAllowed || 0;
  const isCheckedIn = !!checkIn;
  const isEventClosed = event.status === 'CANCELLED' || event.status === 'FINISHED';

  const handleSubmit = (statusToSubmit: 'YES' | 'NO') => {
    if (isDeadlinePassed || isEventClosed) return;
    if (isCheckedIn && statusToSubmit === 'NO') {
      alert('Bạn đã làm thủ tục check-in tại sự kiện, không thể đổi sang "Không tham gia".');
      return;
    }

    setIsSubmitting(true);
    try {
      onSubmitRsvp({
        status: statusToSubmit,
        plusOnes: statusToSubmit === 'YES' ? plusOnes : 0,
        attendanceMode: event.attendanceOptionsEnabled ? attendanceMode : undefined,
      });
      setSelectedStatus(statusToSubmit);
      setLocalFeedback(
        statusToSubmit === 'YES'
          ? 'Đã ghi nhận bạn sẽ tham gia! Cảm ơn bạn rất nhiều.'
          : 'Đã ghi nhận phản hồi. Thật tiếc khi không thể đón tiếp bạn lần này!'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rsvp-box">
      <h3>Xác nhận tham dự</h3>
      <p className="desc">
        {guest.personalization.greeting
          ? `${guest.personalization.greeting}, hãy cho mình biết bạn có thể đến chung vui không nhé!`
          : `Xin chào ${guest.fullName}, sự hiện diện của bạn là niềm vinh hạnh lớn cho ngày lễ.`}
      </p>

      {/* Deadline Notice */}
      {isDeadlinePassed && (
        <div
          className="demo-alert"
          style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b', marginBottom: '14px' }}
        >
          <span>
            <b>Hạn chót đã kết thúc:</b> Đã qua hạn xác nhận tham dự ({event.rsvpDeadline ? new Date(event.rsvpDeadline).toLocaleDateString('vi-VN') : ''}). Biểu mẫu phản hồi hiện đã đóng.
          </span>
        </div>
      )}

      {/* Event Closed Notice */}
      {isEventClosed && (
        <div
          className="demo-alert"
          style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b', marginBottom: '14px' }}
        >
          <span>
            <b>Sự kiện đã đóng:</b> Sự kiện hiện ở trạng thái {event.status === 'CANCELLED' ? 'Đã hủy' : 'Đã kết thúc'}.
          </span>
        </div>
      )}

      {/* Already Checked-in Warning */}
      {isCheckedIn && (
        <div
          className="demo-alert"
          style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af', marginBottom: '14px' }}
        >
          <span>
            <b>Đã điểm danh:</b> Bạn đã hoàn tất check-in tại sự kiện. Không thể đổi sang trạng thái từ chối.
          </span>
        </div>
      )}

      {/* RSVP YES STATE DISPLAY */}
      {selectedStatus === 'YES' && (
        <div style={{ display: 'grid', gap: '14px' }}>
          <div className="rsvp-result">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Bạn đã xác nhận tham gia!
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '12px' }}>
              Hẹn gặp bạn tại buổi lễ. Dưới đây là thẻ check-in và mã QR tham dự của bạn.
            </p>
          </div>

          {/* QR Pass Component */}
          <QrPass
            guestFullName={guest.fullName}
            eventTitle={event.title}
            invitationId={invitationId}
            plusOnes={plusOnes}
            attendanceMode={attendanceMode}
            checkIn={checkIn}
          />

          {/* Change Option if allowed */}
          {!isCheckedIn && !isDeadlinePassed && !isEventClosed && (
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button
                type="button"
                className="btn sm ghost"
                style={{ color: '#64748b', fontSize: '11px', textDecoration: 'underline' }}
                onClick={() => setSelectedStatus(null)}
              >
                Thay đổi lựa chọn tham dự
              </button>
            </div>
          )}
        </div>
      )}

      {/* RSVP NO STATE DISPLAY */}
      {selectedStatus === 'NO' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <div className="rsvp-result no">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Bạn đã chọn không thể tham gia.
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '12px' }}>
              Cảm ơn bạn đã phản hồi. Chúng mình rất tiếc khi không thể cùng chung vui lần này.
            </p>
          </div>

          {!isCheckedIn && !isDeadlinePassed && !isEventClosed && (
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <button
                type="button"
                className="btn sm"
                onClick={() => setSelectedStatus(null)}
              >
                Đổi thành &quot;Mình sẽ đến!&quot;
              </button>
            </div>
          )}
        </div>
      )}

      {/* FORM INPUTS (WHEN PENDING OR EDITING) */}
      {selectedStatus === null && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Plus-ones allowed option */}
          {maxPlusOnes > 0 && (
            <div className="form-block">
              <label htmlFor="plus-ones-select" style={{ fontSize: '12px', fontWeight: 600 }}>
                Bạn có đi cùng người thân không? (Tối đa +{maxPlusOnes} người)
              </label>
              <select
                id="plus-ones-select"
                className="select"
                value={plusOnes}
                onChange={(e) => setPlusOnes(Number(e.target.value))}
                disabled={isDeadlinePassed || isEventClosed}
              >
                <option value={0}>Đi một mình (0 người đi cùng)</option>
                {Array.from({ length: maxPlusOnes }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Đi cùng +{num} người (Tổng cộng {num + 1} người)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Attendance mode option */}
          {event.attendanceOptionsEnabled && (
            <div className="form-block">
              <label style={{ fontSize: '12px', fontWeight: 600 }}>Thời gian bạn sẽ tham gia:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  className={`btn sm ${attendanceMode === 'CEREMONY' ? 'dark' : ''}`}
                  onClick={() => setAttendanceMode('CEREMONY')}
                  disabled={isDeadlinePassed || isEventClosed}
                >
                  Dự lễ
                </button>
                <button
                  type="button"
                  className={`btn sm ${attendanceMode === 'PHOTOS' ? 'dark' : ''}`}
                  onClick={() => setAttendanceMode('PHOTOS')}
                  disabled={isDeadlinePassed || isEventClosed}
                >
                  Chụp ảnh
                </button>
                <button
                  type="button"
                  className={`btn sm ${attendanceMode === 'BOTH' ? 'dark' : ''}`}
                  onClick={() => setAttendanceMode('BOTH')}
                  disabled={isDeadlinePassed || isEventClosed}
                >
                  Cả hai
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn dark"
              style={{ flex: 1.2, padding: '12px 16px', fontSize: '13px' }}
              disabled={isSubmitting || isDeadlinePassed || isEventClosed}
              onClick={() => handleSubmit('YES')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Mình sẽ đến tham dự!
            </button>

            <button
              type="button"
              className="btn"
              style={{ flex: 1, padding: '12px 14px', fontSize: '13px' }}
              disabled={isSubmitting || isCheckedIn || isDeadlinePassed || isEventClosed}
              onClick={() => handleSubmit('NO')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Không thể đến
            </button>
          </div>
        </div>
      )}

      {/* Demo notice tag */}
      <div
        style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#94a3b8',
        }}
      >
        <span>
          {localFeedback ? (
            <span style={{ color: '#059669', fontWeight: 600 }}>{localFeedback} </span>
          ) : (
            'Phản hồi được lưu trong mock store đồng bộ thời gian thực.'
          )}
        </span>
        <span className="tag gray" style={{ fontSize: '10px' }}>
          Dữ liệu demo • Chưa lưu server
        </span>
      </div>
    </div>
  );
}
