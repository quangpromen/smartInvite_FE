'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, showToast } = useMockStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Đã đăng nhập thành công với vai trò ${currentUser.role} (Bản demo)`, 'success');
    router.push('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121827',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#f8fafc',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            className="mark"
            aria-hidden="true"
            style={{ width: '48px', height: '48px', margin: '0 auto 14px', fontSize: '24px' }}
          >
            S
          </div>
          <h1 style={{ font: '600 24px Georgia, serif', margin: '0 0 8px', color: '#fff' }}>
            SmartInvite
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            Đăng nhập vào không gian quản lý sự kiện
          </p>
        </div>

        {/* Demo Notification */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#fbbf24',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}
        >
          <strong>Chế độ thử nghiệm:</strong> Tài khoản mẫu đã được cấu hình sẵn cho phiên làm việc này. Không yêu cầu mật khẩu thật.
        </div>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '16px' }}>
          <div className="form-block">
            <label htmlFor="login-email" style={{ color: '#cbd5e1' }}>
              Email người tổ chức
            </label>
            <input
              id="login-email"
              type="email"
              readOnly
              value={currentUser.email}
              style={{ background: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
            />
          </div>

          <div className="form-block">
            <label htmlFor="login-role" style={{ color: '#cbd5e1' }}>
              Vai trò tài khoản
            </label>
            <input
              id="login-role"
              type="text"
              readOnly
              value={`${currentUser.fullName} (${currentUser.role})`}
              style={{ background: '#0f172a', borderColor: '#334155', color: '#e2e8f0' }}
            />
          </div>

          <button
            type="submit"
            className="btn gold full"
            style={{ padding: '12px', fontSize: '14px', marginTop: '8px' }}
          >
            Tiếp tục vào Dashboard (Demo) →
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#93c5fd', fontSize: '12px' }}>
            ← Quay lại Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
