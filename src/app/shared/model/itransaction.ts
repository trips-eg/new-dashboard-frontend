export interface TransactionResponse {
  success: boolean;
  data: TransactionData;
  message: any;
}

export interface TransactionData {
  pageIndex: number;
  pageSize: number;
  count: number;
  pagesCount: number;
  itemsCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: Transaction[];
}

export interface Transaction {
  id: number;
  amountIn: number;
  amountOut: number;
  balanceAfterTransaction: number;
  transactionType: number;
  transactionTypeName: string;
  transactionDate: string;
  bookingRefernce?: string;
  chargeRefernce?: string;
  // ── Bonus fields (added with registration bonus feature) ──
  bonusAmountUsed: number;
  paidFromCurrentBalance: number;
}

// ── Wallet (admin list) ──
export interface WalletResponse {
  success: boolean;
  data: WalletData;
  message: any;
}

export interface WalletData {
  pageIndex: number;
  pageSize: number;
  count: number;
  pagesCount: number;
  itemsCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: Wallet[];
}

export interface Wallet {
  id: number;
  userId: number;
  currentBalance: number;
  bonusBalance: number;
  totalBalance: number;
  bonusExpiryDate: string;
  hasBonusBalance: boolean;
  hasActiveBonusBalance: boolean;
  effectiveBonusBalance: number;
  effectiveTotal: number;
  user: WalletUser;
}

export interface WalletUser {
  id: number;
  name: string;
  email: string;
  userName: string;
  phoneNumber: string;
  nationality: {
    id: number;
    name: string;
    nameAr: string;
  };
}
