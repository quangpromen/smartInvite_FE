'use client';

import React from 'react';
import { useMockStore, type ToastState } from '@/mocks/mock-store';

export function ToastContainer() {
  const { toasts, removeToast } = useMockStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      role="region"
      aria-label="Thông báo hệ thống"
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  const bgColors: Record<ToastState['type'], string> = {
    info: '#1e293b',
    success: '#065f46',
    warning: '#92400e',
    error: '#991b1b',
  };

  const icons: Record<ToastState['type'], string> = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠️',
    error: '✕',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        pointerEvents: 'auto',
        background: bgColors[toast.type] || '#1e293b',
        color: '#ffffff',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '13px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'fadeIn 0.25s ease-out',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <span style={{ fontSize: '15px' }}>{icons[toast.type]}</span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{toast.message}</span>
      <button
        onClick={onDismiss}
        aria-label="Đóng thông báo"
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          padding: '4px',
          fontSize: '14px',
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
