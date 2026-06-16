// ─── Request/Response Models for Customer Analytics ──────────────

export interface CustomerAnalyticsRequest {
  from: string;
  to: string;
}

export interface CustomerAnalyticsData {
  registeredCount: number;
  loggedInCount: number;
  searchedCount: number;
  viewedTripCount: number;
  bookedCount: number;
  paidCount: number;
  registeredToBookedPercentage: number;
  bookedToPaidPercentage: number;
  bookingsLast7Days: number;
  bookingsLast7DaysPaid: number;
}

export type AnalyticsType =
  | 'registered'
  | 'loggedIn'
  | 'searched'
  | 'booked'
  | 'paid'
  | 'bookings7days'
  | 'paid7days';

export interface CustomersByTypeRequest {
  from: string;
  to: string;
  type: AnalyticsType;
  pageIndex: number;
  pageSize: number;
}

export interface CustomerWalletUser {
  id: number;
  name: string;
  email: string;
  userName: string;
  phoneNumber: string | null;
  nationality: string | null;
}

export interface CustomerWallet {
  id: number;
  userId: number;
  currentBalance: number;
  bonusBalance: number;
  totalBalance: number;
  bonusExpiryDate: string | null;
  hasBonusBalance: boolean;
  hasActiveBonusBalance: boolean;
  effectiveBonusBalance: number;
  effectiveTotal: number;
  user: CustomerWalletUser;
}

export interface AnalyticsCustomer {
  id: string;
  userName: string;
  name: string;
  gender: string;
  email: string;
  phoneNumber: string | null;
  createdDate: string | null;
  iActive: boolean;
  imageUrl: string;
  wallet: CustomerWallet;
  totalCompletedReservations: number;
}

export interface CustomersByTypeData {
  pageIndex: number;
  pageSize: number;
  count: number;
  pagesCount: number;
  itemsCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: AnalyticsCustomer[];
}
