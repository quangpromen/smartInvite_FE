export type UserRole = 'HOST' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INVITED' | 'ARCHIVED';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  lastActiveAt?: string;
  bio?: string;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  bio?: string;
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  bio?: string;
}

export interface MockNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  read: boolean;
  link?: string;
}
