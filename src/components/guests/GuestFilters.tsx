'use client';

import React from 'react';
import type { CardDesign } from '@/features/cards/types';

interface GuestFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedGroup: string;
  onGroupChange: (val: string) => void;
  availableGroups: string[];
  selectedCardId: string;
  onCardChange: (val: string) => void;
  availableCards: CardDesign[];
  selectedRsvp: string;
  onRsvpChange: (val: string) => void;
  selectedCheckIn: string;
  onCheckInChange: (val: string) => void;
}

export function GuestFilters({
  search,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  availableGroups,
  selectedCardId,
  onCardChange,
  availableCards,
  selectedRsvp,
  onRsvpChange,
  selectedCheckIn,
  onCheckInChange,
}: GuestFiltersProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center',
        padding: '16px 20px',
        background: '#ffffff',
        borderBottom: '1px solid #eef2f6',
      }}
    >
      {/* Search Input */}
      <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
        <label className="search" style={{ width: '100%' }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Tìm theo tên hoặc nhóm..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: '100%' }}
            aria-label="Tìm kiếm khách mời"
          />
        </label>
      </div>

      {/* Group Filter */}
      <select
        className="select"
        value={selectedGroup}
        onChange={(e) => onGroupChange(e.target.value)}
        aria-label="Lọc theo nhóm"
        style={{ width: 'auto', minWidth: '130px' }}
      >
        <option value="ALL">Tất cả nhóm</option>
        {availableGroups.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>

      {/* Card Design Filter */}
      <select
        className="select"
        value={selectedCardId}
        onChange={(e) => onCardChange(e.target.value)}
        aria-label="Lọc theo mẫu thiệp"
        style={{ width: 'auto', minWidth: '140px' }}
      >
        <option value="ALL">Tất cả mẫu thiệp</option>
        <option value="UNASSIGNED">Chưa gán thiệp</option>
        {availableCards.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title} {c.isDefault ? '(Mặc định)' : ''}
          </option>
        ))}
      </select>

      {/* RSVP Filter */}
      <select
        className="select"
        value={selectedRsvp}
        onChange={(e) => onRsvpChange(e.target.value)}
        aria-label="Lọc theo phản hồi"
        style={{ width: 'auto', minWidth: '130px' }}
      >
        <option value="ALL">Tất cả RSVP</option>
        <option value="YES">Đồng ý tham gia</option>
        <option value="NO">Từ chối tham gia</option>
        <option value="PENDING">Chưa phản hồi</option>
      </select>

      {/* Check-in Filter */}
      <select
        className="select"
        value={selectedCheckIn}
        onChange={(e) => onCheckInChange(e.target.value)}
        aria-label="Lọc theo check-in"
        style={{ width: 'auto', minWidth: '130px' }}
      >
        <option value="ALL">Tất cả check-in</option>
        <option value="ARRIVED">Đã check-in</option>
        <option value="NOT_ARRIVED">Chưa check-in</option>
      </select>
    </div>
  );
}
