'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { EventForm } from '@/components/events/EventForm';
import { EventBreadcrumb } from '@/components/layout/EventBreadcrumb';
import type { CreateEventInput } from '@/features/events/types';

export default function NewEventPage() {
  const router = useRouter();
  const { eventsRepo, currentUser, showToast } = useMockStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = (data: CreateEventInput) => {
    setIsSubmitting(true);
    try {
      const newEvent = eventsRepo.create(data, currentUser.id);
      showToast(`Đã tạo sự kiện "${newEvent.title}" (Bản demo)`, 'success');
      router.push(`/dashboard/events/${newEvent.id}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo sự kiện', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <EventBreadcrumb
          items={[
            { label: 'Sự kiện', href: '/dashboard/events' },
            { label: 'Tạo sự kiện mới' },
          ]}
        />
      </div>

      <div className="page-heading">
        <div>
          <span className="eyebrow">KHỞI TẠO</span>
          <h1>Tạo sự kiện mới</h1>
          <p>
            Nhập thông tin thời gian và địa điểm chuẩn xác. Thông tin này sẽ tự động áp dụng cho mọi mẫu thiệp thuộc sự kiện.
          </p>
        </div>
      </div>

      <EventForm
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        submitLabel="Tạo sự kiện & Đi đến không gian làm việc →"
        onCancel={() => router.push('/dashboard/events')}
      />
    </div>
  );
}
