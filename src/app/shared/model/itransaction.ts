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
}
