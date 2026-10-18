'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMockStore } from '@/mocks/mock-store';
import { EventBreadcrumb } from '@/components/layout/EventBreadcrumb';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import type { User, UserRole, UserStatus } from '@/features/users/types';

export default function AdminUsersPage() {
  const { db, currentUser, switchUser, usersRepo, showToast } = useMockStore();

  const isHost = currentUser.role !== 'ADMIN';
  const adminUser = db.users.find((u) => u.role === 'ADMIN');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'joined' | 'events'>('joined');

  // Add User modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('HOST');
  const [newStatus, setNewStatus] = useState<UserStatus>('ACTIVE');
  const [newBio, setNewBio] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Suspend / Delete confirmation state
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [guardError, setGuardError] = useState<string>('');

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    return db.users
      .filter((u) => {
        const matchesSearch =
          u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.fullName.localeCompare(b.fullName);
        } else if (sortBy === 'events') {
          const eventsA = db.events.filter((e) => e.ownerId === a.id).length;
          const eventsB = db.events.filter((e) => e.ownerId === b.id).length;
          return eventsB - eventsA;
        } else {
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        }
      });
  }, [db.users, db.events, searchTerm, roleFilter, statusFilter, sortBy]);

  const handleOpenAddModal = () => {
    setNewFullName('');
    setNewEmail('');
    setNewRole('HOST');
    setNewStatus('ACTIVE');
    setNewBio('');
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!newFullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên.';
    }
    if (!newEmail.trim() || !newEmail.includes('@')) {
      errors.email = 'Vui lòng nhập địa chỉ email hợp lệ.';
    } else if (db.users.some((u) => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      errors.email = 'Email này đã tồn tại trong danh sách tài khoản.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const created = usersRepo.create({
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        role: newRole,
        status: newStatus,
        bio: newBio.trim() || undefined,
      });

      showToast(`Đã tạo người dùng "${created.fullName}" trong dữ liệu demo!`, 'success');
      setShowAddModal(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Lỗi khi tạo người dùng', 'error');
    }
  };

  const handleToggleSuspend = (user: User) => {
    if (user.id === currentUser.id) {
      showToast('Không thể tạm ngưng chính tài khoản Admin bạn đang sử dụng.', 'error');
      return;
    }
    setActionUser(user);
    setShowSuspendConfirm(true);
  };

  const confirmToggleSuspend = () => {
    if (!actionUser) return;
    try {
      const newStatus = actionUser.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
      usersRepo.update(actionUser.id, { status: newStatus });
      showToast(
        newStatus === 'ACTIVE'
          ? `Đã kích hoạt lại tài khoản "${actionUser.fullName}".`
          : `Đã tạm ngưng tài khoản "${actionUser.fullName}".`,
        'info'
      );
      setShowSuspendConfirm(false);
      setActionUser(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi cập nhật', 'error');
    }
  };

  const handleDeleteClick = (user: User) => {
    const check = usersRepo.canDelete(user.id, currentUser.id);
    if (!check.allowed) {
      setGuardError(check.reason || 'Không thể xóa tài khoản này.');
      return;
    }
    setActionUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!actionUser) return;
    try {
      const res = usersRepo.delete(actionUser.id, currentUser.id);
      if (res.success) {
        showToast(`Đã xóa người dùng "${actionUser.fullName}" khỏi dữ liệu demo.`, 'success');
      } else {
        showToast(res.reason || 'Không thể xóa người dùng', 'error');
      }
      setShowDeleteConfirm(false);
      setActionUser(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Có lỗi khi xóa', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <EventBreadcrumb
          items={[
            { label: 'Quản trị hệ thống', href: '/admin' },
            { label: 'Quản lý người dùng' },
          ]}
        />
      </div>

      {/* Mock Role Guard Notice if currently logged in as HOST */}
      {isHost && (
        <div
          style={{
            background: '#fffbeb',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong style={{ fontSize: '14px', color: '#b45309' }}>
              🛡️ Giới hạn quyền giao diện (Mock Guard)
            </strong>
            <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#92400e' }}>
              Chỉ tài khoản ADMIN mới có quyền quản lý người dùng. Hiện tại bạn đang đăng nhập là <strong>{currentUser.fullName} (HOST)</strong>.
            </p>
          </div>
          {adminUser && (
            <button
              type="button"
              className="btn sm gold"
              onClick={() => switchUser(adminUser.id)}
            >
              Chuyển sang Admin để thao tác ↗
            </button>
          )}
        </div>
      )}

      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">DANH SÁCH TÀI KHOẢN</span>
          <h1>Quản lý người dùng hệ thống</h1>
          <p>
            Quản lý tài khoản Chủ sự kiện (Host) và Quản trị viên (Admin). Thay đổi vai trò, trạng thái hoặc cấp mới tài khoản.
          </p>
        </div>
        <div className="actions">
          <button type="button" className="btn dark" onClick={handleOpenAddModal}>
            <span>➕</span>
            <span>Thêm người dùng mới (Demo)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="panel"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc email người dùng..."
            style={{ maxWidth: '320px', width: '100%' }}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'ALL' | UserRole)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="HOST">Chủ sự kiện (HOST)</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | UserStatus)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="SUSPENDED">Tạm ngưng (SUSPENDED)</option>
            <option value="INVITED">Đã mời (INVITED)</option>
            <option value="ARCHIVED">Lưu trữ (ARCHIVED)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="user-sort-select" style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Sắp xếp:
          </label>
          <select
            id="user-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'joined' | 'events')}
            style={{ width: 'auto', fontSize: '13px' }}
          >
            <option value="joined">Mới tham gia nhất</option>
            <option value="name">Tên (A-Z)</option>
            <option value="events">Số sự kiện sở hữu</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Sự kiện sở hữu</th>
                <th>Mẫu thiệp</th>
                <th>Ngày tham gia</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Không tìm thấy người dùng nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const ownedEvents = db.events.filter((e) => e.ownerId === u.id);
                  const cardsCount = db.cardDesigns.filter((c) =>
                    ownedEvents.some((e) => e.id === c.eventId)
                  ).length;
                  const isCurrent = u.id === currentUser.id;

                  const statusClass =
                    u.status === 'ACTIVE'
                      ? 'green'
                      : u.status === 'SUSPENDED'
                      ? 'red'
                      : u.status === 'INVITED'
                      ? 'blue'
                      : 'gray';

                  return (
                    <tr key={u.id} style={{ background: isCurrent ? '#f8fafc' : undefined }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            className="avatar sand"
                            aria-hidden="true"
                            style={{
                              width: '36px',
                              height: '36px',
                              fontSize: '13px',
                              background: u.role === 'ADMIN' ? 'var(--navy)' : '#e0e7ff',
                              color: u.role === 'ADMIN' ? '#ffffff' : '#3730a3',
                              flexShrink: 0,
                            }}
                          >
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <strong style={{ fontSize: '13.5px', color: 'var(--navy)', display: 'block' }}>
                              <Link href={`/admin/users/${u.id}`} style={{ color: 'inherit' }}>
                                {u.fullName} {isCurrent && '(Bạn)'}
                              </Link>
                            </strong>
                            <small style={{ color: '#64748b', fontSize: '11px' }}>{u.email}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`tag ${u.role === 'ADMIN' ? 'gold' : 'blue'}`}
                          style={{ fontSize: '11px' }}
                        >
                          {u.role === 'ADMIN' ? '🛡️ ADMIN' : '👤 HOST'}
                        </span>
                      </td>

                      <td>
                        <span className={`tag ${statusClass}`} style={{ fontSize: '11px' }}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>

                      <td>
                        <strong>{ownedEvents.length}</strong> sự kiện
                      </td>

                      <td>
                        <span>{cardsCount} mẫu</span>
                      </td>

                      <td style={{ fontSize: '12px', color: '#64748b' }}>
                        {new Date(u.joinedAt).toLocaleDateString('vi-VN')}
                      </td>

                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Link href={`/admin/users/${u.id}`} className="btn sm">
                            Chi tiết
                          </Link>

                          {!isCurrent && (
                            <button
                              type="button"
                              className="btn sm"
                              onClick={() => handleToggleSuspend(u)}
                              title={u.status === 'SUSPENDED' ? 'Kích hoạt lại' : 'Tạm ngưng'}
                            >
                              {u.status === 'SUSPENDED' ? 'Kích hoạt' : 'Khóa'}
                            </button>
                          )}

                          {!isCurrent && (
                            <button
                              type="button"
                              className="btn sm red"
                              onClick={() => handleDeleteClick(u)}
                              title="Xóa tài khoản nếu không có dữ liệu sự kiện"
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add User Form */}
      {showAddModal && (
        <div
          className="modal-layer"
          onClick={() => setShowAddModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '500px', width: '95%' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--navy)' }}>Thêm người dùng mới (Demo)</h3>
              <button type="button" className="round-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'grid', gap: '14px' }}>
              <div className="form-block">
                <label htmlFor="newuser-fullname">Họ và tên *</label>
                <input
                  id="newuser-fullname"
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="VD: Trần Văn Bình"
                  className={formErrors.fullName ? 'error-border' : ''}
                />
                {formErrors.fullName && <div className="error-text">{formErrors.fullName}</div>}
              </div>

              <div className="form-block">
                <label htmlFor="newuser-email">Email giả lập *</label>
                <input
                  id="newuser-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="VD: vanbinh@smartinvite.demo"
                  className={formErrors.email ? 'error-border' : ''}
                />
                {formErrors.email && <div className="error-text">{formErrors.email}</div>}
                <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                  Không dùng email thật. Hệ thống không gửi thư điện tử trong bản demo.
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-block">
                  <label htmlFor="newuser-role">Vai trò</label>
                  <select
                    id="newuser-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                  >
                    <option value="HOST">Chủ sự kiện (HOST)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                </div>

                <div className="form-block">
                  <label htmlFor="newuser-status">Trạng thái</label>
                  <select
                    id="newuser-status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as UserStatus)}
                  >
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="INVITED">Đã mời (INVITED)</option>
                    <option value="SUSPENDED">Tạm ngưng (SUSPENDED)</option>
                  </select>
                </div>
              </div>

              <div className="form-block">
                <label htmlFor="newuser-bio">Mô tả / Ghi chú</label>
                <textarea
                  id="newuser-bio"
                  rows={2}
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  placeholder="Ghi chú về người dùng này..."
                />
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#64748b',
                }}
              >
                ℹ️ Người dùng được tạo sẽ lưu vào bộ nhớ trình duyệt (localStorage) và hiển thị tức thì.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn dark">
                  Tạo người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Suspend user */}
      <ConfirmationDialog
        isOpen={showSuspendConfirm}
        title={actionUser?.status === 'SUSPENDED' ? 'Kích hoạt lại tài khoản' : 'Tạm ngưng tài khoản'}
        description={`Bạn có chắc chắn muốn ${
          actionUser?.status === 'SUSPENDED' ? 'kích hoạt lại' : 'tạm ngưng'
        } tài khoản của "${actionUser?.fullName}"?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        variant="primary"
        onConfirm={confirmToggleSuspend}
        onCancel={() => {
          setShowSuspendConfirm(false);
          setActionUser(null);
        }}
      />

      {/* Confirmation Dialog: Delete user */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa người dùng"
        description={`Bạn có chắc chắn muốn xóa người dùng "${actionUser?.fullName}" khỏi dữ liệu demo?`}
        confirmText="Đồng ý xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setActionUser(null);
        }}
      />

      {/* Guard Error Dialog (Cannot delete user) */}
      <ConfirmationDialog
        isOpen={!!guardError}
        title="Không thể thực hiện thao tác"
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
