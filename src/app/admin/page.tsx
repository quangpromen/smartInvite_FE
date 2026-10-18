'use client';

import React from 'react';
import Link from 'next/link';
import { useMockStore } from '@/mocks/mock-store';
import { EventBreadcrumb } from '@/components/layout/EventBreadcrumb';

export default function AdminPage() {
  const { db, currentUser, switchUser } = useMockStore();

  const isHost = currentUser.role !== 'ADMIN';
  const adminUser = db.users.find((u) => u.role === 'ADMIN');

  const activeUsersCount = db.users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedUsersCount = db.users.filter((u) => u.status === 'SUSPENDED').length;
  const hostUsersCount = db.users.filter((u) => u.role === 'HOST').length;
  const adminUsersCount = db.users.filter((u) => u.role === 'ADMIN').length;

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <EventBreadcrumb items={[{ label: 'Quản trị hệ thống (Admin)' }]} />
      </div>

      {/* Mock Role Guard Notice if currently logged in as HOST */}
      {isHost && (
        <div
          style={{
            background: '#fffbeb',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '18px 22px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong style={{ fontSize: '15px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛡️</span>
              <span>Giao diện mô phỏng bảo vệ quyền (Mock Role Guard)</span>
            </strong>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#92400e', lineHeight: 1.5 }}>
              Bạn đang duyệt với tài khoản <strong>{currentUser.fullName} (HOST)</strong>.
              Trong hệ thống thực tế, chỉ tài khoản có vai trò <strong>ADMIN</strong> mới được truy cập phân hệ này.
              Để kiểm thử chức năng quản trị viên trong bản demo, hãy bấm nút bên cạnh.
            </p>
          </div>
          {adminUser && (
            <button
              type="button"
              className="btn gold"
              onClick={() => switchUser(adminUser.id)}
              style={{ fontWeight: 700 }}
            >
              Chuyển sang Quản trị viên (Demo) ↗
            </button>
          )}
        </div>
      )}

      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">HỆ THỐNG SMARTINVITE</span>
          <h1>Bảng điều khiển Quản trị viên (Admin)</h1>
          <p>
            Thống kê tài nguyên toàn hệ thống. Tuân thủ tuyệt đối quy tắc bảo mật BR-14: Quản trị viên không mặc định xem thông tin định danh (PII) của khách mời thuộc các chủ sự kiện khác.
          </p>
        </div>
        <div className="actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/admin/users" className="btn dark">
            <span>👥</span>
            <span>Quản lý người dùng ({db.users.length})</span>
          </Link>
          <span className="tag blue" style={{ alignSelf: 'center' }}>
            Phiên làm việc: {currentUser.fullName} ({currentUser.role})
          </span>
        </div>
      </div>

      {/* System KPI Cards */}
      <div
        className="stats"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div className="panel stat">
          <div className="stat-icon" aria-hidden="true">👥</div>
          <b>{db.users.length}</b>
          <p>Tổng tài khoản người dùng</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon blue" aria-hidden="true">📅</div>
          <b>{db.events.length}</b>
          <p>Tổng số sự kiện</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon gold" aria-hidden="true">✉️</div>
          <b>{db.cardDesigns.length}</b>
          <p>Tổng số mẫu thiệp đã tạo</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon green" aria-hidden="true">🎟️</div>
          <b>{db.invitations.length}</b>
          <p>Tổng thư mời phát hành</p>
        </div>

        <div className="panel stat">
          <div className="stat-icon green" aria-hidden="true">🎫</div>
          <b>{db.checkIns.length}</b>
          <p>Tổng lượt Check-in</p>
        </div>
      </div>

      {/* Two Column Layout: User Quick Summary & Quick Navigation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* User Distribution Panel */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--navy)' }}>
              Phân bố tài khoản người dùng
            </h3>
            <Link href="/admin/users" className="btn sm">
              Quản lý danh sách →
            </Link>
          </div>

          <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span>Chủ sự kiện (HOST):</span>
              <strong>{hostUsersCount} tài khoản</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
              <span>Quản trị viên (ADMIN):</span>
              <strong style={{ color: 'var(--navy)' }}>{adminUsersCount} tài khoản</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px' }}>
              <span>Đang hoạt động (ACTIVE):</span>
              <strong style={{ color: '#16a34a' }}>{activeUsersCount} tài khoản</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px' }}>
              <span>Bị tạm ngưng (SUSPENDED):</span>
              <strong style={{ color: '#dc2626' }}>{suspendedUsersCount} tài khoản</strong>
            </div>
          </div>
        </div>

        {/* Security & Isolation Notice */}
        <div className="panel" style={{ padding: '24px', background: '#f8fafc' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: 'var(--navy)' }}>
            Nguyên tắc bảo vệ dữ liệu khách mời (BR-14)
          </h3>
          <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
            Hệ thống SmartInvite áp dụng chính sách cách ly dữ liệu nhiều tầng:
          </p>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#475569', lineHeight: 1.6 }}>
            <li>Quản trị viên hệ thống chỉ xem tổng số lượng tài nguyên (sự kiện, mẫu thiệp, số khách).</li>
            <li>Không rò rỉ danh sách khách mời, tên, số điện thoại hoặc lời nhắn cá nhân của các chủ sự kiện khác.</li>
            <li>Các quyền xóa hoặc tạm ngưng tài khoản được kiểm tra nghiêm ngặt (không tự xóa chính mình, không xóa admin cuối cùng).</li>
          </ul>
        </div>
      </div>

      {/* System Events Table */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>Danh sách sự kiện trên toàn hệ thống</h3>
            <p className="sub" style={{ margin: '4px 0 0' }}>
              Chỉ hiển thị tổng số và trạng thái, không rò rỉ danh sách khách cá nhân
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tên sự kiện</th>
                <th>Chủ sở hữu</th>
                <th>Loại sự kiện</th>
                <th>Số mẫu thiệp</th>
                <th>Số khách</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {db.events.map((ev) => {
                const owner = db.users.find((u) => u.id === ev.ownerId);
                const cardsCount = db.cardDesigns.filter((c) => c.eventId === ev.id).length;
                const guestsCount = db.guests.filter((g) => g.eventId === ev.id).length;

                return (
                  <tr key={ev.id}>
                    <td>
                      <strong>
                        <Link href={`/dashboard/events/${ev.id}`}>{ev.title}</Link>
                      </strong>
                    </td>
                    <td>{owner?.fullName || ev.ownerId}</td>
                    <td>{ev.eventType}</td>
                    <td>{cardsCount} mẫu</td>
                    <td>{guestsCount} khách</td>
                    <td>
                      <span className="tag">{ev.status}</span>
                    </td>
                    <td>
                      <Link href={`/dashboard/events/${ev.id}`} className="btn sm">
                        Xem chi tiết →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
