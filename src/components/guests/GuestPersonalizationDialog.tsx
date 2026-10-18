'use client';

import React, { useState } from 'react';
import type { EventGuest, GuestPersonalization } from '@/features/guests/types';
import type { CardDesign } from '@/features/cards/types';
import type { Event } from '@/features/events/types';
import { InvitationCard } from '@/components/invitation/InvitationCard';

interface GuestPersonalizationDialogProps {
  guest: EventGuest;
  event: Event;
  assignedCard?: CardDesign;
  isOpen: boolean;
  onClose: () => void;
  onSave: (guestId: string, personalization: GuestPersonalization) => void;
}

const COMMON_SALUTATIONS = ['Bạn', 'Anh', 'Chị', 'Em', 'Thầy', 'Cô', 'Chú', 'Cô chú', 'Bác'];
const ACCENT_COLORS = ['#b18f61', '#7069d6', '#c48291', '#059669', '#2563eb', '#d97706'];

export function GuestPersonalizationDialog({
  guest,
  event,
  assignedCard,
  isOpen,
  onClose,
  onSave,
}: GuestPersonalizationDialogProps) {
  const [salutation, setSalutation] = useState(guest.personalization.salutation || '');
  const [greeting, setGreeting] = useState(guest.personalization.greeting || '');
  const [personalMessage, setPersonalMessage] = useState(guest.personalization.personalMessage || '');
  const [accentColor, setAccentColor] = useState(guest.personalization.accentColor || '#b18f61');
  const [previewMode, setPreviewMode] = useState<'PERSONAL' | 'BASE'>('PERSONAL');

  if (!isOpen) return null;

  const currentPersonalization: GuestPersonalization = {
    schemaVersion: 1,
    salutation: salutation.trim() || undefined,
    greeting: greeting.trim() || undefined,
    personalMessage: personalMessage.trim() || undefined,
    accentColor: accentColor || undefined,
  };

  const handleSave = () => {
    onSave(guest.id, currentPersonalization);
    onClose();
  };

  return (
    <div className="modal-layer" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="personalize-title">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '860px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 id="personalize-title" style={{ margin: 0 }}>Cá nhân hóa lời mời: {guest.fullName}</h3>
            <small style={{ color: '#64748b' }}>
              Tùy chỉnh xưng hô và thông điệp riêng cho khách mời này. Không ảnh hưởng đến các khách khác.
            </small>
          </div>
          <button type="button" className="round-btn" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: '24px' }}>
          {/* Form Settings */}
          <div style={{ display: 'grid', gap: '14px' }}>
            <div className="form-block">
              <label htmlFor="salutation-input">Cách xưng hô</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                {COMMON_SALUTATIONS.map((sal) => (
                  <button
                    key={sal}
                    type="button"
                    className={`btn sm ${salutation === sal ? 'dark' : ''}`}
                    onClick={() => {
                      setSalutation(sal);
                      if (!greeting) setGreeting(`Thân gửi ${sal} ${guest.fullName}`);
                    }}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    {sal}
                  </button>
                ))}
              </div>
              <input
                id="salutation-input"
                type="text"
                placeholder="Ví dụ: Bạn, Thầy, Anh..."
                value={salutation}
                onChange={(e) => setSalutation(e.target.value)}
                maxLength={30}
              />
            </div>

            <div className="form-block">
              <label htmlFor="greeting-input">Lời chào đầu thiệp</label>
              <input
                id="greeting-input"
                type="text"
                placeholder="Ví dụ: Thân gửi Bạn Minh An"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                maxLength={80}
              />
            </div>

            <div className="form-block">
              <label htmlFor="message-input">Lời nhắn gửi riêng (tùy chọn)</label>
              <textarea
                id="message-input"
                placeholder="Nhập lời nhắn nhủ dành riêng cho khách mời này..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                maxLength={250}
                rows={3}
              />
              <span style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
                {personalMessage.length}/250 ký tự
              </span>
            </div>

            <div className="form-block">
              <label>Màu nhấn cá nhân</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {ACCENT_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setAccentColor(col)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: col,
                      border: accentColor === col ? '3px solid #1e293b' : '1px solid #cbd5e1',
                      cursor: 'pointer',
                    }}
                    aria-label={`Chọn màu ${col}`}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '11.5px',
                color: '#64748b',
                lineHeight: 1.5,
              }}
            >
              🔒 <strong>Độc lập dữ liệu:</strong> Cá nhân hóa chỉ lưu trên bản ghi của khách <strong>{guest.fullName}</strong>. Mẫu thiệp gốc và thiệp của khách khác không bị thay đổi.
            </div>
          </div>

          {/* Live Preview Panel */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Xem trước thiệp mời
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  className={`btn sm ${previewMode === 'PERSONAL' ? 'dark' : ''}`}
                  onClick={() => setPreviewMode('PERSONAL')}
                  style={{ fontSize: '10px', padding: '4px 8px' }}
                >
                  Bản cá nhân hóa
                </button>
                <button
                  type="button"
                  className={`btn sm ${previewMode === 'BASE' ? 'dark' : ''}`}
                  onClick={() => setPreviewMode('BASE')}
                  style={{ fontSize: '10px', padding: '4px 8px' }}
                >
                  Bản gốc
                </button>
              </div>
            </div>

            {assignedCard ? (
              <div className="full-invite" style={{ transform: 'none', padding: '10px' }}>
                <InvitationCard
                  card={assignedCard}
                  event={event}
                  mode="HOST_PREVIEW"
                  guestPersonalization={previewMode === 'PERSONAL' ? currentPersonalization : undefined}
                  guestFullName={previewMode === 'PERSONAL' ? guest.fullName : undefined}
                />
              </div>
            ) : (
              <div
                className="panel"
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#64748b',
                  border: '1px dashed #cbd5e1',
                }}
              >
                <p style={{ margin: 0, fontSize: '13px' }}>
                  Khách chưa được gán mẫu thiệp nào.
                </p>
                <small style={{ color: '#94a3b8' }}>
                  Vui lòng gán mẫu thiệp trước để xem trước giao diện.
                </small>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
          <button type="button" className="btn sm" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn sm dark" onClick={handleSave}>
            Lưu cá nhân hóa (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
