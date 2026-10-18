'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { CardGallery } from '@/components/cards/CardGallery';

export default function EventCardsPage() {
  const params = useParams();
  const { db } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const event = db.events.find((e) => e.id === eventId);
  if (!event) return null; // Handled by workspace layout

  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">BỘ SƯU TẬP THIỆP MỜI</span>
          <h1>Mẫu thiệp của sự kiện</h1>
          <p>
            Mỗi mẫu thiệp phục vụ một nhóm đối tượng cụ thể (Gia đình, Bạn bè, Thầy cô). Tất cả cùng đọc dữ liệu thời gian và địa điểm từ sự kiện này.
          </p>
        </div>
      </div>

      <CardGallery eventId={event.id} />
    </div>
  );
}
