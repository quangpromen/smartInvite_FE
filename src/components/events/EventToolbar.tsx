'use client';

import React, { useRef } from 'react';
import { SearchIcon, XIcon, FilterIcon, RotateCcwIcon } from '@/components/ui/Icons';

export interface EventToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  filteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
}

export function EventToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  filteredCount,
  totalCount,
  onResetFilters,
}: EventToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isFiltered = searchTerm.trim().length > 0 || statusFilter !== 'ALL';

  const handleClearSearch = () => {
    onSearchChange('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="event-toolbar">
      {/* Search and Filter Controls */}
      <div className="event-toolbar-controls">
        {/* Search Field */}
        <div className="event-search-wrapper">
          <label htmlFor="event-search-input" className="sr-only">
            Tìm kiếm theo tên sự kiện hoặc địa điểm
          </label>
          <div className="event-search-input-box">
            <span className="event-search-icon" aria-hidden="true">
              <SearchIcon size={16} />
            </span>
            <input
              id="event-search-input"
              ref={searchInputRef}
              type="text"
              className="event-search-input"
              placeholder="Tìm theo tên hoặc địa điểm…"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Tìm kiếm theo tên sự kiện hoặc địa điểm"
              autoComplete="off"
            />
            {searchTerm && (
              <button
                type="button"
                className="event-search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Xóa nội dung tìm kiếm"
                title="Xóa tìm kiếm"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Dropdown */}
        <div className="event-filter-wrapper">
          <label htmlFor="event-status-filter" className="sr-only">
            Lọc theo trạng thái sự kiện
          </label>
          <div className="event-filter-select-box">
            <span className="event-filter-icon" aria-hidden="true">
              <FilterIcon size={14} />
            </span>
            <select
              id="event-status-filter"
              className="event-filter-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              aria-label="Lọc theo trạng thái sự kiện"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã công bố</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="FINISHED">Đã kết thúc</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Reset Filters Button (appears when filters are active) */}
        {isFiltered && (
          <button
            type="button"
            className="event-reset-btn"
            onClick={onResetFilters}
            aria-label="Đặt lại tất cả bộ lọc"
            title="Đặt lại bộ lọc về mặc định"
          >
            <RotateCcwIcon size={14} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* Results Count Badge */}
      <div className="event-results-count" aria-live="polite">
        <span className="count-label">Hiển thị</span>
        <span className="count-badge">
          <strong>{filteredCount}</strong> / {totalCount}
        </span>
        <span className="count-suffix">sự kiện</span>
      </div>
    </div>
  );
}
