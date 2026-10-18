'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { GuestTable } from '@/components/guests/GuestTable';
import { GuestFilters } from '@/components/guests/GuestFilters';
import { GuestPersonalizationDialog } from '@/components/guests/GuestPersonalizationDialog';
import { CardAssignmentSelector } from '@/components/guests/CardAssignmentSelector';
import type { EventGuest, GuestPersonalization } from '@/features/guests/types';

export default function EventGuestsManagementPage() {
  const params = useParams();
  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';

  const { db, guestsRepo, showToast } = useMockStore();

  // 1. Look up event
  const event = useMemo(() => {
    return db.events.find((e) => e.id === eventId);
  }, [db.events, eventId]);

  // 2. Look up cards belonging ONLY to current event
  const eventCards = useMemo(() => {
    return db.cardDesigns.filter((c) => c.eventId === eventId);
  }, [db.cardDesigns, eventId]);

  // 3. Look up guests belonging strictly to current event
  const eventGuests = useMemo(() => {
    return db.guests.filter((g) => g.eventId === eventId);
  }, [db.guests, eventId]);

  // Extract available unique groups
  const availableGroups = useMemo(() => {
    const set = new Set<string>();
    for (const g of eventGuests) {
      if (g.groupName) set.add(g.groupName);
    }
    return Array.from(set);
  }, [eventGuests]);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedCardId, setSelectedCardId] = useState('ALL');
  const [selectedRsvp, setSelectedRsvp] = useState('ALL');
  const [selectedCheckIn, setSelectedCheckIn] = useState('ALL');

  // Modals state
  const [personalizingGuest, setPersonalizingGuest] = useState<EventGuest | null>(null);
  const [reassigningGuest, setReassigningGuest] = useState<EventGuest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New guest form state
  const defaultCard = eventCards.find((c) => c.isDefault) || eventCards[0];
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newCardId, setNewCardId] = useState<string>(defaultCard?.id || '');
  const [newPlusOnes, setNewPlusOnes] = useState(0);
  const [newSalutation, setNewSalutation] = useState('Bạn');

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return eventGuests.filter((g) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = g.fullName.toLowerCase().includes(query);
        const matchesGroup = (g.groupName || '').toLowerCase().includes(query);
        if (!matchesName && !matchesGroup) return false;
      }

      // Group
      if (selectedGroup !== 'ALL' && g.groupName !== selectedGroup) {
        return false;
      }

      // Card
      if (selectedCardId === 'UNASSIGNED' && g.assignedCardDesignId !== null) {
        return false;
      }
      if (selectedCardId !== 'ALL' && selectedCardId !== 'UNASSIGNED') {
        if (g.assignedCardDesignId !== selectedCardId) return false;
      }

      // RSVP
      if (selectedRsvp !== 'ALL') {
        const inv = db.invitations.find((i) => i.guestId === g.id && i.eventId === eventId);
        const rsvp = inv ? db.rsvpResponses.find((r) => r.invitationId === inv.id) : undefined;
        const currentRsvp = rsvp ? rsvp.status : 'PENDING';
        if (currentRsvp !== selectedRsvp) return false;
      }

      // Check-in
      if (selectedCheckIn !== 'ALL') {
        const inv = db.invitations.find((i) => i.guestId === g.id && i.eventId === eventId);
        const isCheckedIn = inv
          ? db.checkIns.some((c) => c.invitationId === inv.id)
          : false;
        if (selectedCheckIn === 'ARRIVED' && !isCheckedIn) return false;
        if (selectedCheckIn === 'NOT_ARRIVED' && isCheckedIn) return false;
      }

      return true;
    });
  }, [
    eventGuests,
    search,
    selectedGroup,
    selectedCardId,
    selectedRsvp,
    selectedCheckIn,
    db.invitations,
    db.rsvpResponses,
    db.checkIns,
    eventId,
  ]);

  if (!event) return null;

  // Actions
  const handleCopyLink = async (token: string, guestName: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      showToast(`Đã sao chép link mời cho ${guestName}: /invite/${token}`, 'success');
    } catch {
      showToast(`Link mời: ${inviteUrl}`, 'info');
    }
  };

  const handleSavePersonalization = (guestId: string, personalization: GuestPersonalization) => {
    try {
      guestsRepo.update(guestId, { personalization }, event.id);
      showToast('Đã lưu cá nhân hóa cho khách mời (Demo)', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu cá nhân hóa';
      showToast(msg, 'error');
    }
  };

  const handleAssignCard = (cardId: string | null) => {
    if (!reassigningGuest) return;
    try {
      guestsRepo.assignCard(reassigningGuest.id, cardId, event.id);
      showToast(`Đã cập nhật mẫu thiệp cho ${reassigningGuest.fullName} (Demo)`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi gán mẫu thiệp';
      showToast(msg, 'error');
    }
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      guestsRepo.create({
        eventId: event.id,
        fullName: newName.trim(),
        groupName: newGroup.trim() || undefined,
        assignedCardDesignId: newCardId || null,
        plusOnesAllowed: newPlusOnes,
        personalization: {
          schemaVersion: 1,
          salutation: newSalutation.trim() || undefined,
        },
      });

      showToast(`Đã thêm khách mời ${newName} vào sự kiện (Demo)`, 'success');
      setIsAddModalOpen(false);
      setNewName('');
      setNewGroup('');
      setNewPlusOnes(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi thêm khách mời';
      showToast(msg, 'error');
    }
  };

  return (
    <div>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--navy)' }}>
            Quản lý khách mời ({eventGuests.length})
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Phân nhóm khách, gán mẫu thiệp tương ứng và tùy chỉnh thông điệp cá nhân hóa.
          </p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn sm dark"
            onClick={() => setIsAddModalOpen(true)}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Thêm khách mời mới
          </button>
        </div>
      </div>

      {/* Main Panel with Filters and Table */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <GuestFilters
          search={search}
          onSearchChange={setSearch}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          availableGroups={availableGroups}
          selectedCardId={selectedCardId}
          onCardChange={setSelectedCardId}
          availableCards={eventCards}
          selectedRsvp={selectedRsvp}
          onRsvpChange={setSelectedRsvp}
          selectedCheckIn={selectedCheckIn}
          onCheckInChange={setSelectedCheckIn}
        />

        <GuestTable
          guests={filteredGuests}
          event={event}
          cards={eventCards}
          invitations={db.invitations}
          rsvpResponses={db.rsvpResponses}
          checkIns={db.checkIns}
          onOpenPersonalize={(g) => setPersonalizingGuest(g)}
          onOpenReassign={(g) => setReassigningGuest(g)}
          onCopyLink={handleCopyLink}
        />
      </div>

      {/* Personalization Dialog */}
      {personalizingGuest && (
        <GuestPersonalizationDialog
          guest={personalizingGuest}
          event={event}
          assignedCard={eventCards.find((c) => c.id === personalizingGuest.assignedCardDesignId)}
          isOpen={!!personalizingGuest}
          onClose={() => setPersonalizingGuest(null)}
          onSave={handleSavePersonalization}
        />
      )}

      {/* Card Assignment Selector */}
      {reassigningGuest && (
        <CardAssignmentSelector
          currentCardId={reassigningGuest.assignedCardDesignId}
          availableCards={eventCards}
          guestName={reassigningGuest.fullName}
          isOpen={!!reassigningGuest}
          onClose={() => setReassigningGuest(null)}
          onAssign={handleAssignCard}
        />
      )}

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <div
          className="modal-layer"
          onClick={() => setIsAddModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Thêm khách mời mới</h3>
            <p>Khách mời sẽ được thêm vào sự kiện hiện tại: <strong>{event.title}</strong>.</p>

            <form onSubmit={handleAddGuest} style={{ display: 'grid', gap: '14px' }}>
              <div className="form-block">
                <label htmlFor="guest-name">Họ và tên khách mời *</label>
                <input
                  id="guest-name"
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Minh Trí"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={80}
                  autoFocus
                />
              </div>

              <div className="form-block">
                <label htmlFor="guest-group">Nhóm khách mời</label>
                <input
                  id="guest-group"
                  type="text"
                  placeholder="Ví dụ: Bạn đại học, Gia đình, Bạn cấp 3..."
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="form-block">
                <label htmlFor="guest-salutation">Cách xưng hô mặc định</label>
                <input
                  id="guest-salutation"
                  type="text"
                  placeholder="Ví dụ: Bạn, Anh, Chị, Thầy..."
                  value={newSalutation}
                  onChange={(e) => setNewSalutation(e.target.value)}
                  maxLength={20}
                />
              </div>

              <div className="form-block">
                <label htmlFor="guest-card">Mẫu thiệp gán ban đầu</label>
                <select
                  id="guest-card"
                  className="select"
                  value={newCardId}
                  onChange={(e) => setNewCardId(e.target.value)}
                >
                  <option value="">Chưa gán mẫu thiệp</option>
                  {eventCards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} {c.isDefault ? '(Mặc định)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-block">
                <label htmlFor="guest-plus-ones">Số người đi kèm tối đa (+người)</label>
                <input
                  id="guest-plus-ones"
                  type="number"
                  min={0}
                  max={5}
                  value={newPlusOnes}
                  onChange={(e) => setNewPlusOnes(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn sm dark">
                  Thêm vào danh sách (Demo)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
