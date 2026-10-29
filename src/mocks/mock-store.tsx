'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { MockDb } from '@/services/repositories';
import { createInitialMockDb, initialUsers, initialNotifications } from './fixtures';
import {
  MockEventRepository,
  MockCardRepository,
  MockGuestRepository,
  MockInvitationRepository,
  MockUserRepository,
} from '@/services/mock-repositories';
import type { User } from '@/features/invitations/types';
import type { MockNotification } from '@/features/users/types';

const STORAGE_KEY = 'smartinvite.ui.v4';
const USER_KEY = 'smartinvite.current_user.v2';

export interface ToastState {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface MockStoreContextType {
  db: MockDb;
  currentUser: User;
  currentUserId: string;
  switchUser: (userId: string) => void;
  eventsRepo: MockEventRepository;
  cardsRepo: MockCardRepository;
  guestsRepo: MockGuestRepository;
  invitationsRepo: MockInvitationRepository;
  usersRepo: MockUserRepository;
  notifications: MockNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  toasts: ToastState[];
  showToast: (message: string, type?: ToastState['type']) => void;
  removeToast: (id: string) => void;
  resetToInitial: () => void;
}

const MockStoreContext = createContext<MockStoreContextType | null>(null);

function loadInitialState(): MockDb {
  if (typeof window === 'undefined') {
    return createInitialMockDb();
  }

  try {
    // Purge outdated localStorage keys
    localStorage.removeItem('smartinvite.ui.v1');
    localStorage.removeItem('smartinvite.ui.v2');
    localStorage.removeItem('smartinvite.ui.v3');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialMockDb();

    const parsed = JSON.parse(raw);
    // Validate that it has the normalized shape and no outdated mock events
    if (
      parsed &&
      Array.isArray(parsed.events) &&
      Array.isArray(parsed.cardDesigns) &&
      Array.isArray(parsed.guests) &&
      Array.isArray(parsed.invitations) &&
      Array.isArray(parsed.rsvpResponses) &&
      Array.isArray(parsed.checkIns)
    ) {
      // If persisted data has old removed events, reset to clean focused db
      const hasObsoleteEvents = parsed.events.some((e: { id: string }) => e.id !== 'event-e1');
      if (hasObsoleteEvents) {
        const fresh = createInitialMockDb();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        return fresh;
      }

      // Ensure notifications exists
      if (!Array.isArray(parsed.notifications)) {
        parsed.notifications = [...initialNotifications];
      }
      // Ensure users are present
      if (!Array.isArray(parsed.users) || parsed.users.length < initialUsers.length) {
        parsed.users = [...initialUsers];
      }
      return parsed as MockDb;
    }
  } catch (err) {
    console.warn('[MockStore] Failed to load persisted state, falling back to fixtures', err);
  }

  return createInitialMockDb();
}

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<MockDb>(createInitialMockDb);
  const [currentUserId, setCurrentUserId] = useState<string>(initialUsers[0].id);
  const [isHydrated, setIsHydrated] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Hydrate from localStorage once on client
  useEffect(() => {
    const loaded = loadInitialState();
    setDb(loaded);

    try {
      const savedUserId = localStorage.getItem(USER_KEY);
      if (savedUserId && loaded.users.some((u) => u.id === savedUserId)) {
        setCurrentUserId(savedUserId);
      }
    } catch {}

    setIsHydrated(true);
  }, []);

  // Persist to localStorage whenever db changes after hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (err) {
      console.warn('[MockStore] Failed to persist state to localStorage', err);
    }
  }, [db, isHydrated]);

  const switchUser = (userId: string) => {
    const target = db.users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      try {
        localStorage.setItem(USER_KEY, userId);
      } catch {}
      showToast(`Đã chuyển sang tài khoản ${target.fullName} (${target.role})`, 'info');
    }
  };

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsAsRead = () => {
    setDb((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
    showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'info');
  };

  const resetToInitial = () => {
    const initial = createInitialMockDb();
    setDb(initial);
    setCurrentUserId(initialUsers[0].id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      localStorage.setItem(USER_KEY, initialUsers[0].id);
    } catch {}
    showToast('Đã khôi phục dữ liệu mẫu ban đầu (Demo v2)', 'info');
  };

  // Build repository instances bound to current state setter
  const { eventsRepo, cardsRepo, guestsRepo, invitationsRepo, usersRepo } = useMemo(() => {
    const getDb = () => db;
    return {
      eventsRepo: new MockEventRepository(getDb, setDb),
      cardsRepo: new MockCardRepository(getDb, setDb),
      guestsRepo: new MockGuestRepository(getDb, setDb),
      invitationsRepo: new MockInvitationRepository(getDb, setDb),
      usersRepo: new MockUserRepository(getDb, setDb),
    };
  }, [db]);

  const currentUser = useMemo(() => {
    return db.users.find((u) => u.id === currentUserId) || db.users[0] || initialUsers[0];
  }, [db.users, currentUserId]);

  const unreadNotificationCount = useMemo(() => {
    return (db.notifications || []).filter((n) => !n.read).length;
  }, [db.notifications]);

  const value = useMemo(
    () => ({
      db,
      currentUser,
      currentUserId,
      switchUser,
      eventsRepo,
      cardsRepo,
      guestsRepo,
      invitationsRepo,
      usersRepo,
      notifications: db.notifications || [],
      unreadNotificationCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      toasts,
      showToast,
      removeToast,
      resetToInitial,
    }),
    [
      db,
      currentUser,
      currentUserId,
      eventsRepo,
      cardsRepo,
      guestsRepo,
      invitationsRepo,
      usersRepo,
      unreadNotificationCount,
      toasts,
    ]
  );

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore() {
  const context = useContext(MockStoreContext);
  if (!context) {
    throw new Error('useMockStore must be used within a MockStoreProvider');
  }
  return context;
}
