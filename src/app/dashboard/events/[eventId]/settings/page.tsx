'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { EventForm } from '@/components/events/EventForm';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import type { CreateEventInput, EventStatus } from '@/features/events/types';

export default function EventSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { db, eventsRepo, showToast } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const event = db.events.find((e) => e.id === eventId);

  const [pendingData, setPendingData] = useState<(CreateEventInput & { status?: EventStatus }) | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) return null; // Handled by layout

  const guestCount = db.guests.filter((g) => g.eventId === event.id).length;
  const hasGuestsOrResponses = guestCount > 0;

  const handleFormSubmit = (data: CreateEventInput & { status?: EventStatus }) => {
    // Check if time or location changed and event already has guests/responses
    const timeChanged = data.startsAt !== event.startsAt || data.endsAt !== event.endsAt;
    const locationChanged =
      data.locationName !== event.locationName || data.locationAddress !== event.locationAddress;

    if (hasGuestsOrResponses && (timeChanged || locationChanged)) {
      setPendingData(data);
      setShowConfirmDialog(true);
    } else {
      executeSave(data);
    }
  };

  const executeSave = (data: CreateEventInput & { status?: EventStatus }) => {
    setIsSubmitting(true);
    try {
      eventsRepo.update(event.id, data);
      showToast(`Đã lưu cập nhật thông tin sự kiện "${data.title}" (Bản demo)`, 'success');
      setShowConfirmDialog(false);
      setPendingData(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi cập nhật sự kiện', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmUpdate = () => {
    if (pendingData) {
      executeSave(pendingData);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmDialog(false);
    setPendingData(null);
    showToast('Đã hủy thao tác cập nhật', 'info');
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      <div className="page-heading">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--navy)' }}>
            Cài đặt & Thông tin sự kiện
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Thông tin tại đây là nguồn chân lý duy nhất (canonical) cho mọi mẫu thiệp thuộc sự kiện này.
          </p>
        </div>
      </div>

      <EventForm
        initialData={event}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Lưu thay đổi sự kiện"
        onCancel={() => router.push(`/dashboard/events/${event.id}`)}
      />

      {/* Confirmation Dialog for Canonical Changes */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        title="Xác nhận cập nhật thông tin thời gian / địa điểm"
        description={`Sự kiện hiện đang có ${guestCount} khách mời. Thay đổi thời gian hoặc địa điểm này sẽ tự động cập nhật đến tất cả các mẫu thiệp trong sự kiện. Bạn có chắc chắn muốn tiếp tục?`}
        confirmText="Đồng ý cập nhật tất cả thiệp"
        cancelText="Hủy bỏ"
        variant="primary"
        onConfirm={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
      />
    </div>
  );
}
