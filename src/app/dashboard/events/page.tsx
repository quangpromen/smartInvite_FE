'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMockStore } from '@/mocks/mock-store';
import { EventCard } from '@/components/events/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventBreadcrumb } from '@/components/layout/EventBreadcrumb';

export default function EventsIndexPage() {
  const { db } = useMockStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredEvents = useMemo(() => {
    return db.events.filter((ev) => {
      const matchSearch =
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.locationName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || ev.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [db.events, searchTerm, statusFilter]);

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <EventBreadcrumb items={[{ label: 'Sự kiện' }]} />
      </div>

      <div className="page-heading">
        <div>
          <span className="eyebrow">QUẢN LÝ SỰ KIỆN</span>
          <h1>Danh sách sự kiện</h1>
          <p>Mỗi sự kiện có thể chứa nhiều mẫu thiệp và danh sách khách mời riêng biệt.</p>
        </div>
        <div className="actions">
          <Link href="/dashboard/events/new" className="btn dark">
            <span>➕</span>
            <span>Tạo sự kiện mới</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '260px', alignItems: 'center' }}>
          <div className="search" style={{ flex: 1, maxWidth: '360px' }}>
            <span>🔍</span>
            <input
              type="search"
              placeholder="Tìm theo tên sự kiện hoặc địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Tìm kiếm sự kiện"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="filter-status" className="sr-only">
              Lọc theo trạng thái
            </label>
            <select
              id="filter-status"
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã công bố</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="FINISHED">Đã kết thúc</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '13px', color: '#64748b' }}>
          Hiển thị <strong>{filteredEvents.length}</strong> / {db.events.length} sự kiện
        </div>
      </div>

      {/* Events List or Empty State */}
      {filteredEvents.length > 0 ? (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📅"
          title={searchTerm || statusFilter !== 'ALL' ? 'Không tìm thấy sự kiện phù hợp' : 'Bạn chưa có sự kiện nào'}
          description={
            searchTerm || statusFilter !== 'ALL'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc trạng thái để xem lại toàn bộ sự kiện.'
              : 'Hãy bắt đầu bằng cách tạo sự kiện đầu tiên của bạn để thiết kế thiệp và quản lý khách mời.'
          }
          actionText={searchTerm || statusFilter !== 'ALL' ? 'Xóa bộ lọc tìm kiếm' : 'Tạo sự kiện đầu tiên'}
          onActionClick={
            searchTerm || statusFilter !== 'ALL'
              ? () => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }
              : undefined
          }
          actionHref={searchTerm || statusFilter !== 'ALL' ? undefined : '/dashboard/events/new'}
        />
      )}
    </div>
  );
}
