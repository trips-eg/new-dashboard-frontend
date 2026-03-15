export interface ChargeTransactionResponse {
  success: boolean;
  data: ChargeTransactionData;
  message: any;
}

export interface ChargeTransactionData {
  pageIndex: number;
  pageSize: number;
  count: number;
  pagesCount: number;
  itemsCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  data: ChargeTransaction[];
}

export interface ChargeTransaction {
  id: number;
  walletId: number;
  userId: number;
  sataus: number;
  amountToPay: number;
  clientPayed: number;
  reference: string;
  totalTax: number;
  opayRate: number;
  opayRateAmount: number;
  opayValue: number;
  tripsOperationExpenseValue: number;
  tripsOperationExpenseRate: number;
  tripsOperationExpenseRateAmount: number;
}
