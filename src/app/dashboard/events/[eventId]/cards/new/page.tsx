'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import type { CardThemeKey } from '@/features/cards/types';

export default function NewCardInEventPage() {
  const params = useParams();
  const router = useRouter();
  const { db, cardsRepo, showToast } = useMockStore();

  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';
  const event = db.events.find((e) => e.id === eventId);

  const existingCards = db.cardDesigns.filter((c) => c.eventId === eventId);
  const isFirstCard = existingCards.length === 0;

  const [title, setTitle] = useState('');
  const [audienceLabel, setAudienceLabel] = useState('');
  const [templateKey, setTemplateKey] = useState<CardThemeKey>('classic');
  const [isDefault, setIsDefault] = useState(isFirstCard);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!event) return null; // Handled by workspace layout

  const templates: { key: CardThemeKey; name: string; desc: string; previewBg: string; textColor: string }[] = [
    {
      key: 'classic',
      name: 'Classic Ivory',
      desc: 'Nền kem nhạt, điểm xuyết hoa văn vàng gold thanh lịch. Phù hợp cho lễ tốt nghiệp & sự kiện trang trọng.',
      previewBg: 'linear-gradient(135deg, #fbf5eb, #f3e5d0)',
      textColor: '#293b51',
    },
    {
      key: 'rose',
      name: 'Rose Romance',
      desc: 'Tông hồng pastel ấm áp, trẻ trung và nhiều cảm xúc. Lý tưởng cho bạn bè thân thiết.',
      previewBg: 'linear-gradient(135deg, #fff1ef, #fed7aa)',
      textColor: '#744858',
    },
    {
      key: 'night',
      name: 'Midnight Gold',
      desc: 'Nền xanh than sang trọng phối chữ vàng ánh kim. Tôn vinh vẻ trang trọng, tri ân thầy cô.',
      previewBg: 'linear-gradient(135deg, #1e293b, #0f172a)',
      textColor: '#ffffff',
    },
    {
      key: 'modern',
      name: 'Modern Clean',
      desc: 'Phong cách tối giản, đường nét dứt khoát, hiện đại. Thích hợp cho workshop và gặp mặt.',
      previewBg: 'linear-gradient(135deg, #0f172a, #0284c7)',
      textColor: '#ffffff',
    },
  ];

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Vui lòng nhập tên mẫu thiệp (Ví dụ: Thiệp Bạn Bè, Thiệp Gia Đình)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = () => {
    try {
      const created = cardsRepo.create({
        eventId: event.id,
        title: title.trim(),
        audienceLabel: audienceLabel.trim() || undefined,
        templateKey,
        isDefault,
      });

      showToast(`Đã tạo mẫu thiệp "${created.title}" cho sự kiện (Bản demo)`, 'success');
      router.push(`/dashboard/events/${event.id}/cards`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi tạo mẫu thiệp', 'error');
      setShowConfirmModal(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Immutable Event Association Banner */}
      <div
        className="demo-alert"
        style={{
          background: '#e0f2fe',
          borderColor: '#bae6fd',
          color: '#0369a1',
          marginBottom: '20px',
        }}
      >
        <span style={{ fontSize: '18px' }}>🔗</span>
        <div>
          <strong style={{ display: 'block', fontSize: '13px' }}>
            Thiệp này thuộc sự kiện: {event.title}
          </strong>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>
            Quan hệ giữa mẫu thiệp và sự kiện là bất biến. Mọi thông tin ngày giờ và địa điểm sẽ tự động gắn kết với sự kiện này.
          </span>
        </div>
      </div>

      <div className="page-heading">
        <div>
          <span className="eyebrow">THIẾT LẬP MẪU THIỆP MỚI</span>
          <h1>Tạo mẫu thiệp cho sự kiện</h1>
          <p>Chọn mẫu thiết kế và đặt tên đối tượng để dễ dàng phân loại khi gán khách mời.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel form-panel" noValidate>
        {/* Card Name */}
        <div className="form-block">
          <label htmlFor="card-title">
            Tên mẫu thiệp <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            id="card-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Thiệp Gia Đình, Thiệp Bạn Thân, Thiệp Thầy Cô..."
            maxLength={100}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'card-title-error' : undefined}
          />
          {errors.title && (
            <div id="card-title-error" className="input-error" role="alert">
              {errors.title}
            </div>
          )}
        </div>

        {/* Target Audience */}
        <div className="form-block">
          <label htmlFor="card-audience">Nhóm đối tượng hướng đến (tùy chọn)</label>
          <input
            id="card-audience"
            type="text"
            value={audienceLabel}
            onChange={(e) => setAudienceLabel(e.target.value)}
            placeholder="Ví dụ: Gia đình & Người thân, Bạn bè cùng lớp, Thầy cô bộ môn..."
          />
        </div>

        {/* Template Picker */}
        <div className="form-block">
          <label id="template-picker-label">Chọn phong cách thiết kế khởi tạo</label>
          <div
            role="radiogroup"
            aria-labelledby="template-picker-label"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '12px',
              marginTop: '6px',
            }}
          >
            {templates.map((tmpl) => {
              const isSelected = templateKey === tmpl.key;
              return (
                <div
                  key={tmpl.key}
                  onClick={() => setTemplateKey(tmpl.key)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setTemplateKey(tmpl.key);
                    }
                  }}
                  style={{
                    border: isSelected ? '2px solid var(--navy)' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px',
                    background: isSelected ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 3px rgba(24, 38, 63, 0.1)' : undefined,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      height: '70px',
                      borderRadius: '8px',
                      background: tmpl.previewBg,
                      color: tmpl.textColor,
                      display: 'grid',
                      placeItems: 'center',
                      font: 'italic 16px Georgia, serif',
                      marginBottom: '8px',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    ✦ {tmpl.name}
                  </div>
                  <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>
                    {tmpl.name}
                  </strong>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                    {tmpl.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Default Card Option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <input
            id="card-default"
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="card-default" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
            Đặt làm mẫu thiệp mặc định của sự kiện này (khách mời mới thêm vào sẽ tự động nhận mẫu này)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
          <button
            type="button"
            className="btn"
            onClick={() => router.push(`/dashboard/events/${event.id}/cards`)}
          >
            Hủy bỏ
          </button>
          <button type="submit" className="btn dark">
            Xác nhận tạo thiệp cho sự kiện →
          </button>
        </div>
      </form>

      {/* Confirmation Step */}
      <ConfirmationDialog
        isOpen={showConfirmModal}
        title="Xác nhận liên kết sự kiện"
        description={`Mẫu thiệp "${title}" sẽ được tạo và gắn chặt với sự kiện "${event.title}". Sau khi tạo, thiệp không thể chuyển sang sự kiện khác (chỉ có thể nhân bản). Bạn có chắc chắn muốn tạo không?`}
        confirmText={`Tạo thiệp cho "${event.title}"`}
        cancelText="Quay lại chỉnh sửa"
        onConfirm={handleConfirmCreate}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
