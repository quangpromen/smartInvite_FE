'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMockStore } from '@/mocks/mock-store';
import { EventCard } from '@/components/events/EventCard';
import { EventToolbar } from '@/components/events/EventToolbar';
import { EventListSkeleton } from '@/components/events/EventCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { EventBreadcrumb } from '@/components/layout/EventBreadcrumb';
import { PlusIcon, SearchIcon, EmptyBoxIcon } from '@/components/ui/Icons';

export default function EventsIndexPage() {
  const { db } = useMockStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return db.events.filter((ev) => {
      const matchSearch =
        !term ||
        ev.title.toLowerCase().includes(term) ||
        ev.locationName.toLowerCase().includes(term) ||
        (ev.locationAddress && ev.locationAddress.toLowerCase().includes(term));
      const matchStatus = statusFilter === 'ALL' || ev.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [db.events, searchTerm, statusFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  const hasActiveFilter = searchTerm.trim().length > 0 || statusFilter !== 'ALL';

  return (
    <div className="events-page-container">
      {/* Breadcrumb Navigation */}
      <div className="events-breadcrumb-wrapper">
        <EventBreadcrumb items={[{ label: 'Sự kiện' }]} />
      </div>

      {/* Page Heading & Header Actions */}
      <header className="page-heading events-page-header">
        <div className="events-header-text">
          <span className="eyebrow">QUẢN LÝ SỰ KIỆN</span>
          <h1>Danh sách sự kiện</h1>
          <p>
            Quản lý và tổ chức các sự kiện của bạn. Mỗi sự kiện sở hữu danh sách khách mời và nhiều mẫu thiệp riêng biệt.
          </p>
        </div>
        <div className="actions events-header-actions">
          <Link
            href="/dashboard/events/new"
            className="btn dark event-create-btn"
            aria-label="Tạo sự kiện mới"
          >
            <PlusIcon size={16} />
            <span>Tạo sự kiện mới</span>
          </Link>
        </div>
      </header>

      {/* Screen reader live region for filter updates */}
      <div role="status" aria-live="polite" className="sr-only">
        Hiển thị {filteredEvents.length} trên tổng số {db.events.length} sự kiện
      </div>

      {/* Search and Filtering Toolbar */}
      <EventToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        filteredCount={filteredEvents.length}
        totalCount={db.events.length}
        onResetFilters={handleResetFilters}
      />

      {/* Events List or Empty States */}
      <main id="events-list-section" aria-label="Danh sách sự kiện đã lọc">
        {filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : db.events.length === 0 ? (
          /* Empty state: No events created yet */
          <EmptyState
            icon={<EmptyBoxIcon size={32} />}
            title="Bạn chưa có sự kiện nào"
            description="Hãy bắt đầu bằng cách tạo sự kiện đầu tiên của bạn để thiết kế thiệp và quản lý khách mời."
            actionText="Tạo sự kiện đầu tiên"
            actionHref="/dashboard/events/new"
          />
        ) : (
          /* Empty state: No results match search/filter */
          <EmptyState
            icon={<SearchIcon size={30} />}
            title="Không tìm thấy sự kiện phù hợp"
            description={
              searchTerm.trim()
                ? `Không có sự kiện nào khớp với từ khóa "${searchTerm}" hoặc bộ lọc trạng thái đã chọn.`
                : 'Không có sự kiện nào thuộc trạng thái này.'
            }
            actionText="Xóa bộ lọc tìm kiếm"
            onActionClick={handleResetFilters}
          />
        )}
      </main>
    </div>
  );
}
