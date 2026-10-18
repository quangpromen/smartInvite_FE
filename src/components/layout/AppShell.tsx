'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMockStore } from '@/mocks/mock-store';
import { ToastContainer } from '@/components/ui/Toast';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    db,
    currentUser,
    switchUser,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetToInitial,
  } = useMockStore();

  const [navOpen, setNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close drawers/menus on route change
  useEffect(() => {
    setNavOpen(false);
    setNotifOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Handle escape to close panels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (notifOpen) setNotifOpen(false);
        if (userMenuOpen) setUserMenuOpen(false);
        if (navOpen) setNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notifOpen, userMenuOpen, navOpen]);

  const navLinks = [
    { label: 'Tổng quan', href: '/dashboard', icon: '📊' },
    { label: 'Sự kiện', href: '/dashboard/events', icon: '📅' },
    { label: 'Tạo sự kiện', href: '/dashboard/events/new', icon: '➕' },
    { label: 'Tạo thiệp mới', href: '/dashboard/cards/new', icon: '✉️' },
    { label: 'Quản trị (Admin)', href: '/admin', icon: '🛡️' },
  ];

  return (
    <div className={`app ${navOpen ? 'nav-open' : ''}`}>
      {/* Mobile Drawer Backdrop */}
      {navOpen && (
        <div
          role="presentation"
          onClick={() => setNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 35,
            backdropFilter: 'blur(2px)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className="sidebar" aria-label="Menu chính">
        <div className="brand">
          <div className="mark" aria-hidden="true">
            S
          </div>
          <div>
            <h3>SmartInvite</h3>
            <small>EVENT-FIRST SAAS</small>
          </div>
        </div>

        <div className="nav-caption">ĐIỀU HƯỚNG</div>
        <nav style={{ display: 'grid', gap: '4px' }}>
          {navLinks.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href ||
                  (item.href === '/dashboard/events' &&
                    pathname.startsWith('/dashboard/events') &&
                    pathname !== '/dashboard/events/new') ||
                  (item.href === '/admin' && pathname.startsWith('/admin'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span style={{ fontSize: '15px' }} aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="nav-spacer" />

        {/* Demo status alert */}
        <div className="side-help">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#f59e0b',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <span>⚡</span>
            <span>CHẾ ĐỘ MÔ PHỎNG</span>
          </div>
          <b>Demo Frontend v2</b>
          <p>Dữ liệu chỉ lưu cục bộ tại trình duyệt (localStorage). Chưa kết nối server.</p>
          <button type="button" onClick={resetToInitial}>
            Khôi phục mẫu ban đầu
          </button>
        </div>

        {/* Current user switch selector in sidebar */}
        <div className="side-user" style={{ position: 'relative' }}>
          <div className="avatar sand" aria-hidden="true">
            {currentUser.fullName.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentUser.fullName}
            </div>
            <small style={{ color: currentUser.role === 'ADMIN' ? '#f59e0b' : '#94a3b8' }}>
              {currentUser.role === 'ADMIN' ? '🛡️ Quản trị viên (Admin)' : '👤 Chủ sự kiện (Host)'}
            </small>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="workspace">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="round-btn mobile-btn"
              onClick={() => setNavOpen(!navOpen)}
              aria-label={navOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={navOpen}
            >
              ☰
            </button>
            <div
              className="demo-badge-top"
              style={{
                fontSize: '12px',
                color: '#b45309',
                background: '#fef3c7',
                padding: '4px 10px',
                borderRadius: '20px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>⚡</span>
              <span>Bản demo — dữ liệu chưa được lưu trên máy chủ</span>
            </div>
          </div>

          <div className="topright" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Notification Trigger Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="round-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label={`Thông báo hệ thống (${unreadNotificationCount} chưa đọc)`}
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
                style={{ position: 'relative', width: '40px', height: '40px' }}
                title="Trung tâm thông báo"
              >
                🔔
                {unreadNotificationCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      borderRadius: '10px',
                      padding: '1px 5px',
                      minWidth: '16px',
                      textAlign: 'center',
                      lineHeight: '14px',
                      boxShadow: '0 0 0 2px #ffffff',
                    }}
                  >
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notification Flyout */}
              {notifOpen && (
                <div
                  role="dialog"
                  aria-label="Trung tâm thông báo"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '360px',
                    maxWidth: '90vw',
                    background: '#ffffff',
                    borderRadius: '14px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--navy)' }}>Thông báo</strong>
                      {unreadNotificationCount > 0 && (
                        <span className="tag gold" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {unreadNotificationCount} mới
                        </span>
                      )}
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsAsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        Không có thông báo nào.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.link) {
                              setNotifOpen(false);
                              router.push(n.link);
                            }
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #f1f5f9',
                            background: n.read ? '#ffffff' : '#f0f9ff',
                            cursor: n.link ? 'pointer' : 'default',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '6px',
                              marginBottom: '4px',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: n.read ? 600 : 700,
                                color: n.read ? '#334155' : 'var(--navy)',
                              }}
                            >
                              {n.title}
                            </span>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                              {new Date(n.timestamp).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Role Switcher Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="top-person"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label={`Tài khoản: ${currentUser.fullName} (${currentUser.role}). Bấm để đổi tài khoản demo`}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                style={{
                  background: 'none',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '4px 10px 4px 6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  className="avatar mint"
                  aria-hidden="true"
                  style={{ width: '28px', height: '28px', fontSize: '12px' }}
                >
                  {currentUser.fullName.charAt(0)}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--navy)', display: 'block' }}>
                    {currentUser.fullName}
                  </span>
                  <span style={{ fontSize: '10px', color: currentUser.role === 'ADMIN' ? '#d97706' : '#64748b' }}>
                    {currentUser.role} ▾
                  </span>
                </div>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  aria-label="Chọn tài khoản demo"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '260px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e2e8f0',
                    zIndex: 50,
                    padding: '8px',
                  }}
                >
                  <div
                    style={{
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Chuyển vai trò Demo
                  </div>
                  {db.users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          switchUser(u.id);
                          setUserMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isSelected ? '#f0fdf4' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          color: 'var(--ink)',
                          fontSize: '13px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: isSelected ? 700 : 500 }}>
                            {u.fullName} {isSelected && '✓'}
                          </div>
                          <small style={{ color: '#64748b', fontSize: '11px' }}>
                            {u.role === 'ADMIN' ? '🛡️ Quản trị viên' : '👤 Chủ sự kiện'} • {u.status || 'ACTIVE'}
                          </small>
                        </div>
                      </button>
                    );
                  })}
                  <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0', paddingTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        resetToInitial();
                        setUserMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#dc2626',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      ↻ Đặt lại dữ liệu mẫu ban đầu
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content" id="main-content">
          {children}
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
}
