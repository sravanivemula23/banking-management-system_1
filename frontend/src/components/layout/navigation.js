import { Activity, Banknote, Landmark, LayoutDashboard, Receipt, Send, User, Users, Wallet } from 'lucide-react';

// Navigation is role-based for convenience only. The backend is what actually enforces access.
export const customerNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/accounts', label: 'Accounts', icon: Wallet },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/money', label: 'Deposit & Withdraw', icon: Banknote },
  { to: '/transfer', label: 'Transfer Money', icon: Send },
  { to: '/profile', label: 'Profile', icon: User },
];

export const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/accounts', label: 'Accounts', icon: Landmark },
  { to: '/admin/transactions', label: 'Transactions', icon: Activity },
  { to: '/profile', label: 'Profile', icon: User },
];
