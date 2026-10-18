'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';

export function EventSwitcher({ currentEventId }: { currentEventId: string }) {
  const router = useRouter();
  const { db } = useMockStore();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__new__') {
      router.push('/dashboard/events/new');
    } else if (val && val !== currentEventId) {
      router.push(`/dashboard/events/${val}`);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <label htmlFor="event-switcher" className="sr-only">
        Chuyển sự kiện
      </label>
      <select
        id="event-switcher"
        value={currentEventId}
        onChange={handleSelectChange}
        className="select"
        style={{
          fontWeight: 600,
          borderColor: '#cbd5e1',
          maxWidth: '240px',
          textOverflow: 'ellipsis',
        }}
        aria-label="Chọn sự kiện đang làm việc"
      >
        <optgroup label="Sự kiện của bạn">
          {db.events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title} {ev.id === currentEventId ? '✓' : ''}
            </option>
          ))}
        </optgroup>
        <option value="__new__">+ Tạo sự kiện mới...</option>
      </select>
    </div>
  );
}
