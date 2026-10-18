'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { EventBreadcrumb } from '@/components/layout/EventBreadcrumb';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { formatDateTime } from '@/lib/format-date';
import type { UserRole, UserStatus } from '@/features/users/types';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { db, currentUser, usersRepo, showToast } = useMockStore();

  const userId = typeof params?.userId === 'string' ? params.userId : '';
  const user = db.users.find((u) => u.id === userId);

  // Editable form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'HOST');
  const [status, setStatus] = useState<UserStatus>(user?.status || 'ACTIVE');
  const [bio, setBio] = useState(user?.bio || '');

  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [guardError, setGuardError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--navy)' }}>Người dùng không tồn tại</h2>
        <Link href="/admin/users" className="btn dark">
          Quay lại danh sách người dùng
        </Link>
      </div>
    );
  }

  const isCurrent = user.id === currentUser.id;

  // Events owned by this user
  const ownedEvents = db.events.filter((e) => e.ownerId === user.id);
  const totalCardsOwned = db.cardDesigns.filter((c) =>
    ownedEvents.some((e) => e.id === c.eventId)
  ).length;
  const totalGuestsOwned = db.guests.filter((g) =>
    ownedEvents.some((e) => e.id === g.eventId)
  ).length;

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole !== user.role) {
      setPendingRole(newRole);
      setShowRoleConfirm(true);
    }
  };

  const confirmRoleChange = () => {
    if (pendingRole) {
      setRole(pendingRole);
      setShowRoleConfirm(false);
      setPendingRole(null);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      usersRepo.update(user.id, {
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        status,
        bio: bio.trim() || undefined,
      });

      showToast(`Đã lưu cập nhật thông tin người dùng "${fullName}" (Demo)`, 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi cập nhật', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    const check = usersRepo.canDelete(user.id, currentUser.id);
    if (!check.allowed) {
      setGuardError(check.reason || 'Không thể xóa tài khoản này.');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    try {
      const res = usersRepo.delete(user.id, currentUser.id);
      if (res.success) {
        showToast(`Đã xóa người dùng "${user.fullName}" khỏi dữ liệu demo`, 'success');
        router.push('/admin/users');
      } else {
        showToast(res.reason || 'Không thể xóa người dùng', 'error');
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi xóa', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <EventBreadcrumb
          items={[
            { label: 'Quản trị hệ thống', href: '/admin' },
            { label: 'Quản lý người dùng', href: '/admin/users' },
            { label: user.fullName },
          ]}
        />
      </div>

      {/* Profile Header Banner */}
      <div
        className="panel"
        style={{
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          background: 'linear-gradient(120deg, #182741, #243b5e)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            className="avatar sand"
            aria-hidden="true"
            style={{
              width: '56px',
              height: '56px',
              fontSize: '22px',
              background: 'var(--gold)',
              color: '#ffffff',
            }}
          >
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ margin: 0, fontSize: '24px', color: '#ffffff' }}>{user.fullName}</h1>
              {isCurrent && (
                <span className="tag gold" style={{ fontSize: '10px' }}>
                  Tài khoản của bạn
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>
              {user.email} • ID: <code>{user.id}</code>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span
            className={`tag ${user.role === 'ADMIN' ? 'gold' : 'blue'}`}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            {user.role === 'ADMIN' ? '🛡️ Quản trị viên (ADMIN)' : '👤 Chủ sự kiện (HOST)'}
          </span>
          <span className="tag green" style={{ fontSize: '12px', padding: '4px 10px' }}>
            {user.status || 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Two Column Layout: User Settings & Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Left Form: Edit Profile */}
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--navy)' }}>
            Thông tin hồ sơ tài khoản
          </h3>

          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '16px' }}>
            <div className="form-block">
              <label htmlFor="user-fullname">Họ và tên *</label>
              <input
                id="user-fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-block">
              <label htmlFor="user-email">Địa chỉ email *</label>
              <input
                id="user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-block">
                <label htmlFor="user-role-select">Vai trò hệ thống</label>
                <select
                  id="user-role-select"
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                >
                  <option value="HOST">Chủ sự kiện (HOST)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>

              <div className="form-block">
                <label htmlFor="user-status-select">Trạng thái tài khoản</label>
                <select
                  id="user-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                  disabled={isCurrent}
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="SUSPENDED">Tạm ngưng (SUSPENDED)</option>
                  <option value="INVITED">Đã mời (INVITED)</option>
                  <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
                </select>
              </div>
            </div>

            <div className="form-block">
              <label htmlFor="user-bio">Mô tả / Tiểu sử</label>
              <textarea
                id="user-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ghi chú về tài khoản này..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              {!isCurrent && (
                <button
                  type="button"
                  className="btn sm red"
                  onClick={handleDeleteClick}
                >
                  Xóa người dùng
                </button>
              )}
              <button type="submit" className="btn dark" disabled={isSaving} style={{ marginLeft: 'auto' }}>
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: Account Stats & Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="panel" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--navy)' }}>
              Tài nguyên thuộc quyền sở hữu
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <b style={{ display: 'block', fontSize: '20px', color: 'var(--navy)' }}>
                  {ownedEvents.length}
                </b>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Sự kiện</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <b style={{ display: 'block', fontSize: '20px', color: 'var(--gold)' }}>
                  {totalCardsOwned}
                </b>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Mẫu thiệp</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
                <b style={{ display: 'block', fontSize: '20px', color: '#16a34a' }}>
                  {totalGuestsOwned}
                </b>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Khách mời</span>
              </div>
            </div>

            <div style={{ marginTop: '18px', fontSize: '12.5px', color: '#64748b', display: 'grid', gap: '6px' }}>
              <div>
                <strong>Ngày tham gia:</strong> {new Date(user.joinedAt).toLocaleDateString('vi-VN')}
              </div>
              <div>
                <strong>Lần hoạt động gần nhất:</strong> {user.lastActiveAt ? formatDateTime(user.lastActiveAt) : 'Chưa ghi nhận'}
              </div>
            </div>
          </div>

          {/* Isolation Notice Box */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '12.5px',
              color: '#475569',
              lineHeight: 1.5,
            }}
          >
            🛡️ <strong>Chính sách cách ly thông tin cá nhân (BR-14):</strong>
            <p style={{ margin: '4px 0 0' }}>
              Quản trị viên chỉ được phép xem các chỉ số thống kê sự kiện của chủ tài khoản này.
              Hệ thống tuyệt đối không hiển thị danh sách khách mời, số điện thoại hoặc tin nhắn riêng của khách nhằm bảo đảm quyền riêng tư.
            </p>
          </div>
        </div>
      </div>

      {/* Owned Events List */}
      <div className="panel" style={{ padding: '24px' }}>
        <h3 className="section-title" style={{ margin: '0 0 16px' }}>
          Các sự kiện do {user.fullName} sở hữu ({ownedEvents.length})
        </h3>

        {ownedEvents.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            Người dùng này hiện chưa tạo sự kiện nào.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tên sự kiện</th>
                  <th>Loại</th>
                  <th>Thời gian</th>
                  <th>Địa điểm</th>
                  <th>Số mẫu thiệp</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {ownedEvents.map((ev) => {
                  const cCount = db.cardDesigns.filter((c) => c.eventId === ev.id).length;
                  return (
                    <tr key={ev.id}>
                      <td>
                        <strong>
                          <Link href={`/dashboard/events/${ev.id}`}>{ev.title}</Link>
                        </strong>
                      </td>
                      <td>{ev.eventType}</td>
                      <td style={{ fontSize: '12px' }}>{formatDateTime(ev.startsAt)}</td>
                      <td style={{ fontSize: '12px' }}>{ev.locationName}</td>
                      <td>{cCount} mẫu</td>
                      <td>
                        <span className="tag">{ev.status}</span>
                      </td>
                      <td>
                        <Link href={`/dashboard/events/${ev.id}`} className="btn sm">
                          Xem sự kiện →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showRoleConfirm}
        title="Xác nhận thay đổi vai trò tài khoản"
        description={`Bạn có chắc chắn muốn thay đổi vai trò của "${user.fullName}" từ ${user.role} sang ${pendingRole}?`}
        confirmText="Xác nhận đổi vai trò"
        cancelText="Hủy"
        variant="primary"
        onConfirm={confirmRoleChange}
        onCancel={() => {
          setShowRoleConfirm(false);
          setPendingRole(null);
        }}
      />

      {/* Delete User Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa tài khoản người dùng"
        description={`Bạn có chắc chắn muốn xóa tài khoản của "${user.fullName}" khỏi dữ liệu demo? Hành động này không thể hoàn tác.`}
        confirmText="Đồng ý xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Guard Error Dialog (Blocked Deletion / Suspension) */}
      <ConfirmationDialog
        isOpen={!!guardError}
        title="Hành động bị chặn theo quy tắc an toàn"
        description={guardError}
        confirmText="Đã hiểu"
        cancelText="Đóng"
        variant="primary"
        onConfirm={() => setGuardError('')}
        onCancel={() => setGuardError('')}
      />
    </div>
  );
}
